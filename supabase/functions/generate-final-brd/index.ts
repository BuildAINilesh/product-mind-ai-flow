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
    You are an experienced product documentation expert.
    Based on all prior product development artifacts, generate a comprehensive Business Requirements Document (BRD) ready for team review and stakeholder sign-off.

    ⚠️ Do not make up any content. Only use what's given.

    Inputs:
    Requirement Overview: ${promptData.project_overview}, ${promptData.problem_statement}, ${promptData.proposed_solution}, ${promptData.key_features}, ${promptData.business_goals}, ${promptData.target_audience}

    Market Insights: ${promptData.market_trends}, ${promptData.demand_insights}, ${promptData.top_competitors}, ${promptData.swot_analysis}, ${promptData.market_gap_opportunity}

    Validation Verdict: ${promptData.validation_summary}, ${promptData.strengths}, ${promptData.risks}, ${promptData.recommendations}, ${promptData.readiness_score}, ${promptData.validation_verdict}

    FlowForge Artifacts:

    User Stories: ${promptData.user_stories_json}

    Use Cases: ${promptData.use_cases_json}

    Test Cases (summary): ${promptData.test_case_counts}
    `;

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

    // Add the requirement_id to the BRD data
    const finalBrdData = {
      requirement_id: projectId,
      brd_document: brdData.brd_document, // Make sure OpenAI response matches this structure
      created_at: new Date().toISOString(),
    };

    // Check if BRD already exists
    const { data: existingBrd } = await supabase
      .from("final_brd")
      .select("id")
      .eq("requirement_id", projectId)
      .maybeSingle();

    let result;

    if (existingBrd) {
      // Update existing BRD
      result = await supabase
        .from("final_brd")
        .update(finalBrdData)
        .eq("id", existingBrd.id)
        .select();
    } else {
      // Insert new BRD
      result = await supabase.from("final_brd").insert(finalBrdData).select();
    }

    if (result.error) {
      throw new Error(`Error saving BRD: ${result.error.message}`);
    }

    // Update the requirement status
    await supabase
      .from("requirements")
      .update({ status: "BRD Generated" })
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
