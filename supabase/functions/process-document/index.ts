
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
      
      // For PDFs, we'll send the URL directly to OpenAI for interpretation
      textContent = `This is a PDF file located at: ${documentUrl}. PDF extraction requires specialized libraries.`;
      debugContent = `PDF file detected. Direct URL will be sent to OpenAI for interpretation.`;
      
    } else if (contentType?.includes('msword') || contentType?.includes('openxmlformats-officedocument.wordprocessingml.document')) {
      console.log("Processing DOC/DOCX file - attempting to extract text");
      
      // For DOCX files, we need to properly handle the binary format
      // First, let's get the file as an array buffer
      const fileBuffer = await response.arrayBuffer();
      
      // Create a hex dump of first few bytes for debugging
      const uint8Array = new Uint8Array(fileBuffer.slice(0, 100));
      const hexDump = Array.from(uint8Array).map(b => b.toString(16).padStart(2, '0')).join(' ');
      debugContent = `DOCX file detected. First 100 bytes: ${hexDump}`;
      
      // Instead of trying to parse the binary DOCX directly, let's use OpenAI to help
      textContent = `This is a Word document located at: ${documentUrl}. We'll use OpenAI's capabilities to extract and summarize its content.`;
      
      console.log("Binary Word document detected, will use OpenAI to analyze");
    } else {
      console.log("Processing as plain text");
      // For plain text files, we can just read the text
      textContent = await response.text();
      debugContent = textContent.substring(0, 500);
    }
    
    console.log(`Document content length: ${textContent.length} characters`);
    console.log(`Document content first 200 chars: ${textContent.substring(0, 200)}...`);
    
    // Create prompt for OpenAI
    let promptContent = "";
    
    if (contentType?.includes('pdf') || contentType?.includes('msword') || contentType?.includes('openxmlformats-officedocument')) {
      // For binary document formats, ask OpenAI to interpret from the URL
      promptContent = `
      You are an expert document analyzer. Please analyze this document located at: ${documentUrl}
      
      Document type: ${contentType}
      
      Your tasks:
      1. Access the document at the URL if possible
      2. Extract and summarize the key information from the document
      3. Format your response as a comprehensive document summary with the main points, context, and purpose
      4. If you cannot access the document directly, please state that clearly and provide general information about this document type
      
      Aim to provide a summary that would be helpful to someone who hasn't read the document.
      `;
    } else {
      // For text-based formats, send the extracted text
      promptContent = `
      Document type: ${contentType}
      
      Here is the document content to analyze:
      ${textContent}
      
      Please provide:
      1. A comprehensive summary of the document content
      2. The key points and information contained within
      3. The apparent purpose or context of this document
      
      Format your response as a well-structured document summary.
      `;
    }
    
    console.log("Calling OpenAI to generate document summary");
    
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
            content: 'You are a document analysis expert that summarizes documents accurately and extracts key information. You focus on providing comprehensive summaries that capture the essence of documents.'
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
          documentUrl: documentUrl,
          rawContentSample: debugContent,
          processMethod: contentType?.includes('pdf') || contentType?.includes('msword') || contentType?.includes('openxmlformats-officedocument') 
            ? "OpenAI URL Analysis" 
            : "Direct Text Extraction"
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
