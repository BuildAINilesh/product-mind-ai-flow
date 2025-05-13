import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { FormData, File } from 'formdata-node';
import { Readable } from 'stream';

// OpenAI API key from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-openai-api-key';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the audio file from the request
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioFile = req.files.file;
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const model = req.body.model || 'whisper-1';

    // Create a FormData object to send to OpenAI
    const formData = new FormData();
    formData.append('file', new File([buffer], 'audio.webm'));
    formData.append('model', model);

    // Call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return res.status(response.status).json({ error: 'Error from OpenAI API', details: errorData });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error processing audio:', error);
    return res.status(500).json({ error: 'Error processing audio' });
  }
} 