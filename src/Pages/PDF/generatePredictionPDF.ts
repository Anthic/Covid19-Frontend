// ─────────────────────────────────────────────────────────────────────────────
// generatePredictionPDF.ts
//
// Production-ready PDF generator for the Covid-19 Side Effect Prediction Report.
// Dependencies: jsPDF + jspdf-autotable
// ─────────────────────────────────────────────────────────────────────────────

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MLResult {
  prediction: 0 | 1;
  risk_level: "Low Risk" | "Moderate Risk" | "High Risk";
  probability: number;
  confidence: number;
  feature_importance: Record<string, number>;
}

export interface PredictInput {
  age: number;
  gender: number;
  marital_status: number;
  employment_status: number;
  region: number;
  prev_chronic_conditions: number;
  allergic_reaction: number;
  receiving_immu0therapy: number;
}

export interface Doctor {
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

export interface PDFReportInput {
  mlResult: MLResult;
  formData: PredictInput;
  doctors: Doctor[];
  patientName?: string;
}

// ─── Label Maps ───────────────────────────────────────────────────────────────
const REGIONS: Record<number, string> = {
  0: "Dhaka", 1: "Chittagong", 2: "Rajshahi", 3: "Khulna",
  4: "Barisal", 5: "Sylhet", 6: "Rangpur", 7: "Mymensingh",
  8: "Comilla", 9: "Narayanganj", 10: "Gazipur",
};

const GENDER_LABELS: Record<number, string>     = { 0: "Male", 1: "Female" };
const MARITAL_LABELS: Record<number, string>    = { 0: "Single", 1: "Married", 2: "Divorced", 3: "Widowed" };
const EMPLOYMENT_LABELS: Record<number, string> = { 0: "Employed", 1: "Unemployed", 2: "Student", 3: "Retired" };
const YES_NO: Record<number, string>            = { 0: "No", 1: "Yes" };

const FEATURE_LABELS: Record<string, string> = {
  age:                     "Age",
  prev_chronic_conditions: "Prior Chronic Conditions",
  allergic_reaction:       "Allergic Reaction",
  region:                  "Region",
  gender:                  "Gender",
  employment_status:       "Employment Status",
  marital_status:          "Marital Status",
  receiving_immu0therapy:  "Immunotherapy",
};

// Risk colors as RGB tuples
const RISK_COLORS: Record<string, [number, number, number]> = {
  "Low Risk":      [16,  185, 129],  // emerald-500
  "Moderate Risk": [245, 158,  11],  // amber-500
  "High Risk":     [239,  68,  68],  // red-500
};

// Bar accent colors matching the recharts palette
const BAR_COLORS: [number, number, number][] = [
  [99,  102, 241],   // indigo-500
  [139,  92, 246],   // violet-500
  [167, 139, 250],   // violet-400
  [196, 181, 253],   // violet-300
  [129, 140, 248],   // indigo-400
  [165, 180, 252],   // indigo-300
  [110, 86,  207],
  [76,  29, 149],
];

const RECOMMENDATIONS: Record<string, string[]> = {
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

// ─── Helper: check page break ─────────────────────────────────────────────────
function checkPageBreak(doc: jsPDF, y: number, needed = 20): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - 16) {
    doc.addPage();
    return 20;
  }
  return y;
}

// ─── Helper: Section Header ───────────────────────────────────────────────────
function drawSectionHeader(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  w: number,
  accentColor: [number, number, number] = [99, 102, 241],
): number {
  // Accent left bar
  doc.setFillColor(...accentColor);
  doc.rect(x, y, 3, 7, "F");

  // Background bar
  doc.setFillColor(241, 245, 249);
  doc.rect(x + 3, y, w - 3, 7, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(text, x + 8, y + 5);

  return y + 11;
}

// ─── Helper: Horizontal Progress Bar ─────────────────────────────────────────
function drawProgressBar(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  fillPercent: number,
  color: [number, number, number],
  trackColor: [number, number, number] = [226, 232, 240],
): void {
  const h = 4;
  const filled = Math.max(0, Math.min(100, fillPercent));
  const barW = (filled / 100) * width;

  doc.setFillColor(...trackColor);
  doc.roundedRect(x, y, width, h, 2, 2, "F");

  if (barW > 0.5) {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, barW, h, 2, 2, "F");
  }
}

