
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const openAiApiKey = Deno.env.get('OPENAI_API_KEY');

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

// Function to summarize content using OpenAI
async function summarizeContent(content: string, url: string) {
  if (!openAiApiKey) {
    console.error("OpenAI API Key is missing");
    return null;
  }
  
  try {
    const prompt = `
    You are an expert summarizer. Your task is to create a detailed and comprehensive summary of the following content from ${url}. 
    
    Guidelines:
    1. Maintain all important factual information, data points, statistics, and key insights.
    2. Preserve company names, product mentions, and specific industry terminology.
    3. Include relevant market trends, competitive analysis, and business insights.
    4. Keep any numerical data and percentages that provide context or support claims.
    5. Organize the information logically with clear structure.
    6. Focus only on information relevant to market analysis and business intelligence.
    7. Ignore generic website elements, navigation instructions, or irrelevant content.
    8. The summary should be around 30-40% of the original length but contain 90-95% of the important information.

    Content to summarize:
    ${content}
    
    Summary:`;

    console.log(`Sending ${Math.round(content.length / 1000)}KB of content to OpenAI for summarization`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorData}`);
      return null;
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Error summarizing content: ${error.message}`);
    return null;
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
    console.log(`Using OpenAI API Key: ${openAiApiKey ? "Available (masked)" : "Missing"}`);
    
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
    
    console.log(`Processing ${validUrls.length} valid URLs with batch scraping`);
    
    try {
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
          urls: validUrls,
          formats: ['markdown', 'html']
        })
      };
      
      console.log(`Batch scraping ${validUrls.length} URLs`);
      
      // Use the retry function for API calls
      const { response: scrapeResponse, error: fetchError } = await fetchWithRetry(apiEndpoint, batchScrapeRequest, 3, 2000);

      if (fetchError) {
        console.error(`Batch scrape fetch error: ${fetchError}`);
        
        // Update all source statuses to error
        for (const source of validSources) {
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
        
        throw new Error(`Batch scrape failed: ${fetchError}`);
      }

      console.log(`Firecrawl Batch API response status: ${scrapeResponse.status}`);
      
      if (!scrapeResponse.ok) {
        const errorText = await scrapeResponse.text();
        console.error(`Firecrawl batch scrape error: ${errorText}`);
        throw new Error(`Batch scrape failed with status ${scrapeResponse.status}: ${errorText}`);
      }

      const batchResult = await scrapeResponse.json();
      console.log(`Batch scrape response success: ${batchResult.status === "completed"}`);
      
      if (batchResult.status === "completed" && batchResult.data && Array.isArray(batchResult.data)) {
        console.log(`Received batch scrape data for ${batchResult.data.length} URLs`);
        
        // Create a map of URL to scraped content for easier lookup
        const scrapedContentMap = {};
        batchResult.data.forEach((item, index) => {
          if (item.metadata && item.metadata.sourceURL) {
            scrapedContentMap[item.metadata.sourceURL] = item.markdown || 'No content available';
          } else {
            // If no sourceURL in metadata, use the original URL from our list
            scrapedContentMap[validUrls[index]] = item.markdown || 'No content available';
          }
        });
        
        // Now process each source and store the scraped data
        let processedUrls = 0;
        let errorCount = 0;
        let summarizedCount = 0;
        
        for (const source of validSources) {
          try {
            const url = source.url;
            console.log(`Processing result for URL: ${url}`);
            
            // Get the content from our map
            const markdownContent = scrapedContentMap[url] || 'No content available';
            
            if (!markdownContent || markdownContent === 'No content available') {
              console.warn(`No content found for URL: ${url}`);
            }
            
            // Generate summary using OpenAI
            let summary = null;
            if (markdownContent && markdownContent !== 'No content available' && openAiApiKey) {
              console.log(`Generating summary for ${url}`);
              summary = await summarizeContent(markdownContent, url);
              if (summary) {
                summarizedCount++;
                console.log(`Summary generated successfully for ${url}`);
              } else {
                console.warn(`Failed to generate summary for ${url}`);
              }
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
                requirement_id: requirementId,
                url: url,
                raw_content: markdownContent,
                summary: summary,
                status: summary ? 'summarized' : 'pending_summary'
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
            
            processedUrls++;
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
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: `Processed ${processedUrls} URLs${errorCount > 0 ? ` with ${errorCount} errors` : ''}${summarizedCount > 0 ? `, summarized ${summarizedCount} sources` : ''}`,
          totalUrls: sources.length,
          invalidUrls: invalidSources.length,
          processedUrls,
          summarizedCount,
          errorCount
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      } else {
        console.error(`Invalid or incomplete response format from Firecrawl Batch API`);
        throw new Error("Invalid or incomplete response from batch scrape API");
      }
    } catch (batchError) {
      console.error(`Error during batch scraping: ${batchError.message}`);
      
      // Update all source statuses to error
      for (const source of validSources) {
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
      
      throw batchError;
    }
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
