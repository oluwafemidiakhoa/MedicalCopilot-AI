'use client';

import { Network, Loader2, CheckCircle2, Activity, Brain, Image as ImageIcon, Pill, FileText, Microscope, Layers, AlertTriangle, Shield, Heart, BookOpen, User, GitBranch } from 'lucide-react';

interface AgentStep {
  agent: string;
  status: 'queued' | 'running' | 'completed' | 'error';
  phase?: string;
  confidence?: number;
  startTime?: number;
  endTime?: number;
}

interface Props {
  currentPhase: string;
  agentSteps: AgentStep[];
  isRunning: boolean;
}

const agentIcons: Record<string, React.ComponentType<any>> = {
  clinical_coordinator: GitBranch,
  intake_specialist: User,
  symptom_analyzer: Activity,
  visual_diagnostics_agent: ImageIcon,
  differential_diagnosis_agent: Brain,
  medical_literature_agent: BookOpen,
  drug_interaction_checker: Pill,
  clinical_guidelines_agent: FileText,
  lab_interpreter: Microscope,
  evidence_synthesizer: Layers,
  clinical_reasoning_agent: Brain,
  risk_stratification_agent: AlertTriangle,
  medical_fact_checker: CheckCircle2,
  safety_guardian: Shield,
  ethics_reviewer: Heart,
  medical_writer: FileText,
};

export default function AgentOrchestrationPanel({ currentPhase, agentSteps, isRunning }: Props) {
  const getAgentIcon = (agentName: string) => {
    const Icon = agentIcons[agentName] || Activity;
    return Icon;
  };

  const formatAgentName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getExecutionDuration = (step: AgentStep) => {
    if (step.endTime && step.startTime) {
      return ((step.endTime - step.startTime) / 1000).toFixed(1) + 's';
    }
    return null;
  };

  return (
    <div className="medical-card sticky top-24">
      <div className="flex items-center gap-3 mb-4">
        <Network className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold text-slate-900">Agent Orchestration</h3>
      </div>

      {currentPhase && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-900">Current Phase</div>
          <div className="text-lg font-semibold text-indigo-600">{currentPhase}</div>
        </div>
      )}

      {!isRunning && agentSteps.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Network className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Waiting for Analysis</p>
          <p className="text-sm mt-1">Agent execution will appear here</p>
        </div>
      )}

      <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-custom">
        {agentSteps.map((step, idx) => {
          const Icon = getAgentIcon(step.agent);
          const duration = getExecutionDuration(step);

          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border-2 transition-all animate-slide-in ${
                step.status === 'running'
                  ? 'agent-card-running'
                  : step.status === 'completed'
                  ? 'agent-card-completed'
                  : step.status === 'error'
                  ? 'border-red-200 bg-red-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    step.status === 'running'
                      ? 'bg-blue-100'
                      : step.status === 'completed'
                      ? 'bg-emerald-100'
                      : 'bg-slate-100'
                  }`}
                >
                  {step.status === 'running' ? (
                    <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  ) : step.status === 'completed' ? (
                    <Icon className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Icon className="h-4 w-4 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">
                    {formatAgentName(step.agent)}
                  </div>
                  {step.phase && (
                    <div className="text-xs text-slate-500 mt-0.5">{step.phase}</div>
                  )}
                  {(duration || step.confidence) && (
                    <div className="flex items-center gap-2 mt-1">
                      {duration && (
                        <span className="text-xs text-slate-500">{duration}</span>
                      )}
                      {step.confidence && (
                        <span className="text-xs text-emerald-600 font-medium">
                          {(step.confidence * 100).toFixed(0)}% confidence
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    step.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : step.status === 'running'
                      ? 'bg-blue-100 text-blue-700'
                      : step.status === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {step.status === 'completed' ? '✓' : step.status === 'running' ? '⏳' : '•'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
