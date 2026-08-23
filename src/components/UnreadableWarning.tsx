import React from 'react';
import { AlertTriangle, Camera, Upload, CheckCircle2, RefreshCw, Sparkles, Image as ImageIcon } from 'lucide-react';
import { UnreadableResult } from '../types';

interface UnreadableWarningProps {
  result: UnreadableResult;
  onRetryUpload: () => void;
  onSelectSample?: (sampleId: string) => void;
}

export const UnreadableWarning: React.FC<UnreadableWarningProps> = ({
  result,
  onRetryUpload,
  onSelectSample,
}) => {
  return (
    <div
      id="unreadable-warning-card"
      className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-5 sm:p-7 shadow-xs animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm ring-4 ring-amber-100">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-amber-200/80 px-2.5 py-0.5 text-xs font-bold text-amber-900 border border-amber-300">
              Legibility Notice
            </span>
            {result.fileName && (
              <span className="text-xs font-mono text-amber-800/80">
                {result.fileName}
              </span>
            )}
          </div>

          <h3 className="mt-2 text-lg sm:text-xl font-bold text-amber-950 tracking-tight">
            This image isn't clear enough to read properly
          </h3>

          <p className="mt-2 text-sm sm:text-base text-amber-900 font-medium leading-relaxed">
            {result.unreadableReason ||
              "This image isn't clear enough to read properly. Please upload a clearer photo — try better lighting, holding the camera steady, and making sure the full document is in frame."}
          </p>

          {/* Quality Guidance Checklist */}
          <div className="mt-4 rounded-xl border border-amber-200 bg-white/80 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5 text-amber-700" />
              <span>Tips for a Readable Photo</span>
            </h4>
            <ul className="mt-2.5 space-y-2 text-xs sm:text-sm text-slate-700">
              {(result.qualityGuidance || [
                "Ensure good lighting and avoid dark shadows or glossy glare",
                "Hold your camera steady or place the document flat on a table",
                "Capture the entire page so all four edges and headers are visible",
                "Make sure the text is sharp and in focus before uploading",
              ]).map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              id="btn-retry-upload"
              onClick={onRetryUpload}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-amber-800 transition active:scale-98 cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Clearer Photo or PDF</span>
            </button>

            {onSelectSample && (
              <button
                type="button"
                id="btn-try-clear-sample"
                onClick={() => onSelectSample('scanned-photo-notice')}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-amber-900 hover:bg-amber-100/60 transition cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-amber-700" />
                <span>Try Clear Scanned Sample</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
