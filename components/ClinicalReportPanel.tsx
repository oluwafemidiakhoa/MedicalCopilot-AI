'use client';

import { useState } from 'react';
import { FileText, Heart, AlertCircle, Brain, TrendingUp, Zap, BookOpen, CheckCircle2, X, ChevronRight, Clock, MessageSquare, AlertTriangle } from 'lucide-react';
import { MedicalReport } from '@/lib/api-client';

interface Props {
  report: MedicalReport | null;
}

export default function ClinicalReportPanel({ report }: Props) {
  const [activeTab, setActiveTab] = useState<'clinical' | 'patient'>('clinical');

  if (!report) {
    return (
      <div className="medical-card">
        <div className="tabs flex gap-2 border-b border-slate-200 mb-6">
          <button className="tab px-4 py-2 border-b-2 border-blue-600 text-blue-600 font-semibold">
            <FileText className="h-4 w-4 inline mr-2" />
            Clinical Report
          </button>
          <button className="tab px-4 py-2 border-b-2 border-transparent text-slate-500">
            <Heart className="h-4 w-4 inline mr-2" />
            Patient Education
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Brain className="h-16 w-16 text-slate-300 mb-4" />
          <p className="text-slate-600 font-medium">No Analysis Yet</p>
          <p className="text-sm text-slate-500 mt-2">
            Complete the clinical intake and run analysis
          </p>
        </div>
      </div>
    );
  }

  const urgencyClass = (report.urgency || 'non-urgent').replace('_', '-');
  const urgencyIcon = {
    'emergent': '🚨',
    'urgent': '⚠️',
    'semi-urgent': '⏰',
    'non-urgent': '✅'
  }[urgencyClass] || '📋';

  return (
    <div className="medical-card">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('clinical')}
          className={`px-4 py-2 border-b-2 font-semibold transition-all ${
            activeTab === 'clinical'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Clinical Report
        </button>
        <button
          onClick={() => setActiveTab('patient')}
          className={`px-4 py-2 border-b-2 font-semibold transition-all ${
            activeTab === 'patient'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Heart className="h-4 w-4 inline mr-2" />
          Patient Education
        </button>
      </div>

      {/* Clinical Report Tab */}
      {activeTab === 'clinical' && (
        <div className="space-y-6 animate-fade-in">
          {/* Urgency Banner */}
          <div className={`urgency-${urgencyClass} p-4 rounded-lg flex items-center gap-3`}>
            <span className="text-2xl">{urgencyIcon}</span>
            <div>
              <div className="font-semibold">{report.urgency} Case</div>
              <div className="text-sm opacity-90">{report.chief_complaint}</div>
            </div>
          </div>

          {/* Differential Diagnosis */}
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Brain className="h-5 w-5 text-indigo-600" />
              Differential Diagnosis
            </h3>
            <div className="space-y-4">
              {report.differential_diagnosis.map((dx, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-slate-900">{dx.diagnosis}</div>
                      <div className="text-xs text-slate-500 font-mono">{dx.icd11_code}</div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        dx.probability === 'high'
                          ? 'bg-red-100 text-red-700'
                          : dx.probability === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {dx.probability.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-emerald-50 p-2 rounded">
                      <div className="text-xs font-medium text-emerald-700 mb-1">Supporting:</div>
                      <ul className="space-y-1">
                        {dx.supporting.map((s, i) => (
                          <li key={i} className="text-xs text-slate-700 flex gap-2">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-rose-50 p-2 rounded">
                      <div className="text-xs font-medium text-red-700 mb-1">Contradicting:</div>
                      <ul className="space-y-1">
                        {dx.contradicting.map((c, i) => (
                          <li key={i} className="text-xs text-slate-700 flex gap-2">
                            <X className="h-3 w-3 text-red-400 flex-shrink-0 mt-0.5" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {(dx.next_steps || dx.nextSteps) && (
                    <div className="bg-blue-50 p-2 rounded mt-2">
                      <div className="text-xs font-medium text-blue-700 mb-1">Next Steps:</div>
                      <ul className="space-y-1">
                        {(dx.next_steps || dx.nextSteps)?.map((ns, i) => (
                          <li key={i} className="text-xs text-slate-700 flex gap-2">
                            <ChevronRight className="h-3 w-3 text-blue-500 flex-shrink-0 mt-0.5" />
                            {ns}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Risk Scores */}
          {report.risk_scores && report.risk_scores.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Risk Stratification
              </h3>
              <div className="space-y-3">
                {report.risk_scores.map((score, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <div className="font-semibold text-slate-900">{score.name}</div>
                    <div className="text-lg font-bold text-orange-600 my-1">{score.value}</div>
                    <div className="text-sm text-slate-700">{score.interpretation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
              <Zap className="h-5 w-5 text-blue-600" />
              Clinical Recommendations
            </h3>
            <div className="space-y-4">
              {report.recommendations.diagnostic && report.recommendations.diagnostic.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">🔬 Diagnostic Workup</h4>
                  <ul className="space-y-2">
                    {report.recommendations.diagnostic.map((d, i) => (
                      <li key={i} className="flex gap-2 text-sm p-2 bg-blue-50 rounded text-blue-900">
                        <span>•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.recommendations.treatment && report.recommendations.treatment.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">💊 Treatment Considerations</h4>
                  <ul className="space-y-2">
                    {report.recommendations.treatment.map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm p-2 bg-emerald-50 rounded text-emerald-900">
                        <span>•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.recommendations.monitoring && report.recommendations.monitoring.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">📈 Monitoring</h4>
                  <ul className="space-y-2">
                    {report.recommendations.monitoring.map((m, i) => (
                      <li key={i} className="flex gap-2 text-sm p-2 bg-purple-50 rounded text-purple-900">
                        <span>•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.recommendations.referral && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <strong className="text-indigo-900">🏥 Specialist Referral:</strong>
                  <p className="text-sm text-indigo-800 mt-1">{report.recommendations.referral}</p>
                </div>
              )}
            </div>
          </div>

          {/* Evidence Base */}
          {report.evidence && (
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <BookOpen className="h-5 w-5 text-slate-600" />
                Evidence Base
              </h3>
              {report.evidence.citations && report.evidence.citations.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-slate-700">Key Citations:</h4>
                  {report.evidence.citations.map((cite, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded text-sm">
                      <div className="font-medium text-slate-900">{cite.title}</div>
                      <div className="text-slate-600 mt-1">{cite.journal} ({cite.year})</div>
                      <div className="flex gap-3 mt-1 text-xs text-slate-500">
                        <span>PMID: {cite.pmid}</span>
                        <span>DOI: {cite.doi}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {report.evidence.guidelines && report.evidence.guidelines.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-700">Clinical Guidelines:</h4>
                  {report.evidence.guidelines.map((guide, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded text-sm">
                      <div className="font-medium text-slate-900">{guide.organization}</div>
                      <div className="text-slate-600 mt-1">{guide.title}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600">
            <strong className="text-slate-900">Medical Disclaimer:</strong> This information is for educational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical decisions. In case of emergency, call 911 or your local emergency services immediately.
          </div>
        </div>
      )}

      {/* Patient Education Tab */}
      {activeTab === 'patient' && report.patient_education && (
        <div className="space-y-6 animate-fade-in">
          {/* Understanding condition */}
          <div>
            <h3 className="text-lg font-semibold mb-3">📖 Understanding Your Condition</h3>
            <p className="text-slate-700 leading-relaxed">{report.patient_education.summary}</p>
          </div>

          {/* Red flags */}
          {report.red_flags && report.red_flags.length > 0 && (
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
              <h3 className="flex items-center gap-2 text-red-900 font-semibold mb-3">
                <AlertTriangle className="h-5 w-5" />
                When to Seek Emergency Care
              </h3>
              <ul className="space-y-2">
                {report.red_flags.map((flag, idx) => (
                  <li key={idx} className="text-sm text-red-800 font-medium">{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Self-care */}
          {report.patient_education.self_care && report.patient_education.self_care.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">✅ What You Can Do Now</h3>
              <ul className="space-y-2">
                {report.patient_education.self_care.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* When to contact doctor */}
          {report.patient_education.when_to_seek && report.patient_education.when_to_seek.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">⏰ When to Contact Your Doctor</h3>
              <ul className="space-y-2">
                {report.patient_education.when_to_seek.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-700">
                    <Clock className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Questions for doctor */}
          {report.patient_education.questions && report.patient_education.questions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">❓ Questions to Ask Your Doctor</h3>
              <ul className="space-y-2">
                {report.patient_education.questions.map((q, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-700">
                    <MessageSquare className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600">
            <strong className="text-slate-900">Important:</strong> This is educational information only. For medical advice tailored to your specific situation, please consult with your healthcare provider.
          </div>
        </div>
      )}
    </div>
  );
}
