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

    const { projectId } = await req.json();

    if (!projectId) {
      throw new Error("Project ID is required");
    }

    // Fetch the requirement details
    const { data: requirement, error: requirementError } = await supabase
      .from("requirements")
      .select("*")
      .eq("id", projectId)
      .single();

    if (requirementError) {
      throw new Error(
        `Error fetching requirement: ${requirementError.message}`
      );
    }

    console.log(`Processing project: ${requirement.project_name}`);

    // Prepare data for OpenAI prompt
    const projectData = {
      project_name: requirement.project_name || "",
      company_name: requirement.company_name || "",
      industry_type: requirement.industry_type || "",
      project_idea: requirement.project_idea || "",
      document_summary: requirement.document_summary || "None",
    };

    // Create the prompt for OpenAI
    const prompt = `
    You are acting as an expert Product Manager and Business Analyst.

    Your task is to generate a structured Business Requirements Document (BRD) in valid JSON format based on the input provided below. You must follow these instructions strictly:

    Instructions:
    - Reuse and rephrase content from the inputs (especially "Project Idea") wherever possible to maintain factual accuracy.
    - Tailor your analysis to the given "Industry Type"—use industry-specific language for goals, constraints, risks, and competitor landscape.
    - If any section cannot be confidently answered, return the string: "Not specified in provided input."
    - For the following fields, include:
      → A **1-line introductory sentence**  
      → Followed by a **list of bullet points**, clearly formatted for easy display:
      - key_features
      - business_goals
      - target_audience
      - competitive_landscape
      - constraints_assumptions
      - risks_mitigations
      - acceptance_criteria
      - user_stories

    - Keep each section short, precise, and professional. Use clear bullet points (no long paragraphs).
    - Estimate "analysis_confidence_score" between 0–100 based on how complete and clear the provided inputs are.
    - Output must be valid JSON — do not return Markdown, comments, or explanation outside the object.

    ---

    ### Input:

    Project Name: ${projectData.project_name}  
    Company Name: ${projectData.company_name}  
    Industry Type: ${projectData.industry_type}  
    Project Idea: ${projectData.project_idea}  
    Uploaded Files Summary (if any): ${projectData.document_summary}

    ---

    ### Output Format (JSON):

    {
      "project_overview": string or null,
      "problem_statement": string or null,
      "proposed_solution": string or null,
      "business_goals": "Intro sentence\n- Goal 1\n- Goal 2",
      "target_audience": "Intro sentence\n- Persona 1\n- Persona 2",
      "key_features": "Intro sentence\n- Feature 1\n- Feature 2",
      "competitive_landscape": "Intro sentence\n- Competitor type or gap 1\n- Competitor type or gap 2",
      "constraints_assumptions": "Intro sentence\n- Constraint 1\n- Assumption 1",
      "risks_mitigations": "Intro sentence\n- Risk 1 with mitigation\n- Risk 2 with mitigation",
      "acceptance_criteria": "Intro sentence\n- Criteria 1\n- Criteria 2",
      "user_stories": "Intro sentence\n- As a [user], I want to [goal] so that [value]",
      "appendices": [],
      "analysis_confidence_score": number (0–100)
    }

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
          model: "gpt-4", // Using GPT-4 model
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
    console.log(
      "Raw OpenAI response content:",
      openAIData.choices[0].message.content
    );

    let analysisData;
    try {
      // Extract the JSON content from the OpenAI response
      const content = openAIData.choices[0].message.content;

      // Sometimes OpenAI wraps the JSON in markdown code blocks, so we need to extract it
      let jsonString = content;

      // Check if the response is wrapped in a code block
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1];
        console.log("Extracted JSON from code block:", jsonString);
      }

      // Try to clean the string before parsing
      jsonString = jsonString.trim();

      // Parse the JSON
      try {
        analysisData = JSON.parse(jsonString);
        console.log("Successfully parsed OpenAI response to JSON");
      } catch (parseError) {
        console.error("JSON Parse error:", parseError);
        console.log("Failed JSON string:", jsonString);
        throw parseError;
      }
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      // If parsing fails, use a simplified format with the raw content
      const content = openAIData.choices[0].message.content;
      analysisData = {
        project_overview: `Generated analysis could not be properly formatted. Raw content: ${content.substring(
          0,
          100
        )}...`,
        analysis_confidence_score: 50, // Lower confidence due to parsing issue
      };
    }

    // Add the requirement_id to the analysis data
    analysisData.requirement_id = projectId;

    // Check if analysis already exists
    const { data: existingAnalysis } = await supabase
      .from("requirement_analysis")
      .select("id")
      .eq("requirement_id", projectId)
      .maybeSingle();

    let result;

    if (existingAnalysis) {
      // Update existing analysis
      result = await supabase
        .from("requirement_analysis")
        .update(analysisData)
        .eq("id", existingAnalysis.id)
        .select();
    } else {
      // Insert new analysis
      result = await supabase
        .from("requirement_analysis")
        .insert(analysisData)
        .select();
    }

    if (result.error) {
      throw new Error(`Error saving analysis: ${result.error.message}`);
    }

    // Finally update the requirement status
    await supabase
      .from("requirements")
      .update({ status: "Completed" })
      .eq("id", projectId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Project processed successfully with OpenAI analysis",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing project:", error);

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
