
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const openAiKey = Deno.env.get("OPENAI_API_KEY")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to fetch data from Supabase
async function fetchFromSupabase(url: string, headers: any) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`);
  }
  return await response.json();
}

// Function to fetch a requirement by its ID
async function fetchRequirement(supabaseUrl: string, headers: any, requirementId: string) {
  console.log(`Fetching requirement with ID: ${requirementId}`);
  const requirements = await fetchFromSupabase(
    `${supabaseUrl}/rest/v1/requirements?req_id=eq.${requirementId}&select=*`, 
    headers
  );
  
  if (!requirements || requirements.length === 0) {
    throw new Error("Requirement not found");
  }
  
  return requirements[0];
}

// Function to fetch requirement analysis
async function fetchAnalysis(supabaseUrl: string, headers: any, requirementId: string) {
  const { data: analysis, error } = await fetchFromSupabase(
    `${supabaseUrl}/rest/v1/requirement_analysis?requirement_id=eq.${requirementId}&select=*`,
    headers
  );
  
  return analysis && analysis.length > 0 ? analysis[0] : null;
}

// Function to fetch market analysis
async function fetchMarketAnalysis(supabaseUrl: string, headers: any, requirementId: string) {
  const marketData = await fetchFromSupabase(
    `${supabaseUrl}/rest/v1/market_analysis?requirement_id=eq.${requirementId}&select=*`,
    headers
  );
  
  return marketData && marketData.length > 0 ? marketData[0] : null;
}

// Function to generate the prompt for OpenAI
function generatePrompt(requirement: any, analysis: any, marketAnalysis: any) {
  return `
    You are a senior product strategist and market analyst.
    Based on the provided product requirement and market research data, your task is to evaluate the product idea's market readiness, strengths, risks, and next steps.

    ⚠️ Very Important Instructions:

    Use only the information provided. Do not assume or fabricate facts, data points, or metrics.

    If any area lacks enough detail to assess, state that clearly in the output.

    Output must be a valid JSON object, matching the structure exactly. No markdown, commentary, or extra text.

    Text fields can be null if you truly cannot assess the content based on input.

    Arrays must be enclosed in [] with quoted string items.

    🟦 Inputs:
    Product Requirement (structured):
    Project Overview: ${analysis?.project_overview || requirement.project_idea || "Not available"}

    Problem Statement: ${analysis?.problem_statement || "Not available"}

    Proposed Solution: ${analysis?.proposed_solution || "Not available"}

    Key Features: ${analysis?.key_features || "Not available"}

    Market Analysis:
    Market Trends: ${marketAnalysis?.market_trends || "Not available"}

    Demand Insights: ${marketAnalysis?.demand_insights || "Not available"}

    Top Competitors: ${marketAnalysis?.top_competitors || "Not available"}

    Market Gaps: ${marketAnalysis?.market_gap_opportunity || "Not available"}

    SWOT Analysis: ${marketAnalysis?.swot_analysis || "Not available"}

    Benchmarks: ${marketAnalysis?.industry_benchmarks || "Not available"}

    🟨 Output Format (strict JSON):
    {
      "validation_summary": "string — concise evaluation summary (max 3–4 sentences)",
      "strengths": ["string", "string", "..."],  // Key strong points (up to 5)
      "risks": ["string", "string", "..."],      // Risks, gaps, concerns (up to 5)
      "recommendations": ["string", "string", "..."],  // Actionable advice for improvement
      "readiness_score": number,                 // From 0 to 100 (use your judgment)
      "validation_verdict": "validated" | "needs_refinement" | "high_risk"
    }
    Respond with only the JSON — no explanation.
    `;
}

// Function to call the OpenAI API
async function callOpenAI(prompt: string) {
  console.log("Calling OpenAI API");
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openAiKey}`
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
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API error:", errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Function to parse OpenAI response
function parseOpenAIResponse(content: string) {
  try {
    return JSON.parse(content.trim());
  } catch (e) {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error(`Failed to parse OpenAI response: ${e.message}`);
  }
}

// Function to find or create validation record
async function findOrCreateValidation(supabaseUrl: string, headers: any, requirement: any) {
  const validationRecords = await fetchFromSupabase(
    `${supabaseUrl}/rest/v1/requirement_validation?requirement_id=eq.${requirement.id}&select=id`,
    headers
  );
  
  return validationRecords && validationRecords.length > 0 ? validationRecords[0] : null;
}

// Function to save validation data
async function saveValidation(supabaseUrl: string, headers: any, existingValidation: any, validationData: any, requirementId: string) {
  const method = existingValidation ? "PATCH" : "POST";
  const url = existingValidation 
    ? `${supabaseUrl}/rest/v1/requirement_validation?id=eq.${existingValidation.id}`
    : `${supabaseUrl}/rest/v1/requirement_validation`;
  
  const timestamp = new Date().toISOString();
  
  const body = {
    requirement_id: requirementId,
    validation_summary: validationData.validation_summary,
    strengths: validationData.strengths,
    risks: validationData.risks,
    recommendations: validationData.recommendations,
    readiness_score: validationData.readiness_score,
    validation_verdict: validationData.validation_verdict,
    status: "Completed",
    updated_at: timestamp
  };
  
  if (!existingValidation) {
    body.created_at = timestamp;
  }
  
  const response = await fetch(url, {
    method: method,
    headers: {
      ...headers,
      "Prefer": "return=representation"
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to save validation:", errorText);
    throw new Error(`Failed to save validation: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
}

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requirementId } = await req.json();

    if (!requirementId) {
      throw new Error("Requirement ID is required");
    }

    console.log(`Processing validation for requirement ID: ${requirementId}`);

    // Setup Supabase credentials
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
    const supabaseAdmin = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

    const headers = {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseAdmin}`,
    };

    // Fetch requirement, analysis and market data
    const requirement = await fetchRequirement(supabaseUrl, headers, requirementId);
    const analysis = await fetchAnalysis(supabaseUrl, headers, requirement.id);
    const marketAnalysis = await fetchMarketAnalysis(supabaseUrl, headers, requirement.id);

    // Generate and call OpenAI
    const prompt = generatePrompt(requirement, analysis, marketAnalysis);
    const validationContent = await callOpenAI(prompt);
    
    console.log("Received validation response");
    
    // Parse the JSON response
    const validationJson = parseOpenAIResponse(validationContent);

    // Find existing validation record or create a new one
    const existingValidation = await findOrCreateValidation(supabaseUrl, headers, requirement);
    
    // Update or insert validation record
    const savedData = await saveValidation(supabaseUrl, headers, existingValidation, validationJson, requirement.id);
    
    console.log("Validation saved successfully");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Validation completed successfully",
        data: validationJson,
        record: savedData
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in validation process:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || "An error occurred during validation" 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
