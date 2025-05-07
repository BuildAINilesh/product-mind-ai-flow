
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const openAIApiKey = Deno.env.get("OPENAI_API_KEY") ?? "";
  
  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: "OpenAI API key not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { requirementId } = await req.json();
    
    if (!requirementId) {
      return new Response(
        JSON.stringify({ error: "Requirement ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating user stories for requirement: ${requirementId}`);
    
    // Update the status to "In Progress" in case_generator table
    const { error: updateError } = await supabase
      .from("case_generator")
      .update({ user_stories_status: "In Progress" })
      .eq("requirement_id", requirementId);
    
    if (updateError) {
      console.error("Error updating status:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update generation status" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get requirement details
    const { data: requirement, error: requirementError } = await supabase
      .from("requirements")
      .select("*")
      .eq("id", requirementId)
      .single();
      
    if (requirementError) {
      console.error("Error fetching requirement:", requirementError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch requirement details" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get requirement analysis for more context
    const { data: analysis, error: analysisError } = await supabase
      .from("requirement_analysis")
      .select("project_overview, problem_statement, proposed_solution, key_features")
      .eq("requirement_id", requirementId)
      .maybeSingle();
      
    if (analysisError) {
      console.error("Error fetching analysis:", analysisError);
    }
    
    // Prepare the prompt for OpenAI
    const projectOverview = analysis?.project_overview || requirement.project_idea || requirement.project_name;
    const problemStatement = analysis?.problem_statement || "No specific problem statement available";
    const proposedSolution = analysis?.proposed_solution || "No specific solution description available";
    const keyFeatures = analysis?.key_features || "No specific key features defined";
    
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a product manager tasked with transforming the following product concept into clear, actionable user stories.

Use the requirement overview and key features to create concise stories that reflect what users will be able to do with the product.

Use this format:
"As a [user role], I want to [action] so that [benefit]"

Respond with valid JSON only, no explanation.`
          },
          {
            role: "user",
            content: `Product Requirement:
Overview: ${projectOverview}

Problem: ${problemStatement}

Solution: ${proposedSolution}

Key Features: ${keyFeatures}

Output (Strict JSON Array):
{
  "user_stories": [
    {
      "actor": "string",
      "story": "As a [actor], I want to [action] so that [value]"
    },
    ...
  ]
}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const openAIResponse = await response.json();
    
    if (!openAIResponse.choices || openAIResponse.choices.length === 0) {
      console.error("Invalid OpenAI response:", openAIResponse);
      
      // Update status to failed
      await supabase
        .from("case_generator")
        .update({ user_stories_status: "Failed" })
        .eq("requirement_id", requirementId);
        
      return new Response(
        JSON.stringify({ error: "Failed to generate user stories", openaiError: openAIResponse.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Parse the response
    const responseContent = openAIResponse.choices[0].message.content;
    let userStoriesData;
    
    try {
      userStoriesData = JSON.parse(responseContent);
    } catch (err) {
      console.error("Failed to parse OpenAI response:", err);
      console.log("Response content:", responseContent);
      
      // Update status to failed
      await supabase
        .from("case_generator")
        .update({ user_stories_status: "Failed" })
        .eq("requirement_id", requirementId);
        
      return new Response(
        JSON.stringify({ error: "Failed to parse OpenAI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!userStoriesData.user_stories || !Array.isArray(userStoriesData.user_stories)) {
      console.error("Invalid user stories format:", userStoriesData);
      
      // Update status to failed
      await supabase
        .from("case_generator")
        .update({ user_stories_status: "Failed" })
        .eq("requirement_id", requirementId);
        
      return new Response(
        JSON.stringify({ error: "Invalid user stories format in response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Delete existing user stories for this requirement
    const { error: deleteError } = await supabase
      .from("user_stories")
      .delete()
      .eq("requirement_id", requirementId);
      
    if (deleteError) {
      console.error("Error deleting existing user stories:", deleteError);
    }
    
    // Insert the generated user stories
    const userStoriesForDB = userStoriesData.user_stories.map((story: any) => ({
      requirement_id: requirementId,
      actor: story.actor,
      story: story.story
    }));
    
    const { data: insertedStories, error: insertError } = await supabase
      .from("user_stories")
      .insert(userStoriesForDB)
      .select();
      
    if (insertError) {
      console.error("Error inserting user stories:", insertError);
      
      // Update status to failed
      await supabase
        .from("case_generator")
        .update({ user_stories_status: "Failed" })
        .eq("requirement_id", requirementId);
        
      return new Response(
        JSON.stringify({ error: "Failed to save user stories" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Update status to completed
    const { error: finalUpdateError } = await supabase
      .from("case_generator")
      .update({ user_stories_status: "Completed" })
      .eq("requirement_id", requirementId);
      
    if (finalUpdateError) {
      console.error("Error updating final status:", finalUpdateError);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User stories generated successfully",
        data: insertedStories
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error generating user stories:", error);
    
    // Try to update status to failed if possible
    try {
      const { requirementId } = await req.json();
      if (requirementId) {
        await supabase
          .from("case_generator")
          .update({ user_stories_status: "Failed" })
          .eq("requirement_id", requirementId);
      }
    } catch (e) {
      console.error("Could not update status to failed:", e);
    }
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
