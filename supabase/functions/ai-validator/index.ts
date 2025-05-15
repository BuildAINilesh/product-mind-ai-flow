import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Define interfaces for our data structures
interface Requirement {
  id: string;
  req_id?: string;
  user_id: string;
  project_name?: string;
  project_idea?: string;
  [key: string]: unknown;
}

interface Analysis {
  id?: string;
  requirement_id: string;
  project_overview?: string | null;
  problem_statement?: string | null;
  proposed_solution?: string | null;
  key_features?: string | null;
  [key: string]: unknown;
}

interface MarketAnalysis {
  id?: string;
  requirement_id: string;
  market_trends?: string | null;
  demand_insights?: string | null;
  top_competitors?: string | null;
  market_gap_opportunity?: string | null;
  swot_analysis?: string | null;
  industry_benchmarks?: string | null;
  [key: string]: unknown;
}

interface ValidationRecord {
  id: string;
  requirement_id: string;
  status: string | null;
  validation_summary?: string | null;
  strengths?: string[] | null;
  risks?: string[] | null;
  recommendations?: string[] | null;
  readiness_score?: number | null;
  validation_verdict?: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

interface ValidationResult {
  validation_summary: string;
  strengths: string[];
  risks: string[];
  recommendations: string[];
  readiness_score: number;
  validation_verdict: "validated" | "needs_refinement" | "high_risk";
}

interface SupabaseHeaders {
  "Content-Type": string;
  apikey: string;
  Authorization: string;
  [key: string]: string;
}

// Function to fetch data from Supabase
async function fetchFromSupabase(url: string, headers: SupabaseHeaders) {
  let retries = 3;
  let lastError = null;

  while (retries > 0) {
    try {
      console.log(`Attempting to fetch from: ${url}`);
      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Fetch failed with status ${response.status}: ${errorText}`
        );
        throw new Error(`Fetch failed: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log(
        `Successfully fetched data, got ${responseData.length} items`
      );
      return responseData;
    } catch (error) {
      lastError = error;
      console.error(`Fetch attempt failed (${retries} retries left):`, error);
      retries--;

      if (retries > 0) {
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, (3 - retries) * 1000)
        );
      }
    }
  }

  throw lastError || new Error("Failed to fetch data after multiple attempts");
}

// Function to fetch a requirement by its ID
async function fetchRequirement(
  supabaseUrl: string,
  headers: SupabaseHeaders,
  requirementId: string
): Promise<Requirement> {
  // Decode the requirementId in case it was URL encoded
  const decodedReqId = decodeURIComponent(requirementId);
  console.log(`Fetching requirement with ID: ${requirementId}`);
  console.log(`Decoded ID: ${decodedReqId}`);

  try {
    // First try with req_id exact match (most common case)
    console.log(`Trying to fetch by req_id exact match: ${decodedReqId}`);
    const requirementsByReqId = await fetchFromSupabase(
      `${supabaseUrl}/rest/v1/requirements?req_id=eq.${decodedReqId}&select=*`,
      headers
    );

    if (requirementsByReqId && requirementsByReqId.length > 0) {
      console.log("Found requirement with req_id exact match");
      return requirementsByReqId[0] as Requirement;
    }

    // If not found by req_id, try with internal UUID match
    console.log("Not found by req_id, trying internal UUID...");
    const uuidRequirements = await fetchFromSupabase(
      `${supabaseUrl}/rest/v1/requirements?id=eq.${decodedReqId}&select=*`,
      headers
    );

    if (uuidRequirements && uuidRequirements.length > 0) {
      console.log("Found requirement with internal UUID match");
      return uuidRequirements[0] as Requirement;
    }

    // If exact matches fail, try case-insensitive match on req_id
    console.log(
      "Exact matches failed, trying case-insensitive match on req_id"
    );
    const caseInsensitiveRequirements = await fetchFromSupabase(
      `${supabaseUrl}/rest/v1/requirements?req_id=ilike.${decodedReqId}&select=*`,
      headers
    );

    if (
      !caseInsensitiveRequirements ||
      caseInsensitiveRequirements.length === 0
    ) {
      throw new Error(`Requirement not found with ID: ${decodedReqId}`);
    }

    console.log("Found requirement with case-insensitive match on req_id");
    return caseInsensitiveRequirements[0] as Requirement;
  } catch (error) {
    console.error("Error fetching requirement:", error);
    throw new Error(`Failed to fetch requirement: ${(error as Error).message}`);
  }
}

