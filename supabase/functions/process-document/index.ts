
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { OpenAI } from "https://esm.sh/openai@4.20.1";
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const openai = new OpenAI({ apiKey: openaiApiKey });
    
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
    
    // Check the content type to determine file format
    const contentType = response.headers.get("content-type");
    console.log(`Document content type from headers: ${contentType}`);
    
    // Extract text based on file type
    let documentContent = "";
    
    if (contentType?.includes('pdf')) {
      console.log("Processing PDF file");
      const pdfText = await response.text();
      // Basic text extraction - attempt to pull out text content
      documentContent = pdfText
        // Remove PDF syntax and formatting
        .replace(/\n\r/g, " ")
        .replace(/(\/\w+|\/|\(|\)|\[|\]|\<|\>)/g, " ")
        // Clean up excess whitespace
        .replace(/\s+/g, " ")
        .trim();
      
      console.log("PDF basic text extraction completed, length:", documentContent.length);
      
      // If text extraction yields very little content, inform the user
      if (documentContent.length < 100) {
        console.log("PDF extraction yielded minimal text, using fallback message");
        documentContent += "\n\nNote: Limited text could be extracted from this PDF. For best results, consider uploading a text-based PDF rather than a scanned document.";
      }
    } else if (contentType?.includes('msword') || contentType?.includes('openxmlformats-officedocument.wordprocessingml.document')) {
      console.log("Processing DOC/DOCX file");
      const fileText = await response.text();
      // Extract text from Word XML (very simplified)
      documentContent = fileText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      console.log("Word text extraction completed, length:", documentContent.length);
    } else {
      console.log("Processing as plain text");
      documentContent = await response.text();
    }
    
    // Try to detect if it's a binary file
    const isBinary = /[\x00-\x08\x0E-\x1F]/.test(documentContent.substring(0, 1000));
    console.log(`Document appears to be binary: ${isBinary}`);
    
    // Truncate text if it's extremely long to avoid overwhelming the API
    const maxLength = 8000; // Reduced to 8K to stay within GPT limits
    if (documentContent.length > maxLength) {
      console.log(`Text truncated from ${documentContent.length} to ${maxLength} characters`);
      documentContent = documentContent.substring(0, maxLength) + "... [content truncated]";
    }
    
    console.log(`Document content length: ${documentContent.length} characters`);
    console.log(`Document content first 200 chars: ${documentContent.substring(0, 200)}...`);
    
    if (!documentContent || documentContent.length < 10) {
      throw new Error("Document content is too short or empty");
    }

    // Generate a document summary with OpenAI
    const summaryPrompt = `
      Please summarize the following document content in about 3-5 paragraphs.
      Focus on capturing the main points and key information.
      
      Document content:
      ${documentContent}
    `;
    
    console.log("Sending request to OpenAI for document summarization...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are an AI assistant that summarizes documents concisely and accurately." 
        },
        { 
          role: "user", 
          content: summaryPrompt 
        }
      ],
      temperature: 0.5,
    });
    
    const documentSummary = completion.choices[0].message.content;
    console.log("Received summary from OpenAI");
    console.log(`Summary length: ${documentSummary.length} characters`);
    console.log(`Summary preview: ${documentSummary.substring(0, 200)}...`);
    
    // Update the requirement with the document summary
    const { error: updateError } = await supabase
      .from("requirements")
      .update({ 
        document_summary: documentSummary,
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
        summary: documentSummary
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
