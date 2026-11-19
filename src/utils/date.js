/**
 * Vietnamese date & time utility functions
 */

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return `${day}/${month}/${year}`;
}

export function formatDateTime(dateStr, timeStr) {
  const formattedDate = formatDate(dateStr);
  if (!timeStr) return formattedDate;
  return `${timeStr} • ${formattedDate}`;
}

export function formatDateRange(startDate, endDate) {
  if (!startDate && !endDate) return 'Chưa đặt ngày';
  if (startDate && !endDate) return `Từ ${formatDate(startDate)}`;
  if (!startDate && endDate) return `Đến ${formatDate(endDate)}`;
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
