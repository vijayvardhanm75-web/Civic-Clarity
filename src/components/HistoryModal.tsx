import React from 'react';
import { X, History, Trash2, ArrowRight, Clock, FileText } from 'lucide-react';
import { SimplifiedResult } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SimplifiedResult[];
  onSelectHistory: (item: SimplifiedResult) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Session History (Last 3 Documents)
              </h3>
              <p className="text-xs text-slate-500">
                Quickly restore your recently simplified legal notices
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock className="mx-auto h-8 w-8 text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No simplified documents in this session yet.</p>
            <p className="text-xs text-slate-400 mt-1">Paste a notice and click Simplify to generate a breakdown.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {history.slice(0, 3).map((item) => {
              const isRed = item.urgency.level === 'RED';
              const isYellow = item.urgency.level === 'YELLOW';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectHistory(item);
                    onClose();
                  }}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{isRed ? '🔴' : isYellow ? '🟡' : '🟢'}</span>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{item.actionItems.length} action items</span>
                      <span>•</span>
                      <span>{item.deadlines.length} deadlines</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-blue-700 group-hover:translate-x-0.5 transition"
                  >
                    <span>View Analysis</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear History
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
