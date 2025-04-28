
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { OpenAI } from "https://esm.sh/openai@4.20.1";

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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const openai = new OpenAI({ apiKey: openaiApiKey });
    
    const { documentUrl, requirementId } = await req.json();
    
    if (!documentUrl || !requirementId) {
      throw new Error("Document URL and requirement ID are required");
    }
    
    console.log(`Processing document: ${documentUrl} for requirement: ${requirementId}`);
    
    // Fetch the document content
    const response = await fetch(documentUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }
    
    // Read the document content as text
    // In a real implementation, you would use different parsers depending on the file type
    const documentContent = await response.text();
    console.log(`Document content length: ${documentContent.length} characters`);
    
    if (!documentContent || documentContent.length < 10) {
      throw new Error("Document content is too short or empty");
    }
    
    // Analyze the document content with OpenAI
    const analysisPrompt = `
      You are an AI system that analyzes project requirements documents. 
      Please analyze the following document content and extract structured information about the project.
      
      Document content:
      ${documentContent.substring(0, 8000)}
      
      Generate a comprehensive analysis with the following sections:
      1. Project Overview: A quick summary of the project idea and objective.
      2. Problem Statement: Clearly state the problem the product/feature is solving.
      3. Proposed Solution: Brief about how this product/feature will solve the problem.
      4. Business Goals & Success Metrics: What business outcomes are expected?
      5. Target Audience / Users: Who will use this product? Personas, segments.
      6. Key Features & Requirements: List major features or functionalities needed.
      7. User Stories (Optional): High-level user journeys if applicable.
      8. Competitive Landscape Summary: Quick snapshot of competitors, gaps identified.
      9. Constraints & Assumptions: Technical, operational, legal constraints; and assumptions made.
      10. Risks & Mitigations: What risks exist? How can they be mitigated?
      11. Acceptance Criteria: High-level conditions for "success" of this requirement.
      
      Format your response as a JSON object with these sections as keys and your analysis as values.
    `;
    
    console.log("Sending request to OpenAI...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are an AI assistant that specializes in analyzing software project requirements documents." 
        },
        { 
          role: "user", 
          content: analysisPrompt 
        }
      ],
      temperature: 0.5,
    });
    
    const analysisResponse = completion.choices[0].message.content;
    console.log("Received response from OpenAI");
    
    let analysisData;
    try {
      // Parse the JSON response
      analysisData = JSON.parse(analysisResponse);
      console.log("Successfully parsed OpenAI response as JSON");
    } catch (error) {
      console.error("Error parsing JSON from OpenAI response:", error);
      // Attempt to extract structured data using regex
      analysisData = {
        project_overview: extractSection(analysisResponse, "Project Overview"),
        problem_statement: extractSection(analysisResponse, "Problem Statement"),
        proposed_solution: extractSection(analysisResponse, "Proposed Solution"),
        business_goals: extractSection(analysisResponse, "Business Goals"),
        target_audience: extractSection(analysisResponse, "Target Audience"),
        key_features: extractSection(analysisResponse, "Key Features"),
        user_stories: extractSection(analysisResponse, "User Stories"),
        competitive_landscape: extractSection(analysisResponse, "Competitive Landscape"),
        constraints_assumptions: extractSection(analysisResponse, "Constraints & Assumptions"),
        risks_mitigations: extractSection(analysisResponse, "Risks & Mitigations"),
        acceptance_criteria: extractSection(analysisResponse, "Acceptance Criteria")
      };
    }
    
    // Calculate confidence score based on completeness of analysis
    const totalSections = 11;
    let populatedSections = 0;
    
    for (const key in analysisData) {
      if (analysisData[key] && analysisData[key].length > 10) {
        populatedSections++;
      }
    }
    
    const confidenceScore = Math.round((populatedSections / totalSections) * 100);
    
    // Check if analysis record already exists
    const { data: existingAnalysis } = await supabase
      .from("requirement_analysis")
      .select("id")
      .eq("requirement_id", requirementId)
      .maybeSingle();
    
    let result;
    const analysisRecord = {
      requirement_id: requirementId,
      project_overview: analysisData.project_overview || null,
      problem_statement: analysisData.problem_statement || null,
      proposed_solution: analysisData.proposed_solution || null,
      business_goals: analysisData.business_goals || null,
      target_audience: analysisData.target_audience || null,
      key_features: analysisData.key_features || null,
      user_stories: analysisData.user_stories || null,
      competitive_landscape: analysisData.competitive_landscape || null,
      constraints_assumptions: analysisData.constraints_assumptions || null,
      risks_mitigations: analysisData.risks_mitigations || null,
      acceptance_criteria: analysisData.acceptance_criteria || null,
      appendices: [documentUrl],
      analysis_confidence_score: confidenceScore
    };
    
    if (existingAnalysis) {
      // Update existing analysis
      result = await supabase
        .from("requirement_analysis")
        .update(analysisRecord)
        .eq("id", existingAnalysis.id)
        .select();
    } else {
      // Insert new analysis
      result = await supabase
        .from("requirement_analysis")
        .insert(analysisRecord)
        .select();
    }
    
    if (result.error) {
      throw new Error(`Error saving analysis: ${result.error.message}`);
    }
    
    // Update requirement status
    await supabase
      .from("requirements")
      .update({ status: "Completed" })
      .eq("id", requirementId);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Document processed successfully",
        analysis: result.data[0]
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing document:", error);
    
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

// Helper function to extract sections from text if JSON parsing fails
function extractSection(text, sectionName) {
  const regex = new RegExp(`${sectionName}[:\\s]+(.*?)(?=\\n\\s*\\d+\\.\\s|$)`, 'is');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}
