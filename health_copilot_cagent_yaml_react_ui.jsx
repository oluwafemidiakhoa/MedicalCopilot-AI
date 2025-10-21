import React, { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { UploadCloud, X } from "lucide-react";

/**
 * HealthCopilot – single-file React UI (TailwindCSS)
 * -------------------------------------------------
 * • Beautiful, production-ready UI to pair with your cagent YAML.
 * • Simulates agent run locally (no backend) so you can demo instantly.
 * • Swap simulateRun() with your real /api/run that triggers cagent.
 *
 * Notes
 * - Tailwind classes assume your app has Tailwind configured.
 * - No external UI lib imports to keep this file drop-in ready.
 */

export default function HealthCopilot() {
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [question, setQuestion] = useState("");
  const [age, setAge] = useState("18–39");
  const [duration, setDuration] = useState("< 24 hours");
  const [conditions, setConditions] = useState("");
  const [meds, setMeds] = useState("");
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const [providers, setProviders] = useState({ openai: true, anthropic: true, gemini: true });
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState([] as Array<{ title: string; detail?: string }>);
  const [result, setResult] = useState<any>(null);

  const toggle = (k: "openai" | "anthropic" | "gemini") =>
    setProviders((p) => ({ ...p, [k]: !p[k] }));

  const handlePartSelect = (part: string) => {
    setSelectedParts((prev) => {
      if (prev.includes(part)) {
        return prev.filter((p) => p !== part);
      }
      const newParts = [...prev, part];
      setQuestion(q => `${q}${q ? " " : ""}Symptom location: ${newParts.join(", ")}.`.trim());
      return newParts;
    });
  };
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setImage({ file, preview });
    }
  }

  async function handleRun() {
    setRunning(true);
    setSteps([]);
    setResult(null);

    // The image file would be part of the form data sent to the backend
    const intake = { question, age, duration, conditions, meds, hasImage: !!image };

    // In production, POST to your backend which shells out to `cagent run`.
    // Example: await fetch("/api/run", { method: "POST", body: new FormData(...) })
    for await (const s of simulateRun(intake, providers)) {
      setSteps((prev) => [...prev, s]);
    }
    // @ts-ignore – the last simulate step includes a payload
    const last: any = (await lastStepPromise) as any;
    setResult(last.payload);
    setRunning(false);
  }

  // --- UI building blocks ---------------------------------------------------
  const Card: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
    <div className={`rounded-2xl shadow-sm border border-zinc-200 bg-white/70 backdrop-blur p-5 ${className || ""}`}>{children}</div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 text-zinc-900">
      <header className="max-w-6xl mx-auto px-5 pt-8 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">HealthCopilot</h1>
              <p className="text-sm text-zinc-600 -mt-0.5">Multi‑agent health education assistant (demo)</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs text-zinc-600">
            <span className="px-2 py-1 rounded-full bg-zinc-100">OpenAI</span>
            <span className="px-2 py-1 rounded-full bg-zinc-100">Anthropic</span>
            <span className="px-2 py-1 rounded-full bg-zinc-100">Gemini</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-5 gap-6 pb-16">
        <section className="lg:col-span-3 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-2">Symptom location</h2>
            <p className="text-sm text-zinc-600 mb-4">Click on the body part(s) where you're experiencing symptoms.</p>
            <BodyMap selectedParts={selectedParts} onPartSelect={handlePartSelect} />
          </Card>
          <Card>
            <h2 className="text-lg font-semibold mb-4">Describe what’s going on</h2>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., I’ve had a sore throat and mild fever since yesterday."
              className="w-full h-28 resize-none rounded-xl border border-zinc-200 p-4 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <div className="mt-4">
              <label className="text-xs text-zinc-600">Attach a photo (optional)</label>
              {!image ? (
                <label className="mt-1 w-full h-24 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 cursor-pointer">
                  <UploadCloud className="h-6 w-6 text-zinc-500" />
                  <span className="text-sm text-zinc-600 mt-1">Click to upload an image</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              ) : (
                <div className="mt-1 relative w-32 h-32">
                  <img src={image.preview} alt="Upload preview" className="w-full h-full object-cover rounded-xl" />
                  <button
                    onClick={() => {
                      setImage(null);
                      if (image.preview) URL.revokeObjectURL(image.preview);
                    }}
                    className="absolute -top-2 -right-2 bg-zinc-700 text-white rounded-full p-1 shadow-lg hover:bg-zinc-900"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold mb-4">Additional information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-xs text-zinc-600">Age range</label>
                <select value={age} onChange={(e) => setAge(e.target.value)} className="w-full mt-1 rounded-xl border border-zinc-200 p-2.5">
                  <option>Under 12</option>
                  <option>12–17</option>
                  <option>18–39</option>
                  <option>40–64</option>
                  <option>65+</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-600">Duration</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full mt-1 rounded-xl border border-zinc-200 p-2.5">
                  <option>{"< 24 hours"}</option>
                  <option>1–3 days</option>
                  <option>4–7 days</option>
                  <option>{"> 1 week"}</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-600">Known conditions (optional)</label>
                <input value={conditions} onChange={(e) => setConditions(e.target.value)} className="w-full mt-1 rounded-xl border border-zinc-200 p-2.5" placeholder="e.g., asthma" />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs text-zinc-600">Medications / allergies (optional)</label>
              <input value={meds} onChange={(e) => setMeds(e.target.value)} className="w-full mt-1 rounded-xl border border-zinc-200 p-2.5" placeholder="e.g., ibuprofen allergy" />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {(["openai", "anthropic", "gemini"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => toggle(k)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    providers[k] ? "bg-sky-50 border-sky-300 text-sky-700" : "bg-zinc-50 border-zinc-200 text-zinc-500"
                  }`}
                >
                  {providers[k] ? "✓ " : ""}{k}
                </button>
              ))}
              <div className="flex-1" />
              <button
                onClick={handleRun}
                disabled={running || !question.trim()}
                className={`px-4 py-2 rounded-xl text-white font-medium shadow-sm ${
                  running || !question.trim() ? "bg-zinc-300" : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {running ? "Running…" : "Run health check"}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 mt-3">Educational use only. Not medical advice. If you have emergency symptoms (e.g., chest pain, severe trouble breathing), call local emergency services.</p>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold mb-3">Agent timeline</h3>
            <ul className="space-y-2">
              <AnimatePresence>
                {steps.map((s, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    <div>
                      <div className="text-sm font-medium">{s.title}</div>
                      {s.detail && <div className="text-sm text-zinc-600">{s.detail}</div>}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </Card>
        </section>

        <section className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-2">Result</h2>
            {!result ? (
              <p className="text-zinc-600">Run a check to see structured guidance here.</p>
            ) : (
              <div className="prose prose-zinc max-w-none">
                <h3 className="mt-0">What it might be (not a diagnosis)</h3>
                {result.visualAnalysis && (
                  <>
                    <p className="text-sm italic text-zinc-600">Based on the provided image:</p>
                    <ul>
                      {result.visualAnalysis.map((v: string, i: number) => <li key={i}>{v}</li>)}
                    </ul>
                  </>
                )}
                <ul>
                  {result.possibilities.map((p: any, i: number) => (
                    <li key={i}><strong>{p.name}</strong> — {p.reason}</li>
                  ))}
                </ul>
                <h3>What you can do now</h3>
                <ul>
                  {result.selfCare.map((x: string, i: number) => (<li key={i}>{x}</li>))}
                </ul>
                <h3>Red flags — seek urgent care if</h3>
                <ul>
                  {result.redFlags.map((x: string, i: number) => (<li key={i}>{x}</li>))}
                </ul>
                <h3>Questions to ask a clinician</h3>
                <ul>
                  {result.questions.map((x: string, i: number) => (<li key={i}>{x}</li>))}
                </ul>
                <h3>Sources</h3>
                <ul>
                  {result.sources.map((s: any, i: number) => (
                    <li key={i}><a className="underline" href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>
                  ))}
                </ul>
                <p className="text-xs text-zinc-500 mt-4">Disclaimer: This app provides general health education only and is not a substitute for professional medical advice, diagnosis, or treatment.</p>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-sm font-semibold mb-2">How it works</h3>
            <ol className="list-decimal pl-5 text-sm text-zinc-700 space-y-1">
              <li>Intake agent structures your information (no PII required).</li>
              <li>If an image is provided, a Dermatology Analyst agent describes its visual features.</li>
              <li>A Research agent gathers reputable sources (CDC/NIH/WHO) from the web.</li>
              <li>Writer turns findings into patient‑friendly guidance.</li>
              <li>Safety reviewer checks for risky claims and adds red‑flag guidance.</li>
            </ol>
          </Card>
        </section>
      </main>

      <footer className="text-center text-xs text-zinc-500 pb-8">© {new Date().getFullYear()} HealthCopilot demo</footer>
    </div>
  );
}

// --- BodyMap Component ------------------------------------------------------

const bodyParts = {
  head: { path: "M128 42c-22 0-40 18-40 40s18 40 40 40 40-18 40-40-18-40-40-40z", label: "Head" },
  neck: { path: "M110 122h36v18h-36z", label: "Neck" },
  chest: { path: "M90 140h76v50H90z", label: "Chest" },
  abdomen: { path: "M90 190h76v50H90z", label: "Abdomen" },
  pelvis: { path: "M94 240h68v20H94z", label: "Pelvis" },
  left_shoulder: { path: "M90 140l-20-5-5 20h25v-15z", label: "Left Shoulder" },
  right_shoulder: { path: "M166 140l20-5 5 20h-25v-15z", label: "Right Shoulder" },
  left_arm: { path: "M65 155l-15 70 20 5 10-75z", label: "Left Arm" },
  right_arm: { path: "M191 155l15 70-20 5-10-75z", label: "Right Arm" },
  left_hand: { path: "M50 225l-20 25 25-5 10-20z", label: "Left Hand" },
  right_hand: { path: "M206 225l20 25-25-5-10-20z", label: "Right Hand" },
  left_leg: { path: "M94 260l-14 90 25 0 10-90z", label: "Left Leg" },
  right_leg: { path: "M162 260l14 90-25 0-10-90z", label: "Right Leg" },
  left_foot: { path: "M80 350l-20 20 35 0 5-20z", label: "Left Foot" },
  right_foot: { path: "M176 350l20 20-35 0-5-20z", label: "Right Foot" },
};

function BodyMap({ selectedParts, onPartSelect }: { selectedParts: string[], onPartSelect: (part: string) => void }) {
  return (
    <div className="flex flex-col md:flex-row items-start gap-4">
      <svg viewBox="0 0 256 400" className="w-48 h-auto mx-auto md:mx-0">
        <g fill="none" stroke="#9ca3af" strokeWidth="2">
          {Object.entries(bodyParts).map(([id, { path }]) => (
            <motion.path
              key={id}
              d={path}
              className="cursor-pointer transition-all"
              fill={selectedParts.includes(id) ? "rgba(59, 130, 246, 0.5)" : "rgba(228, 228, 231, 0.3)"}
              stroke={selectedParts.includes(id) ? "rgba(37, 99, 235, 1)" : "#9ca3af"}
              whileHover={{ fill: "rgba(59, 130, 246, 0.3)" }}
              onClick={() => onPartSelect(id)}
            />
          ))}
        </g>
      </svg>
      <div className="w-full flex-1 bg-zinc-50/80 rounded-lg p-3 min-h-[12rem]">
        <p className="text-xs text-zinc-500 mb-2">Selected areas:</p>
        {selectedParts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">
            No areas selected
          </div>
        ) : (
          <Reorder.Group axis="y" values={selectedParts} onReorder={setSelectedParts} className="space-y-1">
            {selectedParts.map((part) => (
              <Reorder.Item key={part} value={part}>
                <div className="flex items-center justify-between bg-white rounded-md px-2 py-1.5 border border-zinc-200 shadow-sm">
                  <span className="text-sm font-medium text-zinc-700">{bodyParts[part as keyof typeof bodyParts].label}</span>
                  <button onClick={() => onPartSelect(part)} className="p-1 rounded-full hover:bg-zinc-100">
                    <X className="h-3.5 w-3.5 text-zinc-500" />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Local simulation – replace with your real backend later
// ----------------------------------------------------------------------------
let lastStepResolve: any;
const lastStepPromise = new Promise((res) => (lastStepResolve = res));

async function* simulateRun(intake: any, providers: { openai: boolean; anthropic: boolean; gemini: boolean }) {
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  yield { title: "Coordinator", detail: "Planning triage → research → write → safety." };
  await wait(400);

  yield { title: "Intake (OpenAI)", detail: `Age: ${intake.age} · Duration: ${intake.duration}` };
  await wait(500);

  if (intake.hasImage) {
    yield { title: "Dermatology Analyst (GPT-4o)", detail: "Analyzing image for visual characteristics..." };
    await wait(800);
  }

  if (providers.gemini) {
    yield { title: "Researcher (Gemini)", detail: "Scanning reputable health sources…" };
    await wait(700);
  } else {
    yield { title: "Researcher", detail: "Tools disabled – using general knowledge only." };
    await wait(500);
  }

  yield { title: "Writer (OpenAI)", detail: "Drafting patient‑friendly guidance." };
  await wait(600);

  yield { title: "Safety (Anthropic)", detail: "Checking for risky advice and adding red‑flags." };
  await wait(500);

  const payload = mockResult(intake);
  lastStepResolve({ payload });
}

function mockResult(intake: any) {
  const generic = !intake.question ? "symptoms" : intake.question.slice(0, 32).toLowerCase();
  return {
    ...(intake.hasImage && {
      visualAnalysis: [
        "Localized redness and small, raised bumps.",
        "Borders appear somewhat defined.",
        "Texture looks slightly scaly in some areas."
      ]}),
    possibilities: [
      { name: "Viral upper respiratory infection", reason: "Common with short duration and mild fever." },
      { name: "Allergic irritation", reason: "If congestion/itchy eyes and seasonal pattern." },
      { name: "Bacterial infection (less likely)", reason: "Consider if symptoms persist >7–10 days or worsen." }
    ],
    selfCare: [
      "Hydrate well; warm fluids can soothe throat.",
      "Consider acetaminophen for fever/discomfort if safe for you.",
      "Rest; avoid strenuous activity until fever resolves.",
      "Salt‑water gargles; humidified air may help."
    ],
    redFlags: [
      "Severe trouble breathing, chest pain, or confusion.",
      "Fever > 39.4°C (103°F) or lasting > 3 days.",
      "Severe dehydration or inability to keep fluids down.",
      "Rash, stiff neck, or worsening severe sore throat."
    ],
    questions: [
      "Based on my history, when should I seek in‑person care?",
      "Which over‑the‑counter options are safe with my conditions/medications?",
      "What symptoms would change the likely cause?"
    ],
    sources: [
      { title: "CDC – Sore Throat", url: "https://www.cdc.gov/antibiotic-use/sore-throat.html" },
      { title: "NIH – Common Cold", url: "https://www.niaid.nih.gov/diseases-conditions/common-cold" },
      { title: "WHO – When to seek care", url: "https://www.who.int/" }
    ]
  };
}