// Function to fetch requirement analysis
async function fetchAnalysis(
  supabaseUrl: string,
  headers: SupabaseHeaders,
  requirementId: string
): Promise<Analysis | null> {
  console.log(
    `Fetching analysis for requirement with internal ID: ${requirementId}`
  );
  const analysis = await fetchFromSupabase(
    `${supabaseUrl}/rest/v1/requirement_analysis?requirement_id=eq.${requirementId}&select=*`,
    headers
  );

  return analysis && analysis.length > 0 ? (analysis[0] as Analysis) : null;
}

// Function to fetch market analysis
async function fetchMarketAnalysis(
  supabaseUrl: string,
  headers: SupabaseHeaders,
  requirementId: string
): Promise<MarketAnalysis | null> {
  console.log(
    `Fetching market analysis for requirement with internal ID: ${requirementId}`
  );
  const marketData = await fetchFromSupabase(
    `${supabaseUrl}/rest/v1/market_analysis?requirement_id=eq.${requirementId}&select=*`,
    headers
  );

  return marketData && marketData.length > 0
    ? (marketData[0] as MarketAnalysis)
    : null;
}

// Function to generate the prompt for OpenAI
function generatePrompt(
  requirement: Requirement,
  analysis: Analysis | null,
  marketAnalysis: MarketAnalysis | null
): string {
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
    Project Overview: ${
      analysis?.project_overview || requirement.project_idea || "Not available"
    }

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

  if (!openAiKey) {
    console.error("OpenAI API key is missing");
    throw new Error(
      "OpenAI API key is missing. Please check environment variables."
    );
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    }),
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
async function findOrCreateValidation(
  supabaseUrl: string,
  headers: SupabaseHeaders,
  requirement: Requirement
): Promise<ValidationRecord> {
  const reqId = requirement.id;
  console.log(
    `[DEBUG] Looking for validation records for requirement: ${reqId}`
  );
  console.log(
    `[DEBUG] Internal UUID: ${reqId}, Display req_id: ${requirement.req_id}`
  );

  try {
    // First try to get all validation records for this requirement to see what exists
    const allValidationRecords = await fetchFromSupabase(
      `${supabaseUrl}/rest/v1/requirement_validation?requirement_id=eq.${reqId}&select=*`,
      headers
    );

    console.log(
      `[DEBUG] Found ${
        allValidationRecords?.length || 0
      } total validation records for requirement ${reqId}`
    );

    if (allValidationRecords?.length > 0) {
      // Log all found records for debugging
      allValidationRecords.forEach((record, index) => {
        console.log(
          `[DEBUG] Record ${index + 1}: ID=${record.id}, Status=${
            record.status
          }, Updated=${record.updated_at}`
        );
      });

      // Get the most recent record by created_at
      const mostRecent = [...allValidationRecords].sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      )[0] as ValidationRecord;

      console.log(
        `[DEBUG] Selected record ID: ${mostRecent.id} as the most recent`
      );
      return mostRecent;
    }

    // If no records exist, create a new validation record
    console.log(
      `[DEBUG] No validation records found for requirement ${reqId}, creating a new one`
    );

    const timestamp = new Date().toISOString();
    const newValidationUrl = `${supabaseUrl}/rest/v1/requirement_validation`;

    const response = await fetch(newValidationUrl, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        requirement_id: reqId,
        status: "Draft",
        created_at: timestamp,
        updated_at: timestamp,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[ERROR] Failed to create validation record: ${response.status} - ${errorText}`
      );
      throw new Error(
        `Failed to create validation record: ${response.status} - ${errorText}`
      );
    }

    const newValidation = await response.json();
    console.log(
      `[DEBUG] Created new validation record with ID: ${newValidation[0].id}`
    );
    return newValidation[0] as ValidationRecord;
  } catch (error) {
    console.error(`[ERROR] Error finding/creating validation record: ${error}`);
    throw error;
  }
}

// Function to save validation data
async function saveValidation(
  supabaseUrl: string,
  headers: SupabaseHeaders,
  existingValidation: ValidationRecord | null,
  validationData: ValidationResult,
  requirementId: string
) {
  try {
    console.log(`[DEBUG] Saving validation for requirement ${requirementId}`);
    console.log(
      `[DEBUG] Existing validation record: ${
        existingValidation ? existingValidation.id : "None - creating new"
      }`
    );

    const method = existingValidation ? "PATCH" : "POST";
    const url = existingValidation
      ? `${supabaseUrl}/rest/v1/requirement_validation?id=eq.${existingValidation.id}`
      : `${supabaseUrl}/rest/v1/requirement_validation`;

    const timestamp = new Date().toISOString();

    interface ValidationBody {
      requirement_id: string;
      validation_summary: string;
      strengths: string[];
      risks: string[];
      recommendations: string[];
      readiness_score: number;
      validation_verdict: string;
      status: string;
      updated_at: string;
      created_at?: string;
    }

    const body: ValidationBody = {
      requirement_id: requirementId,
      validation_summary: validationData.validation_summary,
      strengths: validationData.strengths,
      risks: validationData.risks,
      recommendations: validationData.recommendations,
      readiness_score: validationData.readiness_score,
      validation_verdict: validationData.validation_verdict,
      status: "Completed",
      updated_at: timestamp,
    };

    if (!existingValidation) {
      body.created_at = timestamp;
    }

    console.log(`[DEBUG] Saving validation data using ${method} to ${url}`);
    console.log(
      `[DEBUG] Validation data summary: ${body.validation_summary.substring(
        0,
        50
      )}...`
    );

    const response = await fetch(url, {
      method: method,
      headers: {
        ...headers,
        Prefer: "return=representation",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[ERROR] Failed to save validation: ${response.status} - ${errorText}`
      );
      throw new Error(
        `Failed to save validation: ${response.status} - ${errorText}`
      );
    }

    const savedData = await response.json();
    console.log(
      `[DEBUG] Validation saved successfully. Returned record ID: ${
        savedData[0]?.id || "unknown"
      }`
    );

    // Function to update requirement flow status
    await updateRequirementFlowStatus(supabaseUrl, headers, requirementId);

    return savedData;
  } catch (error) {
    console.error(`[ERROR] Exception saving validation: ${error}`);
    throw error;
  }
}

