import React from 'react';
import { X, FileText, ArrowRight, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocs';

interface SampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sampleId: string) => void;
}

export const SampleModal: React.FC<SampleModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Official Sample Notices
              </h3>
              <p className="text-xs text-slate-500">
                Select a real-world government document or scanned photo to test AI simplification instantly
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {SAMPLE_DOCUMENTS.map((doc) => {
            const isRed = doc.urgencyHint === 'RED';
            const isYellow = doc.urgencyHint === 'YELLOW';
            const isGreen = doc.urgencyHint === 'GREEN';
            const isUnreadable = doc.urgencyHint === 'UNREADABLE';

            return (
              <div
                key={doc.id}
                onClick={() => {
                  onSelect(doc.id);
                  onClose();
                }}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">
                      {isRed ? '🔴' : isYellow ? '🟡' : isGreen ? '🟢' : '⚠️'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 flex items-center gap-1.5">
                      <span>{doc.title}</span>
                      {doc.type === 'image' && (
                        <span className="rounded-md bg-purple-100 px-1.5 py-0.2 text-[10px] font-bold text-purple-800">
                          IMAGE
                        </span>
                      )}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {doc.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                        isRed
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : isYellow
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : isGreen
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}
                    >
                      {doc.badgeNote}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {doc.category}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-blue-700 group-hover:translate-x-0.5 transition"
                >
                  <span>Load Sample</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
