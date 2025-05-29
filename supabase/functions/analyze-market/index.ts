import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";

    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { requirementId } = await req.json();

    if (!requirementId) {
      throw new Error("Requirement ID is required");
    }

    // Fetch project requirement details
    const { data: requirement, error: requirementError } = await supabase
      .from("requirements")
      .select("*")
      .eq("id", requirementId)
      .single();

    if (requirementError) {
      throw new Error(
        `Error fetching requirement: ${requirementError.message}`
      );
    }

    // Fetch requirement analysis to get more context
    const { data: analysis, error: analysisError } = await supabase
      .from("requirement_analysis")
      .select("*")
      .eq("requirement_id", requirementId)
      .maybeSingle();

    if (analysisError && analysisError.code !== "PGRST116") {
      throw new Error(
        `Error fetching requirement analysis: ${analysisError.message}`
      );
    }

    console.log(
      `Generating market analysis for project: ${requirement.project_name}`
    );

    // NEW: Fetch research snippets from scraped_research_data
    const { data: researchData, error: researchError } = await supabase
      .from("scraped_research_data")
      .select("summary")
      .eq("requirement_id", requirementId)
      .eq("status", "summarized");

    if (researchError) {
      console.error(`Error fetching research data: ${researchError.message}`);
      // Continue with analysis even if research data fetching fails
    }

    // Extract and format research snippets
    let researchSnippets = "";

    // Prepare data for OpenAI prompt
    const projectData = {
      project_name: requirement.project_name || "",
      company_name: requirement.company_name || "",
      industry_type: requirement.industry_type || "",
      project_idea: requirement.project_idea || "",
      key_features: analysis?.key_features || "",
      target_audience: analysis?.target_audience || "",
      problem_statement: analysis?.problem_statement || "",
      proposed_solution: analysis?.proposed_solution || "",
    };

    let usingFallbackData = false;

    if (researchData && researchData.length > 0) {
      const validSummaries = researchData
        .filter((item) => item.summary)
        .map((item) => item.summary);

      if (validSummaries.length > 0) {
        researchSnippets = validSummaries.join("\n\n");
      } else {
        console.warn(
          "No valid research summaries found in the database. Using fallback mechanism."
        );
        usingFallbackData = true;
      }
    } else {
      console.warn(
        "No research data found in the database. Using fallback mechanism."
      );
      usingFallbackData = true;
    }

    // Instead of throwing an error, we'll generate an analysis without research data
    if (usingFallbackData) {
      console.log(
        "Generating market analysis using AI-only approach without research data"
      );

      // Add some fallback research data based on the project/industry
      const fallbackResearch = `
      The following is general market information for the ${projectData.industry_type} industry:
      
      1. Market Overview: The ${projectData.industry_type} sector has seen steady growth in recent years with increasing digital transformation initiatives.
      
      2. Common Customer Pain Points: Users in this industry often struggle with efficiency, scalability, and integrating new solutions with existing systems.
      
      3. Competitive Landscape: The market includes both established players and innovative startups offering specialized solutions.
      
      4. Trends: Key trends include AI integration, improved user experience, and focus on data security and privacy.
      
      5. Future Outlook: The industry is expected to continue growing as businesses invest in digital solutions to gain competitive advantages.
      `;

      researchSnippets = fallbackResearch;
    }

    // Create the prompt for OpenAI with research snippets
    const prompt = `
    You are an expert Market Research Analyst tasked with delivering a comprehensive and detailed market analysis based on the provided project details and research snippets.

    Project Details:
    Project Name: ${projectData.project_name}
    Company Name: ${projectData.company_name}
    Industry Type: ${projectData.industry_type}
    Project Idea: ${projectData.project_idea}
    Key Features: ${projectData.key_features}
    Target Audience: ${projectData.target_audience}
    Problem Statement: ${projectData.problem_statement}
    Proposed Solution: ${projectData.proposed_solution}

    Research Snippets from Trusted Sources:
    ${researchSnippets}
    ${
      usingFallbackData
        ? "(Note: This analysis utilizes general industry knowledge due to the absence of specific research data.)"
        : ""
    }

    Instructions:
    - Leverage the research snippets to inform your analysis. If specific data is unavailable, apply general industry knowledge.
    - Provide an in-depth examination for each section, incorporating relevant data, trends, and insights.
    - Ensure each section contains substantial information, aiming for multiple detailed paragraphs where appropriate.
    - Avoid using markdown formatting (e.g., no asterisks '*', hashes '#', or other markdown symbols). Present all text in plain format to ensure compatibility with frontend rendering.
    - Structure your response strictly as a valid JSON object matching the following schema:

    {
      "market_trends": string describing 3-5 current trends in this market with detailed analysis,
      "demand_insights": string with comprehensive examination of potential demand and customer needs,
      "top_competitors": string with in-depth overview of typical competitors in this space and their strengths,
      "market_gap_opportunity": string identifying specific gaps or opportunities this project addresses,
      "swot_analysis": string with thorough SWOT analysis relevant to market position,
      "industry_benchmarks": string with 2-3 key performance indicators typical for this industry,
      "confidence_score": number (0-100) indicating confidence level of this analysis
    }

    The confidence_score should reflect the quality and relevance of the research snippets provided (${
      usingFallbackData
        ? "assign a lower score as we're relying on general industry knowledge"
        : "higher score for more relevant research"
    }).
    Ensure the JSON object is properly formatted and can be parsed without errors.
    `;

    // Call OpenAI API to generate the analysis
    const openAIResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2500,
        }),
      }
    );

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error(
        `OpenAI API error: ${errorData.error?.message || "Unknown error"}`
      );
    }

    const openAIData = await openAIResponse.json();
    console.log("OpenAI response received");

    let marketAnalysisData;
    try {
      // Extract the JSON content from the OpenAI response
      const content = openAIData.choices[0].message.content;

      // Sometimes OpenAI wraps the JSON in markdown code blocks, so we need to extract it
      let jsonString = content;

      // Check if the response is wrapped in a code block
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
      }

      // Parse the JSON
      marketAnalysisData = JSON.parse(jsonString);
      console.log("Successfully parsed OpenAI response to JSON");
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      // If parsing fails, use a simplified format with the raw content
      const content = openAIData.choices[0].message.content;
      marketAnalysisData = {
        market_trends: `Generated analysis could not be properly formatted. Raw content: ${content.substring(
          0,
          100
        )}...`,
        confidence_score: 50, // Lower confidence due to parsing issue
      };
    }

    // Add the requirement_id to the market analysis data
    marketAnalysisData.requirement_id = requirementId;

    // Mark the status as Completed
    marketAnalysisData.status = "Completed";

    // Check if market analysis already exists
    const { data: existingAnalysis } = await supabase
      .from("market_analysis")
      .select("id")
      .eq("requirement_id", requirementId)
      .maybeSingle();

    let result;

    if (existingAnalysis) {
      // Update existing analysis
      result = await supabase
        .from("market_analysis")
        .update(marketAnalysisData)
        .eq("id", existingAnalysis.id)
        .select();
    } else {
      // Insert new analysis
      result = await supabase
        .from("market_analysis")
        .insert(marketAnalysisData)
        .select();
    }

    if (result.error) {
      throw new Error(`Error saving market analysis: ${result.error.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Market analysis generated successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error analyzing market:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
