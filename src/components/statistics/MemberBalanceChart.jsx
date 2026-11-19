import React from 'react';
import { formatCurrency, formatCompactCurrency } from '../../utils/currency';

export default function MemberBalanceChart({ memberStats = [] }) {
  const maxVal = Math.max(
    ...memberStats.map(s => Math.max(s.paid, s.share)),
    1
  );

  if (memberStats.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-slate-400 text-xs italic">
        Chưa có thành viên nào.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-semibold justify-end">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-emerald-500" />
          <span className="text-slate-600">Đã chi (Thanh toán)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-blue-500" />
          <span className="text-slate-600">Phải chịu (Tham gia)</span>
        </div>
      </div>

      <div className="space-y-3">
        {memberStats.map(s => {
          const paidPercent = Math.min(100, Math.round((s.paid / maxVal) * 100));
          const sharePercent = Math.min(100, Math.round((s.share / maxVal) * 100));

          return (
            <div key={s.member.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{s.member.nickname || s.member.name}</span>
                <div className="flex items-center gap-3 font-semibold">
                  <span className="text-emerald-700">Chi: {formatCompactCurrency(s.paid)}</span>
                  <span className="text-blue-700">Chịu: {formatCompactCurrency(s.share)}</span>
                </div>
              </div>

              {/* Dual Progress Bars */}
              <div className="space-y-1">
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${paidPercent}%` }}
                    title={`Đã chi: ${formatCurrency(s.paid)}`}
                  />
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${sharePercent}%` }}
                    title={`Phải chịu: ${formatCurrency(s.share)}`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
