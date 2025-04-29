
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Document processing function called");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { documentUrl, requirementId } = await req.json();
    
    if (!documentUrl || !requirementId) {
      throw new Error("Document URL and requirement ID are required");
    }
    
    console.log(`Processing document: ${documentUrl} for requirement: ${requirementId}`);
    
    // Fetch the document content
    console.log(`Attempting to fetch document from URL: ${documentUrl}`);
    const response = await fetch(documentUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText} (status code: ${response.status})`);
    }
    
    const contentType = response.headers.get("content-type");
    console.log("File content type:", contentType);
    
    // Extract text content based on file type
    let textContent = "";
    
    if (contentType?.includes('pdf')) {
      console.log("Processing PDF file");
      const pdfText = await response.text();
      // Basic text extraction - attempt to pull out text content
      textContent = pdfText
        // Remove PDF syntax and formatting
        .replace(/\n\r/g, " ")
        .replace(/(\/\w+|\/|\(|\)|\[|\]|\<|\>)/g, " ")
        // Clean up excess whitespace
        .replace(/\s+/g, " ")
        .trim();
        
      console.log("PDF basic text extraction completed, length:", textContent.length);
      
      // If text extraction yields very little content, inform the user
      if (textContent.length < 100) {
        console.log("PDF extraction yielded minimal text, using fallback message");
        textContent += "\n\nNote: Limited text could be extracted from this PDF. For best results, consider uploading a text-based PDF rather than a scanned document.";
      }
    } else if (contentType?.includes('msword') || contentType?.includes('openxmlformats-officedocument.wordprocessingml.document')) {
      console.log("Processing DOC/DOCX file");
      const fileText = await response.text();
      // Extract text from Word XML (very simplified)
      textContent = fileText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      console.log("Word text extraction completed, length:", textContent.length);
    } else {
      console.log("Processing as plain text");
      textContent = await response.text();
    }
    
    // Truncate text if it's extremely long to avoid overwhelming the API
    const maxLength = 10000; // 10K characters should be enough for most documents
    if (textContent.length > maxLength) {
      console.log(`Text truncated from ${textContent.length} to ${maxLength} characters`);
      textContent = textContent.substring(0, maxLength) + "... [content truncated]";
    }
    
    console.log(`Document content length: ${textContent.length} characters`);
    console.log(`Document content first 200 chars: ${textContent.substring(0, 200)}...`);
    
    if (textContent.length < 10) {
      console.error("Extracted text is too short:", textContent);
      throw new Error("Could not extract meaningful text from document");
    }

    console.log("Calling OpenAI to generate document summary");
    // Generate summary using OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes documents concisely and accurately. Focus on capturing the main points and key information in 3-5 paragraphs.'
          },
          {
            role: 'user',
            content: `Please summarize the following document content: ${textContent}`
          }
        ]
      })
    });
    
    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`OpenAI API error: ${openAIResponse.status} ${openAIResponse.statusText}`);
    }
    
    const data = await openAIResponse.json();
    console.log("OpenAI response received");
    const summary = data.choices[0].message.content;
    
    // Update the requirement with the document summary
    const { error: updateError } = await supabase
      .from("requirements")
      .update({ 
        document_summary: summary,
        updated_at: new Date().toISOString()
      })
      .eq("id", requirementId);
      
    if (updateError) {
      console.error("Error updating requirement with summary:", updateError);
      throw updateError;
    }
    
    console.log("Successfully updated requirement with document summary");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Document processed and summarized successfully",
        summary: summary
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing document:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
