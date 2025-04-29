
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts"; // For fetch() in Edge Functions

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
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
    let extractedTextSample = "";
    let extractedTextLength = 0;
    
    // Get file as array buffer for binary analysis
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Create a hex dump of first few bytes for debugging
    const hexDump = Array.from(uint8Array.slice(0, 50)).map(b => b.toString(16).padStart(2, '0')).join(' ');
    console.log(`File hex dump (first 50 bytes): ${hexDump}`);
    
    if (contentType?.includes('pdf')) {
      console.log("Processing PDF file - using OpenAI directly");
      
      // For PDFs, we'll use OpenAI to analyze the file via URL
      textContent = `This is a PDF document located at: ${documentUrl}`;
      debugContent = `PDF file detected. The file will be analyzed by OpenAI via URL.`;
      
    } else if (contentType?.includes('msword') || contentType?.includes('openxmlformats-officedocument')) {
      console.log("Processing DOCX file - using OpenAI directly");
      
      // For DOCX files, we'll use OpenAI to analyze the file via URL
      textContent = `This is a Word document located at: ${documentUrl}`;
      debugContent = `Word document detected. The file will be analyzed by OpenAI via URL.`;
      
    } else {
      console.log("Processing as plain text");
      
      // For plain text files, we can decode the array buffer
      textContent = new TextDecoder().decode(arrayBuffer);
      extractedTextSample = textContent.substring(0, 1000) + (textContent.length > 1000 ? "..." : "");
      extractedTextLength = textContent.length;
      debugContent = textContent.substring(0, 500) + (textContent.length > 500 ? "..." : "");
      console.log(`Plain text extracted, length: ${textContent.length} characters`);
    }
    
    // Prepare a more detailed prompt for OpenAI based on file type
    let promptContent = "";
    
    if (contentType?.includes('pdf') || contentType?.includes('msword') || contentType?.includes('openxmlformats-officedocument')) {
      // For binary document formats, ask OpenAI to interpret from the URL directly
      promptContent = `
      You are a document analyzer specialized in extracting information from various document types.
      
      Please analyze this document located at: ${documentUrl}
      Document type: ${contentType}
      
      Your tasks:
      1. Access and analyze the document at the URL
      2. Extract all key information, focusing on main topics, key points, and significant details
      3. Provide a comprehensive, well-structured summary that captures the essence of the document
      4. Format your summary with clear headings and bullet points when appropriate
      5. If there are any tables, charts or structured data, describe their contents clearly
      
      NOTE: The reader has not seen the document, so make your summary informative and standalone.
      `;
    } else {
      // For text-based formats, use the extracted text
      promptContent = `
      You are a document analyzer specialized in extracting information from text documents.
      
      Please analyze the following document content:
      Document type: ${contentType}
      
      ${textContent}
      
      Your tasks:
      1. Extract all key information, focusing on main topics, key points, and significant details
      2. Provide a comprehensive, well-structured summary that captures the essence of the document
      3. Format your summary with clear headings and bullet points when appropriate
      4. If there are any tables or structured data, describe their contents clearly
      
      NOTE: The reader has not seen the document, so make your summary informative and standalone.
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
            content: 'You are an expert document analyst that extracts key information from documents and produces clear, comprehensive summaries.'
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
          extractedTextSample: extractedTextSample,
          extractedTextLength: extractedTextLength,
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
