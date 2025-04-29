
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
      console.log("Processing PDF file");
      const pdfText = await response.text();
      
      // Save first 500 chars of raw content for debugging
      debugContent = pdfText.substring(0, 500);
      console.log("Raw PDF content (first 500 chars):", debugContent);
      
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
      
      // Save first 500 chars of raw content for debugging
      debugContent = fileText.substring(0, 500);
      console.log("Raw Word content (first 500 chars):", debugContent);
      
      // Try to extract from docx XML structure
      try {
        // Look for actual content in document.xml part if exists
        const contentMatch = fileText.match(/<w:document[^>]*>[\s\S]*?<\/w:document>/i);
        if (contentMatch) {
          console.log("Found document.xml content section");
          const documentContent = contentMatch[0];
          
          // Extract text paragraphs
          const paragraphs = documentContent.match(/<w:p[^>]*>[\s\S]*?<\/w:p>/gi) || [];
          console.log(`Found ${paragraphs.length} paragraphs in document.xml`);
          
          if (paragraphs.length > 0) {
            // Extract text from each paragraph
            const extractedTexts = paragraphs.map(p => {
              const textRuns = p.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/gi) || [];
              return textRuns.map(t => t.replace(/<[^>]+>/g, '')).join(' ');
            });
            
            textContent = extractedTexts.join('\n\n');
            console.log("Extracted text from XML structure, length:", textContent.length);
          }
        }
        
        // If we couldn't extract text from XML structure, fall back to basic extraction
        if (!textContent || textContent.length < 10) {
          console.log("Falling back to basic text extraction");
          textContent = fileText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }
      } catch (extractError) {
        console.error("Error in advanced extraction, falling back to basic:", extractError);
        textContent = fileText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      
      console.log("Word text extraction completed, length:", textContent.length);
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
    
    // Add debugging info to prompt for OpenAI
    const promptWithDebugInfo = `
    Document type: ${contentType}
    Raw content sample: ${debugContent}
    
    Extracted text: ${textContent}
    
    Please analyze this content and provide the following:
    1. A summary of what actual content you can detect in this document
    2. An explanation of the document structure and format issues
    3. Recommendations for better text extraction from this document type
    `;
    
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
            content: promptWithDebugInfo
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
