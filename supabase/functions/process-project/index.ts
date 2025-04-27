
// Follow this setup guide to integrate the Deno runtime and use Edge Functions:
// https://docs.supabase.com/guides/functions/getting-started

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get OpenAI API key from environment variables
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { projectId } = await req.json();
    
    if (!projectId) {
      return new Response(JSON.stringify({ error: 'Project ID is required' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
      
    if (projectError || !project) {
      console.error('Error fetching project:', projectError);
      return new Response(JSON.stringify({ error: 'Project not found' }), { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Process with OpenAI
    const structuredDocument = await processWithAI(project);
    
    // Update the project with structured document
    const { error: updateError } = await supabase
      .from('projects')
      .update({ 
        structured_document: structuredDocument
      })
      .eq('id', projectId);
      
    if (updateError) {
      console.error('Error updating project:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update project' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        project_id: projectId,
        structured_document: structuredDocument 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing project:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function processWithAI(project) {
  try {
    const prompt = `
      Please analyze this project information and create a structured document with the following sections:
      
      Project Information:
      - Company name: ${project.company_name}
      - Industry type: ${project.industry_type}
      - Username: ${project.username}
      
      Based on the project idea: "${project.project_idea || 'No project idea provided'}", please generate:
      
      1. Problem: Identify and explain the main problem this project aims to solve
      2. Solution: Describe a comprehensive solution to address the problem
      3. Why this?: Explain the unique value proposition and why this approach is beneficial
      4. Research from Client: Synthesize insights from any provided materials (note: this is based on the project idea as no actual client research was provided)
      5. Features and details: List key features and their specifications
      6. AI suggestion: Provide strategic recommendations to enhance the project
      
      Format the response as JSON with these distinct sections as keys.
    `;
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(data.error?.message || 'Failed to process with AI');
    }
    
    const aiResponse = data.choices[0].message.content;
    
    // Try to parse the response as JSON
    try {
      return JSON.parse(aiResponse);
    } catch (e) {
      // If parsing fails, return the raw text
      console.log('Failed to parse AI response as JSON, returning raw text');
      return {
        problem: "AI response could not be parsed as JSON",
        solution: "Please see raw response below",
        whyThis: "",
        researchFromClient: "",
        featuresAndDetails: "",
        aiSuggestion: "",
        rawResponse: aiResponse
      };
    }
  } catch (error) {
    console.error('Error in AI processing:', error);
    return {
      problem: "Error processing with AI",
      solution: error.message,
      whyThis: "",
      researchFromClient: "",
      featuresAndDetails: "",
      aiSuggestion: ""
    };
  }
}