// ─── Helper: Draw semicircular gauge arc ──────────────────────────────────────
function drawSemiGauge(
  doc: jsPDF,
  cx: number,
  cy: number,
  r: number,
  fillPercent: number,
  color: [number, number, number],
): void {
  const steps = 120;
  const startDeg = 180; // leftmost point
  const totalDeg = 180; // half circle
  const filledDeg = (fillPercent / 100) * totalDeg;

  // --- Track (background arc) ---
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(4);
  const trackPoints: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const deg = startDeg + (totalDeg * i) / steps;
    const rad = (deg * Math.PI) / 180;
    trackPoints.push([cx + r * Math.cos(rad), cy + r * Math.sin(rad)]);
  }
  for (let i = 1; i < trackPoints.length; i++) {
    doc.line(trackPoints[i - 1][0], trackPoints[i - 1][1], trackPoints[i][0], trackPoints[i][1]);
  }

  // --- Filled arc ---
  if (filledDeg > 0) {
    doc.setDrawColor(...color);
    doc.setLineWidth(4);
    const arcSteps = Math.ceil((filledDeg / totalDeg) * steps);
    const fillPoints: [number, number][] = [];
    for (let i = 0; i <= arcSteps; i++) {
      const deg = startDeg + (filledDeg * i) / arcSteps;
      const rad = (deg * Math.PI) / 180;
      fillPoints.push([cx + r * Math.cos(rad), cy + r * Math.sin(rad)]);
    }
    for (let i = 1; i < fillPoints.length; i++) {
      doc.line(fillPoints[i - 1][0], fillPoints[i - 1][1], fillPoints[i][0], fillPoints[i][1]);
    }
  }

  doc.setLineWidth(0.3); // reset
}

