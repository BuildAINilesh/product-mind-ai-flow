import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

// Define the custom RPC functions
export interface CustomFunctions {
  complete_requirement_capture: (args: { req_id: string }) => void;
  complete_analysis: (args: { req_id: string }) => void;
  complete_market_sense: (args: { req_id: string }) => void;
  complete_validator: (args: { req_id: string }) => void;
  complete_case_generator: (args: { req_id: string }) => void;
  complete_brd: (args: { req_id: string }) => void;
}

// Extend the Supabase client type to include our custom RPC functions
declare module "@supabase/supabase-js" {
  export interface SupabaseClient<
    Database = any,
    SchemaName extends string & keyof Database = "public" extends keyof Database
      ? "public"
      : string & keyof Database,
    Schema extends Record<string, any> = Database[SchemaName] extends Record<
      string,
      any
    >
      ? Database[SchemaName]
      : any
  > {
    rpc<
      FunctionName extends string,
      Args extends Record<string, any> = Record<string, any>,
      Result = Args extends Record<string, any> ? any : any
    >(
      fn: FunctionName,
      args?: FunctionName extends keyof CustomFunctions
        ? Parameters<CustomFunctions[FunctionName]>[0]
        : Args,
      options?: {
        head?: boolean;
        count?: null | "exact" | "planned" | "estimated";
      }
    ): FunctionName extends keyof CustomFunctions
      ? Promise<
          | { data: ReturnType<CustomFunctions[FunctionName]>; error: null }
          | { data: null; error: any }
        >
      : Promise<{ data: Result; error: null } | { data: null; error: any }>;
  }
}
