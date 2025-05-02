
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
        // Call Firecrawl Search API as per documentation
        console.log(`Calling Firecrawl API with search query: ${query.query}`);
        
        // The correct endpoint URL according to Firecrawl docs
        const searchEndpoint = 'https://api.firecrawl.dev/api/search';
        
        console.log(`Using search endpoint: ${searchEndpoint}`);
        console.log(`Request payload: ${JSON.stringify({
          query: query.query,
          limit: 5
        })}`);
        
        const searchResponse = await fetch(searchEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${firecrawlApiKey}`
          },
          body: JSON.stringify({
            query: query.query,
            limit: 5 // Get top 5 results per query
          })
        });

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
        console.log(`Search response structure: ${Object.keys(searchResults).join(', ')}`);
        console.log(`Search results success status: ${searchResults.success}`);
        
        if (searchResults.data) {
          console.log(`Search results data type: ${typeof searchResults.data}`);
          console.log(`Is data an array: ${Array.isArray(searchResults.data)}`);
          console.log(`Data length: ${Array.isArray(searchResults.data) ? searchResults.data.length : 'Not an array'}`);
          
          if (Array.isArray(searchResults.data) && searchResults.data.length > 0) {
            console.log(`First result sample: ${JSON.stringify(searchResults.data[0]).substring(0, 200)}...`);
          }
        } else {
          console.log(`No data property in search results or it's empty`);
        }
        
        // Parse results according to Firecrawl documentation
        if (searchResults.success && searchResults.data && Array.isArray(searchResults.data) && searchResults.data.length > 0) {
          console.log(`Received ${searchResults.data.length} results for query: ${query.query}`);
          
          for (const result of searchResults.data) {
            console.log(`Saving result: ${result.title || 'No Title'} | ${result.url}`);
            console.log(`Result structure: ${Object.keys(result).join(', ')}`);
            
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
                url: result.url,
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
          console.log(`No results found for query: ${query.query} or response format unexpected`);
          console.log(`Full response: ${JSON.stringify(searchResults)}`);
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
