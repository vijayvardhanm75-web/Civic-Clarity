import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Search, Sparkles } from 'lucide-react';
import { GlossaryItem } from '../types';

interface GlossarySectionProps {
  glossary: GlossaryItem[];
  translatedGlossary?: GlossaryItem[];
  isTranslating: boolean;
}

export const GlossarySection: React.FC<GlossarySectionProps> = ({
  glossary,
  translatedGlossary,
  isTranslating,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // first open by default
  const [searchTerm, setSearchTerm] = useState('');

  const displayList = translatedGlossary && translatedGlossary.length > 0 ? translatedGlossary : glossary;

  if (!displayList || displayList.length === 0) {
    return null;
  }

  const filteredList = displayList.filter(
    (item) =>
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.explanation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Civic & Legal Glossary
            </h3>
            <p className="text-xs text-slate-500">
              Jargon from this document explained in plain citizen English
            </p>
          </div>
        </div>

        {displayList.length > 3 && (
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jargon..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        {filteredList.map((item, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              className={`rounded-xl border transition ${
                isExpanded ? 'border-teal-200 bg-teal-50/30' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleExpand(idx)}
                className="flex w-full items-center justify-between p-3.5 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-block rounded-md bg-teal-100/80 px-2.5 py-0.5 font-mono text-xs font-bold text-teal-900 border border-teal-200">
                    {item.term}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <span className="text-xs font-medium text-slate-500 hidden sm:inline">
                    {isExpanded ? 'Hide' : 'Explain'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-teal-700" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-teal-100/80 p-3.5 pt-2 text-sm leading-relaxed text-slate-700">
                  {isTranslating ? (
                    <span className="text-slate-400 italic">Translating glossary definition...</span>
                  ) : (
                    <p>{item.explanation}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
