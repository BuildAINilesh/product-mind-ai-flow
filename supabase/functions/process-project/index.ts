
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { projectId } = await req.json();
    
    if (!projectId) {
      throw new Error("Project ID is required");
    }
    
    // Fetch the requirement details
    const { data: requirement, error: requirementError } = await supabase
      .from("requirements")
      .select("*")
      .eq("id", projectId)
      .single();
      
    if (requirementError) {
      throw new Error(`Error fetching requirement: ${requirementError.message}`);
    }
    
    // Simple AI-like processing of the requirement
    // In a real implementation, this would call a real AI model API
    console.log(`Processing project: ${requirement.project_name}`);
    
    // Generate mock analysis data based on the project idea
    const projectIdea = requirement.project_idea || "";
    
    // Extract key themes from project idea (simplified mock)
    const words = projectIdea.split(/\s+/);
    const keyWords = words.filter(word => word.length > 5).slice(0, 10);
    
    // Create some analysis sections based on the project idea
    const problemStatement = `Based on the provided information, this project aims to address challenges related to ${keyWords.slice(0, 3).join(", ")}.`;
    
    const proposedSolution = `The proposed solution involves building a system that will handle ${keyWords.slice(3, 6).join(", ")} to effectively solve the identified problems.`;
    
    // Create analysis record
    const analysisData = {
      requirement_id: projectId,
      project_overview: `This project named '${requirement.project_name}' aims to develop a solution for ${requirement.industry_type} industry. ${projectIdea.substring(0, 150)}...`,
      problem_statement: problemStatement,
      proposed_solution: proposedSolution,
      business_goals: `The primary business goals include improving efficiency in ${requirement.industry_type} processes, increasing user satisfaction, and reducing operational costs.`,
      target_audience: `The target audience includes professionals in the ${requirement.industry_type} industry who need better tools for their daily tasks.`,
      key_features: `
- User authentication and profile management
- Dashboard with key metrics and insights
- Integration with existing systems
- Reporting and analytics capabilities
- Mobile responsive interface
      `,
      user_stories: `
As a user, I want to be able to quickly access my dashboard so I can see important metrics.
As an administrator, I want to manage user permissions so I can control access to sensitive data.
As a manager, I want to generate reports so I can track team performance.
      `,
      competitive_landscape: `The market has several existing solutions, but they lack the specific features addressing ${keyWords.slice(0, 2).join(" and ")}. This creates an opportunity to differentiate with a more focused approach.`,
      constraints_assumptions: `
- The system must be developed within 6 months
- Budget limitations require efficient use of resources
- Existing infrastructure will need to be integrated
- User training will be required for optimal adoption
      `,
      risks_mitigations: `
Risk: User adoption might be slow
Mitigation: Develop intuitive UI and provide comprehensive training materials

Risk: Integration with legacy systems could be challenging
Mitigation: Plan for longer integration testing phase and have backup systems in place
      `,
      acceptance_criteria: `
- System successfully handles all specified use cases
- Performance benchmarks are met under expected load
- Security testing passes with no critical vulnerabilities
- User feedback indicates satisfaction with core features
      `,
      appendices: [],
      analysis_confidence_score: 85,
    };
    
    // Check if analysis already exists
    const { data: existingAnalysis } = await supabase
      .from("requirement_analysis")
      .select("id")
      .eq("requirement_id", projectId)
      .maybeSingle();
    
    let result;
    
    if (existingAnalysis) {
      // Update existing analysis
      result = await supabase
        .from("requirement_analysis")
        .update(analysisData)
        .eq("id", existingAnalysis.id)
        .select();
    } else {
      // Insert new analysis
      result = await supabase
        .from("requirement_analysis")
        .insert(analysisData)
        .select();
    }
    
    if (result.error) {
      throw new Error(`Error saving analysis: ${result.error.message}`);
    }
    
    // Finally update the requirement status
    await supabase
      .from("requirements")
      .update({ status: "Completed" })
      .eq("id", projectId);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Project processed successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing project:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
