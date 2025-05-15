const fs = require("fs");
const path = require("path");
const https = require("https");

// Function to read the Edge Function code
function readFunctionCode(functionName) {
  const filePath = path.join(__dirname, functionName, "index.ts");
  return fs.readFileSync(filePath, "utf8");
}

// Function to deploy via the Supabase API
function deployFunction(functionName, code, apiKey) {
  const projectRef = "nbjajaafqswspkytekun";
  const data = JSON.stringify({
    name: functionName,
    verify_jwt: true,
    body: code,
  });

  const options = {
    hostname: "api.supabase.com",
    path: `/v1/projects/${projectRef}/functions/${functionName}`,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, body: responseData });
        } else {
          reject(
            new Error(`Failed to deploy: ${res.statusCode} ${responseData}`)
          );
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

// Main function
async function main() {
  const functionName = "process-document";

  try {
    // You'll need to provide your Supabase service role key
    const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!apiKey) {
      console.error(
        "Please set SUPABASE_SERVICE_ROLE_KEY environment variable"
      );
      process.exit(1);
    }

    console.log(`Reading function code for: ${functionName}`);
    const code = readFunctionCode(functionName);

    console.log(`Deploying function: ${functionName}`);
    const result = await deployFunction(functionName, code, apiKey);

    console.log(`Successfully deployed function:`, result);
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main();
