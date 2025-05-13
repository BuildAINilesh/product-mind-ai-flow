# Transcribe Audio Edge Function

This Edge Function uses OpenAI's Whisper API to transcribe audio recordings from the voice input feature.

## Deployment

1. Set up your Supabase CLI and login
2. Set the required secrets:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key
```

3. Deploy the function:

```bash
supabase functions deploy transcribe-audio
```

## Usage

The function expects a POST request with a FormData body containing:
- `file`: The audio file to transcribe (WebM format)
- `model`: (Optional) The Whisper model to use (defaults to 'whisper-1')

The request must include a valid Supabase authentication token in the Authorization header.

## Response Format

The function returns JSON with the following structure:

```json
{
  "text": "Transcribed text content"
}
```

In case of an error, the response will have an "error" field with a description of the issue.

## Requirements

- Supabase project with Edge Functions enabled
- OpenAI API key with access to the Whisper API
- User authentication in your application 