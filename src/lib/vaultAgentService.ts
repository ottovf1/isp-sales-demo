import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../integrations/supabase/client';

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  execution_id?: string;
}

export interface AgentExecution {
  id: string;
  agent_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: any;
  output: any;
  created_at: string;
  completed_at?: string;
}

/**
 * Vault Agent Service
 * Integrates with Vault's 66 AI agents across 11 clusters
 * 
 * Key agents for ISP Sales Demo:
 * - sponsor_match_agent (#23): Match sponsors with rights based on fanbase
 * - fanbase_analysis_agent (#24): Analyze and segment fanbase data
 * - company_research_agent (#07): Research companies via web
 * - lead_scoring_agent (#01): Score leads 0-100
 * - prospect_packager_agent (#15): Create prospect packages
 * - orvesto_agent (#26): Extract insights from B2C data
 */
export class VaultAgentService {
  private async getAccessToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || SUPABASE_ANON_KEY;
  }

  /**
   * Run a Vault agent with given input
   */
  async runAgent(agentId: string, input: any): Promise<AgentResponse> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/run-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          agent_id: agentId,
          input: input,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Agent call failed: ${errorText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.output || data,
        execution_id: data.execution_id,
      };
    } catch (error) {
      console.error(`Vault Agent Error (${agentId}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Run a multi-agent workflow
   */
  async runWorkflow(workflowId: string, input: any): Promise<AgentResponse> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/run-workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          workflow_id: workflowId,
          input: input,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Workflow call failed: ${errorText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error(`Vault Workflow Error (${workflowId}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ============================================
  // SPONSOR MATCH AGENTS
  // ============================================

  /**
   * Match sponsors with rights based on fanbase overlap
   */
  async matchSponsor(rightsHolderId: string, criteria?: any): Promise<AgentResponse> {
    return this.runAgent('sponsor_match_agent', {
      rights_holder_id: rightsHolderId,
      criteria: criteria,
    });
  }

  /**
   * Analyze fanbase demographics and interests
   */
  async analyzeFanbase(rightsHolderId: string): Promise<AgentResponse> {
    return this.runAgent('fanbase_analysis_agent', {
      rights_holder_id: rightsHolderId,
    });
  }

  /**
   * Value sponsorship rights
   */
  async valueRights(rightsHolderId: string, sponsorshipType: string): Promise<AgentResponse> {
    return this.runAgent('rights_valuation_agent', {
      rights_holder_id: rightsHolderId,
      sponsorship_type: sponsorshipType,
    });
  }

  // ============================================
  // SALES AGENTS
  // ============================================

  /**
   * Score a lead based on company and decision maker data
   */
  async scoreLead(companyId: string, decisionMakerId?: string): Promise<AgentResponse> {
    return this.runAgent('lead_scoring_agent', {
      company_id: companyId,
      decision_maker_id: decisionMakerId,
    });
  }

  /**
   * Research a company using web data
   */
  async researchCompany(companyName: string, orgNr?: string): Promise<AgentResponse> {
    return this.runAgent('company_research_agent', {
      company_name: companyName,
      org_nr: orgNr,
    });
  }

  /**
   * Create a complete prospect package
   */
  async createProspectPackage(companyId: string, rightsHolderId: string): Promise<AgentResponse> {
    return this.runWorkflow('full_prospect_package', {
      company_id: companyId,
      rights_holder_id: rightsHolderId,
    });
  }

  // ============================================
  // DATA AGENTS
  // ============================================

  /**
   * Get Orvesto consumer insights
   */
  async getOrvestoInsights(segment: string): Promise<AgentResponse> {
    return this.runAgent('orvesto_agent', {
      segment: segment,
    });
  }

  /**
   * Analyze a decision maker's profile
   */
  async analyzeDecisionMaker(decisionMakerId: string): Promise<AgentResponse> {
    return this.runAgent('person_analysis_agent', {
      decision_maker_id: decisionMakerId,
    });
  }

  // ============================================
  // CONTENT AGENTS
  // ============================================

  /**
   * Generate a pitch presentation
   */
  async generatePitch(companyId: string, rightsHolderId: string, template?: string): Promise<AgentResponse> {
    return this.runWorkflow('pitch_preparation', {
      company_id: companyId,
      rights_holder_id: rightsHolderId,
      template: template || 'standard',
    });
  }

  /**
   * Calculate ROI for sponsorship
   */
  async calculateROI(sponsorshipValue: number, expectedReach: number, conversionRate: number): Promise<AgentResponse> {
    return this.runWorkflow('roi_calculation', {
      sponsorship_value: sponsorshipValue,
      expected_reach: expectedReach,
      conversion_rate: conversionRate,
    });
  }

  // ============================================
  // AGENT MONITORING
  // ============================================

  /**
   * Get recent agent executions
   */
  async getRecentExecutions(limit: number = 10): Promise<AgentExecution[]> {
    const { data, error } = await supabase
      .from('agent_executions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching executions:', error);
      return [];
    }
    return data || [];
  }

  /**
   * Get agent performance stats
   */
  async getAgentStats(): Promise<any> {
    const { data, error } = await supabase
      .from('agent_performance_stats')
      .select('*')
      .order('success_rate', { ascending: false });

    if (error) {
      console.error('Error fetching stats:', error);
      return [];
    }
    return data || [];
  }
}

// Singleton instance
export const vaultAgentService = new VaultAgentService();
