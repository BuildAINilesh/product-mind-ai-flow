import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const openAIApiKey = Deno.env.get("OPENAI_API_KEY") ?? "";

  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "OpenAI API key not configured",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { requirementId } = await req.json();

    if (!requirementId) {
      return new Response(
        JSON.stringify({ success: false, error: "Requirement ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Generating test cases for requirement: ${requirementId}`);

    // First check if use cases exist and are completed
    const { data: caseGeneratorData } = await supabase
      .from("case_generator")
      .select("use_cases_status, user_stories_status")
      .eq("requirement_id", requirementId)
      .single();

    if (
      !caseGeneratorData ||
      caseGeneratorData.user_stories_status !== "Completed" ||
      caseGeneratorData.use_cases_status !== "Completed"
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "User stories and use cases must be generated first",
          status: {
            userStories: caseGeneratorData?.user_stories_status || "Not found",
            useCases: caseGeneratorData?.use_cases_status || "Not found",
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update the status to "In Progress" in case_generator table
    try {
      const { error: updateError } = await supabase
        .from("case_generator")
        .update({ test_cases_status: "In Progress" })
        .eq("requirement_id", requirementId);

      if (updateError) {
        console.error("Error updating status:", updateError);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      // Continue with generation even if status update fails
    }

    // Get use cases
    const { data: useCases, error: useCasesError } = await supabase
      .from("use_cases")
      .select("*")
      .eq("requirement_id", requirementId);

    if (useCasesError || !useCases || useCases.length === 0) {
      console.error("Error fetching use cases:", useCasesError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "No use cases found for this requirement",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare the use cases JSON
    const useCasesJson = JSON.stringify(useCases);

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a senior QA engineer and test automation strategist.

Your job is to generate detailed, production-ready test cases based on system use cases.

Each test case must simulate a realistic path that can be manually or programmatically tested.

✅ Key Guidelines:
- Include **happy path** (functional) and **edge/negative/integration** scenarios
- Each test must have precise **steps** (actions + inputs)
- The **expected_result** should reflect clear assertion logic
- Steps should be broken into **setup, action, and validation**
- Make assumptions only if necessary and label them clearly
- Stick to valid **JSON only** with quoted keys — no markdown, titles, or summaries`,
          },
          {
            role: "user",
            content: `Here are the Use Cases:
${useCasesJson}

Your task:
Generate at least **3 test cases per use case**:
- 1 functional
- 1 negative or edge
- 1 integration (if applicable)

For each test case, include:

{
  "test_title": "Short descriptive title",
  "use_case_title": "The use case this belongs to",
  "steps": "Step-by-step actions including inputs and expected behaviors",
  "expected_result": "What should be true after the steps are completed (including assertions)",
  "type": "functional" | "edge" | "integration" | "negative"
}

Example format:
{
  "test_cases": [
    {
      "test_title": "Alert user after 60 mins of inactivity",
      "use_case_title": "Notify user to hydrate after inactivity",
      "steps": "1. Simulate no water intake for 60 minutes\n2. Check bottle sensor status\n3. Observe system sends LED + mobile alert",
      "expected_result": "User receives app notification and bottle vibrates. System logs alert sent status.",
      "type": "functional"
    },
    ...
  ]
}

Respond ONLY with valid JSON. Do NOT include markdown, commentary, or plain text.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    const openAIResponse = await response.json();

    if (!openAIResponse.choices || openAIResponse.choices.length === 0) {
      console.error("Invalid OpenAI response:", openAIResponse);

      // Update status to failed
      await supabase
        .from("case_generator")
        .update({ test_cases_status: "Failed" })
        .eq("requirement_id", requirementId);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to generate test cases",
          openaiError: openAIResponse.error,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse the response
    const responseContent = openAIResponse.choices[0].message.content;
    let testCasesData;

    try {
      testCasesData = JSON.parse(responseContent);
    } catch (err) {
      console.error("Failed to parse OpenAI response:", err);
      console.log("Response content:", responseContent);

      // Update status to failed
      await supabase
        .from("case_generator")
        .update({ test_cases_status: "Failed" })
        .eq("requirement_id", requirementId);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to parse OpenAI response",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!testCasesData.test_cases || !Array.isArray(testCasesData.test_cases)) {
      console.error("Invalid test cases format:", testCasesData);

      // Update status to failed
      await supabase
        .from("case_generator")
        .update({ test_cases_status: "Failed" })
        .eq("requirement_id", requirementId);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid test cases format in response",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Delete existing test cases for this requirement
    const { error: deleteError } = await supabase
      .from("test_cases")
      .delete()
      .eq("requirement_id", requirementId);

    if (deleteError) {
      console.error("Error deleting existing test cases:", deleteError);
    }

    // Find use case IDs for the test cases
    const useCaseTitleToId = new Map();
    for (const useCase of useCases) {
      useCaseTitleToId.set(useCase.title, useCase.id);
    }

    // Insert the generated test cases
    const testCasesForDB = testCasesData.test_cases.map((testCase: any) => {
      const useCaseId = useCaseTitleToId.get(testCase.use_case_title);
      return {
        requirement_id: requirementId,
        use_case_id: useCaseId,
        test_title: testCase.test_title,
        steps: testCase.steps,
        expected_result: testCase.expected_result,
        type: testCase.type.toLowerCase(),
      };
    });

    const { data: insertedTestCases, error: insertError } = await supabase
      .from("test_cases")
      .insert(testCasesForDB)
      .select();

    if (insertError) {
      console.error("Error inserting test cases:", insertError);

      // Update status to failed
      await supabase
        .from("case_generator")
        .update({ test_cases_status: "Failed" })
        .eq("requirement_id", requirementId);

      return new Response(
        JSON.stringify({ success: false, error: "Failed to save test cases" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update status to completed
    const { error: finalUpdateError } = await supabase
      .from("case_generator")
      .update({ test_cases_status: "Completed" })
      .eq("requirement_id", requirementId);

    if (finalUpdateError) {
      console.error("Error updating final status:", finalUpdateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test cases generated successfully",
        data: insertedTestCases,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating test cases:", error);

    // Try to update status to failed if possible
    try {
      const { requirementId } = await req.json();
      if (requirementId) {
        await supabase
          .from("case_generator")
          .update({ test_cases_status: "Failed" })
          .eq("requirement_id", requirementId);
      }
    } catch (e) {
      console.error("Could not update status to failed:", e);
    }

    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
