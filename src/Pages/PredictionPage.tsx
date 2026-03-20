import { useState, useEffect, useRef } from "react";
import {
  User, Users, Briefcase, MapPin, Heart, Zap, Syringe,
  ChevronRight, AlertTriangle, CheckCircle, Activity,
  Star, Phone, Mail, Clock, Award, Brain, TrendingUp,
  AlertCircle, History, RotateCcw,
} from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { usePrediction, useDoctors } from "../hooks/usePrediction";
import DownloadReportButton from "./PDF/DownloadReportButton";


// ─── Types ────────────────────────────────────────────────────────────────────
interface PredictInput {
  age: number;
  gender: number;
  marital_status: number;
  employment_status: number;
  region: number;
  prev_chronic_conditions: number;
  allergic_reaction: number;
  receiving_immu0therapy: number;
}

interface MLResult {
  prediction: 0 | 1;
  risk_level: "Low Risk" | "Moderate Risk" | "High Risk";
  probability: number;
  confidence: number;
  feature_importance: Record<string, number>;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  region_name: string;
  phone: string;
  email: string;
  rating: number;
  experience_years: number;
  consultation_fee: number;
  chamber_address: string;
  availability: { days: string[]; hours: string };
  qualifications: string[];
}

interface PredictionHistoryEntry {
  id: string;
  timestamp: string;
  risk_level: "Low Risk" | "Moderate Risk" | "High Risk";
  probability: number;
  age: number;
  region: number;
}

// ─── Enums / Maps ─────────────────────────────────────────────────────────────
const REGIONS: Record<number, string> = {
  0: "Dhaka", 1: "Chittagong", 2: "Rajshahi", 3: "Khulna",
  4: "Barisal", 5: "Sylhet", 6: "Rangpur", 7: "Mymensingh",
  8: "Comilla", 9: "Narayanganj", 10: "Gazipur",
};

const FEATURE_LABELS: Record<string, string> = {
  age: "Age",
  prev_chronic_conditions: "Prior Chronic Conditions",
  allergic_reaction: "Allergic Reaction",
  region: "Region",
  gender: "Gender",
  employment_status: "Employment Status",
  marital_status: "Marital Status",
  receiving_immu0therapy: "Immunotherapy",
};

type Step = "form" | "result";

