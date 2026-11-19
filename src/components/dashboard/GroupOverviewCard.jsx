import React from 'react';
import { formatDateRange } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';
import { MapPin, Calendar, Target, AlertTriangle } from 'lucide-react';

export default function GroupOverviewCard({ group, totals }) {
  if (!group) return null;

  const hasBudget = totals.budget > 0;
  const isOverBudget = hasBudget && totals.totalExpenses > totals.budget;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
      {/* Subtle decorative glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
              Chuyến đi đang chọn
            </span>
            {group.isArchived && (
              <span className="text-[11px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full">
                Đã lưu trữ
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            {group.name}
          </h2>

          <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
            {group.location && (
              <span className="inline-flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {group.location}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              {formatDateRange(group.startDate, group.endDate)}
            </span>
            <span>• {totals.memberCount} người tham gia</span>
          </div>

          {group.description && (
            <p className="text-xs text-slate-400 mt-3 max-w-xl line-clamp-2">
              {group.description}
            </p>
          )}
        </div>

        {/* Budget Status Section */}
        {hasBudget ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[260px] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" /> Ngân sách dự kiến:
              </span>
              <span className="text-white font-extrabold">{formatCurrency(totals.budget)}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  isOverBudget ? 'bg-rose-500' : totals.budgetUtilization > 80 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, totals.budgetUtilization)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-semibold">
              <span className={isOverBudget ? 'text-rose-300 flex items-center gap-1' : 'text-slate-300'}>
                {isOverBudget ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Vượt: {formatCurrency(Math.abs(totals.remainingBudget))}
                  </>
                ) : (
                  `Còn lại: ${formatCurrency(totals.remainingBudget)}`
                )}
              </span>
              <span className={isOverBudget ? 'text-rose-400 font-extrabold' : 'text-emerald-400 font-extrabold'}>
                {totals.budgetUtilization}%
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">
            Chưa thiết lập ngân sách dự kiến cho chuyến đi này.
          </div>
        )}
      </div>
    </div>
  );
}
