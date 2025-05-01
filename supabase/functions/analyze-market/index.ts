
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
      throw new Error(`Error fetching requirement: ${requirementError.message}`);
    }
    
    // Fetch requirement analysis to get more context
    const { data: analysis, error: analysisError } = await supabase
      .from("requirement_analysis")
      .select("*")
      .eq("requirement_id", requirementId)
      .maybeSingle();
      
    if (analysisError && analysisError.code !== 'PGRST116') {
      throw new Error(`Error fetching requirement analysis: ${analysisError.message}`);
    }
    
    console.log(`Generating market analysis for project: ${requirement.project_name}`);
    
    // Prepare data for OpenAI prompt
    const projectData = {
      project_name: requirement.project_name || "",
      company_name: requirement.company_name || "",
      industry_type: requirement.industry_type || "",
      project_idea: requirement.project_idea || "",
      key_features: analysis?.key_features || "",
      target_audience: analysis?.target_audience || "",
      problem_statement: analysis?.problem_statement || "",
    };
    
    // Create the prompt for OpenAI
    const prompt = `
    You are acting as an expert Market Research Analyst.

    Based on the provided project details, create a comprehensive market analysis using the exact JSON structure requested.

    Project Details:
    Project Name: ${projectData.project_name}
    Company Name: ${projectData.company_name}
    Industry Type: ${projectData.industry_type}
    Project Idea: ${projectData.project_idea}
    Key Features: ${projectData.key_features}
    Target Audience: ${projectData.target_audience}
    Problem Statement: ${projectData.problem_statement}

    Instructions:
    - Analyze the market potential for this product/service
    - Identify relevant market trends and opportunities
    - Research competitive landscape in this industry
    - Provide realistic market insights based on the industry
    - Do not invent specific statistics - use general market knowledge
    - Keep each section concise (4-5 lines) and actionable
    - Use bullet points where appropriate

    Based on the project details above, generate a market analysis in valid JSON format that matches the following structure:

    {
      "market_trends": string describing 3-5 current trends in this market,
      "demand_insights": string with analysis of potential demand and customer needs,
      "top_competitors": string listing typical competitors in this space and their strengths,
      "market_gap_opportunity": string identifying the specific gap or opportunity this project addresses,
      "swot_analysis": string with brief SWOT analysis relevant to market position,
      "industry_benchmarks": string with 2-3 key performance indicators typical for this industry,
      "confidence_score": number (0-100) indicating confidence level of this analysis
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
        model: "gpt-4o-mini",
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
        market_trends: `Generated analysis could not be properly formatted. Raw content: ${content.substring(0, 100)}...`,
        confidence_score: 50, // Lower confidence due to parsing issue
      };
    }
    
    // Add the requirement_id to the market analysis data
    marketAnalysisData.requirement_id = requirementId;
    
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
        message: "Market analysis generated successfully" 
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
