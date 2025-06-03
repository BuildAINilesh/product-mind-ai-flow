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

    CRITICAL FORMATTING REQUIREMENTS:
    1. Return ONLY a valid JSON object
    2. DO NOT include any markdown formatting, code blocks, or explanatory text
    3. DO NOT use any special characters or formatting in the JSON values
    4. Use proper JSON string escaping for newlines (\\n) and quotes
    5. Ensure all string values are properly quoted
    6. The response must be parseable by JSON.parse()

    Content Instructions:
    - Reuse and rephrase content from the inputs (especially "Project Idea") wherever possible to maintain factual accuracy
    - Tailor your analysis to the given "Industry Type"—use industry-specific language for goals, constraints, risks, and competitor landscape
    - If any section cannot be confidently answered, use the string: "Not specified in provided input"
    - For the following fields, include:
      - A single-line introductory sentence
      - Followed by bullet points using "\\n- " for each new point:
        - key_features
        - business_goals
        - target_audience
        - competitive_landscape
        - constraints_assumptions
        - risks_mitigations
        - acceptance_criteria
        - user_stories

    - Keep each section short, precise, and professional
    - Estimate "analysis_confidence_score" between 0-100 based on input completeness

    Input:
    Project Name: ${projectData.project_name}
    Company Name: ${projectData.company_name}
    Industry Type: ${projectData.industry_type}
    Project Idea: ${projectData.project_idea}
    Uploaded Files Summary: ${projectData.document_summary}

    The response must be a single JSON object with exactly these fields:
    {
      "project_overview": "string",
      "problem_statement": "string",
      "proposed_solution": "string",
      "business_goals": "string with \\n- for bullet points",
      "target_audience": "string with \\n- for bullet points",
      "key_features": "string with \\n- for bullet points",
      "competitive_landscape": "string with \\n- for bullet points",
      "constraints_assumptions": "string with \\n- for bullet points",
      "risks_mitigations": "string with \\n- for bullet points",
      "acceptance_criteria": "string with \\n- for bullet points",
      "user_stories": "string with \\n- for bullet points",
      "appendices": [],
      "analysis_confidence_score": number
    }`;

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
          model: "gpt-4-turbo-preview", // Using latest model that supports JSON mode
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          response_format: { type: "json_object" },
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
      "Raw OpenAI response:",
      JSON.stringify(openAIData.choices[0].message.content)
    );

    let analysisData;
    try {
      // Extract the JSON content from the OpenAI response
      const content = openAIData.choices[0].message.content.trim();
      console.log("Trimmed content:", content);

      // First try direct JSON parse
      try {
        analysisData = JSON.parse(content);
        console.log("Direct JSON parse successful");
      } catch (directParseError) {
        console.log("Direct JSON parse failed:", directParseError.message);

        // If direct parse fails, try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          const extractedJson = jsonMatch[1].trim();
          console.log("Extracted JSON from code block:", extractedJson);
          try {
            analysisData = JSON.parse(extractedJson);
            console.log("Code block JSON parse successful");
          } catch (extractedParseError) {
            console.log(
              "Code block JSON parse failed:",
              extractedParseError.message
            );
            throw new Error(
              `Failed to parse JSON from code block: ${extractedParseError.message}`
            );
          }
        } else {
          // Try to find any JSON-like structure in the content
          const possibleJson = content.match(/\{[\s\S]*\}/);
          if (possibleJson) {
            try {
              analysisData = JSON.parse(possibleJson[0]);
              console.log("Found and parsed JSON structure in content");
            } catch (structureParseError) {
              console.log(
                "Structure JSON parse failed:",
                structureParseError.message
              );
              throw new Error("No valid JSON found in response");
            }
          } else {
            throw new Error("No JSON structure found in response");
          }
        }
      }

      // Validate required fields
      const requiredFields = [
        "project_overview",
        "problem_statement",
        "proposed_solution",
        "business_goals",
        "target_audience",
        "key_features",
        "competitive_landscape",
        "constraints_assumptions",
        "risks_mitigations",
        "acceptance_criteria",
        "user_stories",
        "analysis_confidence_score",
      ];

      console.log("Parsed analysis data:", JSON.stringify(analysisData));

      const missingFields = requiredFields.filter(
        (field) => !(field in analysisData)
      );
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      console.log("Successfully parsed and validated OpenAI response");
    } catch (error) {
      console.error("Error processing OpenAI response:", error);
      throw new Error(`Failed to process AI response: ${error.message}`);
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
