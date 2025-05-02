
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

// Function to validate Firecrawl batch response
function validateBatchResponse(data: any): boolean {
  // Check for essential properties
  if (!data) return false;
  
  // For successful batch responses
  if (data.status === "completed" && Array.isArray(data.data)) {
    return true;
  }
  
  // For responses with a job ID (async batch)
  if (data.jobId && data.status) {
    return true;
  }
  
  // For response with just an ID and success flag (initial async response)
  if (data.id && data.success === true) {
    return true;
  }
  
  console.error("Invalid batch response format:", data);
  return false;
}

// Function to check batch scrape status
async function checkBatchScrapeStatus(jobId: string, maxRetries = 25) {
  if (!firecrawlApiKey) {
    throw new Error("Firecrawl API Key is missing");
  }

  console.log(`Checking status for batch scrape job: ${jobId}`);
  
  for (let retry = 0; retry < maxRetries; retry++) {
    try {
      const response = await fetch(`https://api.firecrawl.dev/v1/batch/scrape/${jobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error checking batch status: ${response.status} - ${errorText}`);
        
        // If we get a 400 or 404, the job might not exist or have issues
        if (response.status === 400 || response.status === 404) {
          throw new Error(`Batch scrape failed with status ${response.status}: ${errorText}`);
        }
        
        // Wait before retrying
        await sleep(5000 * Math.pow(2, retry));
        continue;
      }
      
      const statusData = await response.json();
      console.log(`Batch job status: ${statusData.status}, completed: ${statusData.completed}/${statusData.total}`);
      
      if (statusData.status === "completed") {
        return statusData;
      }
      
      // Wait before checking again
      await sleep(5000);
    } catch (error) {
      console.error(`Error fetching batch status: ${error.message}`);
      await sleep(5000 * Math.pow(2, retry));
    }
  }
  
  throw new Error(`Batch job did not complete after ${maxRetries} checks`);
}

