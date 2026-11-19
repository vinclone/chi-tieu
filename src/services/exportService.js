/**
 * CSV / Excel Export Service
 * Formats expense, member contributions, fund summaries, and settlement reports into Excel-compatible UTF-8 CSVs.
 */

import { formatDate } from '../utils/date.js';
import { calculateMemberStatistics } from '../utils/calculations.js';

function triggerCsvDownload(csvContent, filename) {
  // \uFEFF is the UTF-8 Byte Order Mark (BOM) ensuring Excel displays Vietnamese characters properly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export const exportService = {
  /**
   * Export comprehensive Group Fund Settlement Report matching Google Sheets workflow
   */
  exportFundSummaryReportCSV(group, members, expenses, summary, refunds) {
    const lines = [];

    // Header
    lines.push([`BÁO CÁO QUYẾT TOÁN THU CHI & QUỸ NHÓM`].map(escapeCsvCell).join(','));
    lines.push([`Chuyến đi / Sự kiện:`, group.name || '', `Địa điểm:`, group.location || ''].map(escapeCsvCell).join(','));
    lines.push([`Thời gian:`, group.duration || `${group.startDate || ''} - ${group.endDate || ''}`, `Người đại diện:`, group.representative || ''].map(escapeCsvCell).join(','));
    lines.push([]);

    // 1. Overview
    lines.push([`TỔNG HỢP TÀI CHÍNH`].map(escapeCsvCell).join(','));
    lines.push([`Chỉ số`, `Giá trị`].map(escapeCsvCell).join(','));
    lines.push([`Tổng thu quỹ nhóm (Thực thu)`, `${summary.totalCollected} VNĐ`].map(escapeCsvCell).join(','));
    lines.push([`Số thành viên đã nộp`, `${summary.paidMembersCount}/${summary.memberCount}`].map(escapeCsvCell).join(','));
    lines.push([`Tổng chi tiêu thực tế`, `${summary.totalExpenses} VNĐ`].map(escapeCsvCell).join(','));
    lines.push([`Số lượng khoản chi`, `${summary.expenseCount}`].map(escapeCsvCell).join(','));
    lines.push([`Số dư quỹ còn lại`, `${summary.remainingFund} VNĐ`].map(escapeCsvCell).join(','));
    lines.push([`Chi phí thực tế / người`, `${summary.costPerPerson} VNĐ`].map(escapeCsvCell).join(','));
    lines.push([`Hoàn trả bình quân / người`, `${summary.refundPerPerson} VNĐ`].map(escapeCsvCell).join(','));
    lines.push([`Trạng thái quỹ`, summary.statusText].map(escapeCsvCell).join(','));
    lines.push([]);

    // 2. Member contributions
    lines.push([`DANH SÁCH ĐÓNG GÓP QUỸ THÀNH VIÊN`].map(escapeCsvCell).join(','));
    lines.push([`STT`, `Họ và tên`, `Số tiền nộp (VNĐ)`, `Trạng thái đóng`, `Ghi chú đóng tiền`].map(escapeCsvCell).join(','));
    members.forEach((m, idx) => {
      const paid = typeof m.paidAmount === 'number' ? m.paidAmount : (m.contributionAmount || 0);
      const statusLabel = m.paymentStatus === 'paid' ? 'Đã đóng' : m.paymentStatus === 'partial' ? 'Đóng một phần' : 'Chưa đóng';
      lines.push([idx + 1, m.name, paid, statusLabel, m.paymentNote || ''].map(escapeCsvCell).join(','));
    });
    lines.push([]);

    // 3. Expenses
    lines.push([`BẢNG CHI TIÊU CHUNG CỦA ĐOÀN`].map(escapeCsvCell).join(','));
    lines.push([`STT`, `Ngày`, `Nội dung khoản chi`, `Người thanh toán`, `Số tiền (VNĐ)`, `Ghi chú`].map(escapeCsvCell).join(','));
    expenses.forEach((e, idx) => {
      lines.push([
        idx + 1,
        formatDate(e.date),
        e.description || e.title || '',
        e.representative || group.representative || 'Đại diện nhóm',
        e.amount,
        e.note || ''
      ].map(escapeCsvCell).join(','));
    });
    lines.push([]);

    // 4. Refunds & Final Settlement
    lines.push([`BẢNG QUYẾT TOÁN VÀ HOÀN TIỀN THỪA`].map(escapeCsvCell).join(','));
    lines.push([`STT`, `Họ và tên`, `Đã đóng (VNĐ)`, `Chi phí thực tế (VNĐ)`, `Số tiền hoàn trả (VNĐ)`, `Cần đóng thêm (VNĐ)`, `Trạng thái hoàn tiền`, `Tài khoản nhận tiền`, `Ghi chú (Note)`].map(escapeCsvCell).join(','));
    refunds.forEach((r, idx) => {
      lines.push([
        idx + 1,
        r.memberName,
        r.paidAmount,
        r.allocatedCost,
        r.refundAmount,
        r.deficitAmount,
        r.statusLabel,
        r.bankAccount ? `${r.bankName || ''} - ${r.bankAccount}` : '',
        r.refundNote || r.paymentNote || ''
      ].map(escapeCsvCell).join(','));
    });
    lines.push([]);

    // 5. Treasurer info
    const t = group.treasurerInfo || {};
    lines.push([`THÔNG TIN THỦ QUỸ HOÀN TRẢ`].map(escapeCsvCell).join(','));
    lines.push([`Người đại diện / Thủ quỹ:`, t.name || group.representative || ''].map(escapeCsvCell).join(','));
    lines.push([`Số điện thoại:`, t.phone || ''].map(escapeCsvCell).join(','));
    lines.push([`Ngân hàng:`, t.bankName || ''].map(escapeCsvCell).join(','));
    lines.push([`Số tài khoản:`, t.accountNumber || ''].map(escapeCsvCell).join(','));
    lines.push([`Chủ tài khoản:`, t.accountHolder || ''].map(escapeCsvCell).join(','));
    lines.push([`Hạn tất toán / hoàn tiền:`, t.refundDeadline || ''].map(escapeCsvCell).join(','));
    lines.push([`Ghi chú:`, t.note || ''].map(escapeCsvCell).join(','));

    const csvContent = lines.map(l => Array.isArray(l) ? l.join(',') : l).join('\r\n');
    const safeName = (group.name || 'quyet-toan').toLowerCase().replace(/[^a-z0-9]/g, '-');
    triggerCsvDownload(csvContent, `quyet-toan-quy-nhom-${safeName}.csv`);
  },

  /**
   * Export all expenses of the group to CSV
   */
  exportExpensesCSV(group, members, expenses) {
    const headers = [
      'STT',
      'Ngày',
      'Tên khoản chi',
      'Người chi',
      'Số tiền (VNĐ)',
      'Ghi chú'
    ];

    const rows = expenses.map((exp, idx) => {
      return [
        idx + 1,
        formatDate(exp.date),
        exp.description || exp.title || '',
        exp.representative || group.representative || 'Đại diện nhóm',
        exp.amount,
        exp.note || ''
      ].map(escapeCsvCell).join(',');
    });

    const csv = [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
    const safeName = (group?.name || 'chi-tieu').toLowerCase().replace(/[^a-z0-9]/g, '-');
    triggerCsvDownload(csv, `danh-sach-chi-tieu-${safeName}.csv`);
  },

  /**
   * Export members financial balance summary to CSV
   */
  exportMembersSummaryCSV(group, members, expenses, settlements) {
    const stats = calculateMemberStatistics(members, expenses, settlements);

    const headers = [
      'Thành viên',
      'Biệt danh',
      'Đã chi (VNĐ)',
      'Phải chịu (VNĐ)',
      'Đã thanh toán nợ (VNĐ)',
      'Đã nhận nợ (VNĐ)',
      'Số dư ròng (VNĐ)',
      'Trạng thái'
    ];

    const rows = stats.map(st => {
      const statusText = st.balance > 0 ? 'Cần nhận lại' : st.balance < 0 ? 'Cần trả' : 'Đã tất toán';
      return [
        st.name,
        st.nickname || '',
        st.paid,
        st.share,
        st.settlementPaid,
        st.settlementReceived,
        st.balance,
        statusText
      ].map(escapeCsvCell).join(',');
    });

    const csv = [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
    const safeName = (group?.name || 'thanh-vien').toLowerCase().replace(/[^a-z0-9]/g, '-');
    triggerCsvDownload(csv, `tong-hop-thanh-vien-${safeName}.csv`);
  },

  /**
   * Export settlement payment records to CSV
   */
  exportSettlementsCSV(group, members, settlements) {
    const memberMap = new Map(members.map(m => [m.id, m.nickname || m.name]));
    const headers = [
      'STT',
      'Ngày',
      'Người chuyển',
      'Người nhận',
      'Số tiền (VNĐ)',
      'Hình thức',
      'Ghi chú'
    ];

    const rows = settlements.map((s, idx) => {
      const fromName = memberMap.get(s.fromMemberId) || s.fromMemberId;
      const toName = memberMap.get(s.toMemberId) || s.toMemberId;
      return [
        idx + 1,
        formatDate(s.date),
        fromName,
        toName,
        s.amount,
        s.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'Tiền mặt',
        s.note || ''
      ].map(escapeCsvCell).join(',');
    });

    const csv = [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
    const safeName = (group?.name || 'quyet-toan-no').toLowerCase().replace(/[^a-z0-9]/g, '-');
    triggerCsvDownload(csv, `lich-su-quyet-toan-${safeName}.csv`);
  }
};
