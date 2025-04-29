
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
    
    // Get file as array buffer for processing
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Create a hex dump of first few bytes for debugging
    const hexDump = Array.from(uint8Array.slice(0, 50)).map(b => b.toString(16).padStart(2, '0')).join(' ');
    console.log(`File hex dump (first 50 bytes): ${hexDump}`);
    
    // Extract text content based on file type
    let extractedText = "";
    let extractionMethod = "";
    
    if (contentType?.includes('pdf')) {
      console.log("Processing PDF document");
      // For PDFs, attempt to extract text through content parsing
      extractedText = await extractTextFromPDF(uint8Array);
      extractionMethod = "PDF Parser";
      
    } else if (contentType?.includes('msword') || contentType?.includes('openxmlformats-officedocument')) {
      console.log("Processing Word document");
      // For DOCX/DOC, extract text through XML parsing
      extractedText = await extractTextFromDOCX(uint8Array);
      extractionMethod = "DOCX/Word Parser";
      
    } else {
      console.log("Processing as plain text document");
      // For plain text files, we can decode the array buffer
      extractedText = new TextDecoder().decode(arrayBuffer);
      extractionMethod = "Plain Text Decoder";
    }
    
    // Check if we successfully extracted text
    if (!extractedText || extractedText.trim().length < 10) {
      console.log("Warning: Extracted text is empty or too short");
      
      // Fallback approach: try simple text decoding for any format
      const fallbackText = new TextDecoder().decode(arrayBuffer).replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      
      if (fallbackText && fallbackText.trim().length > 100) {
        console.log("Using fallback text extraction method");
        extractedText = fallbackText;
        extractionMethod += " (with Fallback)";
      } else {
        throw new Error("Failed to extract meaningful text content from the document");
      }
    }

    // Limit text size for OpenAI
    const maxChars = 15000; // OpenAI can handle ~4k tokens, approximately 16k chars
    let truncatedText = extractedText;
    let wasTruncated = false;
    
    if (extractedText.length > maxChars) {
      console.log(`Text length (${extractedText.length} chars) exceeds maximum, truncating to ${maxChars} chars`);
      truncatedText = extractedText.substring(0, maxChars);
      wasTruncated = true;
    }
    
    console.log(`Extracted text length: ${extractedText.length} characters`);
    console.log("Sample of extracted text:", extractedText.substring(0, 200));
    
    // Create a prompt for the document analysis
    const prompt = `
    You are a document analyzer specialized in extracting information from various document types.
    
    Please analyze this document content:
    Document type: ${contentType}
    
    ${truncatedText}
    
    ${wasTruncated ? "\n[NOTE: The document was truncated due to length limitations]\n" : ""}
    
    Your tasks:
    1. Extract all key information, focusing on main topics, key points, and significant details
    2. Provide a comprehensive, well-structured summary that captures the essence of the document
    3. Format your summary with clear headings and bullet points when appropriate
    4. If there are any tables or structured data, describe their contents clearly
    
    NOTE: The reader has not seen the document, so make your summary informative and standalone.
    `;
    
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
            content: prompt
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
    
    // Sample of extracted text for debugging
    const extractedTextSample = extractedText.substring(0, 1000) + (extractedText.length > 1000 ? "..." : "");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Document processed and summarized successfully",
        summary: summary,
        debug: {
          contentType: contentType,
          documentUrl: documentUrl,
          extractionMethod: extractionMethod,
          extractedTextSample: extractedTextSample,
          extractedTextLength: extractedText.length,
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

// --- Helper Functions ---

async function extractTextFromPDF(data: Uint8Array): Promise<string> {
  try {
    // Basic PDF text extraction
    // Look for text objects in PDF content
    const textContent = new TextDecoder().decode(data);
    
    // Extract text between PDF text markers
    let extractedText = "";
    const textObjects = textContent.match(/\(([^)]+)\)/g) || [];
    
    for (const textObj of textObjects) {
      // Remove parentheses and decode PDF escapes
      const text = textObj.slice(1, -1).replace(/\\(\d{3})/g, (match, octal) => {
        return String.fromCharCode(parseInt(octal, 8));
      });
      
      extractedText += text + " ";
    }
    
    // Clean up the text
    extractedText = extractedText
      .replace(/\s+/g, " ")      // Replace multiple spaces with single space
      .replace(/[^\x20-\x7E\n\r\t]/g, " "); // Remove non-printable characters
    
    return extractedText || "";
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return "";
  }
}

async function extractTextFromDOCX(data: Uint8Array): Promise<string> {
  try {
    // Convert to string to look for XML content
    const textContent = new TextDecoder().decode(data);
    
    // Look for text content in DOCX XML
    let extractedText = "";
    
    // Try to extract text between <w:t> tags (common in DOCX)
    const matches = textContent.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    
    if (matches && matches.length > 0) {
      extractedText = matches
        .map(match => {
          // Extract the content between the tags
          const content = match.replace(/<[^>]+>/g, "");
          return content;
        })
        .join(" ");
    } else {
      // Fallback: Strip all XML tags if specific tags not found
      extractedText = textContent.replace(/<[^>]+>/g, " ");
    }
    
    // Clean up the text
    extractedText = extractedText
      .replace(/\s+/g, " ")      // Replace multiple spaces with single space
      .replace(/[^\x20-\x7E\n\r\t]/g, " "); // Remove non-printable characters
    
    return extractedText || "";
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    return "";
  }
}
