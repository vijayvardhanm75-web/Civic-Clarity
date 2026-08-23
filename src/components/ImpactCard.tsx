import React from 'react';
import { UserCheck, HelpCircle } from 'lucide-react';

interface ImpactCardProps {
  whatThisMeansForYou: string;
  isTranslating: boolean;
}

export const ImpactCard: React.FC<ImpactCardProps> = ({
  whatThisMeansForYou,
  isTranslating,
}) => {
  return (
    <div
      id="what-this-means-for-you-card"
      className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 sm:p-6 shadow-xs"
    >
      <div className="flex items-start gap-3.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-xs">
          <UserCheck className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-sky-950">
            What This Means For You
          </h3>
          <p className="mt-1 text-base text-slate-800 leading-relaxed">
            {isTranslating ? (
              <span className="text-slate-400 italic">Updating translation...</span>
            ) : (
              whatThisMeansForYou
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
