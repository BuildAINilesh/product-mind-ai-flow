
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requirementId, industryType, problemStatement, proposedSolution, keyFeatures } = await req.json();
    
    if (!requirementId) {
      throw new Error("Required field 'requirementId' is missing");
    }

    console.log(`Generating market queries for requirement: ${requirementId}`);
    
    // Create the OpenAI prompt with explicit instruction to generate exactly 5 queries
    const systemPrompt = "You are an expert market researcher. You must generate exactly 5 search queries, no more and no less.";
    
    const userPrompt = `Inputs:
- Industry: ${industryType || 'Not specified'}
- Problem Statement: ${problemStatement || 'Not specified'}
- Proposed Solution: ${proposedSolution || 'Not specified'}
- Key Features: ${keyFeatures || 'Not specified'}

Instructions:
Generate a JSON array of EXACTLY 5 search queries (no more, no fewer), each optimized for discovering:
- market trends
- demand validation
- competitors
- feature gaps
- industry benchmarks

Output format:
["query 1", "query 2", "query 3", "query 4", "query 5"]`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    // Parse the generated queries
    const generatedContent = data.choices[0].message.content;
    let queries = [];
    
    try {
      // Try to extract JSON array from the response
      const jsonMatch = generatedContent.match(/\[.*\]/s);
      if (jsonMatch) {
        queries = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON array found, try to parse the entire response as JSON
        queries = JSON.parse(generatedContent);
      }
      
      // Ensure queries is an array
      if (!Array.isArray(queries)) {
        throw new Error("Generated content is not an array");
      }
      
      // Strictly enforce exactly 5 queries
      if (queries.length > 5) {
        console.log("OpenAI returned more than 5 queries, truncating to 5");
        queries = queries.slice(0, 5);
      } else if (queries.length < 5) {
        console.log(`OpenAI returned only ${queries.length} queries, which is less than the required 5`);
        // If we have fewer than 5 queries, we can add generic ones to reach 5
        const genericQueries = [
          `${industryType || 'industry'} market size and growth trends`,
          `${industryType || 'industry'} leading competitors and market share`,
          `${industryType || 'product'} customer pain points and needs`,
          `${industryType || 'product'} feature comparison and gaps`,
          `${industryType || 'industry'} future trends and innovations`
        ];
        
        while (queries.length < 5) {
          const genericIndex = queries.length;
          if (genericIndex < genericQueries.length) {
            queries.push(genericQueries[genericIndex]);
          } else {
            // Fallback to ensure we always have 5 queries
            queries.push(`${industryType || 'market'} research query ${queries.length + 1}`);
          }
        }
      }
    } catch (error) {
      console.error("Failed to parse OpenAI response as JSON:", error);
      console.log("Raw response:", generatedContent);
      
      // Fallback: Create exactly 5 queries based on industry type
      queries = [
        `${industryType || 'industry'} market size and growth trends`,
        `${industryType || 'industry'} leading competitors and market share`,
        `${industryType || 'product'} customer pain points and needs`,
        `${industryType || 'product'} feature comparison and gaps`,
        `${industryType || 'industry'} future trends and innovations`
      ];
    }

    console.log(`Generated ${queries.length} search queries`);

    // Store queries in the database - Updated to use the correct table name
    const storedQueries = [];
    for (const query of queries) {
      // Create a record in the firecrawl_queries table (not market_research_queries)
      const queryResponse = await fetch(`${supabaseUrl}/rest/v1/firecrawl_queries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': `${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          requirement_id: requirementId,
          query: query,
          status: 'pending'
        })
      });

      if (!queryResponse.ok) {
        const errorData = await queryResponse.json();
        console.error("Error storing query:", errorData);
        continue;
      }

      const queryData = await queryResponse.json();
      storedQueries.push(queryData[0]);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Generated and stored ${storedQueries.length} search queries`,
      queries: storedQueries 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("Error in generate-market-queries function:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: error.message || "An error occurred while generating market queries" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
