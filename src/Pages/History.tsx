import { useState } from "react";
import {
  History,
  Activity,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { useMyHistory, useMyAnalytics } from "../hooks/usePrediction";
import type { PredictionRecord } from "../types/auth.prediction";

// ─── Constants ────────────────────────────────────────────────────────────────
const REGIONS: Record<number, string> = {
  0: "Dhaka", 1: "Chittagong", 2: "Rajshahi", 3: "Khulna",
  4: "Barisal", 5: "Sylhet", 6: "Rangpur", 7: "Mymensingh",
  8: "Comilla", 9: "Narayanganj", 10: "Gazipur",
};

const RISK_CONFIG = {
  "Low Risk": { bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400", bar: "#10b981" },
  "Moderate Risk": { bg: "bg-amber-500/10   border-amber-500/30", text: "text-amber-400", dot: "bg-amber-400", bar: "#f59e0b" },
  "High Risk": { bg: "bg-red-500/10     border-red-500/30", text: "text-red-400", dot: "bg-red-400", bar: "#ef4444" },
};

// ─── Sub: Risk Badge ──────────────────────────────────────────────────────────
function RiskBadge({ level }: { level: keyof typeof RISK_CONFIG }) {
  const s = RISK_CONFIG[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
      {level}
    </span>
  );
}

// ─── Sub: Stat Card ───────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/8 rounded-2xl px-5 py-4 flex flex-col gap-1">
      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-600">{sub}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export const HistoryPage = () => {
  const [page, setPage] = useState(1);

  const { data: historyRes, isLoading: histLoading, isError: histError } = useMyHistory(page);
  const { data: analytics, isLoading: analyticsLoading } = useMyAnalytics();

  const records: PredictionRecord[] = historyRes?.data ?? [];
  const totalPages = historyRes?.totalPages ?? 1;

  // ── Charts data ───────────────────────────────────────────────────────────
  const riskDistData = analytics?.riskLevels
    ? (() => {
      const counts: Record<string, number> = {};
      (analytics.riskLevels as string[]).forEach((r) => {
        counts[r] = (counts[r] ?? 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({
        name,
        value,
        fill: RISK_CONFIG[name as keyof typeof RISK_CONFIG]?.bar ?? "#6366f1",
      }));
    })()
    : [];

  const trendData = [...records]
    .reverse()
    .map((r, i) => ({
      name: `#${i + 1}`,
      probability: Math.round(r.probability * 100),
      confidence: Math.round(r.confidence * 100),
    }));

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-20 px-4 md:px-10">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">My Records</p>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Prediction{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">
              History
            </span>
          </h1>
          <p className="mt-3 text-slate-400 text-sm max-w-xl">
            Review all past predictions, track your risk trend over time, and download individual reports.
          </p>
        </div>

        {/* Analytics Cards */}
        {analyticsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : analytics ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total Predictions" value={analytics.total} color="text-blue-400" />
            <StatCard
              label="Side Effect Positive"
              value={analytics.sideEffectCount}
              sub={`${analytics.total ? Math.round((analytics.sideEffectCount / analytics.total) * 100) : 0}% of total`}
              color="text-red-400"
            />
            <StatCard
              label="Avg Risk Probability"
              value={analytics.avgProbability != null ? `${Math.round(analytics.avgProbability * 100)}%` : "—"}
              color="text-amber-400"
            />
            <StatCard
              label="Avg Confidence"
              value={analytics.avgConfidence != null ? `${Math.round(analytics.avgConfidence * 100)}%` : "—"}
              color="text-violet-400"
            />
          </div>
        ) : null}

        {/* Charts Row */}
        {riskDistData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Risk Distribution */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <BarChart2 size={16} className="text-violet-400" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-widest">
                  Risk Distribution
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={riskDistData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(v) => [v, "Predictions"]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {riskDistData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Probability Trend */}
            <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <TrendingUp size={16} className="text-blue-400" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-widest">
                  Risk Probability Trend
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(v, name) => [`${v}%`, name === "probability" ? "Risk Probability" : "Confidence"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="probability"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: "#ef4444", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="confidence"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: "#6366f1", r: 3 }}
                    activeDot={{ r: 5 }}
                    strokeDasharray="4 4"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-500 inline-block" /> Risk %</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-500 inline-block border-dashed" /> Confidence %</span>
              </div>
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="bg-white/[0.03] border border-white/8 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/8">
            <History size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-widest">Past Predictions</h3>
            {historyRes && (
              <span className="ml-auto text-xs text-slate-500">{historyRes.total} total</span>
            )}
          </div>

          {histLoading ? (
            <div className="flex flex-col gap-2 p-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-white/[0.03] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : histError ? (
            <div className="flex items-center gap-3 p-8 text-red-400">
              <AlertCircle size={16} />
              <p className="text-sm">Failed to load prediction history. Please try again.</p>
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-slate-600">
              <Activity size={32} className="opacity-40" />
              <p className="text-sm">No predictions found. Run your first prediction!</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden md:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_80px] px-6 py-2 text-[10px] uppercase tracking-widest text-slate-600 border-b border-white/5">
                <span>Date</span>
                <span>Risk Level</span>
                <span>Probability</span>
                <span>Confidence</span>
                <span>Region</span>
                <span>Age</span>
              </div>

              {records.map((r, idx) => {
                const s = RISK_CONFIG[r.risk_level] ?? RISK_CONFIG["Low Risk"];
                return (
                  <div
                    key={r._id}
                    className={`flex flex-col md:grid md:grid-cols-[1fr_1fr_1fr_1fr_1fr_80px] items-start md:items-center px-6 py-4 gap-2 md:gap-0 transition-colors hover:bg-white/[0.02] ${idx !== records.length - 1 ? "border-b border-white/5" : ""
                      }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={11} className="text-slate-600 shrink-0" />
                      {new Date(r.createdAt).toLocaleString("en-BD", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                    <div>
                      <RiskBadge level={r.risk_level} />
                    </div>
                    <div>
                      <span className={`text-sm font-bold ${s.text}`}>
                        {Math.round(r.probability * 100)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-violet-400 font-semibold">
                        {Math.round(r.confidence * 100)}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {REGIONS[r.input.region] ?? `Region ${r.input.region}`}
                    </div>
                    <div className="text-xs text-slate-400">
                      {r.input.age} yrs
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-white/8">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>
                  <span className="text-xs text-slate-500">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};