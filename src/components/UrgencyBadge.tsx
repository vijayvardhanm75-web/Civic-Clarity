import React from 'react';
import { AlertTriangle, Clock, Info, ShieldAlert, CheckCircle } from 'lucide-react';
import { UrgencyInfo } from '../types';

interface UrgencyBadgeProps {
  urgency: UrgencyInfo;
  urgencyReasonDisplay?: string;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({
  urgency,
  urgencyReasonDisplay,
}) => {
  const reason = urgencyReasonDisplay || urgency.reason;

  if (urgency.level === 'RED') {
    return (
      <div
        id="urgency-badge-container"
        className="rounded-2xl border-2 border-rose-300 bg-rose-50/90 p-4 sm:p-5 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm ring-4 ring-rose-100">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔴</span>
                <span className="text-base sm:text-lg font-bold text-rose-950 tracking-tight">
                  Action Required Now
                </span>
                <span className="rounded-full bg-rose-200/80 px-2.5 py-0.5 text-xs font-semibold text-rose-900 border border-rose-300">
                  Urgent
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-rose-900/90 leading-normal">
                {reason}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (urgency.level === 'YELLOW') {
    return (
      <div
        id="urgency-badge-container"
        className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-4 sm:p-5 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm ring-4 ring-amber-100">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🟡</span>
                <span className="text-base sm:text-lg font-bold text-amber-950 tracking-tight">
                  Action Needed Soon
                </span>
                <span className="rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-semibold text-amber-900 border border-amber-300">
                  Upcoming Window
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-amber-900/90 leading-normal">
                {reason}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // GREEN / Informational
  return (
    <div
      id="urgency-badge-container"
      className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/90 p-4 sm:p-5 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🟢</span>
              <span className="text-base sm:text-lg font-bold text-emerald-950 tracking-tight">
                Informational Only
              </span>
              <span className="rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 border border-emerald-300">
                No Penalty
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-emerald-900/90 leading-normal">
              {reason}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
