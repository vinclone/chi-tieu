/**
 * Natural language parser for quick expense entry in Vietnamese
 * E.g. "Thuê xe 1tr350, vé tham quan 450k, ăn trưa 630k, nước uống 150k"
 */

import { parseVietnameseMoneyText } from './currency.js';
import { getTodayString } from './date.js';

export function parseQuickTextExpenses(input, defaultRepresentative = '') {
  if (!input || !input.trim()) return [];

  // Split by comma, semicolon, or newline
  const rawItems = input.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);

  const parsedExpenses = [];

  for (const raw of rawItems) {
    // Regular expression to look for money tokens like: 1tr350, 450k, 1.350.000, 630k, 150000đ
    const moneyPattern = /(\b\d+(?:[.,]\d+)?(?:tr|trieu)\d+(?:k)?\b|\b\d+(?:[.,]\d+)?(?:tr|trieu|k|nghin|ngàn|ty|tỷ)\b|\b\d{1,3}(?:[.,]\d{3})+(?:đ)?\b|\b\d+(?:đ)?\b)/i;

    const match = raw.match(moneyPattern);
    if (match) {
      const moneyStr = match[0];
      const amount = parseVietnameseMoneyText(moneyStr);

      // Everything before the money token (or around it) is the expense title
      const title = raw.replace(match[0], '').replace(/[-:]\s*$/, '').replace(/^[-:]\s*/, '').trim();

      if (amount > 0 && title) {
        parsedExpenses.push({
          title: title.charAt(0).toUpperCase() + title.slice(1),
          amount,
          date: getTodayString(),
          representative: defaultRepresentative,
          note: `Nhập nhanh từ: "${raw}"`,
          rawText: raw,
          valid: true
        });
      } else if (amount > 0 && !title) {
        parsedExpenses.push({
          title: 'Chi tiêu',
          amount,
          date: getTodayString(),
          representative: defaultRepresentative,
          note: `Nhập nhanh từ: "${raw}"`,
          rawText: raw,
          valid: true
        });
      }
    }
  }

  return parsedExpenses;
}
