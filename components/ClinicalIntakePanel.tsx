'use client';

import { useState } from 'react';
import { User, Activity, Image, Microscope, Brain } from 'lucide-react';
import { ClinicalIntake } from '@/lib/api-client';

interface Props {
  onRunAnalysis: (intake: ClinicalIntake) => void;
  isRunning: boolean;
  images: File[];
  setImages: (images: File[]) => void;
}

export default function ClinicalIntakePanel({ onRunAnalysis, isRunning, images, setImages }: Props) {
  const [chiefComplaint, setChiefComplaint] = useState('Chest pain with exertion for 3 days');
  const [hpi, setHpi] = useState('45 year old male with cardiovascular risk factors');
  const [pmh, setPmh] = useState('Hypertension, hyperlipidemia');
  const [medications, setMedications] = useState('Lisinopril, atorvastatin');
  const [allergies, setAllergies] = useState('Penicillin (rash)');
  const [vitals, setVitals] = useState({
    bp: '',
    hr: '',
    rr: '',
    temp: '',
    spo2: '',
  });
  const [labValues, setLabValues] = useState('');

  const handleSubmit = () => {
    if (!chiefComplaint.trim()) {
      alert('Please enter a chief complaint');
      return;
    }

    const intake: ClinicalIntake = {
      chief_complaint: chiefComplaint,
      hpi,
      pmh,
      medications,
      allergies,
      vitals,
      lab_values: labValues,
    };

    onRunAnalysis(intake);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Clinical Intake Card */}
      <div className="medical-card">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Clinical Intake</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Chief Complaint <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="e.g., Chest pain with exertion for 3 days"
              className="medical-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              History of Present Illness
            </label>
            <textarea
              value={hpi}
              onChange={(e) => setHpi(e.target.value)}
              placeholder="Describe onset, duration, character, aggravating/relieving factors..."
              rows={4}
              className="medical-input resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Past Medical History
              </label>
              <input
                type="text"
                value={pmh}
                onChange={(e) => setPmh(e.target.value)}
                placeholder="HTN, DM, CAD..."
                className="medical-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Medications
              </label>
              <input
                type="text"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="Current medications"
                className="medical-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Allergies
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Drug allergies and reactions"
              className="medical-input"
            />
          </div>
        </div>
      </div>

      {/* Vital Signs Card */}
      <div className="medical-card">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Vital Signs</h3>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {[
            { key: 'bp', label: 'BP', unit: 'mmHg' },
            { key: 'hr', label: 'HR', unit: 'bpm' },
            { key: 'rr', label: 'RR', unit: '/min' },
            { key: 'temp', label: 'Temp', unit: '°F' },
            { key: 'spo2', label: 'SpO₂', unit: '%' },
          ].map(({ key, label, unit }) => (
            <div key={key} className="text-center">
              <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
              <input
                type="text"
                value={vitals[key as keyof typeof vitals]}
                onChange={(e) => setVitals({ ...vitals, [key]: e.target.value })}
                placeholder="--"
                className="w-full px-2 py-1.5 text-sm text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <div className="text-[10px] text-slate-500 mt-0.5">{unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Images Card */}
      <div className="medical-card">
        <div className="flex items-center gap-3 mb-4">
          <Image className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Medical Images</h3>
        </div>

        <div className="space-y-3">
          <label className="block w-full cursor-pointer">
            <div className="h-24 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2">
              <div className="text-3xl">📤</div>
              <div className="text-sm font-medium text-slate-600">Click to upload images</div>
              <div className="text-xs text-slate-500">Dermatology, Radiology, Pathology</div>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={URL.createObjectURL(img)}
                    alt=""
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Laboratory Values Card */}
      <div className="medical-card">
        <div className="flex items-center gap-3 mb-4">
          <Microscope className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Laboratory Values</h3>
        </div>

        <textarea
          value={labValues}
          onChange={(e) => setLabValues(e.target.value)}
          placeholder="Paste lab values: CBC, CMP, lipids, cardiac markers, etc."
          rows={6}
          className="medical-input resize-none"
        />
      </div>

      {/* Run Analysis Button */}
      <button
        onClick={handleSubmit}
        disabled={isRunning || !chiefComplaint}
        className="w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRunning ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            Running Multi-Agent Analysis...
          </>
        ) : (
          <>
            <Brain className="h-5 w-5" />
            Run Clinical Analysis
          </>
        )}
      </button>
    </div>
  );
}
