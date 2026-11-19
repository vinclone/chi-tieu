import React, { useState } from 'react';
import { formatDate } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';

export default function DailySpendingBarChart({ expenses = [] }) {
  const [hoveredDate, setHoveredDate] = useState(null);

  // Group by date
  const dailyMap = {};
  expenses.forEach(exp => {
    const d = exp.date;
    if (!dailyMap[d]) dailyMap[d] = { date: d, amount: 0, count: 0 };
    dailyMap[d].amount += Number(exp.amount) || 0;
    dailyMap[d].count += 1;
  });

  const dailyList = Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  const maxAmount = Math.max(...dailyList.map(d => d.amount), 1);

  if (dailyList.length === 0) {
    return (
      <div className="h-56 flex items-center justify-center text-slate-400 text-xs italic">
        Chưa có dữ liệu chi tiêu theo ngày.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-48 flex items-end gap-3 pt-6 pb-2 border-b border-slate-200 overflow-x-auto px-2">
        {dailyList.map(item => {
          const heightPercent = Math.max(10, Math.round((item.amount / maxAmount) * 100));
          const isHovered = hoveredDate === item.date;

          return (
            <div
              key={item.date}
              className="flex-1 flex flex-col items-center gap-2 min-w-[50px] group relative cursor-pointer"
              onMouseEnter={() => setHoveredDate(item.date)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-12 z-20 bg-slate-900 text-white text-[11px] font-bold py-1 px-2 rounded-lg shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95">
                  {formatCurrency(item.amount)} ({item.count} khoản)
                </div>
              )}

              {/* Bar */}
              <div
                className={`w-full rounded-t-xl transition-all duration-300 ${
                  isHovered ? 'bg-emerald-500 shadow-md' : 'bg-emerald-600/80 group-hover:bg-emerald-600'
                }`}
                style={{ height: `${heightPercent}%` }}
              />

              {/* Date Label */}
              <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                {formatDate(item.date).slice(0, 5)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Tổng số ngày có chi tiêu: {dailyList.length} ngày</span>
        <span>Cao nhất: {formatCurrency(maxAmount)}</span>
      </div>
    </div>
  );
}
