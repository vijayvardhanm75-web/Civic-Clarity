import React, { useState } from 'react';
import { Copy, Check, Printer, RotateCcw, Share2 } from 'lucide-react';
import { SimplifiedResult, SupportedLanguage } from '../types';

interface ActionBarProps {
  result: SimplifiedResult;
  activeLanguage: SupportedLanguage;
  onReset: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  result,
  activeLanguage,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const translation = result.translations?.[activeLanguage];
    const summary = translation?.summary || result.summary;
    const impact = translation?.whatThisMeansForYou || result.whatThisMeansForYou;
    const urgency = translation?.urgencyReason || result.urgency.reason;
    const actions = (translation?.actionItems || result.actionItems.map((a) => a.text))
      .map((t, idx) => `${idx + 1}. ${t}`)
      .join('\n');
    const deadlines = result.deadlines.map((d) => `• ${d.title}: ${d.date}`).join('\n');

    const fullReport = `CIVICCLARITY SUMMARY
Title: ${result.title}
Urgency: ${result.urgency.label} (${result.urgency.level})
Reason: ${urgency}

SUMMARY:
${summary}

WHAT THIS MEANS FOR YOU:
${impact}

ACTION ITEMS:
${actions || 'No mandatory action required.'}

DEADLINES:
${deadlines || 'No specific calendar deadlines.'}

---
Simplified with CivicClarity`;

    navigator.clipboard.writeText(fullReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500">Citizen Actions:</span>
        <button
          id="btn-copy-report"
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
          <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
        </button>

        <button
          id="btn-print-report"
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
        >
          <Printer className="h-3.5 w-3.5 text-slate-500" />
          <span>Print / PDF</span>
        </button>
      </div>

      <div>
        <button
          id="btn-simplify-another"
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-300 transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Simplify Another Notice</span>
        </button>
      </div>
    </div>
  );
};
