/**
 * Vietnamese Dong (VND) Currency Utilities
 */

/**
 * Format integer amount to Vietnamese Dong string: e.g. 500000 -> "500.000 ₫"
 * @param {number} amount
 * @param {boolean} showSymbol
 * @returns {string}
 */
export function formatCurrency(amount, showSymbol = true) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? '0 ₫' : '0';
  }
  const rounded = Math.round(Number(amount));
  const formatted = new Intl.NumberFormat('vi-VN').format(rounded);
  return showSymbol ? `${formatted} ₫` : formatted;
}

/**
 * Format compact money: e.g. 1500000 -> "1,5 tr ₫"
 * @param {number} amount
 * @returns {string}
 */
export function formatCompactCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 ₫';
  const val = Math.abs(Number(amount));
  const sign = amount < 0 ? '-' : '';
  if (val >= 1_000_000_000) {
    return `${sign}${(val / 1_000_000_000).toFixed(1).replace('.0', '')} tỷ ₫`;
  }
  if (val >= 1_000_000) {
    return `${sign}${(val / 1_000_000).toFixed(1).replace('.0', '')} tr ₫`;
  }
  if (val >= 1_000) {
    return `${sign}${(val / 1_000).toFixed(0)}k ₫`;
  }
  return formatCurrency(amount);
}

/**
 * Parse standard numeric or formatted input to integer VND
 * e.g. "450.000" -> 450000, "1,350,000" -> 1350000
 * @param {string|number} input
 * @returns {number}
 */
export function parseCurrencyInput(input) {
  if (typeof input === 'number') return Math.max(0, Math.round(input));
  if (!input) return 0;
  const cleaned = String(input).replace(/[^\d]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

/**
 * Parse natural Vietnamese money representations:
 * Examples:
 * - "150k" -> 150000
 * - "1.5tr" / "1,5tr" -> 1500000
 * - "1tr350" / "1tr350k" -> 1350000
 * - "2tr" -> 2000000
 * - "50000" / "50.000" / "50,000" / "50.000đ" -> 50000
 * - "2 tỷ" -> 2000000000
 * 
 * @param {string} text
 * @returns {number} integer VND
 */
export function parseVietnameseMoneyText(text) {
  if (!text) return 0;
  if (typeof text === 'number') return Math.max(0, Math.round(text));

  const trimmed = String(text).trim().toLowerCase().replace(/\s+/g, '');
  if (!trimmed) return 0;

  // Case: "1tr350" or "1tr350k"
  const trCombinedMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)(?:tr|trieu)(\d+)(?:k)?$/);
  if (trCombinedMatch) {
    const trPart = parseFloat(trCombinedMatch[1].replace(',', '.'));
    let subPart = trCombinedMatch[2];
    // if subPart is "35" -> 350,000; if "350" -> 350,000; if "5" -> 500,000
    if (subPart.length === 1) subPart = subPart + '00000';
    else if (subPart.length === 2) subPart = subPart + '0000';
    else if (subPart.length === 3) subPart = subPart + '000';
    else if (subPart.length === 4) subPart = subPart + '00';
    else if (subPart.length === 5) subPart = subPart + '0';
    const subNum = parseInt(subPart, 10) || 0;
    return Math.round(trPart * 1_000_000 + subNum);
  }

  // Case: "1.5tr", "1,5tr", "2tr", "10trieu"
  const trMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)(?:tr|trieu)$/);
  if (trMatch) {
    const val = parseFloat(trMatch[1].replace(',', '.'));
    return Math.round(val * 1_000_000);
  }

  // Case: "150k"
  const kMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)(?:k|nghin|ngàn)$/);
  if (kMatch) {
    const val = parseFloat(kMatch[1].replace(',', '.'));
    return Math.round(val * 1_000);
  }

  // Case: "1ty", "1.5ty"
  const tyMatch = trimmed.match(/^(\d+(?:[.,]\d+)?)(?:ty|tỷ)$/);
  if (tyMatch) {
    const val = parseFloat(tyMatch[1].replace(',', '.'));
    return Math.round(val * 1_000_000_000);
  }

  // Standard numbers like "1.350.000", "1,350,000", "50000đ"
  const cleaned = trimmed.replace(/[^\d]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}
