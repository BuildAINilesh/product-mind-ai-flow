
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Sleep function to pause execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Exponential backoff retry function
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3, initialBackoffMs = 1000) {
  let retries = 0;
  let backoffMs = initialBackoffMs;
  
  while (true) {
    try {
      const response = await fetch(url, options);
      
      // If rate limited, wait and retry
      if (response.status === 429) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        
        const retryAfterMs = errorData.error && errorData.error.includes("retry after") 
          ? parseInt(errorData.error.match(/retry after (\d+)s/)?.[1] || "60") * 1000 
          : backoffMs;
        
        console.log(`Rate limited. Waiting for ${retryAfterMs/1000}s before retry.`);
        
        if (retries >= maxRetries) {
          console.error(`Maximum retries (${maxRetries}) reached. Giving up.`);
          return {
            response,
            error: `Rate limit reached after ${maxRetries} retries. Please try again later.`
          };
        }
        
        // Wait for the specified time
        await sleep(retryAfterMs);
        retries++;
        backoffMs *= 2; // Exponential backoff
        continue;
      }
      
      return { response, error: null };
    } catch (error) {
      if (retries >= maxRetries) {
        console.error(`Maximum retries (${maxRetries}) reached. Giving up.`);
        return { 
          response: null, 
          error: `Network error after ${maxRetries} retries: ${error.message}`
        };
      }
      
      console.error(`Fetch error: ${error.message}. Retrying in ${backoffMs/1000}s...`);
      await sleep(backoffMs);
      retries++;
      backoffMs *= 2; // Exponential backoff
    }
  }
}

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
    let errorCount = 0;
    let rateLimitHits = 0;
    
    // Process queries with spacing to avoid rate limits
    for (const query of queries) {
      console.log(`Processing query: ${query.query}`);
      
      try {
        // Using the correct endpoint for the Firecrawl API based on curl example
        const apiEndpoint = "https://api.firecrawl.dev/v1/search";
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
        
        // Use the retry function for API calls
        const { response: searchResponse, error: fetchError } = await fetchWithRetry(apiEndpoint, searchRequest, 3, 2000);

        if (fetchError) {
          console.error(`Fetch error for query '${query.query}': ${fetchError}`);
          
          if (fetchError.includes("Rate limit")) {
            rateLimitHits++;
          }
          
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
          
          errorCount++;
          continue;
        }

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
          
          errorCount++;
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
                  status: 'found'  // Using 'found' which is now allowed by the constraint
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
        
        // Add a delay between requests to avoid hitting rate limits
        if (queries.length > 1) {
          const delayMs = 2000; // 2 second delay between requests
          console.log(`Adding delay of ${delayMs}ms between requests to avoid rate limits`);
          await sleep(delayMs);
        }
        
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
        
        errorCount++;
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Processed ${processedQueries} queries and saved ${savedSources} search results${errorCount > 0 ? ` with ${errorCount} errors` : ''}${rateLimitHits > 0 ? ` (hit rate limits ${rateLimitHits} times)` : ''}`,
      processedQueries,
      savedSources,
      errorCount,
      rateLimitHits
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
