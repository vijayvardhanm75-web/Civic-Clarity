import React from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { DeadlineItem } from '../types';

interface DeadlinesSectionProps {
  deadlines: DeadlineItem[];
  hasNoDeadlines: boolean;
}

export const DeadlinesSection: React.FC<DeadlinesSectionProps> = ({
  deadlines,
  hasNoDeadlines,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
          <Calendar className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Key Deadlines
          </h3>
          <p className="text-xs text-slate-500">
            Chronologically organized with earliest dates first
          </p>
        </div>
      </div>

      {hasNoDeadlines || deadlines.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-sm">
            No strict calendar deadlines or expiry cutoffs found in this document.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {deadlines.map((dl, idx) => {
            const isUrgent = dl.urgency === 'red';
            const isMedium = dl.urgency === 'yellow';

            return (
              <div
                key={dl.id || idx}
                className={`flex flex-col justify-between rounded-xl border p-3.5 transition ${
                  isUrgent
                    ? 'border-rose-300 bg-rose-50/70'
                    : isMedium
                    ? 'border-amber-300 bg-amber-50/70'
                    : 'border-slate-200 bg-slate-50/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {dl.title}
                  </span>
                  {isUrgent ? (
                    <span className="shrink-0 rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                      Urgent
                    </span>
                  ) : isMedium ? (
                    <span className="shrink-0 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
                      Upcoming
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                      Timeline
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800">
                    <Calendar className="h-3.5 w-3.5 text-slate-600" />
                    <span>{dl.date}</span>
                  </div>
                  {dl.daysRemainingNote && (
                    <span className="text-[11px] font-medium text-slate-600 bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                      {dl.daysRemainingNote}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
