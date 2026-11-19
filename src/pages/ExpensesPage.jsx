import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import CommonExpenseTable from '../components/fund/CommonExpenseTable.jsx';
import PasteExpensesModal from '../components/fund/PasteExpensesModal.jsx';
import QuickTextInputModal from '../components/fund/QuickTextInputModal.jsx';
import ExpenseFormModal from '../components/expenses/ExpenseFormModal.jsx';
import { Receipt, ArrowLeft, Download, Plus, Sparkles, ClipboardPaste } from 'lucide-react';
import { formatCurrency } from '../utils/currency.js';
import { exportService } from '../services/exportService.js';
import { useToast } from '../context/ToastContext.jsx';

export default function ExpensesPage() {
  const {
    activeGroup,
    currentMembers,
    currentExpenses,
    fundSummary,
    addExpenseInline,
    updateExpenseInline,
    deleteExpenseInline,
    batchAddExpenses,
    setActiveTab
  } = useApp();

  const { showToast } = useToast();
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [isQuickTextModalOpen, setIsQuickTextModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  const handleExportCSV = () => {
    try {
      exportService.exportExpensesCSV(activeGroup, currentMembers, currentExpenses);
      showToast('Đã xuất danh sách chi tiêu ra tệp CSV Excel!');
    } catch (e) {
      showToast('Lỗi khi xuất file: ' + e.message, 'error');
    }
  };

  const handleSaveExpenseFromModal = (payload, id) => {
    if (id) {
      updateExpenseInline(id, payload);
    } else {
      addExpenseInline(payload);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="text-xs font-semibold text-slate-500 hover:text-rose-700 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại Bảng tổng quan
            </button>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-rose-700" />
            Bảng Chi Tiêu Chung Của Đoàn
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ghi nhận các hóa đơn, khoản chi ăn uống, di chuyển, vé tham quan thanh toán từ quỹ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Big easy button to open form */}
          <button
            type="button"
            onClick={() => {
              setExpenseToEdit(null);
              setIsFormModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors shadow-rose-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm khoản chi mới (Form)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsQuickTextModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-semibold rounded-xl transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Nhập nhanh chữ</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPasteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <ClipboardPaste className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Dán từ Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Tổng chi thực tế</span>
          <span className="text-lg sm:text-2xl font-bold text-rose-700 font-mono mt-0.5 block whitespace-nowrap">
            {formatCurrency(fundSummary.totalExpenses)}
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Số giao dịch chi</span>
          <span className="text-lg sm:text-2xl font-bold text-slate-900 font-mono mt-0.5 block whitespace-nowrap">
            {fundSummary.expenseCount} <span className="text-xs sm:text-sm font-sans font-normal text-slate-500">khoản</span>
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Chi phí bình quân</span>
          <span className="text-lg sm:text-2xl font-bold text-slate-900 font-mono mt-0.5 block whitespace-nowrap">
            {formatCurrency(fundSummary.costPerPerson)}
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] sm:text-xs text-slate-400 block font-medium">Đại diện thanh toán</span>
          <span className="text-sm sm:text-base font-bold text-slate-800 truncate block mt-1" title={activeGroup.representative}>
            {activeGroup.representative || 'Chưa chỉ định'}
          </span>
        </div>
      </div>

      {/* Full-width Common Expense Spreadsheet Table */}
      <div className="min-h-[580px] flex flex-col">
        <CommonExpenseTable
          expenses={currentExpenses}
          representative={activeGroup.representative}
          onAddExpense={addExpenseInline}
          onUpdateExpense={updateExpenseInline}
          onDeleteExpense={deleteExpenseInline}
          onOpenPasteModal={() => setIsPasteModalOpen(true)}
          onOpenQuickTextModal={() => setIsQuickTextModalOpen(true)}
          onOpenAddExpenseModal={() => {
            setExpenseToEdit(null);
            setIsFormModalOpen(true);
          }}
          onOpenEditExpenseModal={(expense) => {
            setExpenseToEdit(expense);
            setIsFormModalOpen(true);
          }}
        />
      </div>

      {/* Easy Expense Form Modal */}
      <ExpenseFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
        members={currentMembers}
        defaultRepresentative={activeGroup.representative}
        onSave={handleSaveExpenseFromModal}
      />

      {/* Paste Expenses Modal */}
      <PasteExpensesModal
        isOpen={isPasteModalOpen}
        onClose={() => setIsPasteModalOpen(false)}
        onConfirmBatch={batchAddExpenses}
        defaultRepresentative={activeGroup.representative}
      />

      {/* Quick Text Modal */}
      <QuickTextInputModal
        isOpen={isQuickTextModalOpen}
        onClose={() => setIsQuickTextModalOpen(false)}
        onConfirmBatch={batchAddExpenses}
        defaultRepresentative={activeGroup.representative}
      />
    </div>
  );
}
