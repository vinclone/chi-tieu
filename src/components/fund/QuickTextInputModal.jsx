import React, { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, CheckCircle2, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { parseQuickTextExpenses } from '../../utils/textParser.js';
import { formatCurrency } from '../../utils/currency.js';
import { getTodayString } from '../../utils/date.js';

export default function QuickTextInputModal({
  isOpen,
  onClose,
  onConfirmBatch,
  defaultRepresentative = ''
}) {
  const [inputText, setInputText] = useState('');
  const [parsedItems, setParsedItems] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setInputText('');
      setParsedItems([]);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);
    const results = parseQuickTextExpenses(val, defaultRepresentative);
    setParsedItems(results);
  };

  const handleUpdateItem = (index, updates) => {
    setParsedItems(prev => prev.map((item, idx) => idx === index ? { ...item, ...updates } : item));
  };

  const handleDeleteItem = (index) => {
    setParsedItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleConfirm = () => {
    const validItems = parsedItems.filter(item => item.valid && item.amount > 0);
    if (validItems.length === 0) return;
    onConfirmBatch(validItems);
    onClose();
  };

  if (!isOpen) return null;

  const validCount = parsedItems.filter(item => item.valid && item.amount > 0).length;
  const totalAmount = parsedItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-600 text-white rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nhập Nhanh Chi Tiêu Bằng Văn Bản Tự Nhiên
              </h3>
              <p className="text-xs text-slate-500">
                Gõ câu tự do: ứng dụng tự động bóc tách số tiền và nội dung
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

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Nhập hoặc dán đoạn văn bản chi tiêu:
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={handleInputChange}
              placeholder="VD: Thuê xe 1tr350, vé tham quan 450k, ăn trưa 630k, nước uống 150k"
              className="w-full border border-slate-300 rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50 focus:bg-white transition-colors"
              autoFocus
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Hỗ trợ: <code className="bg-slate-100 px-1 rounded">1tr350</code>, <code className="bg-slate-100 px-1 rounded">450k</code>, <code className="bg-slate-100 px-1 rounded">630.000đ</code>, phân cách bằng dấu phẩy, chấm phẩy hoặc xuống dòng.
            </p>
          </div>

          {/* Quick example chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 text-[11px]">Thử câu mẫu:</span>
            <button
              type="button"
              onClick={() => {
                const sample = "Thuê xe 1tr350, vé tham quan 450k, ăn trưa 630k, nước uống 150k, BBQ 360k";
                setInputText(sample);
                setParsedItems(parseQuickTextExpenses(sample, defaultRepresentative));
              }}
              className="px-2 py-0.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-[11px] border border-purple-200 transition-colors"
            >
              "Thuê xe 1tr350, vé tham quan 450k, ăn trưa 630k..."
            </button>
          </div>

          {/* Parsed list preview */}
          {parsedItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-800">
                  Nhận diện được {validCount} khoản chi:
                </span>
                <span className="font-mono font-bold text-purple-700 text-sm">
                  Tổng: {formatCurrency(totalAmount)}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {parsedItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateItem(idx, { title: e.target.value })}
                      className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 font-medium text-slate-800"
                    />

                    <input
                      type="text"
                      value={item.amount?.toLocaleString('vi-VN') || ''}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^\d]/g, '');
                        handleUpdateItem(idx, { amount: cleaned ? parseInt(cleaned, 10) : 0 });
                      }}
                      className="w-28 text-right bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-rose-700"
                    />

                    <button
                      type="button"
                      onClick={() => handleDeleteItem(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <span>Thêm {validCount} khoản chi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
