import React from 'react';
import { formatCurrency } from '../../utils/currency';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function SplitPreviewTable({
  members,
  splits,
  totalAmount,
  splitType,
  difference,
  isValid
}) {
  const memberMap = new Map(members.map(m => [m.id, m]));
  const sumSplits = splits.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Xem trước chia tiền ({splits.length} người)
        </span>
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {isValid ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Khớp 100%
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5" /> Lệch: {Math.abs(difference).toLocaleString('vi-VN')} {splitType === 'percentage' ? '%' : '₫'}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200/90 divide-y divide-slate-100 max-h-48 overflow-y-auto">
        {splits.map(s => {
          const m = memberMap.get(s.memberId);
          return (
            <div key={s.memberId} className="flex items-center justify-between px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: m?.avatarColor || '#10B981' }}
                >
                  {(m?.nickname || m?.name || '?')[0].toUpperCase()}
                </div>
                <span className="font-medium text-slate-800">{m?.nickname || m?.name || s.memberId}</span>
                {s.meta?.percent !== undefined && (
                  <span className="text-slate-400">({s.meta.percent}%)</span>
                )}
                {s.meta?.weight !== undefined && (
                  <span className="text-slate-400">({s.meta.weight} phần)</span>
                )}
              </div>
              <span className="font-bold text-slate-800">{formatCurrency(s.amount)}</span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs font-bold">
        <span className="text-slate-600">Tổng các phần:</span>
        <span className={isValid ? 'text-emerald-700' : 'text-rose-600'}>
          {formatCurrency(sumSplits)} / {formatCurrency(totalAmount)}
        </span>
      </div>
    </div>
  );
}