// ─── Main Generator ───────────────────────────────────────────────────────────
export function generatePredictionPDF({
  mlResult,
  formData,
  doctors,
  patientName = "Anonymous",
}: PDFReportInput): void {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW  = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentW = pageW - margin * 2;
  const riskColor = RISK_COLORS[mlResult.risk_level];
  let y = 0;

  // ── PAGE 1 ────────────────────────────────────────────────────────────────

  // Dark header bar
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 52, "F");

  // App name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(99, 102, 241);
  doc.text("COVID-19 SIDE EFFECT PREDICTOR", margin, 14);
  doc.text("POWERED BY ML · ACADEMIC RESEARCH", pageW - margin, 14, { align: "right" });

  // Report title
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("Prediction Report", margin, 26);

  // Date & patient
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  const dateStr = new Date().toLocaleString("en-BD", { dateStyle: "long", timeStyle: "short" });
  doc.text(`Generated: ${dateStr}`, margin, 35);
  doc.text(`Patient: ${patientName}`, margin, 41);

  y = 60;

  // ── Risk Summary Card ─────────────────────────────────────────────────────
  // Card background
  doc.setFillColor(...riskColor);
  const cardH = 46;
  doc.roundedRect(margin, y, contentW, cardH, 5, 5, "F");
  doc.setFillColor(0, 0, 0);
  // slight dark overlay — simulate by printing a semi-transparent rect
  // (jsPDF doesn't have native alpha, skip the overlay for clean look)

  // Left: verdict & risk level
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(
    mlResult.prediction === 1 ? "SIDE EFFECT LIKELY" : "SIDE EFFECT UNLIKELY",
    margin + 6, y + 13,
  );

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(mlResult.risk_level.toUpperCase() + " PROFILE", margin + 6, y + 21);

  // Risk arc gauge (right side of card)
  const gaugeCX = margin + contentW - 26;
  const gaugeCY = y + cardH - 6;
  const gaugeR   = 20;
  const pct      = Math.round(mlResult.probability * 100);
  drawSemiGauge(doc, gaugeCX, gaugeCY, gaugeR, pct, [255, 255, 255]);

  // Percentage label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`${pct}%`, gaugeCX, gaugeCY - 3, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Risk Score", gaugeCX, gaugeCY + 3, { align: "center" });

  y += cardH + 6;

  // ── Stats Row ─────────────────────────────────────────────────────────────
  const statW = (contentW - 8) / 3;
  const stats = [
    { label: "Probability", value: `${pct}%`, color: riskColor },
    { label: "Confidence",  value: `${Math.round(mlResult.confidence * 100)}%`, color: [99, 102, 241] as [number, number, number] },
    { label: "Result",      value: mlResult.prediction === 1 ? "Positive" : "Negative", color: riskColor },
  ];

  stats.forEach((s, i) => {
    const sx = margin + i * (statW + 4);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(sx, y, statW, 16, 3, 3, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(s.label.toUpperCase(), sx + statW / 2, y + 5.5, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...s.color);
    doc.text(s.value, sx + statW / 2, y + 13, { align: "center" });
  });

  y += 22;

  // ── Patient Profile ───────────────────────────────────────────────────────
  y = drawSectionHeader(doc, "PATIENT PROFILE", margin, y, contentW);

  const profileRows = [
    ["Age",             `${formData.age} years`,                 "Gender",            GENDER_LABELS[formData.gender] ?? "—"],
    ["Marital Status",  MARITAL_LABELS[formData.marital_status]  ?? "—", "Employment", EMPLOYMENT_LABELS[formData.employment_status] ?? "—"],
    ["Region",          REGIONS[formData.region]                 ?? "—", "Chronic Conditions", YES_NO[formData.prev_chronic_conditions] ?? "—"],
    ["Allergic Reaction", YES_NO[formData.allergic_reaction]     ?? "—", "Immunotherapy",      YES_NO[formData.receiving_immu0therapy]  ?? "—"],
  ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [],
    body: profileRows,
    columnStyles: {
      0: { fontStyle: "bold", textColor: [71, 85, 105],  cellWidth: 38 },
      1: { textColor: [15, 23, 42],                      cellWidth: 52 },
      2: { fontStyle: "bold", textColor: [71, 85, 105],  cellWidth: 38 },
      3: { textColor: [15, 23, 42],                      cellWidth: 47 },
    },
    styles: { fontSize: 9, cellPadding: 3, lineColor: [226, 232, 240], lineWidth: 0.3 },
    theme: "grid",
  });

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  y = checkPageBreak(doc, y, 60);

  // ── Feature Importance ────────────────────────────────────────────────────
  y = drawSectionHeader(doc, "KEY RISK FACTORS — FEATURE IMPORTANCE", margin, y, contentW, [99, 102, 241]);

  const sorted = Object.entries(mlResult.feature_importance).sort(([, a], [, b]) => b - a);
  const maxVal = sorted[0]?.[1] ?? 1;

  sorted.forEach(([key, val], i) => {
    const pctVal = parseFloat((val * 100).toFixed(1));
    const relPct = maxVal > 0 ? (val / maxVal) * 100 : 0;
    const label  = FEATURE_LABELS[key] ?? key;
    const bColor = BAR_COLORS[i % BAR_COLORS.length];

    // Feature label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(label, margin, y + 3.5);

    // Bar
    const barX = margin + 66;
    const barW = contentW - 84;
    drawProgressBar(doc, barX, y, barW, relPct, bColor);

    // Percentage
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...bColor);
    doc.text(`${pctVal}%`, margin + contentW, y + 3.5, { align: "right" });

    y += 9;
  });

  y += 6;
  y = checkPageBreak(doc, y, 50);

  // ── AI Recommendations ────────────────────────────────────────────────────
  y = drawSectionHeader(doc, "AI-GENERATED RECOMMENDATIONS", margin, y, contentW, riskColor);

  const recs = RECOMMENDATIONS[mlResult.risk_level] ?? [];
  recs.forEach((rec, i) => {
    y = checkPageBreak(doc, y, 12);

    // Bullet circle
    doc.setFillColor(...riskColor);
    doc.circle(margin + 3, y + 2.5, 1.8, "F");

    // Number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`${i + 1}`, margin + 3, y + 3.5, { align: "center" });

    // Rec text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text(rec, margin + 8, y + 3.5);

    y += 9;
  });

  y += 6;

  // ── Doctors Table ─────────────────────────────────────────────────────────
  if (doctors.length > 0) {
    y = checkPageBreak(doc, y, 40);
    y = drawSectionHeader(
      doc,
      `RECOMMENDED SPECIALISTS — ${(REGIONS[formData.region] ?? "").toUpperCase()}`,
      margin, y, contentW,
      [16, 185, 129],
    );

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Doctor", "Specialty", "Hospital", "Phone", "Fee (৳)", "Rating"]],
      body: doctors.map((d) => [
        d.name,
        d.specialty,
        d.hospital,
        d.phone,
        d.consultation_fee.toLocaleString(),
        `${d.rating} / 5`,
      ]),
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        cellPadding: 4,
      },
      styles: { fontSize: 8, cellPadding: 3.5, lineColor: [226, 232, 240], lineWidth: 0.3 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 42 },
        1: { cellWidth: 36 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 18, halign: "right" },
        5: { cellWidth: 16, halign: "center" },
      },
      theme: "grid",
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // ── Footer (every page) ───────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const pageH = doc.internal.pageSize.getHeight();

    doc.setFillColor(15, 23, 42);
    doc.rect(0, pageH - 12, pageW, 12, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "Academic research tool only. Not a clinical diagnosis. Always consult a qualified medical professional.",
      margin,
      pageH - 4.5,
    );
    doc.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 4.5, { align: "right" });
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const filename = `covid19-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}