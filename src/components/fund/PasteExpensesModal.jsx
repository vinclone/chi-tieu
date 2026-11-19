import React, { useState, useEffect } from 'react';
import { X, ClipboardPaste, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { parsePastedExpenses } from '../../utils/tsvParser.js';
import { formatCurrency } from '../../utils/currency.js';
import { formatDate } from '../../utils/date.js';

export default function PasteExpensesModal({
  isOpen,
  onClose,
  onConfirmBatch,
  defaultRepresentative
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
    const results = parsePastedExpenses(val, defaultRepresentative);
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
  const totalBatchAmount = parsedRows.filter(r => r.valid).reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-600 text-white rounded-lg">
              <ClipboardPaste className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Dán Dữ Liệu Chi Tiêu Từ Excel / Google Sheets
              </h3>
              <p className="text-xs text-slate-500">
                Sao chép các dòng trong bảng tính và dán trực tiếp vào ô bên dưới
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
              placeholder={`Ví dụ dữ liệu từ Excel:\n20/11/2026\tThuê xe 16 chỗ\tNguyễn Văn An\t1.350.000\tNhà xe Tuấn Anh\n20/11/2026\tVé tham quan\tNguyễn Văn An\t450.000\t9 người\n20/11/2026\tĂn trưa cơm niêu\tNguyễn Văn An\t630.000`}
              className="w-full border border-slate-300 rounded-lg p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 focus:bg-white transition-colors"
              autoFocus
            />
          </div>

          {/* Parsed Preview */}
          {parsedRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-800">
                  Xem trước kết quả nhận diện ({validCount}/{parsedRows.length} dòng hợp lệ):
                </span>
                <span className="font-mono font-bold text-rose-700 text-sm">
                  Tổng: {formatCurrency(totalBatchAmount)}
                </span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-56">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Ngày</th>
                      <th className="py-2 px-3">Khoản chi</th>
                      <th className="py-2 px-3">Người chi</th>
                      <th className="py-2 px-3 text-right">Số tiền</th>
                      <th className="py-2 px-3">Ghi chú</th>
                      <th className="py-2 px-2 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.valid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                        <td className="py-1.5 px-3 whitespace-nowrap text-slate-600">{formatDate(row.date)}</td>
                        <td className="py-1.5 px-3 font-medium text-slate-900 font-sans">{row.description}</td>
                        <td className="py-1.5 px-3 text-slate-700 font-sans">{row.representative}</td>
                        <td className="py-1.5 px-3 text-right font-bold text-rose-700">{formatCurrency(row.amount)}</td>
                        <td className="py-1.5 px-3 text-slate-500 font-sans">{row.note}</td>
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
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <span>Nhập {validCount} khoản chi vào bảng</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
