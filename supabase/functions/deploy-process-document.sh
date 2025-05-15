#!/bin/bash

FUNCTION_NAME="process-document"
PROJECT_REF="nbjajaafqswspkytekun"

echo "Deploying the $FUNCTION_NAME edge function..."

# Move to supabase folder (parent directory)
cd "$(dirname "$0")/.." || exit 1

# Deploy the function
npx supabase functions deploy "$FUNCTION_NAME" --no-verify-jwt --project-ref "$PROJECT_REF"

if [ $? -eq 0 ]; then
  echo "Successfully deployed $FUNCTION_NAME edge function!"
  echo "You can now test your function..."
  echo ""
  echo "If it doesn't work, make sure to set the OPENAI_API_KEY with:"
  echo "npx supabase secrets set OPENAI_API_KEY=your_openai_api_key --project-ref $PROJECT_REF"
else
  echo "Error deploying $FUNCTION_NAME function"
  exit 1
fi 