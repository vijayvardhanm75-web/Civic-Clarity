import React, { useState } from 'react';
import { CheckSquare, Square, CheckCircle2, ListChecks, Info } from 'lucide-react';
import { ActionItem } from '../types';

interface ActionChecklistProps {
  actionItems: ActionItem[];
  translatedActionTexts?: string[];
  hasNoActions: boolean;
  isTranslating: boolean;
}

export const ActionChecklist: React.FC<ActionChecklistProps> = ({
  actionItems,
  translatedActionTexts,
  hasNoActions,
  isTranslating,
}) => {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const total = actionItems.length;
  const completed = actionItems.filter((item) => checkedIds[item.id]).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
            <ListChecks className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Action Items Checklist
            </h3>
            <p className="text-xs text-slate-500">
              Clear, specific steps to comply or protect your rights
            </p>
          </div>
        </div>

        {total > 0 && !hasNoActions && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${(completed / total) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-600">
              {completed}/{total} Done
            </span>
          </div>
        )}
      </div>

      {hasNoActions || total === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-900">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm font-medium">
            No mandatory action required from your side. This document is purely for your information and records.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {actionItems.map((item, index) => {
            const isChecked = Boolean(checkedIds[item.id]);
            const displayText =
              translatedActionTexts && translatedActionTexts[index]
                ? translatedActionTexts[index]
                : item.text;

            return (
              <li
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`group flex items-start gap-3 rounded-xl border p-3.5 transition cursor-pointer select-none ${
                  isChecked
                    ? 'border-indigo-200 bg-indigo-50/40 text-slate-500'
                    : 'border-slate-200 bg-slate-50/50 text-slate-800 hover:border-indigo-300 hover:bg-slate-50'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="flex h-5 w-5 items-center justify-center rounded-md border-2 border-slate-300 bg-white group-hover:border-indigo-400">
                      <span className="text-[10px] font-bold text-slate-400">{index + 1}</span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <span
                    className={`text-sm leading-relaxed ${
                      isChecked ? 'line-through text-slate-500 font-normal' : 'font-medium text-slate-800'
                    }`}
                  >
                    {isTranslating ? (
                      <span className="text-slate-400 italic">Translating...</span>
                    ) : (
                      displayText
                    )}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
