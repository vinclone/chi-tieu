import React from 'react';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { calculateMemberBalance, calculateMemberPaidTotal, calculateMemberShareTotal } from '../../utils/calculations';
import { Edit2, Trash2, Eye } from 'lucide-react';

export default function MemberList({
  members = [],
  expenses = [],
  settlements = [],
  onEdit,
  onRemove,
  onSelectMember
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map(member => {
        const paid = calculateMemberPaidTotal(member.id, expenses);
        const share = calculateMemberShareTotal(member.id, expenses);
        const balance = calculateMemberBalance(member.id, expenses, settlements);

        return (
          <div
            key={member.id}
            onClick={() => onSelectMember(member)}
            className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-4 shadow-xs transition-all hover:shadow-md cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Header: Avatar, Name, Status */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-base font-bold shadow-sm shrink-0"
                    style={{ backgroundColor: member.avatarColor || '#10B981' }}
                  >
                    {(member.nickname || member.name)[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-emerald-700 transition-colors">
                        {member.name}
                      </h4>
                      {member.status === 'removed' && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                          Đã rời
                        </span>
                      )}
                    </div>
                    {member.nickname && member.nickname !== member.name && (
                      <p className="text-xs text-slate-400 font-medium truncate">"{member.nickname}"</p>
                    )}
                  </div>
                </div>

                {/* Balance badge */}
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block font-semibold">SỐ DƯ</span>
                  <CurrencyDisplay amount={balance} isBalance={true} size="md" />
                </div>
              </div>

              {member.note && (
                <p className="text-xs text-slate-500 mb-3 bg-slate-50 px-2.5 py-1.5 rounded-lg line-clamp-1">
                  {member.note}
                </p>
              )}

              {/* Financial Summary Breakdown */}
              <div className="grid grid-cols-2 gap-2 py-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Đã chi trả:</span>
                  <span className="font-bold text-slate-800">{paid.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phải chịu:</span>
                  <span className="font-bold text-slate-800">{share.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-xs" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onSelectMember(member)}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700 font-semibold"
              >
                <Eye className="w-3.5 h-3.5" /> Xem chi tiết
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onEdit(member)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(member)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Xóa thành viên"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
