import { Request, Response } from "express";
import multer from "multer";
import fetch from "node-fetch";
import { FormData } from "formdata-node";
import { supabase } from "../integrations/supabase/client";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
});

// OpenAI API key from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "your-openai-api-key";

export const transcribeAudio = async (
  audioFile: Express.Multer.File
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([audioFile.buffer], { type: audioFile.mimetype }),
      audioFile.originalname
    );
    formData.append("model", "whisper-1");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("No active session");
    }

    const response = await fetch(
      `https://nbjajaafqswspkytekun.supabase.co/functions/v1/transcribe-audio`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData as any,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const result = (await response.json()) as { text: string };
    return result.text || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
};

// Middleware to handle file upload
const handleFileUpload = upload.single("file");

export default async function handler(req: Request, res: Response) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Handle file upload with multer
  handleFileUpload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ error: `File upload error: ${err.message}` });
    } else if (err) {
      return res.status(500).json({ error: `Unknown error: ${err.message}` });
    }

    try {
      // Get the uploaded file from multer
      const audioFile = req.file;
      if (!audioFile) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const model = req.body.model || "whisper-1";

      // Create a FormData object to send to OpenAI
      const formData = new FormData();
      formData.append(
        "file",
        new Blob([audioFile.buffer], { type: audioFile.mimetype }),
        audioFile.originalname
      );
      formData.append("model", model);

      // Call the OpenAI API
      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: formData as any,
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("OpenAI API error:", errorData);
        return res
          .status(response.status)
          .json({ error: "Error from OpenAI API", details: errorData });
      }

      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      console.error("Error processing audio:", error);
      return res.status(500).json({ error: "Error processing audio" });
    }
  });
}
