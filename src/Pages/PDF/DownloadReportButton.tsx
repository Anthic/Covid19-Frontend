// ─────────────────────────────────────────────────────────────────────────────
// pdf-report/DownloadReportButton.tsx
//
// Drop this button anywhere in your result step.
//
// Usage in PredictionPage result section:
//   import DownloadReportButton from "../pdf-report/DownloadReportButton";
//
//   <DownloadReportButton
//     mlResult={mlResult}
//     formData={form}
//     doctors={doctorData?.doctors ?? []}
//   />
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { generatePredictionPDF, type Doctor, type MLResult, type PredictInput } from "./generatePredictionPDF";

interface DownloadReportButtonProps {
  mlResult: MLResult;
  formData: PredictInput;
  doctors: Doctor[];
  patientName?: string;
}

export default function DownloadReportButton({
  mlResult,
  formData,
  doctors,
  patientName,
}: DownloadReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      // slight delay so spinner shows before PDF generation blocks
      await new Promise((r) => setTimeout(r, 100));
      generatePredictionPDF({ mlResult, formData, doctors, patientName });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <FileDown size={15} />
          Download Report (PDF)
        </>
      )}
    </button>
  );
}