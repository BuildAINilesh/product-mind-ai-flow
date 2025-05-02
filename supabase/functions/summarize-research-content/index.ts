
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Sleep function to pause execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

// Exponential backoff retry function for API calls
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 5, initialBackoffMs = 1000) {
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

// Process a batch of pending summaries
async function processPendingSummaries(requirementId: string, batchSize = 3) {
  try {
    console.log(`Processing summaries for requirement: ${requirementId}`);
    
    // Fetch pending summary items
    const { response: pendingResponse, error: pendingError } = await fetchWithRetry(
      `${supabaseUrl}/rest/v1/scraped_research_data?requirement_id=eq.${requirementId}&status=eq.pending_summary&select=*&limit=${batchSize}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': `${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (pendingError || !pendingResponse?.ok) {
      throw new Error(`Failed to fetch pending summaries: ${pendingError || pendingResponse?.statusText}`);
    }
    
    const pendingItems = await pendingResponse.json();
    console.log(`Found ${pendingItems.length} pending summary items`);
    
    if (pendingItems.length === 0) {
      return {
        success: true,
        message: "No pending summaries found",
        processed: 0,
        summarized: 0,
        errors: 0
      };
    }
    
    let summarizedCount = 0;
    let errorCount = 0;
    
    // Process each pending summary item with delay between items to avoid rate limiting
    for (const item of pendingItems) {
      try {
        console.log(`Generating summary for content from URL: ${item.url}`);
        const summary = await summarizeContent(item.raw_content, item.url);
        
        if (summary) {
          console.log(`Summary generated successfully for ${item.url}`);
          
          // Update the item with the summary
          const { response: updateResponse, error: updateError } = await fetchWithRetry(
            `${supabaseUrl}/rest/v1/scraped_research_data?id=eq.${item.id}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': `${supabaseServiceKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify({
                summary: summary,
                status: 'summarized'
              })
            }
          );
          
          if (updateError || !updateResponse?.ok) {
            console.error(`Error updating summary for ${item.url}: ${updateError || updateResponse?.statusText}`);
            errorCount++;
            continue;
          }
          
          summarizedCount++;
        } else {
          console.warn(`Failed to generate summary for ${item.url}`);
          
          // Update status to error
          await fetch(`${supabaseUrl}/rest/v1/scraped_research_data?id=eq.${item.id}`,
            {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': `${supabaseServiceKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                status: 'error'
              })
            }
          );
          
          errorCount++;
        }
        
        // Add a larger delay between summarization requests to avoid OpenAI rate limiting
        // This is key to ensuring all summaries get processed
        console.log("Waiting 3 seconds before processing next item to avoid rate limits...");
        await sleep(3000);
      } catch (itemError) {
        console.error(`Error processing item ${item.id}: ${itemError.message}`);
        errorCount++;
        
        // Update status to error
        await fetch(`${supabaseUrl}/rest/v1/scraped_research_data?id=eq.${item.id}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'apikey': `${supabaseServiceKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: 'error'
            })
          }
        );
      }
    }
    
    // Check if there are more pending summaries
    const { response: countResponse } = await fetchWithRetry(
      `${supabaseUrl}/rest/v1/scraped_research_data?requirement_id=eq.${requirementId}&status=eq.pending_summary&select=count`,
      {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': `${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        }
      }
    );
    
    const remainingCount = parseInt(countResponse?.headers.get('content-range')?.split('/')[1] || '0');
    
    return {
      success: true,
      message: `Processed ${pendingItems.length} items, successfully summarized ${summarizedCount} items`,
      processed: pendingItems.length,
      summarized: summarizedCount,
      errors: errorCount,
      remaining: remainingCount
    };
  } catch (error) {
    console.error(`Error processing pending summaries: ${error.message}`);
    return {
      success: false,
      message: `Error processing pending summaries: ${error.message}`,
      processed: 0,
      summarized: 0,
      errors: 1
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
    
    if (!openAiApiKey) {
      throw new Error("OpenAI API Key is missing. Please set it in the Supabase Edge Function Secrets.");
    }
    
    console.log(`Processing summaries for requirement: ${requirementId}`);
    console.log(`Using OpenAI API Key: ${openAiApiKey ? "Available (masked)" : "Missing"}`);
    
    // Reduce batch size to 3 to avoid rate limits
    const result = await processPendingSummaries(requirementId, 3);
    
    // Query the total summarized count
    const { response: summaryCountResponse } = await fetchWithRetry(
      `${supabaseUrl}/rest/v1/scraped_research_data?requirement_id=eq.${requirementId}&status=eq.summarized&select=id`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': `${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    let totalSummarizedCount = 0;
    if (summaryCountResponse?.ok) {
      const summaryData = await summaryCountResponse.json();
      totalSummarizedCount = summaryData.length;
    }
    
    return new Response(JSON.stringify({ 
      ...result,
      totalSummarized: totalSummarizedCount
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("Error in summarize-research-content function:", error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: error.message || "An error occurred while summarizing research content" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
