'use client';

import { useState } from 'react';
import { Shield, Stethoscope } from 'lucide-react';
import ClinicalIntakePanel from '@/components/ClinicalIntakePanel';
import AgentOrchestrationPanel from '@/components/AgentOrchestrationPanel';
import ClinicalReportPanel from '@/components/ClinicalReportPanel';
import { apiClient, ClinicalIntake, MedicalReport } from '@/lib/api-client';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function MedicalCopilotPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [agentSteps, setAgentSteps] = useState<any[]>([]);
  const [report, setReport] = useState<MedicalReport | null>(null);
  const [images, setImages] = useState<File[]>([]);

  // WebSocket connection
  const wsUrl = sessionId ? `${process.env.NEXT_PUBLIC_WS_URL}/ws/${sessionId}` : null;

  const { isConnected } = useWebSocket(wsUrl, {
    onMessage: (data) => {
      if (data.type === 'agent_status') {
        setCurrentPhase(data.phase || '');
        setAgentSteps((prev) => {
          const existing = prev.find((s) => s.agent === data.agent);
          if (existing) {
            return prev.map((s) =>
              s.agent === data.agent
                ? {
                    ...s,
                    status: data.status,
                    confidence: data.confidence,
                    endTime: data.status === 'completed' ? Date.now() : s.endTime,
                  }
                : s
            );
          } else {
            return [
              ...prev,
              {
                agent: data.agent,
                status: data.status,
                phase: data.phase,
                confidence: data.confidence,
                startTime: Date.now(),
              },
            ];
          }
        });
      } else if (data.type === 'analysis_complete') {
        setReport(data.report!);
        setIsRunning(false);
        setCurrentPhase('Complete');
      }
    },
    onOpen: () => {
      console.log('Connected to agent stream');
    },
    onClose: () => {
      console.log('Disconnected from agent stream');
    },
  });

  const handleRunAnalysis = async (intake: ClinicalIntake) => {
    setIsRunning(true);
    setAgentSteps([]);
    setReport(null);
    setCurrentPhase('Starting...');

    try {
      const response = await apiClient.startAnalysis(intake, images);
      setSessionId(response.session_id);
    } catch (error) {
      console.error('Error starting analysis:', error);
      alert('Error starting analysis. Please check that the API server is running.');
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  MedicalCopilot AI
                </h1>
                <p className="text-sm text-slate-600">Advanced Multi-Agent Clinical Intelligence System</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">HIPAA Compliant</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span>16 Agents {isConnected ? 'Active' : 'Ready'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="max-w-[1920px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Panel - Clinical Intake */}
          <div className="xl:col-span-5">
            <ClinicalIntakePanel
              onRunAnalysis={handleRunAnalysis}
              isRunning={isRunning}
              images={images}
              setImages={setImages}
            />
          </div>

          {/* Middle Panel - Agent Orchestration */}
          <div className="xl:col-span-3">
            <AgentOrchestrationPanel
              currentPhase={currentPhase}
              agentSteps={agentSteps}
              isRunning={isRunning}
            />
          </div>

          {/* Right Panel - Clinical Report */}
          <div className="xl:col-span-4">
            <ClinicalReportPanel report={report} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 pb-8 mt-8">
        <p>© 2024 MedicalCopilot AI - Educational purposes only, not medical advice</p>
        <p className="mt-1">
          <strong>IMPORTANT:</strong> This is a research system. Requires physician review of all recommendations.
        </p>
      </footer>
    </div>
  );
}
