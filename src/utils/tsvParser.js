/**
 * TSV / Spreadsheet Multi-row Paste Parser
 * Handles pasting rows copied from Google Sheets, Microsoft Excel, or CSV
 */

import { parseVietnameseMoneyText } from './currency.js';
import { getTodayString } from './date.js';

/**
 * Split text into rows and columns, handling tab, comma, semicolon
 * @param {string} rawText 
 * @returns {string[][]}
 */
export function splitSpreadsheetRows(rawText) {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const rows = [];

  for (const line of lines) {
    // If contains tabs, prioritize tab splitting (standard Excel clipboard)
    let cells;
    if (line.includes('\t')) {
      cells = line.split('\t').map(c => c.trim());
    } else if (line.includes(';') && !line.includes(',')) {
      cells = line.split(';').map(c => c.trim());
    } else if (line.includes(',') && !line.match(/\d+,\d{3}/)) {
      // split by comma if not purely thousands separators
      cells = line.split(',').map(c => c.trim());
    } else {
      // Split by 2 or more spaces
      cells = line.split(/\s{2,}/).map(c => c.trim());
      if (cells.length === 1) {
        // Fallback: split by single space if looks like "Name Amount Note"
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          cells = parts;
        }
      }
    }
    rows.push(cells);
  }

  return rows;
}

/**
 * Parse pasted expenses from Google Sheets / Excel
 * Expected columns may vary:
 * [STT, Ngày, Nội dung, Người chi, Số tiền, Ghi chú]
 * or [Ngày, Khoản chi, Người chi, Tiền]
 * or [Khoản chi, Tiền, Ghi chú]
 * 
 * @param {string} rawText 
 * @param {string} defaultRepresentative
 * @returns {Array<Object>}
 */
