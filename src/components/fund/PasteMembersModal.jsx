import React, { useState, useEffect } from 'react';
import { X, ClipboardPaste, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { parsePastedMembers } from '../../utils/tsvParser.js';
import { formatCurrency } from '../../utils/currency.js';

export default function PasteMembersModal({
  isOpen,
  onClose,
  onConfirmBatch,
  defaultContribution = 0
}) {
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setRawText('');
      setParsedRows([]);
    }
  }, [isOpen]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setRawText(val);
    const results = parsePastedMembers(val, defaultContribution);
    setParsedRows(results);
  };

  const handleConfirm = () => {
    const validRows = parsedRows.filter(r => r.valid);
    if (validRows.length === 0) return;
    onConfirmBatch(validRows);
    onClose();
  };

  if (!isOpen) return null;

  const validCount = parsedRows.filter(r => r.valid).length;
  const totalBatchContribution = parsedRows.filter(r => r.valid).reduce((sum, r) => sum + r.contributionAmount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <ClipboardPaste className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Dán Danh Sách Thành Viên Từ Excel
              </h3>
              <p className="text-xs text-slate-500">
                Sao chép cột Họ tên, Số tiền đóng, Ghi chú từ bảng tính rồi dán vào đây
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Dán dữ liệu vào đây (Ctrl + V):
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={handleTextChange}
              placeholder={`Ví dụ dữ liệu từ Excel:\nTrần Hoàng Vinh\t450000\tChuyển khoản\nLê Ngọc Bích\t450000\tChuyển khoản\nPhạm Mạnh Cường\t450000\tTiền mặt`}
              className="w-full border border-slate-300 rounded-lg p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white transition-colors"
              autoFocus
            />
          </div>

          {/* Parsed Preview */}
          {parsedRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-800">
                  Xem trước kết quả nhận diện ({validCount}/{parsedRows.length} thành viên hợp lệ):
                </span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  Tổng nộp: {formatCurrency(totalBatchContribution)}
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-56">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Họ và tên</th>
                      <th className="py-2 px-3 text-right">Số tiền đóng</th>
                      <th className="py-2 px-3">Trạng thái</th>
                      <th className="py-2 px-3">Ghi chú</th>
                      <th className="py-2 px-2 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.valid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                        <td className="py-1.5 px-3 font-medium text-slate-900 font-sans">{row.name}</td>
                        <td className="py-1.5 px-3 text-right font-bold text-emerald-700">{formatCurrency(row.contributionAmount)}</td>
                        <td className="py-1.5 px-3 font-sans">
                          {row.paymentStatus === 'paid' ? 'Đã đóng' : row.paymentStatus === 'unpaid' ? 'Chưa đóng' : 'Đóng một phần'}
                        </td>
                        <td className="py-1.5 px-3 text-slate-500 font-sans">{row.paymentNote}</td>
                        <td className="py-1.5 px-2 text-center">
                          {row.valid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                          ) : (
                            <span title={row.error}>
                              <AlertTriangle className="w-4 h-4 text-rose-600 inline" />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-medium"
          >
            Hủy bỏ
          </button>

          <button
            onClick={handleConfirm}
            disabled={validCount === 0}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <span>Nhập {validCount} thành viên</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
