import React from 'react';
import { Shield, Sparkles, History, FileText, Info } from 'lucide-react';

interface NavbarProps {
  onOpenHistory: () => void;
  historyCount: number;
  onOpenSamples: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHistory,
  historyCount,
  onOpenSamples,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm ring-4 ring-blue-50">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900 font-serif">
                CivicClarity
              </span>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                AI Civic Translator
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Translating dense government notices & legal circulars into plain citizen language
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-sample-docs"
            type="button"
            onClick={onOpenSamples}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200"
          >
            <FileText className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden xs:inline">Sample</span> Notices
          </button>

          <button
            id="btn-open-history"
            type="button"
            onClick={onOpenHistory}
            className="relative inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <History className="h-3.5 w-3.5 text-slate-600" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