export function parsePastedExpenses(rawText, defaultRepresentative = '') {
  const rows = splitSpreadsheetRows(rawText);
  if (rows.length === 0) return [];

  const parsed = [];
  const today = getTodayString();

  for (let r = 0; r < rows.length; r++) {
    const cells = rows[r];
    if (cells.length === 0) continue;

    // Check if header row
    const firstCell = cells[0].toLowerCase();
    if (
      firstCell === 'stt' ||
      firstCell === 'no' ||
      firstCell === 'no.' ||
      firstCell.includes('ngày') ||
      firstCell.includes('khoản chi') ||
      firstCell.includes('nội dung')
    ) {
      // skip header row
      continue;
    }

    let description = '';
    let amount = 0;
    let date = today;
    let representative = defaultRepresentative;
    let note = '';

    // Smart column recognition
    // 1. Identify money cell with scoring to avoid false positives (e.g. "9 người" or "2 vé")
    let bestMoneyScore = -1;
    let moneyIndex = -1;

    for (let i = 0; i < cells.length; i++) {
      const cellText = cells[i].trim();
      if (!cellText) continue;

      // If contains ordinary words and no currency suffixes, it's text/note (e.g. "9 người")
      const hasOrdinaryWords = /[a-zA-Zà-ỹÀ-Ỹ]/.test(cellText) && 
        !/(?:tr|trieu|k|nghin|ngàn|ty|tỷ|đ|vnd)/i.test(cellText);
      if (hasOrdinaryWords) continue;

      const val = parseVietnameseMoneyText(cellText);
      if (val > 0) {
        let score = 10;
        // Thousands separator like "1.350.000" or "450.000"
        if (/\d{1,3}(?:[.,]\d{3})+/.test(cellText)) score += 50;
        // Currency suffix like "450k", "1tr350"
        if (/(?:tr|trieu|k|nghin|ngàn|ty|tỷ|đ|vnd)/i.test(cellText)) score += 40;
        // Pure number >= 1000
        if (/^\d+$/.test(cellText) && val >= 1000) score += 30;

        if (score > bestMoneyScore) {
          bestMoneyScore = score;
          moneyIndex = i;
          amount = val;
        }
      }
    }

    // 2. Identify date cell
    let dateIndex = -1;
    for (let i = 0; i < cells.length; i++) {
      if (i === moneyIndex) continue;
      const c = cells[i];
      // Match YYYY-MM-DD or DD/MM/YYYY or DD-MM
      if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(c)) {
        date = c.replace(/\//g, '-');
        dateIndex = i;
        break;
      } else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(c)) {
        const parts = c.split(/[-/]/);
        date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        dateIndex = i;
        break;
      } else if (/^\d{1,2}[-/]\d{1,2}$/.test(c)) {
        const parts = c.split(/[-/]/);
        const currentYear = new Date().getFullYear();
        date = `${currentYear}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        dateIndex = i;
        break;
      }
    }

    // 3. Find description and other cells
    const remainingCells = cells.filter((_, idx) => idx !== moneyIndex && idx !== dateIndex);

    // If first cell was a numeric STT (like "1", "2"), filter it out
    if (remainingCells.length > 0 && /^\d+$/.test(remainingCells[0])) {
      remainingCells.shift();
    }

    if (remainingCells.length === 1) {
      description = remainingCells[0];
    } else if (remainingCells.length === 2) {
      description = remainingCells[0];
      // Is second cell a person or note?
      if (!representative) {
        representative = remainingCells[1];
      } else {
        note = remainingCells[1];
      }
    } else if (remainingCells.length >= 3) {
      description = remainingCells[0];
      representative = remainingCells[1] || defaultRepresentative;
      note = remainingCells.slice(2).join(' - ');
    }

    if (description || amount > 0) {
      parsed.push({
        id: `exp_pasted_${Date.now()}_${r}`,
        date: date || today,
        description: description || 'Khoản chi chưa đặt tên',
        amount: Math.max(0, amount),
        representative: representative || defaultRepresentative || 'Đại diện nhóm',
        note: note || '',
        valid: amount > 0 && description.length > 0,
        error: amount <= 0 ? 'Số tiền không hợp lệ' : !description ? 'Thiếu nội dung chi tiêu' : null
      });
    }
  }

  return parsed;
}

/**
 * Parse pasted members from Google Sheets / Excel
 * Example formats:
 * - Vinh \t 450000 \t Chuyển khoản \t Đã nhận
 * - 1 \t Nguyễn Văn An \t 450000 \t Tiền mặt
 * - Bích \t 450000
 * - Cuong
 * 
 * @param {string} rawText 
 * @param {number} defaultContribution 
 * @returns {Array<Object>}
 */
export function parsePastedMembers(rawText, defaultContribution = 0) {
  const rows = splitSpreadsheetRows(rawText);
  if (rows.length === 0) return [];

  const parsed = [];

  for (let r = 0; r < rows.length; r++) {
    const cells = rows[r];
    if (cells.length === 0) continue;

    // Check if header row
    const firstCell = cells[0].toLowerCase();
    if (
      firstCell === 'stt' ||
      firstCell === 'no' ||
      firstCell === 'no.' ||
      firstCell.includes('họ và tên') ||
      firstCell.includes('thành viên') ||
      firstCell.includes('tên')
    ) {
      continue;
    }

    let name = '';
    let contribution = defaultContribution;
    let paymentStatus = 'paid'; // default to paid if pasting into contribution table
    let note = '';

    // If first cell is numeric index (STT), skip it
    let contentCells = [...cells];
    if (contentCells.length > 1 && /^\d+$/.test(contentCells[0])) {
      contentCells.shift();
    }

    // Name is first content cell
    name = contentCells[0] || '';

    // Check if any cell has contribution amount
    let moneyIndex = -1;
    for (let i = 1; i < contentCells.length; i++) {
      const val = parseVietnameseMoneyText(contentCells[i]);
      if (val > 0) {
        contribution = val;
        moneyIndex = i;
        break;
      }
    }

    // Remaining cells are notes or statuses
    const extraCells = contentCells.filter((_, idx) => idx !== 0 && idx !== moneyIndex);
    if (extraCells.length > 0) {
      const extraText = extraCells.join(' ');
      const lower = extraText.toLowerCase();
      if (lower.includes('chưa') || lower.includes('unpaid') || lower.includes('nợ')) {
        paymentStatus = 'unpaid';
      } else if (lower.includes('một phần') || lower.includes('partial')) {
        paymentStatus = 'partial';
      } else if (lower.includes('hoàn') || lower.includes('refund')) {
        paymentStatus = 'refunded';
      } else {
        paymentStatus = 'paid';
      }
      note = extraText;
    }

    if (name.trim()) {
      parsed.push({
        id: `mem_pasted_${Date.now()}_${r}`,
        name: name.trim(),
        contributionAmount: contribution,
        paidAmount: paymentStatus === 'unpaid' ? 0 : contribution,
        paymentStatus,
        paymentNote: note,
        refundStatus: 'pending',
        refundAmount: 0,
        valid: Boolean(name.trim()),
        error: !name.trim() ? 'Thiếu họ tên' : null
      });
    }
  }

  return parsed;
}
