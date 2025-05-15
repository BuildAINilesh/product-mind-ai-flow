#!/usr/bin/env node

import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const functionName = "process-document";

try {
  console.log(`Deploying the ${functionName} edge function...`);

  // Get the absolute path to the function directory
  const functionPath = resolve(__dirname, functionName);

  // Execute the deployment command
  const output = execSync(
    `npx supabase functions deploy ${functionName} --no-verify-jwt --project-ref nbjajaafqswspkytekun`,
    {
      stdio: "inherit",
      cwd: resolve(__dirname, ".."), // Go up one level to the supabase directory
    }
  );

  console.log(`Successfully deployed ${functionName} edge function!`);
  console.log("You can now test your function...");
  console.log(
    "\nIf it doesn't work, make sure to set the OPENAI_API_KEY with:"
  );
  console.log(
    "npx supabase secrets set OPENAI_API_KEY=your_openai_api_key --project-ref nbjajaafqswspkytekun"
  );
} catch (error) {
  console.error(`Error deploying ${functionName} function:`, error.message);
  process.exit(1);
}
