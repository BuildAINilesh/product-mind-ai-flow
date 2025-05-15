import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  RequirementData,
  RequirementAnalysisData,
  MarketAnalysisData,
  ANALYSIS_STATUS_KEY,
  ANALYSIS_CURRENT_STEP_KEY,
  ANALYSIS_STEPS_KEY,
} from "./types";
import { ProcessStep } from "@/components/market-sense/MarketAnalysisProgress";
import { completeMarketSense } from "@/services/requirementFlowService";

export const useGenerateAnalysis = (
  requirementId: string | null,
  requirement: RequirementData | null,
  requirementAnalysis: RequirementAnalysisData | null,
  updateStepStatus: (
    index: number,
    status: "pending" | "processing" | "completed" | "failed",
    current?: number | null,
    total?: number | null
  ) => void,
  setCurrentStep: (step: number) => void,
  setAnalysisInProgress: (inProgress: boolean) => void,
  progressSteps: ProcessStep[]
) => {
  const [generating, setGenerating] = useState(false);

  // Function to generate market analysis
  const generateAnalysis = async (): Promise<MarketAnalysisData | null> => {
    if (!requirementId || !requirement) {
      toast.error("Missing requirement data. Cannot generate analysis.");
      return null;
    }

    // Always allow generation to start by removing this check
    // if (generating) {
    //   toast.error("Analysis generation already in progress. Please wait.");
    //   return null;
    // }

    try {
      // Clear any existing analysis state from localStorage
      localStorage.removeItem(ANALYSIS_STATUS_KEY + requirementId);
      localStorage.removeItem(ANALYSIS_STEPS_KEY + requirementId);
      localStorage.removeItem(ANALYSIS_CURRENT_STEP_KEY + requirementId);

      // Reset state for a fresh start
      setGenerating(true);
      setAnalysisInProgress(true);

      // Initialize new analysis state in localStorage
      localStorage.setItem(ANALYSIS_STATUS_KEY + requirementId, "true");
      localStorage.setItem(
        ANALYSIS_STEPS_KEY + requirementId,
        JSON.stringify(progressSteps)
      );
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, "0");

      console.log("Starting market analysis generation for:", requirementId);

      // If requirement analysis is missing, create simplified problem/solution data
      const analysisDataForQueries = requirementAnalysis || {
        problem_statement:
          requirement.problem_statement ||
          "Problem derived from requirement description",
        proposed_solution: requirement.solution || requirement.project_idea,
        key_features: "Key features derived from project description",
      };

      // Update the flow tracking to show market_sense is in progress
      await supabase
        .from("requirement_flow_tracking")
        .update({
          current_stage: "market_sense",
          market_sense_status: "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("requirement_id", requirementId);

      // STEP 1: Generate search queries
      setCurrentStep(0);
      updateStepStatus(0, "processing");

      const { data: queriesData, error: queriesError } =
        await supabase.functions.invoke("generate-market-queries", {
          body: {
            requirementId,
            projectName: requirement.project_name,
            industry: requirement.industry_type,
            problemStatement: analysisDataForQueries.problem_statement,
            proposedSolution: analysisDataForQueries.proposed_solution,
            keyFeatures: analysisDataForQueries.key_features,
          },
        });

      if (queriesError) {
        console.error("Error generating search queries:", queriesError);
        updateStepStatus(0, "failed");
        throw queriesError;
      }

      console.log("Search queries generated:", queriesData);
      updateStepStatus(0, "completed");

      // STEP 2: Process search queries to get URLs
      setCurrentStep(1);
      updateStepStatus(1, "processing");

      let current = 0;
      let urls: string[] = [];

      // Process each search query to get URLs
      for (const query of queriesData.queries) {
        current++;
        updateStepStatus(1, "processing", current, queriesData.queries.length);

        const { data: urlsData, error: urlsError } =
          await supabase.functions.invoke("process-market-queries", {
            body: {
              requirementId,
              query,
            },
          });

        if (urlsError) {
          console.error("Error processing search query:", urlsError);
          continue;
        }

        console.log("URL data returned:", urlsData);

        // Check for URLs from function response
        if (
          urlsData &&
          urlsData.urls &&
          Array.isArray(urlsData.urls) &&
          urlsData.urls.length > 0
        ) {
          console.log(
            `Found ${urlsData.urls.length} URLs from the search query`
          );
          urls = [...urls, ...urlsData.urls];
        }
      }

      // Check database for sources as a last attempt to find valid URLs
      if (urls.length === 0) {
        console.log(
          "No URLs found from API responses, checking database for sources"
        );

        const { data: sourcesFromDb, error: sourcesError } = await supabase
          .from("market_research_sources")
          .select("url")
          .eq("requirement_id", requirementId)
          .not("status", "eq", "error");

        if (!sourcesError && sourcesFromDb && sourcesFromDb.length > 0) {
          console.log(`Found ${sourcesFromDb.length} sources from database`);
          const dbUrls = sourcesFromDb
            .map((source) => source.url)
            .filter(
              (url) =>
                url && url.startsWith("http") && !url.includes("placeholder")
            );
          if (dbUrls.length > 0) {
            urls = [...urls, ...dbUrls];
          }
        }
      }

      if (urls.length === 0) {
        console.error("No valid URLs found for research - stopping analysis");
        updateStepStatus(1, "failed");
        throw new Error(
          "Failed to find any relevant URLs for research. Cannot continue analysis without valid search results."
        );
      }

      updateStepStatus(1, "completed");
      console.log("Found URLs for research:", urls);

      // STEP 3: Scrape content from URLs
      setCurrentStep(2);
      updateStepStatus(2, "processing");

      current = 0;
      let scrapedCount = 0;

      // Limit to first 9 URLs to avoid overloading
      const urlsToScrape = urls.slice(0, 9);

      for (const url of urlsToScrape) {
        current++;
        updateStepStatus(2, "processing", current, urlsToScrape.length);

        const { data: scrapeData, error: scrapeError } =
          await supabase.functions.invoke("scrape-research-urls", {
            body: {
              requirementId,
              url,
            },
          });

        if (scrapeError) {
          console.error("Error scraping URL:", scrapeError);
          continue;
        }

        if (scrapeData && scrapeData.success) {
          scrapedCount++;
        }
      }

      if (scrapedCount === 0 && urlsToScrape.length > 0) {
        console.warn(
          "Failed to scrape any content, but continuing with analysis"
        );
        updateStepStatus(2, "completed", 1, 1);
      } else {
        updateStepStatus(2, "completed");
        console.log("Scraped content from URLs");
      }

      // STEP 4: Summarize research content
      setCurrentStep(3);
      updateStepStatus(3, "processing");

      const { data: sourcesData, error: sourcesError } = await supabase
        .from("scraped_research_data")
        .select("id, status")
        .eq("requirement_id", requirementId)
        .not("status", "eq", "error");

      if (sourcesError) {
        console.error("Error getting research sources:", sourcesError);
        // Modified: Don't throw error, just mark step as failed but continue
        updateStepStatus(3, "failed");
        console.log("Continuing with analysis despite summarization errors");
      } else {
        current = 0;
        let summarizedCount = 0;
        const sourcesToProcess = sourcesData || [];

        console.log(`Found ${sourcesToProcess.length} sources to summarize`);

        for (const source of sourcesToProcess) {
          current++;
          updateStepStatus(3, "processing", current, sourcesToProcess.length);

          try {
            const { data: summaryData, error: summaryError } =
              await supabase.functions.invoke("summarize-research-content", {
                body: {
                  sourceId: source.id,
                },
              });

            if (summaryError) {
              console.error("Error summarizing content:", summaryError);
              continue;
            }

            if (summaryData && summaryData.success) {
              summarizedCount++;
            }
          } catch (summaryErr) {
            console.error(
              `Failed to summarize source ${source.id}:`,
              summaryErr
            );
            // Continue with next source even if this one fails
          }
        }

        // Modified logic: continue even if no content was summarized
        if (summarizedCount === 0) {
          console.warn(
            "Could not summarize any research content, but continuing with analysis"
          );

          // Add fallback data if no content was summarized
          if (sourcesToProcess.length > 0) {
            const { data, error } = await supabase
              .from("scraped_research_data")
              .update({
                summary:
                  "Content could not be summarized, but analysis will continue with available data.",
                status: "summarized",
              })
              .eq("requirement_id", requirementId)
              .in(
                "id",
                sourcesToProcess.map((source) => source.id)
              );

            if (error) {
              console.error("Error adding fallback summary data:", error);
            }
          }
        }

        updateStepStatus(3, "completed");
        console.log("Summarized research content or added fallback data");
      }

      // STEP 5: Create market analysis
      setCurrentStep(4);
      updateStepStatus(4, "processing");

      const { data: analysisData, error: analysisError } =
        await supabase.functions.invoke("analyze-market", {
          body: {
            requirementId,
            projectName: requirement.project_name,
            industry: requirement.industry_type,
            problemStatement: analysisDataForQueries.problem_statement,
            proposedSolution: analysisDataForQueries.proposed_solution,
          },
        });

      if (analysisError) {
        console.error("Error creating market analysis:", analysisError);
        updateStepStatus(4, "failed");
        throw analysisError;
      }

      console.log("Market analysis created:", analysisData);
      updateStepStatus(4, "completed");

      // Update steps in localStorage with completed state
      const completedSteps = progressSteps.map((step) => ({
        ...step,
        status: "completed",
      }));
      localStorage.setItem(
        ANALYSIS_STEPS_KEY + requirementId,
        JSON.stringify(completedSteps)
      );
      localStorage.setItem(ANALYSIS_CURRENT_STEP_KEY + requirementId, "5");

      // Update the market analysis status to Completed
      await supabase
        .from("market_analysis")
        .update({ status: "Completed" })
        .eq("requirement_id", requirementId);

      // Update the requirement flow tracking to mark market_sense as completed
      await supabase
        .from("requirement_flow_tracking")
        .update({
          market_sense_status: "market_complete",
          updated_at: new Date().toISOString(),
        })
        .eq("requirement_id", requirementId);

      // Fetch and return the newly created market analysis
      const { data: marketAnalysis, error: fetchError } = await supabase
        .from("market_analysis")
        .select("*")
        .eq("requirement_id", requirementId)
        .single();

      if (fetchError) {
        console.error("Error fetching market analysis:", fetchError);
        throw fetchError;
      }

      toast.success("Market analysis completed successfully!");

      // Call completeMarketSense after updating the market_sense_status to ensure the flow advances to the next stage
      await completeMarketSense(requirementId);

      return marketAnalysis;
    } catch (error: unknown) {
      console.error("Error generating market analysis:", error);
      toast.error(
        "Failed to generate market analysis: " +
          ((error as Error)?.message || "Unknown error")
      );

      // Update the flow tracking to show there was an error
      await supabase
        .from("requirement_flow_tracking")
        .update({
          market_sense_status: "error",
          updated_at: new Date().toISOString(),
        })
        .eq("requirement_id", requirementId);

      return null;
    } finally {
      setGenerating(false);
    }
  };

  return { generateAnalysis };
};
