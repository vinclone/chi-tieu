import React from 'react';
import { 
  Calendar, 
  MapPin, 
  UserCheck, 
  Printer, 
  FileSpreadsheet, 
  RefreshCw, 
  Edit3, 
  FolderSync, 
  Clock,
  Download,
  Database
} from 'lucide-react';
import { formatDate } from '../../utils/date.js';
import { exportService } from '../../services/exportService.js';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function GroupInfoBar({ 
  group, 
  members, 
  expenses, 
  fundSummary, 
  refunds,
  onOpenEditGroup, 
  onOpenGroupSwitcher,
  onResetDemo,
  onTriggerPrint
}) {
  const { showToast } = useToast();
  const { exportJSONBackup } = useApp();

  const handleExportCSV = () => {
    try {
      exportService.exportFundSummaryReportCSV(group, members, expenses, fundSummary, refunds);
      showToast('Đã xuất báo cáo quyết toán quỹ nhóm ra file Excel CSV thành công!');
    } catch (e) {
      console.error(e);
      showToast('Có lỗi xảy ra khi xuất file Excel: ' + e.message, 'error');
    }
  };

  const handleDownloadBackup = () => {
    try {
      exportJSONBackup();
      showToast('Đã tải tệp sao lưu dữ liệu (.JSON) về máy tính thành công!');
    } catch (e) {
      console.error(e);
      showToast('Lỗi khi tải tệp sao lưu JSON', 'error');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Group metadata */}
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
              Quỹ nhóm du lịch
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {group.duration || '2 ngày 1 đêm'}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {group.name || 'Chuyến đi dã ngoại'}
          </h1>
          {group.tripName && group.tripName !== group.name && (
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              {group.tripName}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 mt-2.5 text-xs text-slate-600">
            {group.location && (
              <span className="flex items-center gap-1 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate max-w-[200px]">{group.location}</span>
              </span>
            )}
            <span className="flex items-center gap-1 text-slate-700 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              {formatDate(group.startDate)} {group.endDate ? `— ${formatDate(group.endDate)}` : ''}
            </span>
            <span className="flex items-center gap-1 text-slate-700">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Thủ quỹ: <strong className="text-slate-900">{group.representative || 'Chưa chỉ định'}</strong>
            </span>
          </div>
        </div>

        {/* Right: Action buttons (Touch-friendly on mobile) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <button
            onClick={onOpenEditGroup}
            type="button"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl min-h-[38px] transition-colors"
            title="Chỉnh sửa thông tin chuyến đi & thủ quỹ"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Sửa thông tin</span>
          </button>

          <button
            onClick={onOpenGroupSwitcher}
            type="button"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl min-h-[38px] transition-colors"
            title="Chuyển đổi hoặc tạo chuyến đi mới"
          >
            <FolderSync className="w-3.5 h-3.5" />
            <span>Đổi chuyến</span>
          </button>

          <button
            onClick={handleExportCSV}
            type="button"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-xs min-h-[38px] transition-colors"
            title="Xuất toàn bộ bảng thu chi & quyết toán ra file Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={handleDownloadBackup}
            type="button"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl min-h-[38px] transition-colors"
            title="Lưu tệp sao lưu dữ liệu (.JSON) về máy tính của bạn"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sao lưu JSON</span>
          </button>

          <button
            onClick={onTriggerPrint}
            type="button"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 active:bg-black text-white text-xs font-semibold rounded-xl shadow-xs min-h-[38px] transition-colors"
            title="In ấn hoặc lưu file PDF mẫu quyết toán"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In quyết toán</span>
          </button>

          <button
            onClick={onResetDemo}
            type="button"
            className="inline-flex items-center justify-center gap-1 px-2.5 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:bg-slate-200 rounded-xl min-h-[38px] transition-colors"
            title="Khôi phục lại dữ liệu mẫu chuẩn"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium sm:hidden">Mẫu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
