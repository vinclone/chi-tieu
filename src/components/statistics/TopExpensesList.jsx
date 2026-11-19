import React from 'react';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';

export default function TopExpensesList({ expenses = [], members = [] }) {
  const memberMap = new Map(members.map(m => [m.id, m]));

  const top5 = [...expenses]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5);

  if (top5.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-xs italic">
        Chưa có khoản chi nào.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {top5.map((exp, idx) => {
        const payer = memberMap.get(exp.payerId);

        return (
          <div key={exp.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                idx === 0 ? 'bg-amber-100 text-amber-700' :
                idx === 1 ? 'bg-slate-200 text-slate-700' :
                idx === 2 ? 'bg-orange-100 text-orange-700' :
                'bg-slate-100 text-slate-500'
              }`}>
                {idx + 1}
              </span>
              <div className="min-w-0">
                <span className="font-bold text-slate-800 truncate block">{exp.title}</span>
                <span className="text-[11px] text-slate-400">
                  {payer?.nickname || payer?.name} trả • {formatDate(exp.date)}
                </span>
              </div>
            </div>

            <span className="font-extrabold text-slate-900 shrink-0">
              {formatCurrency(exp.amount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
