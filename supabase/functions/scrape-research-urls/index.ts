
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
    const { requirementId, limit } = await req.json();
    
    if (!requirementId) {
      throw new Error("Required field 'requirementId' is missing");
    }

    console.log(`Processing pending scrape URLs for requirement: ${requirementId}`);
    console.log(`Using Firecrawl API Key: ${firecrawlApiKey ? "Available (masked)" : "Missing"}`);
    
    if (!firecrawlApiKey) {
      throw new Error("Firecrawl API Key is missing. Please set it in the Supabase Edge Function Secrets.");
    }
    
    // Fetch sources with pending_scrape status
    const queryLimit = limit || 10; // Default to 10 sources per execution
    const sourcesResponse = await fetch(
      `${supabaseUrl}/rest/v1/market_research_sources?requirement_id=eq.${requirementId}&status=eq.pending_scrape&limit=${queryLimit}`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': `${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    );

    if (!sourcesResponse.ok) {
      const errorData = await sourcesResponse.json();
      throw new Error(`Failed to fetch sources: ${JSON.stringify(errorData)}`);
    }

    const sources = await sourcesResponse.json();
    console.log(`Found ${sources.length} pending scrape URLs to process`);

    if (sources.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No pending scrape URLs found",
        processedUrls: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Process each URL with Firecrawl Scraper API
    let processedUrls = 0;
    let errorCount = 0;
    let rateLimitHits = 0;
    
    // Process URLs with spacing to avoid rate limits
    for (const source of sources) {
      console.log(`Processing URL: ${source.url}`);
      
      try {
        // Skip URLs that don't have a proper scheme
        if (!source.url || !source.url.match(/^(http|https):\/\//)) {
          console.warn(`Skipping invalid URL: ${source.url}`);
          
          // Update source status to error
          await fetch(`${supabaseUrl}/rest/v1/market_research_sources?id=eq.${source.id}`, {
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
        
        // Call Firecrawl Scraper API
        const apiEndpoint = "https://api.firecrawl.dev/v1/scrape";
        console.log(`Calling Firecrawl API with endpoint: ${apiEndpoint}`);
        console.log(`Scraping URL: ${source.url}`);
        
        const scrapeRequest = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${firecrawlApiKey}`
          },
          body: JSON.stringify({
            url: source.url,
            formats: ['markdown', 'html']
          })
        };
        
        console.log("Firecrawl API request:", {
          endpoint: apiEndpoint,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer [MASKED]'
          },
          body: JSON.stringify({
            url: source.url,
            formats: ['markdown', 'html']
          })
        });
        
        // Use the retry function for API calls
        const { response: scrapeResponse, error: fetchError } = await fetchWithRetry(apiEndpoint, scrapeRequest, 3, 2000);

        if (fetchError) {
          console.error(`Fetch error for URL '${source.url}': ${fetchError}`);
          
          if (fetchError.includes("Rate limit")) {
            rateLimitHits++;
          }
          
          // Update source status to error
          await fetch(`${supabaseUrl}/rest/v1/market_research_sources?id=eq.${source.id}`, {
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

        console.log(`Firecrawl API response status: ${scrapeResponse.status}`);
        
        if (!scrapeResponse.ok) {
          const errorText = await scrapeResponse.text();
          console.error(`Firecrawl scrape error for URL '${source.url}': ${errorText}`);
          console.error(`Status: ${scrapeResponse.status}, Headers: ${JSON.stringify([...scrapeResponse.headers])}`);
          
          // Update source status to error
          await fetch(`${supabaseUrl}/rest/v1/market_research_sources?id=eq.${source.id}`, {
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

        const scrapeResult = await scrapeResponse.json();
        console.log(`Scrape response success: ${scrapeResult.success}`);
        
        // Process results according to expected format
        if (scrapeResult.success && scrapeResult.data) {
          console.log(`Received scrape data for URL: ${source.url}`);
          
          // Extract markdown content
          const markdownContent = scrapeResult.data.markdown || 'No content available';
          
          // Store scraped data
          const scrapedDataResponse = await fetch(`${supabaseUrl}/rest/v1/scraped_research_data`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': `${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              source_id: source.id,
              requirement_id: requirementId,
              url: source.url,
              raw_content: markdownContent,
              status: 'pending_summary'
            })
          });

          if (!scrapedDataResponse.ok) {
            const errorData = await scrapedDataResponse.json();
            console.error(`Error storing scraped data: ${JSON.stringify(errorData)}`);
            continue;
          }
          
          // Update source status to scraped
          await fetch(`${supabaseUrl}/rest/v1/market_research_sources?id=eq.${source.id}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': `${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              status: 'scraped'
            })
          });
          
          processedUrls++;
        } else {
          console.error(`Invalid response format from Firecrawl API: ${JSON.stringify(scrapeResult)}`);
          
          // Update source status to error
          await fetch(`${supabaseUrl}/rest/v1/market_research_sources?id=eq.${source.id}`, {
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
        
        // Add a delay between requests to avoid hitting rate limits
        if (sources.length > 1) {
          const delayMs = 2000; // 2 second delay between requests
          console.log(`Adding delay of ${delayMs}ms between requests to avoid rate limits`);
          await sleep(delayMs);
        }
        
      } catch (urlError) {
        console.error(`Error processing URL '${source.url}': ${urlError.message}`);
        console.error(urlError.stack);
        
        // Update source status to error
        await fetch(`${supabaseUrl}/rest/v1/market_research_sources?id=eq.${source.id}`, {
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
      message: `Processed ${processedUrls} URLs${errorCount > 0 ? ` with ${errorCount} errors` : ''}${rateLimitHits > 0 ? ` (hit rate limits ${rateLimitHits} times)` : ''}`,
      processedUrls,
      errorCount,
      rateLimitHits
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("Error in scrape-research-urls function:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: error.message || "An error occurred while processing research URLs" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
