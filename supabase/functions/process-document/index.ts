
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { OpenAI } from "https://esm.sh/openai@4.20.1";

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
    const response = await fetch(documentUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }
    
    // Read the document content as text
    const documentContent = await response.text();
    console.log(`Document content length: ${documentContent.length} characters`);
    
    if (!documentContent || documentContent.length < 10) {
      throw new Error("Document content is too short or empty");
    }
    
    // Generate a document summary with OpenAI
    const summaryPrompt = `
      Please summarize the following document content in about 3-5 paragraphs.
      Focus on capturing the main points and key information.
      
      Document content:
      ${documentContent.substring(0, 8000)}
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
    
    // Update the requirement with the document summary
    const { error: updateError } = await supabase
      .from("requirements")
      .update({ 
        document_summary: documentSummary,
        updated_at: new Date().toISOString()
      })
      .eq("id", requirementId);
      
    if (updateError) {
      throw updateError;
    }
    
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
