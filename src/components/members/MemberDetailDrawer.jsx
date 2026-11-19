import React from 'react';
import Modal from '../common/Modal';
import CurrencyDisplay from '../common/CurrencyDisplay';
import { formatDate } from '../../utils/date';
import { calculateMemberBalance, calculateMemberPaidTotal, calculateMemberShareTotal } from '../../utils/calculations';
import {
  Wallet,
  Receipt,
  ArrowRightLeft
} from 'lucide-react';

export default function MemberDetailDrawer({
  isOpen,
  onClose,
  member,
  expenses = [],
  settlements = [],
  allMembers = []
}) {
  if (!member) return null;

  const memberMap = new Map(allMembers.map(m => [m.id, m]));

  const paid = calculateMemberPaidTotal(member.id, expenses);
  const share = calculateMemberShareTotal(member.id, expenses);
  const balance = calculateMemberBalance(member.id, expenses, settlements);

  // Expenses paid by this member
  const expensesPaid = expenses.filter(e => e.payerId === member.id);

  // Expenses where this member was a participant
  const expensesInvolved = expenses.filter(e => e.participantIds?.includes(member.id));

  // Settlements involving this member
  const memberSettlements = settlements.filter(s =>
    s.fromMemberId === member.id || s.toMemberId === member.id
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết tài chính thành viên" maxWidth="max-w-2xl">
      <div className="space-y-5">
        {/* Member Header Card */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/90">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-sm shrink-0"
            style={{ backgroundColor: member.avatarColor || '#10B981' }}
          >
            {(member.nickname || member.name)[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 truncate">{member.name}</h3>
              {member.nickname && member.nickname !== member.name && (
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                  {member.nickname}
                </span>
              )}
              {member.status === 'removed' && (
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  Đã rời nhóm
                </span>
              )}
            </div>
            {member.note && <p className="text-xs text-slate-500 mt-0.5">{member.note}</p>}
          </div>
        </div>

        {/* Financial KPI summary */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">ĐÃ CHI TRẢ</span>
            <CurrencyDisplay amount={paid} size="md" />
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">PHẢI CHỊU</span>
            <CurrencyDisplay amount={share} size="md" />
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">SỐ DƯ RÒNG</span>
            <CurrencyDisplay amount={balance} isBalance={true} size="md" />
          </div>
        </div>

        {/* Expenses Paid by this member */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-emerald-600" />
            Các khoản đã đứng ra thanh toán ({expensesPaid.length})
          </h4>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {expensesPaid.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">Chưa đứng ra thanh toán khoản nào.</p>
            ) : (
              expensesPaid.map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{exp.title}</span>
                    <span className="text-[10px] text-slate-400 block">{formatDate(exp.date)}</span>
                  </div>
                  <CurrencyDisplay amount={exp.amount} size="sm" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expenses Involved */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-blue-600" />
            Các khoản tham gia chia tiền ({expensesInvolved.length})
          </h4>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {expensesInvolved.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">Không tham gia khoản chi nào.</p>
            ) : (
              expensesInvolved.map(exp => {
                const mySplit = exp.splits?.find(s => s.memberId === member.id);
                return (
                  <div key={exp.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">{exp.title}</span>
                      <span className="text-[10px] text-slate-400 block">{formatDate(exp.date)}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800 block">
                        {mySplit ? mySplit.amount.toLocaleString('vi-VN') + ' ₫' : '—'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Settlement History */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-purple-600" />
            Lịch sử thanh toán quyết toán ({memberSettlements.length})
          </h4>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {memberSettlements.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">Chưa có giao dịch quyết toán nào.</p>
            ) : (
              memberSettlements.map(s => {
                const isSender = s.fromMemberId === member.id;
                const otherMember = isSender ? memberMap.get(s.toMemberId) : memberMap.get(s.fromMemberId);

                return (
                  <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                    <div>
                      <span className="font-semibold text-slate-800">
                        {isSender ? `Đã chuyển cho ${otherMember?.nickname || otherMember?.name}` : `Đã nhận từ ${otherMember?.nickname || otherMember?.name}`}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{formatDate(s.date)}</span>
                    </div>
                    <span className={`font-bold ${isSender ? 'text-blue-600' : 'text-emerald-600'}`}>
                      {isSender ? '-' : '+'}{(s.paidAmount || s.amount).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
