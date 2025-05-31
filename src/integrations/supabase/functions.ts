import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create a single client instance with consistent type parameters
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export the client type for consistency
export type SupabaseClient = typeof supabase;

// Function to invoke Supabase Edge Functions
export const invokeFunction = async (functionName: string, body?: any) => {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error invoking function ${functionName}:`, error);
    return { data: null, error };
  }
};
