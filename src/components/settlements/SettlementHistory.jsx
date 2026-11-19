import React, { useState } from 'react';
import ConfirmDialog from '../common/ConfirmDialog';
import { formatDate } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';
import { RotateCcw, CreditCard, Banknote, Smartphone, HelpCircle, Edit2 } from 'lucide-react';

const METHOD_LABELS = {
  bank_transfer: { label: 'Chuyển khoản', icon: CreditCard },
  cash: { label: 'Tiền mặt', icon: Banknote },
  e_wallet: { label: 'Ví điện tử', icon: Smartphone },
  other: { label: 'Khác', icon: HelpCircle },
};

export default function SettlementHistory({
  settlements = [],
  members = [],
  onEdit,
  onDelete
}) {
  const memberMap = new Map(members.map(m => [m.id, m]));
  const [settlementToDelete, setSettlementToDelete] = useState(null);

  if (settlements.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 text-center text-slate-400 text-xs">
        Chưa có giao dịch quyết toán nào được ghi nhận.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-xs">
      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
        Lịch sử thanh toán đã ghi nhận ({settlements.length})
      </h3>

      <div className="divide-y divide-slate-100">
        {settlements.map(s => {
          const sender = memberMap.get(s.fromMemberId);
          const receiver = memberMap.get(s.toMemberId);
          const methodInfo = METHOD_LABELS[s.paymentMethod] || METHOD_LABELS.other;
          const MethodIcon = methodInfo.icon;

          return (
            <div key={s.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MethodIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800">
                    <span className="font-bold text-slate-900">{sender?.nickname || sender?.name}</span> đã trả cho{' '}
                    <span className="font-bold text-slate-900">{receiver?.nickname || receiver?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                    <span>{formatDate(s.date)}</span>
                    <span>•</span>
                    <span>{methodInfo.label}</span>
                    {s.note && (
                      <>
                        <span>•</span>
                        <span className="italic truncate max-w-[150px]">"{s.note}"</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="font-extrabold text-emerald-700 text-sm">
                  {formatCurrency(s.paidAmount || s.amount)}
                </span>
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(s)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Chỉnh sửa giao dịch này"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSettlementToDelete(s)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Hủy / Hoàn tác thanh toán này"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={!!settlementToDelete}
        onClose={() => setSettlementToDelete(null)}
        onConfirm={() => {
          if (settlementToDelete) {
            onDelete(settlementToDelete.id);
            setSettlementToDelete(null);
          }
        }}
        title="Xác nhận hoàn tác thanh toán"
        message="Bạn có chắc chắn muốn hủy giao dịch quyết toán này? Số dư và các khoản nợ của hai thành viên sẽ được tính toán lại về trạng thái trước đó."
        confirmText="Hoàn tác"
      />
    </div>
  );
}
