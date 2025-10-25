// API Client for MedicalCopilot AI Backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8001';

export interface VitalSigns {
  bp?: string;
  hr?: string;
  rr?: string;
  temp?: string;
  spo2?: string;
}

export interface ClinicalIntake {
  chief_complaint: string;
  hpi?: string;
  pmh?: string;
  medications?: string;
  allergies?: string;
  vitals?: VitalSigns;
  lab_values?: string;
}

export interface DiagnosticFinding {
  diagnosis: string;
  icd11_code?: string;
  probability: 'high' | 'medium' | 'low';
  supporting: string[];
  contradicting: string[];
  next_steps?: string[];
  nextSteps?: string[];
}

export interface RiskScore {
  name: string;
  value: string;
  interpretation: string;
}

export interface Recommendations {
  diagnostic: string[];
  treatment: string[];
  monitoring: string[];
  referral?: string;
}

export interface Citation {
  title: string;
  journal: string;
  year: number;
  pmid: string;
  doi: string;
}

export interface Guideline {
  organization: string;
  title: string;
  url: string;
}

export interface PatientEducation {
  summary: string;
  self_care: string[];
  when_to_seek: string[];
  questions: string[];
}

export interface MedicalReport {
  session_id: string;
  urgency: 'emergent' | 'urgent' | 'semi-urgent' | 'non-urgent';
  chief_complaint: string;
  differential_diagnosis: DiagnosticFinding[];
  risk_scores: RiskScore[];
  recommendations: Recommendations;
  red_flags: string[];
  evidence: {
    citations: Citation[];
    guidelines: Guideline[];
  };
  patient_education: PatientEducation;
}

export interface AgentUpdate {
  type: 'agent_status' | 'analysis_complete';
  agent?: string;
  status?: 'queued' | 'running' | 'completed' | 'error';
  phase?: string;
  confidence?: number;
  output?: any;
  timestamp?: string;
  report?: MedicalReport;
}

export interface AnalysisResponse {
  session_id: string;
  status: string;
  websocket_url: string;
}

export interface AgentInfo {
  name: string;
  description: string;
  model: string;
}

class MedicalCopilotAPI {
  private baseURL: string;
  private wsURL: string;

  constructor() {
    this.baseURL = API_URL;
    this.wsURL = WS_URL;
  }

  /**
   * Start a new clinical analysis
   */
  async startAnalysis(
    intake: ClinicalIntake,
    images?: File[]
  ): Promise<AnalysisResponse> {
    const formData = new FormData();
    formData.append('intake', JSON.stringify(intake));

    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await fetch(`${this.baseURL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get session status and results
   */
  async getSession(sessionId: string): Promise<any> {
    const response = await fetch(`${this.baseURL}/session/${sessionId}`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get list of all agents
   */
  async getAgents(): Promise<{ agents: AgentInfo[]; total: number }> {
    const response = await fetch(`${this.baseURL}/agents`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; active_sessions: number }> {
    const response = await fetch(`${this.baseURL}/health`);

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create WebSocket connection for real-time updates
   */
  createWebSocket(sessionId: string): WebSocket {
    const wsUrl = `${this.wsURL}/ws/${sessionId}`;
    return new WebSocket(wsUrl);
  }

  /**
   * Calculate risk score
   */
  async calculateRiskScore(
    scoreType: string,
    parameters: Record<string, any>
  ): Promise<any> {
    const formData = new FormData();
    formData.append('score_type', scoreType);
    formData.append('parameters', JSON.stringify(parameters));

    const response = await fetch(`${this.baseURL}/tools/risk-score`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search ICD-11 codes
   */
  async searchICD11(query: string): Promise<any> {
    const response = await fetch(
      `${this.baseURL}/tools/icd11/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Check drug interactions
   */
  async checkDrugInteractions(medications: string[]): Promise<any> {
    const response = await fetch(`${this.baseURL}/tools/drug-interaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(medications),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const apiClient = new MedicalCopilotAPI();

// Export class for testing
export default MedicalCopilotAPI;
