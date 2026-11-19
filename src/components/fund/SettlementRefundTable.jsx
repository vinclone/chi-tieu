import React from 'react';
import { 
  Coins, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Copy 
} from 'lucide-react';
import { formatCurrency, parseCurrencyInput } from '../../utils/currency.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function SettlementRefundTable({
  refunds = [],
  allocationType = 'equal',
  onAllocationTypeChange,
  customAllocations = {},
  onCustomAllocationChange,
  onUpdateRefundStatus,
  onUpdateMember
}) {
  const { showToast } = useToast();

  const totalPaid = refunds.reduce((sum, r) => sum + r.paidAmount, 0);
  const totalCost = refunds.reduce((sum, r) => sum + r.allocatedCost, 0);
  const totalRefunds = refunds.reduce((sum, r) => sum + r.refundAmount, 0);
  const totalDeficits = refunds.reduce((sum, r) => sum + r.deficitAmount, 0);

  const handleCopyBank = (member) => {
    if (!member.bankAccount) {
      showToast('Thành viên chưa cung cấp thông tin tài khoản ngân hàng', 'info');
      return;
    }
    const text = `${member.memberName} - ${member.bankName || ''} - STK: ${member.bankAccount}`;
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép thông tin tài khoản của ${member.memberName}!`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header bar */}
      <div className="p-4 border-b border-slate-200 bg-teal-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-teal-700 text-white rounded-lg">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Quyết Toán Chi Phí & Hoàn Tiền Thừa
            </h2>
            <p className="text-xs text-slate-500">
              Số tiền hoàn trả = Tiền đã đóng - Chi phí thực tế mỗi người
            </p>
          </div>
        </div>

        {/* Allocation Mode Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">Cách phân bổ:</span>
          <div className="inline-flex p-0.5 bg-slate-200/80 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => onAllocationTypeChange('equal')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                allocationType === 'equal'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chia đều cho đoàn
            </button>
            <button
              type="button"
              onClick={() => onAllocationTypeChange('custom')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                allocationType === 'custom'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tùy chỉnh riêng
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW: Full Spreadsheet Table (hidden md:block) */}
      <div className="hidden md:block overflow-x-auto flex-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
              <th className="py-2 px-2 w-9 text-center">STT</th>
              <th className="py-2 px-2 min-w-[115px]">Thành viên</th>
              <th className="py-2 px-2 min-w-[85px] text-right">Đã nộp</th>
              <th className="py-2 px-2 min-w-[95px] text-right">Chi phí TT</th>
              <th className="py-2 px-2 min-w-[95px] text-right">Hoàn trả (Dư)</th>
              <th className="py-2 px-2 min-w-[85px] text-right">Đóng thêm</th>
              <th className="py-2 px-2 min-w-[105px]">Trạng thái</th>
              <th className="py-2 px-2 min-w-[125px]">Số tài khoản</th>
              <th className="py-2 px-3 min-w-[150px]">Ghi chú (Note)</th>
              <th className="py-2 px-2 w-24 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {refunds.length === 0 && (
              <tr>
                <td colSpan="10" className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-xs font-semibold text-slate-600">Chưa có dữ liệu quyết toán</span>
                    <span className="text-[11px] text-slate-400">Hãy thêm thành viên và khoản chi để tự động tính tiền hoàn trả</span>
                  </div>
                </td>
              </tr>
            )}
            {refunds.map((r, index) => {
              const isSurplus = r.netBalance > 0;
              const isDeficit = r.netBalance < 0;
              const isCompleted = r.refundStatus === 'completed' || r.refundStatus === 'refunded';

              return (
                <tr key={r.memberId} className="hover:bg-teal-50/20 transition-colors">
                  <td className="py-2 px-3 text-center text-slate-500 font-mono">
                    {index + 1}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-900">
                    {r.memberName}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-700">
                    {formatCurrency(r.paidAmount)}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-medium">
                    {allocationType === 'custom' ? (
                      <input
                        type="text"
                        value={customAllocations[r.memberId]?.toLocaleString('vi-VN') || ''}
                        onChange={(e) => onCustomAllocationChange(r.memberId, parseCurrencyInput(e.target.value))}
                        className="w-24 text-right bg-white border border-slate-300 focus:border-teal-500 rounded px-1.5 py-0.5 text-xs outline-none"
                      />
                    ) : (
                      <span className="text-slate-800">{formatCurrency(r.allocatedCost)}</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold">
                    {isSurplus ? (
                      <span className="text-emerald-700">+{formatCurrency(r.refundAmount)}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-semibold">
                    {isDeficit ? (
                      <span className="text-rose-600">-{formatCurrency(r.deficitAmount)}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {isSurplus ? (
                      isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Đã hoàn trả
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" /> Chưa hoàn trả
                        </span>
                      )
                    ) : isDeficit ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800">
                        <AlertCircle className="w-3 h-3" /> Cần thu thêm
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        ✓ Đã tất toán
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-slate-600">
                    {r.bankAccount ? (
                      <div className="flex items-center gap-1.5 group/bank">
                        <span className="truncate max-w-[140px] font-mono text-[11px]" title={`${r.bankName || ''} - ${r.bankAccount}`}>
                          {r.bankName ? `${r.bankName}: ` : ''}{r.bankAccount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyBank(r)}
                          className="opacity-0 group-hover/bank:opacity-100 p-0.5 hover:text-teal-700 transition-opacity"
                          title="Sao chép STK"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Chưa có STK</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-slate-600">
                    <input
                      type="text"
                      placeholder="Ghi chú hoàn tiền..."
                      value={r.refundNote || r.note || ''}
                      onChange={(e) => onUpdateMember && onUpdateMember(r.memberId, { refundNote: e.target.value })}
                      className="w-full bg-transparent border-transparent hover:border-slate-300 focus:border-teal-500 focus:bg-white rounded px-1.5 py-0.5 outline-none text-xs transition-colors"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    {isSurplus && (
                      <button
                        type="button"
                        onClick={() => onUpdateRefundStatus(r.memberId, isCompleted ? 'pending' : 'completed')}
                        className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                          isCompleted
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isCompleted ? 'Hoàn tác' : 'Xác nhận đã trả'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-semibold text-slate-900 border-t border-slate-200">
              <td colSpan="2" className="py-2.5 px-3 text-right">
                Tổng cộng:
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                {formatCurrency(totalPaid)}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-rose-700">
                {formatCurrency(totalCost)}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-emerald-800 font-bold">
                +{formatCurrency(totalRefunds)}
              </td>
              <td className="py-2.5 px-3 text-right font-mono text-rose-800 font-bold">
                {totalDeficits > 0 ? `-${formatCurrency(totalDeficits)}` : '0 ₫'}
              </td>
              <td colSpan="4" className="py-2.5 px-3 text-slate-500 text-xs">
                Tổng tiền cần chuyển hoàn: <strong className="text-emerald-700">{formatCurrency(totalRefunds)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* MOBILE VIEW: Clean Touch Cards (md:hidden) */}
      <div className="md:hidden divide-y divide-slate-100 overflow-y-auto flex-1 p-2.5 space-y-3">
        {refunds.length === 0 && (
          <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs font-semibold text-slate-600">Chưa có thành viên để quyết toán</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Hãy thêm thành viên và chi phí để tự động tính tiền hoàn</p>
          </div>
        )}
        {refunds.map((r, index) => {
          const isSurplus = r.netBalance > 0;
          const isDeficit = r.netBalance < 0;
          const isCompleted = r.refundStatus === 'completed' || r.refundStatus === 'refunded';

          return (
            <div key={r.memberId} className="bg-slate-50/90 border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2.5">
              {/* Top row: STT, Name & Status Badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="font-bold text-slate-900 text-sm truncate">
                    {r.memberName}
                  </span>
                </div>

                <div className="shrink-0">
                  {isSurplus ? (
                    isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" /> Đã hoàn
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                        <Clock className="w-3 h-3" /> Chưa hoàn
                      </span>
                    )
                  ) : isDeficit ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
                      <AlertCircle className="w-3 h-3" /> Cần thu thêm
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      ✓ Đã tất toán
                    </span>
                  )}
                </div>
              </div>

              {/* Financial Metrics 3-Col Box */}
              <div className="grid grid-cols-3 gap-2 bg-white rounded-lg p-2 border border-slate-100 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Đã nộp</span>
                  <span className="text-xs font-mono font-semibold text-slate-700">
                    {formatCurrency(r.paidAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Chi phí TT</span>
                  {allocationType === 'custom' ? (
                    <input
                      type="text"
                      value={customAllocations[r.memberId]?.toLocaleString('vi-VN') || ''}
                      onChange={(e) => onCustomAllocationChange(r.memberId, parseCurrencyInput(e.target.value))}
                      className="w-full text-center bg-slate-50 border border-slate-200 focus:border-teal-500 rounded px-1 py-0.5 text-xs font-mono outline-none"
                    />
                  ) : (
                    <span className="text-xs font-mono font-semibold text-slate-700">
                      {formatCurrency(r.allocatedCost)}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {isSurplus ? 'Hoàn trả (Dư)' : isDeficit ? 'Cần nộp thêm' : 'Chênh lệch'}
                  </span>
                  <span className={`text-xs font-mono font-bold ${
                    isSurplus ? 'text-emerald-700' : isDeficit ? 'text-rose-600' : 'text-slate-500'
                  }`}>
                    {isSurplus ? `+${formatCurrency(r.refundAmount)}` : isDeficit ? `-${formatCurrency(r.deficitAmount)}` : '0 ₫'}
                  </span>
                </div>
              </div>

              {/* Bank Account Info & Copy */}
              <div className="flex items-center justify-between gap-2 text-xs text-slate-600 bg-teal-50/40 px-2.5 py-1.5 rounded-lg border border-teal-100/60">
                <div className="truncate min-w-0">
                  {r.bankAccount ? (
                    <span className="font-mono text-[11px] text-teal-900" title={`${r.bankName || ''} - ${r.bankAccount}`}>
                      🏦 {r.bankName ? `${r.bankName}: ` : ''}<strong>{r.bankAccount}</strong>
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">Chưa có thông tin số tài khoản</span>
                  )}
                </div>
                {r.bankAccount && (
                  <button
                    type="button"
                    onClick={() => handleCopyBank(r)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 hover:bg-teal-200 active:bg-teal-300 text-teal-800 text-[10px] font-bold rounded shrink-0 transition-colors"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>Chép STK</span>
                  </button>
                )}
              </div>

              {/* Editable Note Input */}
              <div>
                <input
                  type="text"
                  placeholder="Ghi chú hoàn tiền (VD: Đã CK VCB, tiền mặt...)"
                  value={r.refundNote || r.note || ''}
                  onChange={(e) => onUpdateMember && onUpdateMember(r.memberId, { refundNote: e.target.value })}
                  className="w-full bg-white border border-slate-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 rounded-lg px-2.5 py-1.5 text-xs outline-none placeholder:text-slate-400 transition-colors"
                />
              </div>

              {/* Action Button: Confirm Refund / Undo */}
              {isSurplus && (
                <button
                  type="button"
                  onClick={() => onUpdateRefundStatus(r.memberId, isCompleted ? 'pending' : 'completed')}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all min-h-[40px] flex items-center justify-center gap-1.5 ${
                    isCompleted
                      ? 'bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm shadow-emerald-600/20'
                  }`}
                >
                  {isCompleted ? (
                    <span>↩ Hoàn tác: Đổi sang chưa trả</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác nhận đã trả tiền ({formatCurrency(r.refundAmount)})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* MOBILE TOTAL FOOTER BAR (md:hidden) */}
      <div className="md:hidden bg-teal-50/90 border-t border-slate-200 p-3 space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-slate-600">
          <span>Tổng đã nộp / Chi phí:</span>
          <span className="font-mono">
            <span className="text-emerald-700 font-semibold">{formatCurrency(totalPaid)}</span>
            {' / '}
            <span className="text-rose-700 font-semibold">{formatCurrency(totalCost)}</span>
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-teal-100">
          <span className="font-bold text-slate-900">Tổng hoàn trả dư:</span>
          <span className="font-mono text-emerald-800 font-bold text-sm">
            +{formatCurrency(totalRefunds)}
          </span>
        </div>
        {totalDeficits > 0 && (
          <div className="flex items-center justify-between text-rose-700 font-bold">
            <span>Cần thu thêm:</span>
            <span className="font-mono">-{formatCurrency(totalDeficits)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
