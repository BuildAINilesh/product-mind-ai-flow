
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts"; // For fetch() in Edge Functions
import * as JSZip from "https://esm.sh/jszip@3.10.1";

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
    
    // Create a hex dump of first few bytes for debugging
    const uint8Array = new Uint8Array(arrayBuffer);
    const hexDump = Array.from(uint8Array.slice(0, 50)).map(b => b.toString(16).padStart(2, '0')).join(' ');
    console.log(`File hex dump (first 50 bytes): ${hexDump}`);
    
    // Extract text content based on file type
    let extractedText = "";
    let extractionMethod = "";
    
    if (contentType?.includes('pdf')) {
      console.log("Processing PDF document");
      extractedText = await extractTextFromPDF(arrayBuffer);
      extractionMethod = "PDF Text Extraction";
      
    } else if (contentType?.includes('msword') || contentType?.includes('openxmlformats-officedocument')) {
      console.log("Processing Word document");
      extractedText = await extractTextFromDOCX(arrayBuffer);
      extractionMethod = "DOCX/Word Text Extraction";
      
    } else {
      console.log("Processing as plain text document");
      extractedText = new TextDecoder().decode(arrayBuffer);
      extractionMethod = "Plain Text Decoder";
    }
    
    // Check if we successfully extracted text
    if (!extractedText || extractedText.trim().length < 10) {
      console.log("Warning: Extracted text is too short or empty");
      
      // Try fallback extraction if main method failed
      extractedText = await fallbackExtraction(arrayBuffer, contentType || "");
      if (extractedText) {
        extractionMethod += " (with Fallback)";
      } else {
        throw new Error("Failed to extract meaningful text content from the document");
      }
    }

    console.log(`Extracted text length: ${extractedText.length} characters`);
    console.log("Sample of extracted text:", extractedText.substring(0, 200));
    
    // Limit text size for OpenAI API
    const maxChars = 15000; // OpenAI can handle ~4k tokens, approximately 16k chars
    let truncatedText = extractedText;
    let wasTruncated = false;
    
    if (extractedText.length > maxChars) {
      console.log(`Text length (${extractedText.length} chars) exceeds maximum, truncating to ${maxChars} chars`);
      truncatedText = extractedText.substring(0, maxChars);
      wasTruncated = true;
    }
    
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

async function extractTextFromDOCX(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // Parse the DOCX file using JSZip
    const zip = new JSZip();
    await zip.loadAsync(arrayBuffer);
    
    // DOCX files store content in word/document.xml
    const documentXml = await zip.file("word/document.xml")?.async("string");
    if (!documentXml) {
      throw new Error("Could not find document.xml in the DOCX file");
    }
    
    // Extract only text from XML (remove tags)
    let textContent = "";
    
    // Extract content between <w:t> tags (these contain the actual text)
    const textRegex = /<w:t[^>]*>(.*?)<\/w:t>/g;
    let match;
    
    while ((match = textRegex.exec(documentXml)) !== null) {
      textContent += match[1] + " ";
    }
    
    // Clean up the text
    textContent = textContent
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .trim();
      
    return textContent;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    return "";
  }
}

async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    // Since we can't use a PDF parsing library directly in Deno,
    // we'll use basic text extraction by looking for text blocks
    const uint8Array = new Uint8Array(arrayBuffer);
    const textContent = new TextDecoder().decode(uint8Array);
    
    // Look for text objects in PDF content (very simplified approach)
    let extractedText = "";
    
    // Look for beginnings of text objects
    const textBlockStart = /BT\s*(\(|\[)/g;
    const textBlockEnd = /\s*ET/g;
    
    let startIndex = 0;
    let endIndex = 0;
    
    while ((startIndex = textBlockStart.exec(textContent)?.index) !== undefined) {
      textBlockEnd.lastIndex = startIndex;
      const endMatch = textBlockEnd.exec(textContent);
      
      if (endMatch && endMatch.index > startIndex) {
        const textBlock = textContent.substring(startIndex, endMatch.index);
        
        // Extract text between parentheses
        const textInParentheses = textBlock.match(/\(([^)]+)\)/g);
        if (textInParentheses) {
          extractedText += textInParentheses
            .map(t => t.substring(1, t.length - 1))
            .join(" ");
        }
      }
    }
    
    // If we couldn't extract anything using the above method,
    // try a more brute-force approach
    if (!extractedText.trim()) {
      const simpleMatches = textContent.match(/\((\w+[\w\s.,;:'"!?-]*)\)/g);
      if (simpleMatches) {
        extractedText = simpleMatches
          .map(t => t.substring(1, t.length - 1))
          .join(" ");
      }
    }
    
    return extractedText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return "";
  }
}

async function fallbackExtraction(arrayBuffer: ArrayBuffer, contentType: string): Promise<string> {
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const fullText = new TextDecoder().decode(uint8Array);
    
    // Try to find any textual content among the binary data
    let extractedText = "";
    
    // Pattern to match readable text sequences (3+ consecutive printable ASCII chars)
    const textChunks = fullText.match(/[A-Za-z0-9\s.,;:'"!?-]{3,}/g) || [];
    
    extractedText = textChunks
      .filter(chunk => chunk.trim().length > 5) // Skip very short chunks
      .join(" ");
      
    console.log("Fallback extraction found text chunks:", textChunks.length);
    
    if (extractedText.length > 100) {
      return extractedText;
    }
    
    return "";
  } catch (error) {
    console.error("Error in fallback extraction:", error);
    return "";
  }
}
