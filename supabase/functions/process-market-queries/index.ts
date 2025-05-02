
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requirementId } = await req.json();
    
    if (!requirementId) {
      throw new Error("Required field 'requirementId' is missing");
    }

    console.log(`Processing market queries for requirement: ${requirementId}`);
    console.log(`Using Firecrawl API Key: ${firecrawlApiKey ? "Available (masked)" : "Missing"}`);
    
    if (!firecrawlApiKey) {
      throw new Error("Firecrawl API Key is missing. Please set it in the Supabase Edge Function Secrets.");
    }
    
    // Get all pending queries for the requirement
    const queriesResponse = await fetch(`${supabaseUrl}/rest/v1/firecrawl_queries?requirement_id=eq.${requirementId}&status=eq.pending`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': `${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    if (!queriesResponse.ok) {
      const errorData = await queriesResponse.json();
      throw new Error(`Failed to fetch queries: ${JSON.stringify(errorData)}`);
    }

    const queries = await queriesResponse.json();
    console.log(`Found ${queries.length} pending queries to process`);

    if (queries.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No pending queries found",
        processedQueries: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Process each query with Firecrawl Search API
    let processedQueries = 0;
    let savedSources = 0;
    
    for (const query of queries) {
      console.log(`Processing query: ${query.query}`);
      
      try {
        // Using the correct endpoint for the Firecrawl API
        const apiEndpoint = "https://api.firecrawl.dev/api/search";
        console.log(`Calling Firecrawl API with endpoint: ${apiEndpoint}`);
        console.log(`Search query: ${query.query}`);
        
        const searchRequest = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${firecrawlApiKey}`
          },
          body: JSON.stringify({
            query: query.query,
            limit: 5 // Get top 5 results per query
          })
        };
        
        console.log("Firecrawl API request:", {
          endpoint: apiEndpoint,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer [MASKED]'
          },
          body: JSON.stringify({
            query: query.query,
            limit: 5
          })
        });
        
        const searchResponse = await fetch(apiEndpoint, searchRequest);

        console.log(`Firecrawl API response status: ${searchResponse.status}`);
        
        if (!searchResponse.ok) {
          const errorText = await searchResponse.text();
          console.error(`Firecrawl search error for query '${query.query}': ${errorText}`);
          console.error(`Status: ${searchResponse.status}, Headers: ${JSON.stringify([...searchResponse.headers])}`);
          
          // Update the query status to error
          await fetch(`${supabaseUrl}/rest/v1/firecrawl_queries?id=eq.${query.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': `${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              status: 'error'
            })
          });
          
          continue;
        }

        const searchResults = await searchResponse.json();
        console.log(`Search response success: ${searchResults.success}`);
        console.log(`Search results data:`, JSON.stringify(searchResults).substring(0, 200) + '...');
        
        // Process results according to expected format
        if (searchResults.success && searchResults.data && Array.isArray(searchResults.data)) {
          const results = searchResults.data;
          console.log(`Received ${results.length} results for query: ${query.query}`);
          
          if (results.length > 0) {
            console.log(`First result: ${JSON.stringify(results[0])}`);
            
            for (const result of results) {
              console.log(`Saving result: ${result.title || 'No Title'} | ${result.url || 'No URL'}`);
              
              // Store each result in market_research_sources
              const sourceResponse = await fetch(`${supabaseUrl}/rest/v1/market_research_sources`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseServiceKey}`,
                  'apikey': `${supabaseServiceKey}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                  requirement_id: requirementId,
                  query_id: query.id,
                  title: result.title || 'No Title',
                  url: result.url || '',
                  snippet: result.description || null,
                  status: 'found'
                })
              });

              if (!sourceResponse.ok) {
                const errorData = await sourceResponse.json();
                console.error(`Error storing search result: ${JSON.stringify(errorData)}`);
                continue;
              }
              
              savedSources++;
            }
          } else {
            console.log(`No results found for query: ${query.query}`);
          }
        } else {
          console.error(`Invalid response format from Firecrawl API: ${JSON.stringify(searchResults)}`);
        }
        
        // Update the query status to searched
        await fetch(`${supabaseUrl}/rest/v1/firecrawl_queries?id=eq.${query.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': `${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            status: 'searched'
          })
        });
        
        processedQueries++;
        
      } catch (queryError) {
        console.error(`Error processing query '${query.query}': ${queryError.message}`);
        console.error(queryError.stack);
        
        // Update the query status to error
        await fetch(`${supabaseUrl}/rest/v1/firecrawl_queries?id=eq.${query.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': `${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            status: 'error'
          })
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Processed ${processedQueries} queries and saved ${savedSources} search results`,
      processedQueries,
      savedSources
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("Error in process-market-queries function:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: error.message || "An error occurred while processing market queries" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
