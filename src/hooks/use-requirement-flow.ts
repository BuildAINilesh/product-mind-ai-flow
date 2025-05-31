
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type FlowStage = 
  | 'requirement_capture'
  | 'analysis'
  | 'market_sense'
  | 'validator'
  | 'case_generator'
  | 'brd';

export interface RequirementFlowStatus {
  id: string;
  requirement_id: string;
  current_stage: FlowStage;
  requirement_capture_status: string;
  analysis_status: string;
  market_sense_status: string;
  validator_status: string;
  case_generator_status: string;
  brd_status: string;
  created_at: string;
  updated_at: string;
}

export const useRequirementFlow = (requirementId: string) => {
  const [currentStage, setCurrentStage] = useState<FlowStage>('requirement_capture');

  const { data: flowStatus, isLoading, error, refetch } = useQuery({
    queryKey: ['requirement-flow', requirementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requirement_flow_tracking')
        .select('*')
        .eq('requirement_id', requirementId)
        .single();

      if (error) throw error;
      return data as RequirementFlowStatus;
    },
    enabled: !!requirementId,
  });

  useEffect(() => {
    if (flowStatus) {
      setCurrentStage(flowStatus.current_stage as FlowStage);
    }
  }, [flowStatus]);

  const updateStage = async (stage: FlowStage) => {
    try {
      const { error } = await supabase
        .from('requirement_flow_tracking')
        .update({ current_stage: stage })
        .eq('requirement_id', requirementId);

      if (error) throw error;
      
      setCurrentStage(stage);
      refetch();
    } catch (error) {
      console.error('Error updating flow stage:', error);
    }
  };

  return {
    flowStatus,
    currentStage,
    isLoading,
    error,
    updateStage,
    refetch,
  };
};
