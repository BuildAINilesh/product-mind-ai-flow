
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const openAiKey = Deno.env.get("OPENAI_API_KEY")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { requirementId } = await req.json()

    if (!requirementId) {
      throw new Error("Requirement ID is required")
    }

    console.log(`Processing validation for requirement ID: ${requirementId}`)

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") as string
    const supabaseAdmin = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string

    const headers = {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseAdmin}`,
    }

    // Fetch requirement data
    const fetchRequirement = await fetch(`${supabaseUrl}/rest/v1/requirements?req_id=eq.${requirementId}&select=*`, {
      headers,
    })
    
    if (!fetchRequirement.ok) {
      throw new Error(`Failed to fetch requirement: ${fetchRequirement.status}`)
    }
    
    const requirements = await fetchRequirement.json()
    if (!requirements || requirements.length === 0) {
      throw new Error("Requirement not found")
    }
    
    const requirement = requirements[0]
    
    // Fetch requirement analysis
    const fetchAnalysis = await fetch(
      `${supabaseUrl}/rest/v1/requirement_analysis?requirement_id=eq.${requirement.id}&select=*`, 
      { headers }
    )
    
    if (!fetchAnalysis.ok) {
      throw new Error(`Failed to fetch requirement analysis: ${fetchAnalysis.status}`)
    }
    
    const analysisData = await fetchAnalysis.json()
    const analysis = analysisData && analysisData.length > 0 ? analysisData[0] : null
    
    // Fetch market analysis
    const fetchMarket = await fetch(
      `${supabaseUrl}/rest/v1/market_analysis?requirement_id=eq.${requirement.id}&select=*`, 
      { headers }
    )
    
    if (!fetchMarket.ok) {
      throw new Error(`Failed to fetch market analysis: ${fetchMarket.status}`)
    }
    
    const marketData = await fetchMarket.json()
    const marketAnalysis = marketData && marketData.length > 0 ? marketData[0] : null

    // Prepare the prompt for OpenAI
    const prompt = `
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
    `

    // Call OpenAI API
    console.log("Calling OpenAI API")
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
    })

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text()
      console.error("OpenAI API error:", errorText)
      throw new Error(`OpenAI API error: ${openAiResponse.status} - ${errorText}`)
    }

    const openAiData = await openAiResponse.json()
    const validationContent = openAiData.choices[0].message.content
    
    console.log("Received validation response")
    
    // Parse the JSON response
    let validationJson
    try {
      validationJson = JSON.parse(validationContent.trim())
    } catch (e) {
      console.error("Failed to parse OpenAI response:", validationContent)
      throw new Error(`Failed to parse OpenAI response: ${e.message}`)
    }

    // Find existing validation record or create a new one
    const fetchValidation = await fetch(
      `${supabaseUrl}/rest/v1/requirement_validation?requirement_id=eq.${requirement.id}&select=id`, 
      { headers }
    )
    
    if (!fetchValidation.ok) {
      throw new Error(`Failed to fetch validation record: ${fetchValidation.status}`)
    }
    
    const validationRecords = await fetchValidation.json()
    const existingValidation = validationRecords && validationRecords.length > 0 ? validationRecords[0] : null
    
    // Update or insert validation record
    const validationMethod = existingValidation ? "PATCH" : "POST"
    const validationUrl = existingValidation 
      ? `${supabaseUrl}/rest/v1/requirement_validation?id=eq.${existingValidation.id}`
      : `${supabaseUrl}/rest/v1/requirement_validation`
    
    const validationData = {
      requirement_id: requirement.id,
      validation_summary: validationJson.validation_summary,
      strengths: validationJson.strengths,
      risks: validationJson.risks,
      recommendations: validationJson.recommendations,
      readiness_score: validationJson.readiness_score,
      validation_verdict: validationJson.validation_verdict,
      status: "Completed"
    }
    
    if (!existingValidation) {
      validationData.created_at = new Date().toISOString()
    }
    
    validationData.updated_at = new Date().toISOString()
    
    const saveValidation = await fetch(validationUrl, {
      method: validationMethod,
      headers: {
        ...headers,
        "Prefer": existingValidation ? "return=representation" : "return=representation"
      },
      body: JSON.stringify(validationData)
    })
    
    if (!saveValidation.ok) {
      const errorText = await saveValidation.text()
      console.error("Failed to save validation:", errorText)
      throw new Error(`Failed to save validation: ${saveValidation.status} - ${errorText}`)
    }
    
    const savedData = await saveValidation.json()
    
    console.log("Validation saved successfully")
    
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
    )
  } catch (error) {
    console.error("Error in validation process:", error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || "An error occurred during validation" 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})
