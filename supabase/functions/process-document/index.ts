
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
    const { documentUrl } = await req.json();
    
    if (!documentUrl) {
      throw new Error("Document URL is required");
    }
    
    console.log(`Processing document: ${documentUrl}`);
    
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
    let debugContent = "";
    
    if (contentType?.includes('pdf')) {
      console.log("Processing PDF file - using OpenAI directly to interpret the PDF");
      
      // Get the raw bytes for debugging
      const rawBytes = await response.clone().arrayBuffer();
      debugContent = `PDF file detected. Size: ${rawBytes.byteLength} bytes. Binary format, showing first 100 bytes in hex: ${[...new Uint8Array(rawBytes.slice(0, 100))].map(b => b.toString(16).padStart(2, '0')).join(' ')}`;
      console.log(debugContent);
      
      // Instead of trying to parse PDF, we'll ask OpenAI to summarize it directly using the URL
      textContent = `This is a PDF file located at: ${documentUrl}. PDF extraction requires specialized libraries.`;
    } else if (contentType?.includes('msword') || contentType?.includes('openxmlformats-officedocument.wordprocessingml.document')) {
      console.log("Processing DOC/DOCX file - using basic text extraction approach");
      
      // For DOCX files, we'll use a simple text extraction approach
      // Get raw content for debugging
      const fileText = await response.text();
      debugContent = fileText.substring(0, 500);
      
      console.log("Raw Word content sample (first 500 chars):", debugContent);
      
      // Try to extract readable text by looking for words between XML tags
      const wordMatches = fileText.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
      if (wordMatches.length > 0) {
        // Extract text from XML tags
        textContent = wordMatches
          .map(tag => tag.replace(/<\/?w:t[^>]*>/g, ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
          
        console.log(`Extracted ${wordMatches.length} text segments from DOCX XML structure`);
      } else {
        // Fallback to basic XML tag stripping if no word tags found
        textContent = fileText
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        console.log("Using fallback text extraction method (basic XML tag stripping)");
      }
    } else {
      console.log("Processing as plain text");
      const fileText = await response.text();
      
      // Save first 500 chars of raw content for debugging
      debugContent = fileText.substring(0, 500);
      console.log("Raw plain text content (first 500 chars):", debugContent);
      
      textContent = fileText;
    }
    
    // Truncate text if it's extremely long to avoid overwhelming the API
    const maxLength = 10000; // 10K characters should be enough for most documents
    if (textContent.length > maxLength) {
      console.log(`Text truncated from ${textContent.length} to ${maxLength} characters`);
      textContent = textContent.substring(0, maxLength) + "... [content truncated]";
    }
    
    console.log(`Document content length: ${textContent.length} characters`);
    console.log(`Document content first 200 chars: ${textContent.substring(0, 200)}...`);
    
    // For debugging - include more of the extracted text
    const debugTextSample = textContent.substring(0, 1000);
    console.log(`Extended sample of extracted text (1000 chars): ${debugTextSample}`);
    
    if (textContent.length < 10) {
      console.error("Extracted text is too short:", textContent);
      throw new Error("Could not extract meaningful text from document");
    }

    console.log("Calling OpenAI to generate document summary");
    
    // Create prompt for OpenAI
    let promptContent;
    
    if (contentType?.includes('pdf')) {
      // For PDFs, we ask OpenAI to interpret the document from the URL
      promptContent = `
      You are given a PDF document located at this URL: ${documentUrl}
      
      Your task is to:
      1. Try to access and extract text from this PDF file if possible
      2. If you cannot access the file directly, please explain that you're unable to access the PDF directly
      3. Provide advice on how the user could extract text from their PDF files through proper PDF parsing libraries
      
      Please format your response as a document summary with helpful information.
      `;
    } else {
      // For other file types, we send the extracted text
      promptContent = `
      Document type: ${contentType}
      Raw content sample: ${debugContent}
      
      Extracted text: ${textContent}
      
      Please analyze this content and provide the following:
      1. A summary of what actual content you can detect in this document
      2. An explanation of the document structure and format issues
      3. Recommendations for better text extraction from this document type
      `;
    }
    
    // Generate summary using OpenAI
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    
    if (!openAIApiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful debugging assistant that analyzes document text extraction issues and provides clear technical explanations.'
          },
          {
            role: 'user',
            content: promptContent
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
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Document processed and summarized successfully",
        summary: summary,
        debug: {
          contentType: contentType,
          rawContentSample: debugContent,
          extractedTextSample: debugTextSample,
          extractedTextLength: textContent.length
        }
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
