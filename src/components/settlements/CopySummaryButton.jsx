import React, { useState } from 'react';
import { generateChatSummary } from '../../utils/settlementAlgorithm';
import { useToast } from '../../context/ToastContext';
import { Copy, Check } from 'lucide-react';

export default function CopySummaryButton({
  group,
  members = [],
  transfers = []
}) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const summaryText = generateChatSummary(group, members, transfers);
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      showToast('Đã sao chép tổng kết quyết toán! Dán vào nhóm Zalo / Messenger ngay.');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Không thể tự động sao chép vào bộ nhớ tạm', 'error');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
        copied
          ? 'bg-emerald-700 text-white shadow-emerald-700/20'
          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
      }`}
    >
      {copied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
      <span>{copied ? 'Đã sao chép!' : 'Sao chép tổng kết gửi nhóm'}</span>
    </button>
  );
}
