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

    console.log(`Generating use cases for requirement: ${requirementId}`);

    // First check if user stories exist and are completed
    const { data: caseGeneratorData } = await supabase
      .from("case_generator")
      .select("user_stories_status")
      .eq("requirement_id", requirementId)
      .single();

    if (
      !caseGeneratorData ||
      caseGeneratorData.user_stories_status !== "Completed"
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "User stories must be generated first",
          status: caseGeneratorData?.user_stories_status || "Not found",
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
        .update({ use_cases_status: "In Progress" })
        .eq("requirement_id", requirementId);

      if (updateError) {
        console.error("Error updating status:", updateError);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      // Continue with generation even if status update fails
    }

    // Get user stories
    const { data: userStories, error: storiesError } = await supabase
      .from("user_stories")
      .select("*")
      .eq("requirement_id", requirementId);

    if (storiesError || !userStories || userStories.length === 0) {
      console.error("Error fetching user stories:", storiesError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "No user stories found for this requirement",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get requirement analysis for more context
    const { data: analysis } = await supabase
      .from("requirement_analysis")
      .select("key_features")
      .eq("requirement_id", requirementId)
      .maybeSingle();

    // Prepare the user stories JSON
    const userStoriesJson = JSON.stringify(userStories);
    const keyFeatures =
      analysis?.key_features || "No specific key features defined";

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
            content: `You are a senior business analyst and system designer.

Your task is to generate detailed, system-level **use cases** based on user stories and product features.

Each use case must reflect a realistic scenario including:

- **Trigger**: What event or condition starts the flow
- **Actor**: Who initiates it
- **Preconditions**: What must be true before the use case begins
- **Main Flow**: A numbered list of step-by-step actions (user/system interactions)
- **Alternate Flow**: What happens if there's a deviation (e.g., input error, sensor failure)
- **Outcome**: Final expected system result if successful

📌 Guidelines:
- Be specific and actionable
- Use real-world logic and interactions
- Avoid vague phrasing like "system does something"
- Focus on how the system and user interact across devices or interfaces
- Keep all output in **valid JSON** with **quoted keys** and no markdown`,
          },
          {
            role: "user",
            content: `User Stories:
${userStoriesJson}

Key Features:
${keyFeatures}

Create use cases based on the above. Each use case must include these fields:

{
  "title": "Use case title",
  "actor": "User or system actor initiating the flow",
  "trigger": "Event or condition that starts the use case",
  "preconditions": "Conditions that must be met before the use case begins",
  "main_flow": "A numbered list of steps showing the happy path",
  "alt_flow": "How the system responds to unexpected or error conditions",
  "outcome": "Final expected system output or result"
}

Respond with:
{
  "use_cases": [ ... ]
}

Only return the strict JSON. Do not add explanations, markdown, or summaries.`,
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
        .update({ use_cases_status: "Failed" })
        .eq("requirement_id", requirementId);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to generate use cases",
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
    let useCasesData;

    try {
      useCasesData = JSON.parse(responseContent);
    } catch (err) {
      console.error("Failed to parse OpenAI response:", err);
      console.log("Response content:", responseContent);

      // Update status to failed
      await supabase
        .from("case_generator")
        .update({ use_cases_status: "Failed" })
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

    if (!useCasesData.use_cases || !Array.isArray(useCasesData.use_cases)) {
      console.error("Invalid use cases format:", useCasesData);

      // Update status to failed
      await supabase
        .from("case_generator")
        .update({ use_cases_status: "Failed" })
        .eq("requirement_id", requirementId);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid use cases format in response",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Delete existing use cases for this requirement
    const { error: deleteError } = await supabase
      .from("use_cases")
      .delete()
      .eq("requirement_id", requirementId);

    if (deleteError) {
      console.error("Error deleting existing use cases:", deleteError);
    }

    // Insert the generated use cases
    const useCasesForDB = useCasesData.use_cases.map((useCase: any) => ({
      requirement_id: requirementId,
      title: useCase.title,
      actor: useCase.actor,
      trigger: useCase.trigger,
      preconditions: useCase.preconditions,
      main_flow: useCase.main_flow,
      alt_flow: useCase.alt_flow,
      outcome: useCase.outcome,
    }));

    const { data: insertedUseCases, error: insertError } = await supabase
      .from("use_cases")
      .insert(useCasesForDB)
      .select();

    if (insertError) {
      console.error("Error inserting use cases:", insertError);

      // Update status to failed
      await supabase
        .from("case_generator")
        .update({ use_cases_status: "Failed" })
        .eq("requirement_id", requirementId);

      return new Response(
        JSON.stringify({ success: false, error: "Failed to save use cases" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Update status to completed
    const { error: finalUpdateError } = await supabase
      .from("case_generator")
      .update({ use_cases_status: "Completed" })
      .eq("requirement_id", requirementId);

    if (finalUpdateError) {
      console.error("Error updating final status:", finalUpdateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Use cases generated successfully",
        data: insertedUseCases,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating use cases:", error);

    // Try to update status to failed if possible
    try {
      const { requirementId } = await req.json();
      if (requirementId) {
        await supabase
          .from("case_generator")
          .update({ use_cases_status: "Failed" })
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
