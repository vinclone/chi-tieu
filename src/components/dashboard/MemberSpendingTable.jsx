import React from 'react';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { formatCurrency } from '../../utils/currency';

export default function MemberSpendingTable({ memberStats = [] }) {
  if (memberStats.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-xs italic">
        Chưa có thành viên nào trong chuyến đi này.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
            <th className="py-3 px-3">Thành viên</th>
            <th className="py-3 px-3 text-right">Đã trả (Paid)</th>
            <th className="py-3 px-3 text-right">Phải chịu (Share)</th>
            <th className="py-3 px-3 text-right">Số dư (Balance)</th>
            <th className="py-3 px-3 text-center">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium">
          {memberStats.map(s => {
            const isPositive = s.balance > 0;
            const isNegative = s.balance < 0;

            return (
              <tr key={s.member.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-2xs"
                      style={{ backgroundColor: s.member.avatarColor || '#10B981' }}
                    >
                      {(s.member.nickname || s.member.name)[0]}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {s.member.nickname || s.member.name}
                      </span>
                      {s.member.nickname && s.member.nickname !== s.member.name && (
                        <span className="text-[10px] text-slate-400 block">{s.member.name}</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-semibold text-slate-800">
                  {formatCurrency(s.paid)}
                </td>
                <td className="py-3 px-3 text-right font-semibold text-slate-600">
                  {formatCurrency(s.share)}
                </td>
                <td className="py-3 px-3 text-right font-extrabold">
                  <CurrencyDisplay amount={s.balance} isBalance={true} size="sm" />
                </td>
                <td className="py-3 px-3 text-center">
                  {isPositive && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Được nhận lại
                    </span>
                  )}
                  {isNegative && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                      Cần chuyển trả
                    </span>
                  )}
                  {!isPositive && !isNegative && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                      Đã cân bằng
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
