import React from 'react';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function SuggestedTransfers({
  transfers = [],
  members = [],
  onRecordTransfer
}) {
  const memberMap = new Map(members.map(m => [m.id, m]));

  if (transfers.length === 0) {
    return (
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-emerald-900 text-base mb-1">
          Tuyệt vời! Nhóm đã quyết toán cân bằng 100%
        </h3>
        <p className="text-xs text-emerald-700 max-w-md mx-auto">
          Hiện không có khoản nợ nào chưa thanh toán. Mọi người đều đã hoàn thành trách nhiệm tài chính của mình!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Gợi ý chuyển tiền tối ưu ({transfers.length} giao dịch)
        </h3>
        <span className="text-xs text-slate-400">
          Thuật toán tối thiểu hóa số lần chuyển khoản
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {transfers.map(t => {
          const sender = memberMap.get(t.fromMemberId);
          const receiver = memberMap.get(t.toMemberId);

          return (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between gap-3 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between gap-3">
                {/* Sender */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: sender?.avatarColor || '#EF4444' }}
                  >
                    {(sender?.nickname || sender?.name || '?')[0]}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 block font-medium">Người trả</span>
                    <span className="font-bold text-slate-800 text-sm truncate block">
                      {sender?.nickname || sender?.name}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center justify-center px-2">
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                </div>

                {/* Receiver */}
                <div className="flex items-center gap-2.5 min-w-0 text-right">
                  <div className="min-w-0">
                    <span className="text-[11px] text-slate-400 block font-medium">Người nhận</span>
                    <span className="font-bold text-slate-800 text-sm truncate block">
                      {receiver?.nickname || receiver?.name}
                    </span>
                  </div>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: receiver?.avatarColor || '#10B981' }}
                  >
                    {(receiver?.nickname || receiver?.name || '?')[0]}
                  </div>
                </div>
              </div>

              {/* Amount & Action */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Cần chuyển:</span>
                  <CurrencyDisplay amount={t.amount} size="lg" />
                </div>

                <button
                  type="button"
                  onClick={() => onRecordTransfer(t)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
                >
                  Đánh dấu đã trả
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
