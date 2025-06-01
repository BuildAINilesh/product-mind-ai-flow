import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as pdfjs from "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/+esm";
import * as mammoth from "https://esm.sh/mammoth@1.6.0";

// For TypeScript compilation - won't be used in runtime
declare global {
  interface Window {
    Deno?: {
      env: {
        get(key: string): string | undefined;
      };
    };
  }
}

// Use Window.Deno to avoid TypeScript errors
const getDeno = () => {
  return globalThis.Deno;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Function to remove Markdown formatting
function removeMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "") // Remove headings
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.*?)\*/g, "$1") // Remove italics
    .replace(/__(.*?)__/g, "$1") // Remove underline
    .replace(/~~(.*?)~~/g, "$1") // Remove strikethrough
    .replace(/`(.*?)`/g, "$1") // Remove inline code
    .replace(/^\s*[-+*]\s+/gm, "• ") // Convert bullet points to a simple bullet character
    .replace(/^\s*\d+\.\s+/gm, "$& ") // Keep numbered lists but ensure proper spacing
    .replace(/\n{3,}/g, "\n\n") // Normalize multiple newlines
    .trim();
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    console.log("Process document function called");
    const { documentUrl } = await req.json();
    console.log("Received document URL:", documentUrl);

    if (!documentUrl) {
      return new Response(
        JSON.stringify({
          error: "Document URL is required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch the document content
    const response = await fetch(documentUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch document: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    console.log("File content type:", contentType);

    // Read the body ONCE as an ArrayBuffer (can be used for both binary and text)
    const arrayBuffer = await response.arrayBuffer();
    console.log(
      `Received document data, size: ${arrayBuffer.byteLength} bytes`
    );

    // Extract text content based on file type
    let extractedText = "";
    let extractionMethod = "";

    if (contentType.includes("pdf")) {
      console.log("Processing PDF document");
      try {
        // Set the worker source
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

        // Load the PDF document
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        console.log("PDF loaded successfully with", pdf.numPages, "pages");

        // Extract text from each page
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          console.log(`Processing page ${i} of ${pdf.numPages}`);
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ");
          fullText += pageText + "\n\n";
        }

        // Clean up the text
        extractedText = fullText.replace(/\s+/g, " ").trim();

        extractionMethod = "PDF.js Text Extraction";

        if (extractedText.length < 50) {
          // Fallback method if PDF.js doesn't extract good text
          console.log(
            "PDF.js yielded minimal text, trying manual extraction..."
          );

          // Convert ArrayBuffer to text for manual extraction
          const pdfText = new TextDecoder().decode(arrayBuffer);

          // Try more aggressive pattern matching for text objects in PDF
          // Look for text in different PDF encoding patterns
          const patterns = [
            /\(([^)]{2,})\)/g, // Basic parenthesized text
            /\(([^)]{2,})\)Tj/g, // Text followed by Tj operator
            /\[(.*?)\]TJ/g, // TJ array notation
            /\\(\d{3})/g, // Octal character codes
            /BT\s*(.*?)\s*ET/gs, // Text between BT and ET blocks
          ];

          let allMatches = [];
          for (const pattern of patterns) {
            const matches = pdfText.match(pattern) || [];
            allMatches = [...allMatches, ...matches];
          }

          if (allMatches.length > 0) {
            const manualText = allMatches
              .map((m) => m.replace(/^\(+|\)+$|(Tj|TJ)$/g, "")) // Remove parens and operators
              .join(" ")
              .replace(/\\(\d{3}|n|r|t|f|\\|\(|\))/g, " ") // Handle escape sequences
              .replace(/\s+/g, " ")
              .trim();

            if (manualText.length > extractedText.length) {
              extractedText = manualText;
              extractionMethod = "Enhanced PDF Text Extraction (Fallback)";
            }
          }
        }
      } catch (pdfError) {
        console.error("PDF extraction error:", pdfError);

        // Fallback to simple text extraction using the ArrayBuffer we already have
        const pdfText = new TextDecoder().decode(arrayBuffer);
        extractedText = pdfText
          .replace(/\n\r/g, " ")
          .replace(/(\/\w+|\/|\(|\)|\[|\]|<|>)/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        extractionMethod = "Basic PDF Text Extraction (Fallback)";
      }

      // Add warning if text extraction yielded minimal results
      if (extractedText.length < 100) {
        extractedText +=
          "\n\nNote: Limited text could be extracted from this PDF. It might be a scanned document or contain mostly images. For best results, please consider uploading a text-based PDF rather than a scanned document, or describe the document contents in the 'Project Idea' field.";
      }
    } else if (
      contentType.includes("msword") ||
      contentType.includes("openxmlformats-officedocument") ||
      documentUrl.toLowerCase().endsWith(".docx") ||
      documentUrl.toLowerCase().endsWith(".doc")
    ) {
      console.log("Processing Word document");
      try {
        // Use mammoth.js for better Word document extraction - handle both .docx and .doc
        console.log("Attempting to extract text with mammoth.js");
        const result = await mammoth.extractRawText({ arrayBuffer });

        if (result && result.value) {
          extractedText = result.value;
          extractionMethod = "Mammoth.js Word Document Extraction";
          console.log(
            "Mammoth.js extraction successful, text length:",
            extractedText.length
          );

          // Log any warnings from mammoth
          if (result.messages && result.messages.length > 0) {
            console.log("Mammoth extraction warnings:", result.messages);
          }
        } else {
          throw new Error("Mammoth.js extraction returned empty result");
        }
      } catch (docError) {
        console.error("Mammoth extraction error:", docError);

        console.log("Falling back to basic text extraction for Word document");
        try {
          // Convert ArrayBuffer to text for basic extraction
          const rawText = new TextDecoder().decode(arrayBuffer);

          // Attempt to find text chunks among binary data
          const textChunks = rawText.match(/[A-Za-z0-9\s.,;:'"!?-]{5,}/g) || [];
          extractedText = textChunks.join(" ").replace(/\s+/g, " ").trim();

          extractionMethod = "Word Document Text Extraction (Fallback)";
        } catch (fallbackError) {
          console.error("Fallback extraction also failed:", fallbackError);
          extractedText = "";
          extractionMethod = "Failed - Binary Content Detected";
        }
      }

      // If extraction failed or yielded minimal results
      if (extractedText.length < 100) {
        extractedText +=
          "\n\nNote: Limited text could be extracted from this Word document. It might be corrupted, password-protected, or contain primarily non-text elements. For best results, please consider saving the document as plain text or copying its contents directly to the Project Idea field.";
      }
    } else {
      console.log("Processing as plain text document");
      // Convert ArrayBuffer to text
      extractedText = new TextDecoder().decode(arrayBuffer);
      extractionMethod = "Plain Text Decoder";
    }

    // Check if we actually got text content
    // Use safer regex syntax for control characters
    const isBinaryContent =
      extractedText.length < 20 ||
      extractedText.startsWith("%PDF") ||
      (extractedText.includes("PK") &&
        extractedText.charCodeAt(0) === 0x50 &&
        extractedText.charCodeAt(1) === 0x4b);

    if (isBinaryContent) {
      console.warn("Text extraction failed or returned binary data");

      let fileTypeName = "document";
      if (contentType.includes("pdf")) {
        fileTypeName = "PDF document";
      } else if (
        contentType.includes("word") ||
        contentType.includes("openxmlformats")
      ) {
        fileTypeName = "Word document";
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Document processed but could not extract readable text`,
          summary: `The ${fileTypeName} you've provided is in the format of ${contentType}, but unfortunately, it consists primarily of binary data rather than readable text content. This format typically indicates that the document is either corrupt, improperly opened, or contains mostly non-text elements, which results in unreadable contents extracted from the file.

Since the actual textual content required for summarization isn't available, here's what typically can be inferred from a standard document, along with the kind of key information one would expect to extract if the document were properly readable:

### Summary of Expected Document Insights

#### Document Overview
- **Type:** ${
            contentType.includes("pdf")
              ? "PDF Document"
              : contentType.includes("word")
              ? "Word Document (.docx)"
              : "Document"
          }
- **Potential Contents:** Textual data, tables, images, or formatted sections that convey specific information pertinent to the document's intent (e.g., reports, research papers, business letters).

#### Key Sections Typically Found in a Document
1. **Title/Heading**
   - Main title that represents the primary subject of the document.

2. **Introduction**
   - Brief overview outlining the purpose of the document, the topics being discussed, and any relevant context.

3. **Main Body**
   - Contains different sections that elaborate on various aspects of the topic.
   - This could include:
     - **Subheadings** for organizing content into understandable categories.
     - **Bullet Points or Lists** for highlighting important information and summarizing key ideas efficiently.

4. **Conclusion**
   - A section that summarizes the findings or takes a final stance on the discussed matters.

5. **Tables or Figures**
   - Normally included to present data in an organized manner, allowing for easy comparison and analysis.
   - If available, these would provide structured data like statistics, dates, or other relevant numerical information.

6. **References**
   - A list of sources, if applicable, that supports the document's content.

### Missing Content
- Since I cannot extract actual readable data or summarize specific information, it is recommended:
   - To use software capable of properly opening and parsing ${
     contentType.includes("pdf")
       ? "PDF"
       : contentType.includes("word")
       ? ".docx"
       : "document"
   } files to retrieve text content.
   - To look for textual contents, references, or subjects in the sections of the document once it is properly accessible.

If you have a specific topic or expected content in mind, or if you can provide a different version of the document that is readable, I would be glad to assist further with extracting and summarizing the content.`,
          debug: {
            contentType,
            documentUrl,
            extractionMethod: "Failed - Binary Content Detected",
            extractedTextLength: extractedText.length,
            extractedTextSample: extractedText.substring(0, 1000),
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Limit text size for OpenAI API
    const maxChars = 15000;
    let truncatedText = extractedText;
    let wasTruncated = false;

    if (extractedText.length > maxChars) {
      truncatedText = extractedText.substring(0, maxChars);
      wasTruncated = true;
      console.log(
        `Text truncated from ${extractedText.length} to ${maxChars} characters`
      );
    }

    // Create a prompt for the document analysis
    const prompt = `
    You are a document analyzer specialized in extracting information from various document types.
    
    Please analyze this document content:
    Document type: ${contentType}
    
    ${truncatedText}
    
    ${
      wasTruncated
        ? "\n[NOTE: The document was truncated due to length limitations]\n"
        : ""
    }
    
    Your tasks:
    1. Extract all key information, focusing on main topics, key points, and significant details
    2. Provide a comprehensive, well-structured summary that captures the essence of the document
    3. Format your response in plain text without any Markdown formatting
    4. DO NOT use hashtags (#) for headings - use plain text with UPPERCASE for section titles
    5. DO NOT use asterisks (*) or underscores (_) for emphasis - use plain text
    6. If there are lists, use simple dashes (-) or numbers (1.) with proper spacing
    7. If there are any tables or structured data, describe their contents clearly
    
    IMPORTANT: The summary should be formatted in plain text only, without any Markdown syntax.
    
    NOTE: The reader has not seen the document, so make your summary informative and standalone.
    `;

    console.log("Calling OpenAI to generate document summary");

    // Generate summary using OpenAI
    const openAIResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getDeno().env.get("OPENAI_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an expert document analyst that extracts key information from documents and produces clear, comprehensive summaries in plain text format. Never use Markdown formatting in your responses.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(
        `OpenAI API error: ${openAIResponse.status} ${openAIResponse.statusText}`
      );
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
          contentType,
          documentUrl,
          extractionMethod,
          extractedTextLength: extractedText.length,
          extractedTextSample: extractedText.substring(0, 1000),
        },
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
        status: 500,
      }
    );
  }
});
