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

    console.log(
      `Generating Final BRD for project: ${requirement.project_name}`
    );

    // Fetch requirement analysis for project overview
    const { data: analysis, error: analysisError } = await supabase
      .from("requirement_analysis")
      .select("*")
      .eq("requirement_id", projectId)
      .single();

    if (analysisError) {
      throw new Error(
        `Error fetching requirement analysis: ${analysisError.message}`
      );
    }

    // Fetch market analysis
    const { data: marketAnalysis, error: marketError } = await supabase
      .from("market_analysis")
      .select("*")
      .eq("requirement_id", projectId)
      .single();

    // Fetch validation analysis
    const { data: validationAnalysis, error: validationError } = await supabase
      .from("validation_analysis")
      .select("*")
      .eq("requirement_id", projectId)
      .single();

    // Fetch user stories
    const { data: userStories, error: userStoriesError } = await supabase
      .from("user_stories")
      .select("*")
      .eq("requirement_id", projectId);

    // Fetch use cases
    const { data: useCases, error: useCasesError } = await supabase
      .from("use_cases")
      .select("*")
      .eq("requirement_id", projectId);

    // Fetch test cases
    const { data: testCases, error: testCasesError } = await supabase
      .from("test_cases")
      .select("*")
      .eq("requirement_id", projectId);

    // Calculate test case counts by type
    const testCaseCounts = {
      total: testCases?.length || 0,
      functional:
        testCases?.filter((tc) => tc.test_type === "Functional").length || 0,
      edge: testCases?.filter((tc) => tc.test_type === "Edge").length || 0,
      negative:
        testCases?.filter((tc) => tc.test_type === "Negative").length || 0,
      integration:
        testCases?.filter((tc) => tc.test_type === "Integration").length || 0,
    };

    // Prepare data for OpenAI prompt
    const promptData = {
      project_overview: analysis?.project_overview || "",
      problem_statement: analysis?.problem_statement || "",
      proposed_solution: analysis?.proposed_solution || "",
      key_features: analysis?.key_features || "",
      business_goals: analysis?.business_goals || "",
      target_audience: analysis?.target_audience || "",

      // Market insights
      market_trends: marketAnalysis?.market_trends || "",
      demand_insights: marketAnalysis?.demand_insights || "",
      top_competitors: marketAnalysis?.top_competitors || "",
      swot_analysis: marketAnalysis?.swot_analysis || "",
      market_gap_opportunity: marketAnalysis?.market_gap_opportunity || "",

      // Validation
      validation_summary: validationAnalysis?.validation_summary || "",
      strengths: validationAnalysis?.strengths || "",
      risks: validationAnalysis?.risks || "",
      recommendations: validationAnalysis?.recommendations || "",
      readiness_score: validationAnalysis?.readiness_score || 0,
      validation_verdict: validationAnalysis?.validation_verdict || "",

      // Artifacts
      user_stories_json: JSON.stringify(userStories || []),
      use_cases_json: JSON.stringify(useCases || []),
      test_case_counts: JSON.stringify(testCaseCounts),
    };

    // Create the prompt for OpenAI
    const prompt = `
You are an expert BRD writer and product analyst.
Your job is to stitch together a detailed, logically flowing, and business-aligned Business Requirements Document (BRD).

🧠 The BRD should:
- Tell a coherent story from context to recommendation
- Use the structure of a traditional enterprise BRD
- Be firmly rooted in the actual data (requirement, research, validation, user stories, use cases, and tests)
- Have deep insights, linked logic across sections, and professional tone

📌 Inputs:
---
Project Overview: ${promptData.project_overview}
Problem Statement: ${promptData.problem_statement}
Proposed Solution: ${promptData.proposed_solution}
Key Features: ${promptData.key_features}
Business Goals: ${promptData.business_goals}
Target Audience: ${promptData.target_audience}

Market Trends: ${promptData.market_trends}
Demand Insights: ${promptData.demand_insights}
Top Competitors: ${promptData.top_competitors}
SWOT: ${promptData.swot_analysis}
Gap Opportunity: ${promptData.market_gap_opportunity}

Validation Summary: ${promptData.validation_summary}
Strengths: ${promptData.strengths}
Risks: ${promptData.risks}
Recommendations: ${promptData.recommendations}
Readiness Score: ${promptData.readiness_score}
Verdict: ${promptData.validation_verdict}

User Stories: ${promptData.user_stories_json}
Use Cases: ${promptData.use_cases_json}
Test Case Summary: ${promptData.test_case_counts}

---

🎯 Section-Specific Instructions:

1. Project Overview (250-300 words):
   - Executive summary of the project scope
   - Clear articulation of the business opportunity
   - High-level timeline and resource implications
   - Key stakeholders and their roles

2. Problem Statement (200-250 words):
   - Current state analysis
   - Pain points and their business impact
   - Quantifiable metrics showing the problem scale
   - Affected stakeholders and their challenges

3. Proposed Solution (250-300 words):
   - Comprehensive solution architecture
   - Core functionalities and their benefits
   - Integration requirements
   - Technical and operational considerations

4. Key Features (200-250 words):
   - Prioritized feature list with rationale
   - Dependencies and implementation phases
   - Success metrics for each feature
   - Integration points with existing systems

5. Business Goals (200-250 words):
   - Short and long-term objectives
   - Success metrics and KPIs
   - ROI analysis and timeline
   - Risk-adjusted business outcomes

6. Target Audience (200-250 words):
   - Detailed persona analysis
   - Usage patterns and preferences
   - Pain points and gain points
   - Adoption barriers and enablers

7. Market Research Summary (250-300 words):
   - Market size and growth potential
   - Competitive landscape analysis
   - Market gaps and opportunities
   - Trend impact analysis

8. Validation Summary (200-250 words):
   - Validation methodology
   - Key findings and insights
   - Stakeholder feedback synthesis
   - Pivot points and adjustments

9. Risks and Mitigations:
   - Strategic risks
   - Operational risks
   - Technical risks
   - Market risks
   Each risk should include:
   - Impact assessment
   - Probability analysis
   - Mitigation strategy
   - Contingency plan

10. Final Recommendation (250-300 words):
    - Go/No-go recommendation
    - Critical success factors
    - Implementation roadmap
    - Resource requirements
    - Next steps and timeline

General Instructions:
1. Make each section read like a part of a bigger narrative.
2. Use insights from earlier sections to inform later ones (e.g., market → validation → risks).
3. Make the document compelling but rooted in factual insights only.
4. User stories and use cases should be distilled into bullet-style summaries.
5. Risks should be connected to key challenges or edge cases.
6. Final recommendation must refer to all prior factors logically.
7. Keep each section aligned with enterprise standards.
8. Do not invent new features or fabricate metrics.

✅ Output Format (JSON only):
{
  "brd_document": {
    "project_overview": "...",
    "problem_statement": "...",
    "proposed_solution": "...",
    "key_features": "...",
    "business_goals": "...",
    "target_audience": "...",
    "market_research_summary": "...",
    "validation_summary": "...",
    "user_stories_summary": ["...", "..."],
    "use_cases_summary": ["...", "..."],
    "test_case_summary": {
      "total_tests": number,
      "functional": number,
      "edge": number,
      "negative": number,
      "integration": number
    },
    "risks_and_mitigations": [
      {
        "risk_type": "...",
        "description": "...",
        "impact": "...",
        "probability": "...",
        "mitigation": "...",
        "contingency": "..."
      }
    ],
    "final_recommendation": "...",
    "ai_signoff_confidence": number (0–100)
  }
}

Respond with a valid, clean JSON object only.`;

    // Call OpenAI API to generate the BRD
    const openAIResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o", // Using a suitable OpenAI model
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
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

    let brdData;
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
      brdData = JSON.parse(jsonString);
      console.log("Successfully parsed OpenAI response to JSON");
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      throw new Error(`Failed to parse BRD data: ${error.message}`);
    }

    // Map the BRD document to the requirement_brd table structure
    const doc = brdData.brd_document;
    const finalBrdData = {
      requirement_id: projectId,
      status: "ready",
      project_overview: doc.project_overview || "",
      problem_statement: doc.problem_statement || "",
      proposed_solution: doc.proposed_solution || "",
      key_features: doc.key_features || "",
      business_goals: doc.business_goals || "",
      target_audience: doc.target_audience || "",
      market_research_summary: doc.market_research_summary || "",
      validation_summary: doc.validation_summary || "",
      user_stories_summary: doc.user_stories_summary || [],
      use_cases_summary: doc.use_cases_summary || [],
      total_tests: doc.test_case_summary?.total_tests || 0,
      functional_tests: doc.test_case_summary?.functional || 0,
      edge_tests: doc.test_case_summary?.edge || 0,
      negative_tests: doc.test_case_summary?.negative || 0,
      integration_tests: doc.test_case_summary?.integration || 0,
      risks_and_mitigations: doc.risks_and_mitigations || [],
      final_recommendation: doc.final_recommendation || "",
      ai_signoff_confidence: doc.ai_signoff_confidence || 0,
      updated_at: new Date().toISOString(),
    };

    // Check if BRD already exists
    const { data: existingBrd } = await supabase
      .from("requirement_brd")
      .select("id")
      .eq("requirement_id", projectId)
      .maybeSingle();

    let result;

    if (existingBrd) {
      // Update existing BRD
      result = await supabase
        .from("requirement_brd")
        .update(finalBrdData)
        .eq("id", existingBrd.id)
        .select();
    } else {
      // Insert new BRD
      result = await supabase
        .from("requirement_brd")
        .insert(finalBrdData)
        .select();
    }

    if (result.error) {
      throw new Error(`Error saving BRD: ${result.error.message}`);
    }

    // Update the requirement status
    await supabase
      .from("requirements")
      .update({ status: "Completed" })
      .eq("id", projectId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Final BRD generated successfully",
        brd_id: result.data[0].id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error generating final BRD:", error);

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
