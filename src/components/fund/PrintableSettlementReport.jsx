import React from 'react';
import { Printer, X } from 'lucide-react';
import { formatCurrency } from '../../utils/currency.js';
import { formatDate } from '../../utils/date.js';

export default function PrintableSettlementReport({
  isOpen,
  onClose,
  group,
  members,
  expenses,
  fundSummary,
  refunds
}) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const treasurer = group.treasurerInfo || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col my-auto print:border-none print:shadow-none print:rounded-none">
        {/* Print toolbar (hidden on paper) */}
        <div className="p-4 border-b border-slate-200 bg-slate-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">
              Xem trước bản in Báo Cáo Quyết Toán Quỹ Nhóm
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>In trang / Lưu PDF</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Document */}
        <div className="p-8 md:p-10 text-slate-800 text-xs font-sans space-y-6 max-h-[85vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0 print:space-y-4">
          {/* Header */}
          <div className="text-center border-b pb-4 border-slate-300">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
              BẢNG QUYẾT TOÁN THU CHI & QUỸ NHÓM
            </h1>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              {group.name} {group.tripName && group.tripName !== group.name ? `— ${group.tripName}` : ''}
            </p>
            <div className="flex items-center justify-center gap-6 text-xs text-slate-600 mt-2 font-mono">
              <span>Địa điểm: <strong>{group.location || 'N/A'}</strong></span>
              <span>Thời gian: <strong>{formatDate(group.startDate)} {group.endDate ? `- ${formatDate(group.endDate)}` : ''}</strong> ({group.duration || '2N1Đ'})</span>
              <span>Đại diện: <strong>{group.representative}</strong></span>
            </div>
          </div>

          {/* 1. Tổng quan tài chính */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 border-l-4 border-emerald-700 pl-2">
              I. TỔNG QUAN TÀI CHÍNH
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[11px]">Tổng tiền quỹ thu được:</span>
                <span className="text-base font-bold text-emerald-800 font-mono">
                  {formatCurrency(fundSummary.totalCollected)}
                </span>
                <span className="block text-[10px] text-slate-500 mt-0.5">
                  ({fundSummary.paidMembersCount}/{fundSummary.memberCount} thành viên đã đóng)
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[11px]">Tổng chi phí thực tế:</span>
                <span className="text-base font-bold text-rose-700 font-mono">
                  {formatCurrency(fundSummary.totalExpenses)}
                </span>
                <span className="block text-[10px] text-slate-500 mt-0.5">
                  ({fundSummary.expenseCount} khoản chi tiêu đoàn)
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[11px]">Số dư quỹ còn lại:</span>
                <span className={`text-base font-bold font-mono ${fundSummary.remainingFund >= 0 ? 'text-teal-800' : 'text-rose-700'}`}>
                  {fundSummary.remainingFund >= 0 ? '+' : ''}{formatCurrency(fundSummary.remainingFund)}
                </span>
                <span className="block text-[10px] text-slate-500 mt-0.5">
                  {fundSummary.remainingFund >= 0 ? `Hoàn trả: ${formatCurrency(fundSummary.refundPerPerson)}/người` : 'Hụt quỹ'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Chi tiết thu quỹ & Quyết toán hoàn tiền */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 border-l-4 border-emerald-700 pl-2">
              II. BẢNG QUYẾT TOÁN & HOÀN TIỀN THỪA TỪNG THÀNH VIÊN
            </h2>
            <table className="w-full border-collapse border border-slate-300 text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-semibold">
                  <th className="border border-slate-300 p-1.5 text-center w-10">STT</th>
                  <th className="border border-slate-300 p-1.5">Họ và tên</th>
                  <th className="border border-slate-300 p-1.5 text-right w-24">Tiền đã đóng</th>
                  <th className="border border-slate-300 p-1.5 text-right w-24">Chi phí thực tế</th>
                  <th className="border border-slate-300 p-1.5 text-right w-28">Hoàn trả (Dư)</th>
                  <th className="border border-slate-300 p-1.5 text-center w-28">Trạng thái</th>
                  <th className="border border-slate-300 p-1.5 text-center w-36">Ký nhận / Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((r, idx) => (
                  <tr key={r.memberId}>
                    <td className="border border-slate-300 p-1.5 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-300 p-1.5 font-medium">{r.memberName}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono">{formatCurrency(r.paidAmount)}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono">{formatCurrency(r.allocatedCost)}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono font-bold text-emerald-800">
                      {r.netBalance > 0 ? `+${formatCurrency(r.refundAmount)}` : r.netBalance < 0 ? `-${formatCurrency(r.deficitAmount)}` : '0 ₫'}
                    </td>
                    <td className="border border-slate-300 p-1.5 text-center">
                      {r.statusLabel}
                    </td>
                    <td className="border border-slate-300 p-1.5 text-slate-600 text-[10px]">
                      {r.refundNote && <span className="font-semibold block text-slate-800">Ghi chú: {r.refundNote}</span>}
                      {r.bankAccount ? `${r.bankName || ''} ${r.bankAccount}` : (r.paymentNote || '')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold">
                  <td colSpan="2" className="border border-slate-300 p-1.5 text-right">Tổng cộng:</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono">{formatCurrency(fundSummary.totalCollected)}</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono">{formatCurrency(fundSummary.totalExpenses)}</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono text-emerald-800">+{formatCurrency(fundSummary.remainingFund)}</td>
                  <td colSpan="2" className="border border-slate-300 p-1.5 text-center text-[10px]">Đã cân bằng 100%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 3. Chi tiết các khoản chi */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 border-l-4 border-rose-700 pl-2">
              III. DANH MỤC CHI TIÊU THỰC TẾ
            </h2>
            <table className="w-full border-collapse border border-slate-300 text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-semibold">
                  <th className="border border-slate-300 p-1.5 text-center w-10">STT</th>
                  <th className="border border-slate-300 p-1.5 w-24">Ngày</th>
                  <th className="border border-slate-300 p-1.5">Nội dung chi tiêu</th>
                  <th className="border border-slate-300 p-1.5 w-28">Người chi</th>
                  <th className="border border-slate-300 p-1.5 text-right w-28">Số tiền</th>
                  <th className="border border-slate-300 p-1.5">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e, idx) => (
                  <tr key={e.id}>
                    <td className="border border-slate-300 p-1.5 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-300 p-1.5 font-mono">{formatDate(e.date)}</td>
                    <td className="border border-slate-300 p-1.5 font-medium">{e.description || e.title}</td>
                    <td className="border border-slate-300 p-1.5">{e.representative || group.representative}</td>
                    <td className="border border-slate-300 p-1.5 text-right font-mono font-bold text-rose-800">{formatCurrency(e.amount)}</td>
                    <td className="border border-slate-300 p-1.5 text-slate-600">{e.note || ''}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold">
                  <td colSpan="4" className="border border-slate-300 p-1.5 text-right">Tổng chi tiêu đoàn:</td>
                  <td className="border border-slate-300 p-1.5 text-right font-mono text-rose-800">{formatCurrency(fundSummary.totalExpenses)}</td>
                  <td className="border border-slate-300 p-1.5 text-slate-500 text-[10px]">Đã thanh toán đủ</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 4. Thông tin tài khoản hoàn trả & Chữ ký */}
          <div className="pt-4 border-t border-slate-300">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded mb-6 text-[11px]">
              <span className="font-bold text-slate-900 block mb-1">THÔNG TIN TÀI KHOẢN THỦ QUỸ HOÀN TRẢ:</span>
              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>Thủ quỹ: <strong>{treasurer.name || group.representative || 'Chưa cập nhật'}</strong> {treasurer.phone ? `(SĐT: ${treasurer.phone})` : ''}</div>
                <div>Ngân hàng: <strong>{treasurer.bankName || 'Chưa cập nhật'}</strong> — STK: <strong>{treasurer.accountNumber || 'Chưa cập nhật'}</strong></div>
                <div>Chủ TK: <strong>{treasurer.accountHolder || treasurer.name || group.representative || 'Chưa cập nhật'}</strong></div>
                <div>Hạn hoàn tiền: <strong>{treasurer.refundDeadline || 'Theo thỏa thuận nhóm'}</strong></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 text-center pt-2">
              <div>
                <p className="font-bold text-slate-900">ĐẠI DIỆN ĐOÀN / THỦ QUỸ</p>
                <p className="text-[10px] text-slate-500 italic mt-0.5">(Ký và ghi rõ họ tên)</p>
                <div className="h-16"></div>
                <p className="font-bold text-slate-800">{treasurer.name || group.representative}</p>
              </div>

              <div>
                <p className="font-bold text-slate-900">XÁC NHẬN CỦA CÁC THÀNH VIÊN</p>
                <p className="text-[10px] text-slate-500 italic mt-0.5">(Đã nhận đủ tiền hoàn trả)</p>
                <div className="h-16"></div>
                <p className="font-semibold text-slate-700 italic">Đã xác nhận quyết toán</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