// Process all URLs in a single batch with Firecrawl
async function processAllUrls(batchUrls: string[], batchSources: any[]) {
  try {
    console.log(`Processing all ${batchUrls.length} URLs in a single batch`);
    
    // Call Firecrawl Batch Scraper API
    const apiEndpoint = "https://api.firecrawl.dev/v1/batch/scrape";
    console.log(`Calling Firecrawl Batch API with endpoint: ${apiEndpoint}`);
    
    const batchScrapeRequest = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlApiKey}`
      },
      body: JSON.stringify({
        urls: batchUrls,
        formats: ['markdown', 'html']
      })
    };
    
    // Use the retry function for API calls
    const { response: scrapeResponse, error: fetchError } = await fetchWithRetry(apiEndpoint, batchScrapeRequest, 3, 2000);

    if (fetchError) {
      console.error(`Batch scrape fetch error: ${fetchError}`);
      
      // Mark all URLs in this batch as error
      for (const source of batchSources) {
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
      }
      
      throw new Error(`Batch scrape fetch error: ${fetchError}`);
    }

    console.log(`Firecrawl Batch API response status: ${scrapeResponse.status}`);
    
    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error(`Firecrawl batch scrape error: ${errorText}`);
      
      try {
        const errorData = JSON.parse(errorText);
        
        // Check for specific error about unsupported websites
        if (errorData.details && Array.isArray(errorData.details)) {
          const unsupportedUrlIndexes = errorData.details
            .filter((detail: any) => detail.message && detail.message.includes("website is no longer supported"))
            .map((detail: any) => detail.path && detail.path[1])
            .filter((idx: number) => typeof idx === 'number');
          
          if (unsupportedUrlIndexes.length > 0) {
            console.log(`Found ${unsupportedUrlIndexes.length} unsupported URLs at indexes: ${unsupportedUrlIndexes.join(', ')}`);
            
            // Mark only the unsupported URLs as error
            for (const idx of unsupportedUrlIndexes) {
              if (idx < batchSources.length) {
                const source = batchSources[idx];
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
              }
            }
            
            // Create a new batch with supported URLs only
            const supportedUrlsIndexes = [...Array(batchUrls.length).keys()]
              .filter(idx => !unsupportedUrlIndexes.includes(idx));
            
            if (supportedUrlsIndexes.length > 0) {
              const supportedUrls = supportedUrlsIndexes.map(idx => batchUrls[idx]);
              const supportedSources = supportedUrlsIndexes.map(idx => batchSources[idx]);
              
              console.log(`Retrying with ${supportedUrls.length} supported URLs`);
              // Recursive call with supported URLs only
              return processAllUrls(supportedUrls, supportedSources);
            }
          }
        }
      } catch (parseError) {
        console.error(`Failed to parse error details: ${parseError.message}`);
      }
      
      // Mark all URLs as error if we couldn't handle specific errors
      for (const source of batchSources) {
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
      }
      
      throw new Error(`Batch scrape failed with status ${scrapeResponse.status}: ${errorText}`);
    }

    // Parse response and validate its format
    const initialResponse = await scrapeResponse.json();
    console.log(`Initial batch response:`, initialResponse);
    
    // Validate the response format
    if (!validateBatchResponse(initialResponse)) {
      console.error(`Invalid or incomplete response format from Firecrawl Batch API`);
      
      // Mark all URLs in this batch as error
      for (const source of batchSources) {
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
      }
      
      throw new Error(`Invalid or incomplete response from Firecrawl Batch API`);
    }
    
    // Handle synchronous vs asynchronous responses
    let batchResult;
    
    // If this is an async job, we need to poll for completion
    if (initialResponse.id && initialResponse.success === true) {
      console.log(`Received async batch job ID: ${initialResponse.id}. Polling for completion...`);
      batchResult = await checkBatchScrapeStatus(initialResponse.id);
    } else if (initialResponse.status === "completed" && Array.isArray(initialResponse.data)) {
      console.log(`Received completed batch result directly with ${initialResponse.data.length} items`);
      batchResult = initialResponse;
    } else {
      throw new Error(`Unexpected response format from Firecrawl Batch API`);
    }
    
    if (batchResult.status === "completed" && Array.isArray(batchResult.data)) {
      console.log(`Processing batch scrape data for ${batchResult.data.length} URLs`);
      
      // Create a map of URL to scraped content for easier lookup
      const scrapedContentMap: Record<string, string> = {};
      batchResult.data.forEach((item: any, index: number) => {
        if (item && item.metadata && item.metadata.sourceURL) {
          scrapedContentMap[item.metadata.sourceURL] = item.markdown || 'No content available';
        } else if (item && item.markdown) {
          // If no sourceURL in metadata, use the original URL from our list
          // but make sure we have a valid item with markdown content
          scrapedContentMap[batchUrls[index]] = item.markdown;
        } else {
          console.warn(`No valid content for URL at index ${index}`);
        }
      });
      
      // Now process each source and store the scraped data
      let successCount = 0;
      let errorCount = 0;
      
      for (const source of batchSources) {
        try {
          const url = source.url;
          console.log(`Processing result for URL: ${url}`);
          
          // Get the content from our map
          const markdownContent = scrapedContentMap[url] || 'No content available';
          
          if (!markdownContent || markdownContent === 'No content available') {
            console.warn(`No content found for URL: ${url}`);
            errorCount++;
            
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
            
            continue;
          }
          
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
              requirement_id: source.requirement_id,
              url: url,
              raw_content: markdownContent,
              status: 'pending_summary'
            })
          });

          if (!scrapedDataResponse.ok) {
            const errorData = await scrapedDataResponse.json();
            console.error(`Error storing scraped data for ${url}: ${JSON.stringify(errorData)}`);
            errorCount++;
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
          
          successCount++;
        } catch (urlError) {
          console.error(`Error processing URL '${source.url}': ${urlError.message}`);
          errorCount++;
          
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
        }
      }
      
      return {
        processed: batchSources.length,
        success: true,
        successCount,
        errorCount
      };
    }
    
    throw new Error(`Batch result did not complete or has no data`);
    
  } catch (error) {
    console.error(`Error processing all URLs: ${error.message}`);
    return {
      processed: 0,
      success: false,
      error: error.message,
      errorCount: batchSources.length,
      successCount: 0
    };
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

    console.log(`Processing pending scrape URLs for requirement: ${requirementId}`);
    console.log(`Using Firecrawl API Key: ${firecrawlApiKey ? "Available (masked)" : "Missing"}`);
    
    if (!firecrawlApiKey) {
      throw new Error("Firecrawl API Key is missing. Please set it in the Supabase Edge Function Secrets.");
    }
    
    // Fetch all sources with pending_scrape status for this requirement
    const sourcesResponse = await fetch(
      `${supabaseUrl}/rest/v1/market_research_sources?requirement_id=eq.${requirementId}&status=eq.pending_scrape`, 
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

    // Extract valid URLs
    const validSources = sources.filter(source => source.url && source.url.match(/^(http|https):\/\//));
    const validUrls = validSources.map(source => source.url);
    
    // Mark invalid URLs as error
    const invalidSources = sources.filter(source => !source.url || !source.url.match(/^(http|https):\/\//));
    for (const source of invalidSources) {
      console.warn(`Skipping invalid URL: ${source.url}`);
      
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
    }
    
    if (validUrls.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No valid URLs found to scrape",
        processedUrls: 0,
        invalidUrls: invalidSources.length
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`Processing ${validUrls.length} valid URLs in a single batch`);
    
    // Process all URLs in a single batch
    const result = await processAllUrls(validUrls, validSources);
    
    // Get pending summary count
    const pendingSummaryQuery = await fetch(
      `${supabaseUrl}/rest/v1/scraped_research_data?requirement_id=eq.${requirementId}&status=eq.pending_summary&select=id`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': `${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    let pendingSummaryCount = 0;
    if (pendingSummaryQuery.ok) {
      const pendingData = await pendingSummaryQuery.json();
      pendingSummaryCount = pendingData.length;
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `Processed ${result.processed} URLs${result.errorCount > 0 ? ` with ${result.errorCount} errors` : ''}`,
      totalUrls: sources.length,
      invalidUrls: invalidSources.length,
      processedUrls: result.processed,
      successCount: result.successCount || 0,
      pendingSummaries: pendingSummaryCount,
      errorCount: result.errorCount || 0
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
