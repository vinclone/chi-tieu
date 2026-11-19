import React, { useState, useRef } from 'react';
import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Modal from '../components/common/Modal';
import { useApp } from '../context/AppContext';
import { storageService } from '../services/storageService';
import { exportService } from '../services/exportService';
import { useToast } from '../context/ToastContext';
import {
  Download,
  Upload,
  RotateCcw,
  Trash2,
  FileSpreadsheet,
  FolderGit2,
  FileCode2
} from 'lucide-react';

export default function SettingsPage() {
  const {
    data,
    activeGroup,
    currentMembers,
    currentExpenses,
    currentSettlements,
    updateGroup,
    resetToDemo,
    clearAllData,
    reloadData
  } = useApp();

  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  // Group edit form
  const [groupForm, setGroupForm] = useState({
    name: activeGroup?.name || '',
    location: activeGroup?.location || '',
    startDate: activeGroup?.startDate || '',
    endDate: activeGroup?.endDate || '',
    budget: activeGroup?.budget ? String(activeGroup.budget) : '',
    description: activeGroup?.description || ''
  });

  // Dialog states
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Import preview modal state
  const [importPreview, setImportPreview] = useState(null); // { parsedData, stats }
  const [importMode, setImportMode] = useState('replace'); // 'replace' | 'merge'

  const handleUpdateGroupInfo = (e) => {
    e.preventDefault();
    if (!groupForm.name.trim()) {
      showToast('Tên chuyến đi không được để trống', 'error');
      return;
    }
    updateGroup(activeGroup.id, {
      name: groupForm.name.trim(),
      location: groupForm.location.trim(),
      startDate: groupForm.startDate,
      endDate: groupForm.endDate,
      budget: Number(groupForm.budget) || 0,
      description: groupForm.description.trim()
    });
  };

  const handleExportJSON = () => {
    storageService.downloadJSONBackup(data);
    showToast('Đã tải xuống tệp sao lưu JSON!');
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      const validation = storageService.validateBackup(content);
      if (!validation.isValid) {
        showToast(validation.error, 'error');
        return;
      }
      try {
        const parsed = JSON.parse(content);
        setImportPreview({
          parsedData: parsed,
          stats: validation.stats
        });
      } catch (err) {
        showToast('Lỗi đọc nội dung tệp: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    // Reset file input so user can reselect same file if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;
    const applied = storageService.applyBackup(data, importPreview.parsedData, importMode);
    reloadData(applied);
    setImportPreview(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Cài đặt & Quản lý dữ liệu"
        subtitle="Tùy chỉnh thông tin chuyến đi, sao lưu, phục hồi và xuất báo cáo Excel"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Group Settings */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Thông tin chuyến đi hiện tại
              </h3>
              <p className="text-xs text-slate-400">Chỉnh sửa thông số của nhóm "{activeGroup?.name}"</p>
            </div>
          </div>

          <form onSubmit={handleUpdateGroupInfo} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tên chuyến đi / Nhóm
              </label>
              <input
                type="text"
                value={groupForm.name}
                onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Địa điểm
              </label>
              <input
                type="text"
                value={groupForm.location}
                onChange={(e) => setGroupForm({ ...groupForm, location: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={groupForm.startDate}
                  onChange={(e) => setGroupForm({ ...groupForm, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  value={groupForm.endDate}
                  onChange={(e) => setGroupForm({ ...groupForm, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ngân sách dự kiến (VNĐ)
              </label>
              <input
                type="number"
                min="0"
                step="50000"
                value={groupForm.budget}
                onChange={(e) => setGroupForm({ ...groupForm, budget: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mô tả
              </label>
              <textarea
                rows="2"
                value={groupForm.description}
                onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all active:scale-98"
            >
              Lưu thông tin chuyến đi
            </button>
          </form>
        </div>

        {/* Right Column: Backup, Restore & CSV Exports */}
        <div className="space-y-6">
          {/* JSON Backup & Restore Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileCode2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Sao lưu & Khôi phục dữ liệu (JSON)
                </h3>
                <p className="text-xs text-slate-400">Xuất file sao lưu hoặc nạp lại dữ liệu trên máy tính</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-all shadow-2xs"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Tải tệp sao lưu JSON</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-all shadow-2xs cursor-pointer">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Nạp dữ liệu từ JSON</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelected}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Mẫu chuyến đi dã ngoại có sẵn:</span>
              <a
                href="./data/mau_chuyen_di_ba_vi.json"
                download="mau_chuyen_di_ba_vi.json"
                className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải mẫu Ba Vì (.JSON)</span>
              </a>
            </div>
            <p className="text-[11px] text-slate-400">
              * Dữ liệu được lưu trữ tự động trong trình duyệt của bạn (LocalStorage) và không cần kết nối internet.
            </p>
          </div>

          {/* Excel / CSV Exports Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Xuất bảng tính Excel (CSV)
                </h3>
                <p className="text-xs text-slate-400">Hỗ trợ đầy đủ tiếng Việt UTF-8 hiển thị chuẩn trên Microsoft Excel</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => exportService.exportExpensesCSV(activeGroup, currentMembers, currentExpenses)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Xuất danh sách toàn bộ khoản chi tiêu</span>
                </div>
                <span className="text-slate-400 text-[11px] font-normal">.csv</span>
              </button>

              <button
                type="button"
                onClick={() => exportService.exportMembersSummaryCSV(activeGroup, currentMembers, currentExpenses, currentSettlements)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Xuất bảng tổng kết số dư thành viên</span>
                </div>
                <span className="text-slate-400 text-[11px] font-normal">.csv</span>
              </button>

              <button
                type="button"
                onClick={() => exportService.exportSettlementsCSV(activeGroup, currentMembers, currentSettlements)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Xuất lịch sử quyết toán & thanh toán</span>
                </div>
                <span className="text-slate-400 text-[11px] font-normal">.csv</span>
              </button>
            </div>
          </div>

          {/* Reset & Wipe Danger Zone */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm pb-2 border-b border-slate-100">
              Dữ liệu mẫu & Khôi phục hệ thống
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="w-full sm:w-1/2 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <span>Nạp lại dữ liệu mẫu Đà Lạt</span>
              </button>

              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(true)}
                className="w-full sm:w-1/2 flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa sạch toàn bộ dữ liệu</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetToDemo}
        title="Khôi phục dữ liệu mẫu chuyến đi Đà Lạt?"
        message="Hành động này sẽ thay thế dữ liệu hiện tại bằng bộ dữ liệu mẫu thực tế của Chuyến đi Đà Lạt 2026 (5 thành viên, 10 khoản chi đầy đủ danh mục)."
        confirmText="Nạp dữ liệu mẫu"
        type="warning"
      />

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={clearAllData}
        title="Xóa toàn bộ dữ liệu ứng dụng?"
        message="Hành động này sẽ xóa tất cả các nhóm, thành viên, chi tiêu và thanh toán hiện có. Ứng dụng sẽ trở về trạng thái trống ban đầu."
        confirmText="Xác nhận xóa sạch"
        type="danger"
      />

      {/* Import Preview Modal */}
      <Modal
        isOpen={!!importPreview}
        onClose={() => setImportPreview(null)}
        title="Xác nhận nạp tệp sao lưu JSON"
        maxWidth="max-w-lg"
      >
        {importPreview && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
              <span className="font-bold text-slate-800 block text-sm">
                Chi tiết tệp sao lưu:
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Số lượng nhóm: <strong className="text-slate-900">{importPreview.stats.groupCount}</strong></div>
                <div>Số thành viên: <strong className="text-slate-900">{importPreview.stats.memberCount}</strong></div>
                <div>Số khoản chi: <strong className="text-slate-900">{importPreview.stats.expenseCount}</strong></div>
                <div>Số giao dịch quyết toán: <strong className="text-slate-900">{importPreview.stats.settlementCount}</strong></div>
              </div>
            </div>

            {/* Strategy Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Cách xử lý dữ liệu:
              </label>
              <div className="space-y-2 text-xs">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors hover:bg-slate-50 border-slate-200">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Thay thế toàn bộ dữ liệu hiện tại</span>
                    <span className="text-slate-400">Xóa dữ liệu cũ và ghi đè hoàn toàn bằng dữ liệu từ tệp này.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors hover:bg-slate-50 border-slate-200">
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Gộp chung vào dữ liệu hiện có (Merge)</span>
                    <span className="text-slate-400">Giữ nguyên dữ liệu cũ, chỉ bổ sung các nhóm và khoản chi mới chưa trùng mã ID.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setImportPreview(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 active:scale-98"
              >
                Xác nhận nạp dữ liệu
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
