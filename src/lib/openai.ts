import OpenAI from 'openai';

// Initialize OpenAI client with API key from environment variables
export const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For client-side usage (you should secure this better in production)
}); 