// Function to update requirement flow status
async function updateRequirementFlowStatus(
  supabaseUrl: string,
  headers: SupabaseHeaders,
  requirementId: string
) {
  try {
    console.log(
      `[DEBUG] Updating requirement flow status for ${requirementId}`
    );

    // First fetch the flow tracking record to verify it exists
    const flowTrackingUrl = `${supabaseUrl}/rest/v1/requirement_flow_tracking?requirement_id=eq.${requirementId}&select=*`;
    console.log(
      `[DEBUG] Fetching flow tracking record from: ${flowTrackingUrl}`
    );

    const flowTracking = await fetchFromSupabase(flowTrackingUrl, headers);

    if (!flowTracking || flowTracking.length === 0) {
      console.error(
        `[ERROR] Flow tracking record not found for requirement ${requirementId}`
      );

      // Create a new flow tracking record if one doesn't exist
      console.log(
        `[DEBUG] Creating new flow tracking record for requirement ${requirementId}`
      );
      const createResponse = await fetch(
        `${supabaseUrl}/rest/v1/requirement_flow_tracking`,
        {
          method: "POST",
          headers: {
            ...headers,
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            requirement_id: requirementId,
            current_stage: "case_generator",
            validator_status: "validation_complete",
            case_generator_status: "case_draft",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),
        }
      );

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error(
          `[ERROR] Failed to create flow tracking record: ${createResponse.status} - ${errorText}`
        );
        return false;
      }

      console.log(`[DEBUG] Successfully created new flow tracking record`);
      return true;
    }

    console.log(
      `[DEBUG] Found existing flow tracking record: ${JSON.stringify(
        flowTracking[0]
      )}`
    );

    // Try to update using both SQL function and direct update for redundancy
    // First attempt: Call the completeValidator function
    console.log(`[DEBUG] Attempting to call completeValidator function`);
    try {
      const rpcResponse = await fetch(
        `${supabaseUrl}/rest/v1/rpc/completevalidator`,
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            p_requirement_id: requirementId,
          }),
        }
      );

      const rpcResult = await rpcResponse.text();
      console.log(
        `[DEBUG] SQL function result: ${rpcResponse.status} - ${rpcResult}`
      );

      if (rpcResponse.ok) {
        console.log(`[DEBUG] Successfully called completeValidator function`);
        // Return true here but still try the backup method
      }
    } catch (rpcError) {
      console.error(`[ERROR] Error calling SQL function: ${rpcError}`);
      // Continue to backup method
    }

    // Second attempt: Direct update approach that doesn't depend on current stage
    console.log(`[DEBUG] Using direct update approach as backup`);
    const updateUrl = `${supabaseUrl}/rest/v1/requirement_flow_tracking?requirement_id=eq.${requirementId}`;
    console.log(`[DEBUG] Updating flow tracking at: ${updateUrl}`);

    const updateData = {
      validator_status: "validation_complete",
      current_stage: "case_generator",
      case_generator_status: "case_draft",
      updated_at: new Date().toISOString(),
    };

    console.log(`[DEBUG] Update payload: ${JSON.stringify(updateData)}`);

    const response = await fetch(updateUrl, {
      method: "PATCH",
      headers: {
        ...headers,
        Prefer: "return=representation",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[ERROR] Failed to update flow status: ${response.status} - ${errorText}`
      );
      return false;
    }

    // Verify the update was successful by fetching the record again
    const verificationResponse = await fetchFromSupabase(
      flowTrackingUrl,
      headers
    );

    if (verificationResponse && verificationResponse.length > 0) {
      console.log(
        `[DEBUG] Verification: ${JSON.stringify(verificationResponse[0])}`
      );

      if (
        verificationResponse[0].validator_status === "validation_complete" &&
        verificationResponse[0].current_stage === "case_generator"
      ) {
        console.log("[DEBUG] Successfully verified flow tracking update");
        return true;
      } else {
        console.warn(
          "[WARN] Flow tracking update verification failed - status doesn't match expected values"
        );
      }
    }

    console.log("[DEBUG] Successfully updated requirement flow status");
    return true;
  } catch (error) {
    console.error(`[ERROR] Exception updating flow status: ${error}`);
    return false;
  }
}

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let requirementId;
    try {
      const body = await req.json();
      requirementId = body.requirementId;
      console.log(
        `[DEBUG] Received requirementId in request: ${requirementId}`
      );
    } catch (parseError) {
      console.error("[ERROR] Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid request format: " + parseError.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!requirementId) {
      throw new Error("Requirement ID is required");
    }

    console.log(
      `[DEBUG] Processing validation for requirement ID: ${requirementId}`
    );

    // Setup Supabase credentials
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
    const supabaseAdmin = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

    if (!supabaseUrl || !supabaseKey || !supabaseAdmin) {
      throw new Error("Supabase credentials are missing");
    }

    const headers = {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseAdmin}`,
    };

    // Fetch requirement, analysis and market data
    const requirement = await fetchRequirement(
      supabaseUrl,
      headers,
      requirementId
    );

    if (!requirement) {
      console.error(`[ERROR] Requirement not found with ID: ${requirementId}`);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Requirement not found with ID: ${requirementId}`,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `[DEBUG] Found requirement: ID=${requirement.id}, req_id=${
        requirement.req_id || "none"
      }`
    );

    // Always use the internal UUID for consistency in database relationships
    const internalId = requirement.id;
    console.log(
      `[DEBUG] Using internal ID ${internalId} for all related lookups`
    );

    // Extract the user_id from the requirement to ensure we're handling data from the correct user
    const userId = requirement?.user_id;
    if (!userId) {
      throw new Error(
        "Could not determine user ownership for this requirement"
      );
    }

    const analysis = await fetchAnalysis(supabaseUrl, headers, internalId);
    console.log(`[DEBUG] Analysis data: ${analysis ? "Found" : "Not found"}`);

    const marketAnalysis = await fetchMarketAnalysis(
      supabaseUrl,
      headers,
      internalId
    );
    console.log(
      `[DEBUG] Market analysis data: ${marketAnalysis ? "Found" : "Not found"}`
    );

    // Generate and call OpenAI
    const prompt = generatePrompt(requirement, analysis, marketAnalysis);
    const validationContent = await callOpenAI(prompt);

    console.log("[DEBUG] Received validation response from OpenAI");

    // Parse the JSON response
    const validationJson = parseOpenAIResponse(validationContent);

    // Find existing validation record
    const existingValidation = await findOrCreateValidation(
      supabaseUrl,
      headers,
      requirement
    );

    // Update existing record or create a new one if none exists
    const savedData = await saveValidation(
      supabaseUrl,
      headers,
      existingValidation, // Use existing record if found
      validationJson,
      internalId
    );

    console.log("[DEBUG] Validation saved successfully");

    // Update the requirement flow tracking status
    const flowUpdateSuccess = await updateRequirementFlowStatus(
      supabaseUrl,
      headers,
      internalId
    );

    if (flowUpdateSuccess) {
      console.log("[DEBUG] Flow tracking status updated successfully");
    } else {
      console.warn(
        "[WARN] Failed to update flow tracking status, but validation was saved"
      );
    }

    // Double-check the saved data by fetching the latest record
    const latestRecord = await fetchFromSupabase(
      `${supabaseUrl}/rest/v1/requirement_validation?requirement_id=eq.${internalId}&select=*&order=created_at.desc&limit=1`,
      headers
    );

    if (latestRecord && latestRecord.length > 0) {
      console.log(
        `[DEBUG] Latest validation record for verification: ID=${latestRecord[0].id}`
      );
      console.log(
        `[DEBUG] Validation summary: ${
          latestRecord[0].validation_summary?.substring(0, 50) || "not set"
        }...`
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Validation completed successfully",
        data: validationJson,
        record: savedData,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[ERROR] Error in validation process:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An error occurred during validation",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
