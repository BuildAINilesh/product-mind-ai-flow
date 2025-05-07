
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
      throw new Error(`Error fetching requirement: ${requirementError.message}`);
    }
    
    console.log(`Processing project: ${requirement.project_name}`);
    
    // Prepare data for OpenAI prompt
    const projectData = {
      project_name: requirement.project_name || "",
      company_name: requirement.company_name || "",
      industry_type: requirement.industry_type || "",
      project_idea: requirement.project_idea || "",
      document_summary: requirement.document_summary || "None"
    };
    
    // Create the prompt for OpenAI
    const prompt = `
    You are acting as an expert Product Manager and Business Analyst.

    Based on the provided project idea and basic details, create a structured Business Requirements Document (BRD) following the exact format below.

    Project Details:
    Project Name: ${projectData.project_name}
    Company Name: ${projectData.company_name}
    Industry Type: ${projectData.industry_type}
    Project Idea: ${projectData.project_idea}
    Uploaded Files Summary (if any): ${projectData.document_summary}

    Instructions:
    Stick to the structure below exactly.
    Do not invent information. If some section cannot be confidently answered from the input, mention: "Details not provided. Please validate."
    Use clear, simple professional English.
    Use bullet points where needed (for Features, Goals, Risks, etc.).
    Keep each section short, precise, and focused (no more than 4–5 lines unless needed).
    For Business Goals, suggest 2–3 realistic success metrics related to the Industry Type.
    For Competitive Landscape, suggest common competitor types or gaps typical for that industry.

    Based on the product idea and basic project inputs above, generate a requirement analysis in valid JSON format that matches the following database schema:

    {
      "project_overview": string or null,
      "problem_statement": string or null,
      "proposed_solution": string or null,
      "business_goals": string or null,
      "target_audience": string or null,
      "key_features": string or null,
      "competitive_landscape": string or null,
      "constraints_assumptions": string or null,
      "risks_mitigations": string or null,
      "acceptance_criteria": string or null,
      "user_stories": string or null,
      "appendices": [],
      "analysis_confidence_score": number (0–100, estimate of AI's confidence)
    }

    Ensure the response is a valid JSON object that can be parsed.
    `;
    
    // Call OpenAI API to generate the analysis
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using a suitable OpenAI model
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      })
    });
    
    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error("OpenAI API Error:", errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || "Unknown error"}`);
    }
    
    const openAIData = await openAIResponse.json();
    console.log("OpenAI response received");
    
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
      }
      
      // Parse the JSON
      analysisData = JSON.parse(jsonString);
      console.log("Successfully parsed OpenAI response to JSON");
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      // If parsing fails, use a simplified format with the raw content
      const content = openAIData.choices[0].message.content;
      analysisData = {
        project_overview: `Generated analysis could not be properly formatted. Raw content: ${content.substring(0, 100)}...`,
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

    // Create/Update the BRD document
    const { data: existingBRD } = await supabase
      .from("requirement_brd")
      .select("id")
      .eq("requirement_id", projectId)
      .maybeSingle();
    
    const brdData = {
      requirement_id: projectId,
      brd_document: analysisData,
      status: "ready" // Set to ready since we just generated it
    };
    
    let brdResult;
    
    if (existingBRD) {
      brdResult = await supabase
        .from("requirement_brd")
        .update(brdData)
        .eq("id", existingBRD.id);
    } else {
      brdResult = await supabase
        .from("requirement_brd")
        .insert(brdData);
    }
    
    if (brdResult.error) {
      throw new Error(`Error saving BRD: ${brdResult.error.message}`);
    }
    
    // Update the requirement's structured_document field with the BRD data
    await supabase
      .from("requirements")
      .update({ 
        status: "Completed",
        structured_document: analysisData
      })
      .eq("id", projectId);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Project processed successfully with OpenAI analysis" 
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