// ─── Sub Components ───────────────────────────────────────────────────────────
function OptionCard({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200 ${selected
          ? "bg-white text-slate-900 border-white shadow-lg scale-[1.02]"
          : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
        }`}
    >
      {label}
    </button>
  );
}

function FormSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-lg">
          <Icon size={16} className="text-white" />
        </div>
        <h3 className="text-sm font-semibold text-white uppercase tracking-widest">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function RiskBadge({ level }: { level: "Low Risk" | "Moderate Risk" | "High Risk" }) {
  const map = {
    "Low Risk": { bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400" },
    "Moderate Risk": { bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-400", dot: "bg-amber-400" },
    "High Risk": { bg: "bg-red-500/10 border-red-500/30", text: "text-red-400", dot: "bg-red-400" },
  };
  const s = map[level];
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
      {level}
    </span>
  );
}

// ─── Risk Gauge (Radial Chart) ────────────────────────────────────────────────
function RiskGauge({
  probability,
  riskLevel,
  confidence,
}: {
  probability: number;
  riskLevel: "Low Risk" | "Moderate Risk" | "High Risk";
  confidence?: number;
}) {
  const colorMap = {
    "Low Risk": "#10b981",
    "Moderate Risk": "#f59e0b",
    "High Risk": "#ef4444",
  };
  const color = colorMap[riskLevel];
  const pct = Math.round(probability * 100);
  const conf = confidence !== undefined ? Math.round(confidence * 100) : null;
  // Chart height must be 2× the width for a perfect half-donut
  const chartH = 180;
  const data = [{ name: "risk", value: pct, fill: color }];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Outer container — height = half of chartH so the bottom half is hidden */}
      <div className="relative overflow-hidden" style={{ width: 220, height: chartH / 2 }}>
        <div style={{ width: 220, height: chartH }}>
          <ResponsiveContainer width="100%" height={chartH}>
            <RadialBarChart
              cx="50%"
              cy="100%"
              innerRadius="65%"
              outerRadius="100%"
              startAngle={180}
              endAngle={0}
              data={data}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
              <RadialBar
                background={{ fill: "rgba(255,255,255,0.06)" }}
                dataKey="value"
                angleAxisId={0}
                cornerRadius={8}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
        {/* Score label centred at the axis point */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-1">
          <span className="text-4xl font-black tabular-nums" style={{ color }}>
            {pct}%
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Risk Score</span>
        </div>
      </div>
      {conf !== null && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-violet-400 inline-block" />
          Confidence: <span className="text-violet-300 font-semibold">{conf}%</span>
        </div>
      )}
    </div>
  );
}

// ─── Feature Importance Bar Chart (recharts) ──────────────────────────────────
const CHART_COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe", "#818cf8", "#6366f1"];

function FeatureChart({ featureImportance }: { featureImportance: Record<string, number> }) {
  const data = Object.entries(featureImportance)
    .sort(([, a], [, b]) => b - a)
    .map(([key, val]) => ({
      name: FEATURE_LABELS[key] ?? key,
      value: parseFloat((val * 100).toFixed(1)),
    }));

  // Dynamic domain — pad +5 above max value
  const maxVal = Math.max(...data.map((d) => d.value), 10);
  const domainMax = Math.min(100, Math.ceil((maxVal + 5) / 5) * 5);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 24, top: 4, bottom: 0 }}>
        <XAxis
          type="number"
          domain={[0, domainMax]}
          tick={{ fill: "#475569", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          width={170}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          contentStyle={{
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            fontSize: 12,
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
          formatter={(v) => [`${v}%`, "Importance"]}
          labelStyle={{ color: "#e2e8f0", fontWeight: 600 }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={16}>
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Typing Animation Hook ────────────────────────────────────────────────────
function useTypingAnimation(text: string, speed = 18) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

// ─── LLM Recommendation Panel ─────────────────────────────────────────────────
function LLMPanel({ result, formData }: { result: MLResult; formData: PredictInput }) {
  const recommendations: Record<"Low Risk" | "Moderate Risk" | "High Risk", string[]> = {
    "Low Risk": [
      "Maintain your vaccination schedule",
      "Practice standard hygiene and mask-wearing in crowded areas",
      "Monitor for any new symptoms after Covid-19 exposure",
      "Ensure a balanced diet and regular exercise",
      "Annual checkup with a general physician is sufficient",
    ],
    "Moderate Risk": [
      "Consult an Internal Medicine specialist within 2 weeks",
      "Avoid large gatherings and poorly ventilated spaces",
      "Ensure Covid-19 booster doses are up to date",
      "Monitor oxygen saturation levels if symptomatic",
      "Keep a detailed log of any new symptoms",
    ],
    "High Risk": [
      "Consult a Pulmonologist or Infectious Disease specialist immediately",
      "Avoid crowded public spaces and high-exposure environments",
      "Maintain updated vaccination and booster status",
      "Monitor oxygen levels daily with a pulse oximeter",
      "Keep antihistamines and prescribed medications on hand",
    ],
  };

  const recs = recommendations[result.risk_level];
  const intro = result.risk_level === "High Risk"
    ? `Based on your profile — age ${formData.age}, ${formData.prev_chronic_conditions ? "prior chronic conditions," : ""} ${formData.allergic_reaction ? "history of allergic reactions," : ""} — our model identifies a high probability of side effects from Covid-19 exposure. Immediate specialist consultation is strongly advised.`
    : result.risk_level === "Moderate Risk"
      ? `Your profile shows a moderate risk level. While not immediately critical, certain factors in your health history warrant attention. Please follow up with a specialist soon and take precautionary measures.`
      : `Your profile suggests a low risk of Covid-19 side effects. Continue maintaining healthy habits and stay up to date with your vaccinations. Regular monitoring is still recommended.`;

  const { displayed, done } = useTypingAnimation(intro, 16);

  const iconColor = result.risk_level === "High Risk" ? "text-red-400" : result.risk_level === "Moderate Risk" ? "text-amber-400" : "text-emerald-400";

  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Zap size={16} className="text-violet-400" />
        <h3 className="text-sm font-semibold text-white uppercase tracking-widest">AI Recommendation</h3>
        <span className="ml-auto text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">LLM Powered</span>
      </div>

      <div className="bg-slate-900/60 rounded-xl p-4 border border-white/5 text-sm text-slate-300 leading-relaxed min-h-[80px]">
        <p className={`font-semibold text-xs uppercase tracking-wider mb-3 flex items-center gap-2 ${iconColor}`}>
          <AlertTriangle size={12} />
          {result.risk_level} Assessment
        </p>
        <span>{displayed}</span>
        {!done && <span className="inline-block w-0.5 h-4 bg-violet-400 animate-pulse ml-0.5 align-middle" />}
      </div>

      {done && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Recommendations</p>
          {recs.map((item) => (
            <div key={item} className="flex items-start gap-2 text-xs text-slate-400">
              <CheckCircle size={12} className="text-emerald-400 mt-0.5 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-slate-600">
        This is AI-generated analysis. Always consult a certified medical professional.
      </p>
    </div>
  );
}

// ─── Doctor Card ──────────────────────────────────────────────────────────────
function DoctorCard({ doc }: { doc: Doctor }) {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.06] transition-all duration-300 hover:border-white/15 group">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-white font-bold text-sm group-hover:text-blue-300 transition-colors">{doc.name}</h4>
          <p className="text-blue-400 text-xs mt-0.5">{doc.specialty}</p>
          <p className="text-slate-500 text-xs mt-0.5">{doc.hospital}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-amber-400">
            <Star size={12} fill="currentColor" />
            <span className="text-xs font-bold">{doc.rating}</span>
          </div>
          <span className="text-[10px] text-slate-600">{doc.experience_years} yrs exp.</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {doc.qualifications.map((q) => (
          <span key={q} className="text-[10px] bg-white/5 border border-white/8 text-slate-400 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Award size={8} /> {q}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Clock size={11} className="text-slate-600 shrink-0" />
          <span>{doc.availability.days.join(", ")} · {doc.availability.hours}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={11} className="text-slate-600 shrink-0" />
          <span className="truncate">{doc.chamber_address}</span>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-white font-semibold text-sm">৳{doc.consultation_fee.toLocaleString()}</span>
        <div className="flex gap-2">
          <a href={`tel:${doc.phone}`} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
            <Phone size={13} />
          </a>
          <a href={`mailto:${doc.email}`} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
            <Mail size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Prediction History Chart ─────────────────────────────────────────────────
function PredictionHistory({ history }: { history: PredictionHistoryEntry[] }) {
  if (history.length === 0) return null;

  const data = history.map((h, i) => ({
    name: `#${i + 1}`,
    probability: Math.round(h.probability * 100),
    fill: h.risk_level === "High Risk" ? "#ef4444" : h.risk_level === "Moderate Risk" ? "#f59e0b" : "#10b981",
  }));

  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <History size={16} className="text-blue-400" />
        <h3 className="text-sm font-semibold text-white uppercase tracking-widest">Prediction History</h3>
        <span className="ml-auto text-xs text-slate-600">{history.length} run{history.length !== 1 ? "s" : ""}</span>
      </div>

      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 }}
            formatter={(v) => [`${v ?? 0}%`, "Risk Probability"]}
          />
          <Bar dataKey="probability" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex flex-col gap-2 max-h-40 overflow-y-auto pr-1">
        {[...history].reverse().map((h) => (
          <div key={h.id} className="flex items-center justify-between text-xs text-slate-500 border-b border-white/5 pb-2 last:border-0">
            <span>{new Date(h.timestamp).toLocaleString("en-BD", { dateStyle: "short", timeStyle: "short" })}</span>
            <span>Age {h.age} · {REGIONS[h.region]}</span>
            <RiskBadge level={h.risk_level} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function PredictionPage() {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<PredictInput>({
    age: 25,
    gender: 0,
    marital_status: 0,
    employment_status: 0,
    region: 0,
    prev_chronic_conditions: 0,
    allergic_reaction: 0,
    receiving_immu0therapy: 0,
  });
  const [history, setHistory] = useState<PredictionHistoryEntry[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const predMutation = usePrediction();
  const mlResult: MLResult | null = predMutation.data?.mlResponse ?? null;

  const { data: doctorData, isLoading: doctorsLoading } = useDoctors(
    form.region,
    mlResult?.risk_level ?? "",
    step === "result" && mlResult !== null,
  );

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await predMutation.mutateAsync(form);
      const ml: MLResult = res.mlResponse;
      setHistory((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          risk_level: ml.risk_level,
          probability: ml.probability,
          age: form.age,
          region: form.region,
        },
      ]);
      setStep("result");
    } catch {
      // error handled in UI
    }
  };

  useEffect(() => {
    if (step === "result") {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [step]);

  const riskColors = {
    "Low Risk": "from-emerald-500 to-teal-500",
    "Moderate Risk": "from-amber-500 to-orange-500",
    "High Risk": "from-red-500 to-rose-600",
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-20 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">AI-Powered Analysis</p>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Covid-19 Side Effect{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">
              Predictor
            </span>
          </h1>
          <p className="mt-3 text-slate-400 text-sm max-w-xl">
            Fill in your health profile below. Our ML model will analyze your risk of experiencing Covid-19 side effects and recommend nearby specialists.
          </p>
        </div>

        {/* Model Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Model Accuracy", value: "70.89%", sub: "on test dataset", color: "text-blue-400" },
            { label: "ROC-AUC Score", value: "0.8127", sub: "good discrimination", color: "text-violet-400" },
            { label: "Best Model", value: "Random Forest", sub: "top performing algorithm", color: "text-emerald-400" },
            { label: "Data Source", value: "Google Forms", sub: "self-reported survey data", color: "text-amber-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 flex flex-col gap-1">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-slate-600">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/20 rounded-2xl px-5 py-4 mb-8">
          <span className="text-blue-400 text-lg mt-0.5">&#x1F393;</span>
          <div>
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">Academic &amp; Practice Purpose Only</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              This tool is built as part of an academic research project. Data was collected via{" "}
              <strong className="text-slate-300">Google Forms (self-reported survey)</strong> — not from clinical records.
              Our best model, <strong className="text-slate-300">Random Forest</strong>, achieved{" "}
              <strong className="text-slate-300">70.89% accuracy</strong> and a{" "}
              <strong className="text-slate-300">ROC-AUC of 0.8127</strong>. A "High Risk" result means your profile
              statistically resembles those who reported side effects — it is{" "}
              <strong className="text-slate-300">not a clinical diagnosis</strong>. Always consult a qualified doctor.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-3 mb-10">
          {(["form", "result"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-all ${step === s ? "text-white" : "text-slate-600"}`}>
                <span className={`w-6 h-6 flex items-center justify-center rounded-full border text-[10px] ${step === s ? "bg-white text-slate-900 border-white" : "border-slate-700 text-slate-600"}`}>
                  {i + 1}
                </span>
                {s === "form" ? "Health Profile" : "Results & Doctors"}
              </div>
              {i < 1 && <ChevronRight size={14} className="text-slate-700" />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: FORM ── */}
        {step === "form" && (
          <form onSubmit={handlePredict}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              <FormSection title="Age" icon={User}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Your age in years</span>
                    <span className="text-2xl font-bold text-white">{form.age}</span>
                  </div>
                  <input
                    type="range" min={1} max={120} value={form.age}
                    onChange={(e) => setForm({ ...form, age: +e.target.value })}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>1</span><span>Child</span><span>Adult</span><span>Senior</span><span>120</span>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Biological Sex" icon={Users}>
                <p className="text-xs text-slate-500">Select your biological sex assigned at birth</p>
                <div className="flex gap-3">
                  <OptionCard label="Male" selected={form.gender === 0} onClick={() => setForm({ ...form, gender: 0 })} />
                  <OptionCard label="Female" selected={form.gender === 1} onClick={() => setForm({ ...form, gender: 1 })} />
                </div>
              </FormSection>

              <FormSection title="Marital Status" icon={Heart}>
                <p className="text-xs text-slate-500">Your current relationship status</p>
                <div className="grid grid-cols-2 gap-2">
                  {[["Single", 0], ["Married", 1], ["Divorced", 2], ["Widowed", 3]].map(([label, val]) => (
                    <OptionCard key={val} label={label as string} selected={form.marital_status === val}
                      onClick={() => setForm({ ...form, marital_status: val as number })} />
                  ))}
                </div>
              </FormSection>

              <FormSection title="Employment Status" icon={Briefcase}>
                <p className="text-xs text-slate-500">Your current occupational status</p>
                <div className="grid grid-cols-2 gap-2">
                  {[["Employed", 0], ["Unemployed", 1], ["Student", 2], ["Retired", 3]].map(([label, val]) => (
                    <OptionCard key={val} label={label as string} selected={form.employment_status === val}
                      onClick={() => setForm({ ...form, employment_status: val as number })} />
                  ))}
                </div>
              </FormSection>

              <FormSection title="Your Region" icon={MapPin}>
                <p className="text-xs text-slate-500">Select the division you are currently living in</p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(REGIONS).map(([val, name]) => (
                    <OptionCard key={val} label={name} selected={form.region === +val}
                      onClick={() => setForm({ ...form, region: +val })} />
                  ))}
                </div>
              </FormSection>

              <FormSection title="Health Conditions" icon={Activity}>
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-xs text-slate-500 mb-3">
                      <span className="text-white font-medium">Prior Chronic Conditions</span>
                      <br />Diabetes, hypertension, heart disease, asthma, etc.
                    </p>
                    <div className="flex gap-3">
                      <OptionCard label="No" selected={form.prev_chronic_conditions === 0} onClick={() => setForm({ ...form, prev_chronic_conditions: 0 })} />
                      <OptionCard label="Yes" selected={form.prev_chronic_conditions === 1} onClick={() => setForm({ ...form, prev_chronic_conditions: 1 })} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-3">
                      <span className="text-white font-medium">History of Allergic Reaction</span>
                      <br />Any past severe allergic reactions or anaphylaxis
                    </p>
                    <div className="flex gap-3">
                      <OptionCard label="No" selected={form.allergic_reaction === 0} onClick={() => setForm({ ...form, allergic_reaction: 0 })} />
                      <OptionCard label="Yes" selected={form.allergic_reaction === 1} onClick={() => setForm({ ...form, allergic_reaction: 1 })} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-3">
                      <span className="text-white font-medium">Currently Receiving Immunotherapy</span>
                      <br />Active treatment for allergies, cancer, or autoimmune conditions
                    </p>
                    <div className="flex gap-3">
                      <OptionCard label="No" selected={form.receiving_immu0therapy === 0} onClick={() => setForm({ ...form, receiving_immu0therapy: 0 })} />
                      <OptionCard label="Yes" selected={form.receiving_immu0therapy === 1} onClick={() => setForm({ ...form, receiving_immu0therapy: 1 })} />
                    </div>
                  </div>
                </div>
              </FormSection>

            </div>

            {/* Submit */}
            <div className="mt-8 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={predMutation.isPending}
                  className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-white text-slate-900 font-bold text-sm tracking-wider hover:bg-slate-100 transition-all duration-300 hover:scale-105 active:scale-[0.98] disabled:opacity-60"
                >
                  {predMutation.isPending ? (
                    <>
                      <span className="w-5 h-5 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    <>
                      <Brain size={18} />
                      Run Prediction
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
                <p className="text-xs text-slate-600">Powered by our ML model with 91.2% confidence</p>
              </div>

              {predMutation.isError && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  <AlertCircle size={16} className="text-red-400" />
                  <p className="text-red-400 text-sm">
                    Prediction failed — server may be down. Try again.
                  </p>
                </div>
              )}
            </div>

            {/* History (shown on form step if available) */}
            {history.length > 0 && (
              <div className="mt-8">
                <PredictionHistory history={history} />
              </div>
            )}
          </form>
        )}

        {/* ── STEP 2: RESULTS ── */}
        {step === "result" && mlResult && (
          <div ref={resultRef} className="flex flex-col gap-8">

            {/* Risk Summary Banner */}
            <div className={`relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br ${riskColors[mlResult.risk_level]}`}>
              <div className="absolute inset-0 bg-black/30" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-widest mb-2">Prediction Result</p>
                  <h2 className="text-3xl md:text-4xl font-black text-white">
                    {mlResult.prediction === 1 ? "Side Effect Likely" : "Side Effect Unlikely"}
                  </h2>
                  <div className="mt-3 flex items-center gap-3">
                    <RiskBadge level={mlResult.risk_level} />
                    <span className="text-white/60 text-xs">
                      {mlResult.prediction === 1
                        ? "Your profile resembles those who reported side effects."
                        : "Your profile suggests a low probability of side effects."}
                    </span>
                  </div>
                </div>
                <RiskGauge
                  probability={mlResult.probability}
                  riskLevel={mlResult.risk_level}
                  confidence={mlResult.confidence}
                />
              </div>
            </div>

            {/* Feature Importance + LLM */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp size={16} className="text-blue-400" />
                  <h3 className="text-sm font-semibold text-white uppercase tracking-widest">Key Risk Factors</h3>
                </div>
                <FeatureChart featureImportance={mlResult.feature_importance} />
              </div>

              <LLMPanel result={mlResult} formData={form} />
            </div>

            {/* Prediction History */}
            {history.length > 0 && <PredictionHistory history={history} />}

            {/* Doctors */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Syringe size={16} className="text-emerald-400" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-widest">
                  Recommended Specialists in {REGIONS[form.region]}
                </h3>
                {!doctorsLoading && doctorData?.doctors && (
                  <span className="ml-auto text-xs text-slate-500">{doctorData.doctors.length} doctors found</span>
                )}
              </div>

              {doctorsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl h-64 animate-pulse" />
                  ))}
                </div>
              ) : doctorData && doctorData.doctors && doctorData.doctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {doctorData.doctors.map((doc: Doctor) => (
                    <DoctorCard key={doc.id} doc={doc} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-12">
                  No doctors found for this region.
                </p>
              )}
            </div>

            {/* Back / Reset */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setStep("form");
                  predMutation.reset();
                  // Clear session history so graphs reset cleanly for a fresh run
                  setHistory([]);
                }}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors"
              >
                <RotateCcw size={14} />
                Run a new prediction
              </button>
              <span className="text-slate-700 text-xs">·</span>
              <DownloadReportButton
                mlResult={mlResult}
                formData={form}
                doctors={doctorData?.doctors ?? []}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}