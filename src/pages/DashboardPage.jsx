import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import FinancialOverviewCards from '../components/fund/FinancialOverviewCards.jsx';
import GroupInfoBar from '../components/fund/GroupInfoBar.jsx';
import MemberContributionTable from '../components/fund/MemberContributionTable.jsx';
import CommonExpenseTable from '../components/fund/CommonExpenseTable.jsx';
import SettlementRefundTable from '../components/fund/SettlementRefundTable.jsx';
import TreasurerInfoCard from '../components/fund/TreasurerInfoCard.jsx';
import PasteExpensesModal from '../components/fund/PasteExpensesModal.jsx';
import PasteMembersModal from '../components/fund/PasteMembersModal.jsx';
import QuickTextInputModal from '../components/fund/QuickTextInputModal.jsx';
import GroupEditModal from '../components/fund/GroupEditModal.jsx';
import PrintableSettlementReport from '../components/fund/PrintableSettlementReport.jsx';
import GroupSwitcherModal from '../components/groups/GroupSwitcherModal.jsx';
import ExpenseFormModal from '../components/expenses/ExpenseFormModal.jsx';
import { Users, Receipt, Coins, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/currency.js';

export default function DashboardPage() {
  const {
    activeGroup,
    currentMembers,
    currentExpenses,
    fundSummary,
    memberRefunds,
    allocationType,
    setAllocationType,
    customAllocations,
    setCustomAllocations,
    addExpenseInline,
    updateExpenseInline,
    deleteExpenseInline,
    batchAddExpenses,
    addMemberInline,
    updateMemberInline,
    deleteMemberInline,
    batchAddMembers,
    updateMemberRefundStatus,
    updateTreasurerInfo,
    updateGroup,
    resetToDemo,
    isGroupSwitcherOpen,
    setIsGroupSwitcherOpen,
    setActiveTab
  } = useApp();

  // Modal dialog states
  const [isPasteExpensesOpen, setIsPasteExpensesOpen] = useState(false);
  const [isPasteMembersOpen, setIsPasteMembersOpen] = useState(false);
  const [isQuickTextOpen, setIsQuickTextOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  const handleCustomAllocationChange = (memberId, amount) => {
    setCustomAllocations(prev => ({
      ...prev,
      [memberId]: amount
    }));
  };

  if (!activeGroup) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p>Đang tải thông tin chuyến đi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. Group Information Header & Actions */}
      <GroupInfoBar
        group={activeGroup}
        members={currentMembers}
        expenses={currentExpenses}
        fundSummary={fundSummary}
        refunds={memberRefunds}
        onOpenEditGroup={() => setIsEditGroupOpen(true)}
        onOpenGroupSwitcher={() => setIsGroupSwitcherOpen(true)}
        onResetDemo={resetToDemo}
        onTriggerPrint={() => setIsPrintReportOpen(true)}
      />

      {/* 2. Top Financial Summary Cards */}
      <FinancialOverviewCards
        fundSummary={fundSummary}
        group={activeGroup}
      />

      {/* 3. Quick Navigation Cards to Dedicated Pages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('members')}
          className="p-4 bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl shadow-xs transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Trang chuyên biệt</span>
              <strong className="text-sm text-slate-900 group-hover:text-emerald-800 transition-colors">
                Đóng Góp Thành Viên
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">{currentMembers.length} người • Đã thu {formatCurrency(fundSummary.totalCollected)}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          className="p-4 bg-white hover:bg-rose-50/50 border border-slate-200 hover:border-rose-300 rounded-xl shadow-xs transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-800 rounded-xl group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Trang chuyên biệt</span>
              <strong className="text-sm text-slate-900 group-hover:text-rose-800 transition-colors">
                Bảng Chi Tiêu Đoàn
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">{currentExpenses.length} khoản chi • Đã chi {formatCurrency(fundSummary.totalExpenses)}</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-700 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settlement')}
          className="p-4 bg-white hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 rounded-xl shadow-xs transition-all text-left flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-100 text-teal-800 rounded-xl group-hover:scale-105 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Trang chuyên biệt</span>
              <strong className="text-sm text-slate-900 group-hover:text-teal-800 transition-colors">
                Quyết Toán & Hoàn Tiền
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">Dư: {formatCurrency(fundSummary.remainingFund)} • Hoàn {formatCurrency(fundSummary.refundPerPerson)}/người</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* 4. Middle Spreadsheet Row: Member Contributions (Left) & Common Expenses (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Member Contribution Table (5 cols on xl) */}
        <div className="xl:col-span-5 h-[620px] flex flex-col">
          <MemberContributionTable
            members={currentMembers}
            plannedContribution={activeGroup.plannedContribution}
            onAddMember={addMemberInline}
            onUpdateMember={updateMemberInline}
            onDeleteMember={deleteMemberInline}
            onOpenPasteModal={() => setIsPasteMembersOpen(true)}
          />
        </div>

        {/* Right Column: Common Expense Table (7 cols on xl) */}
        <div className="xl:col-span-7 h-[620px] flex flex-col">
          <CommonExpenseTable
            expenses={currentExpenses}
            representative={activeGroup.representative}
            onAddExpense={addExpenseInline}
            onUpdateExpense={updateExpenseInline}
            onDeleteExpense={deleteExpenseInline}
            onOpenPasteModal={() => setIsPasteExpensesOpen(true)}
            onOpenQuickTextModal={() => setIsQuickTextOpen(true)}
            onOpenAddExpenseModal={() => {
              setExpenseToEdit(null);
              setIsExpenseFormOpen(true);
            }}
            onOpenEditExpenseModal={(expense) => {
              setExpenseToEdit(expense);
              setIsExpenseFormOpen(true);
            }}
          />
        </div>
      </div>

      {/* 5. Bottom Spreadsheet Row: Final Settlement & Refunds (Left) & Treasurer Info (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Settlement & Refunds (8 cols on xl) */}
        <div className="xl:col-span-8 min-h-[380px] flex flex-col">
          <SettlementRefundTable
            refunds={memberRefunds}
            allocationType={allocationType}
            onAllocationTypeChange={setAllocationType}
            customAllocations={customAllocations}
            onCustomAllocationChange={handleCustomAllocationChange}
            onUpdateRefundStatus={updateMemberRefundStatus}
            onUpdateMember={updateMemberInline}
          />
        </div>

        {/* Right Column: Treasurer Contact & Bank Information (4 cols on xl) */}
        <div className="xl:col-span-4 min-h-[380px] flex flex-col">
          <TreasurerInfoCard
            group={activeGroup}
            onUpdateTreasurer={updateTreasurerInfo}
          />
        </div>
      </div>

      {/* --- Modals --- */}
      {/* Easy Expense Form Modal */}
      <ExpenseFormModal
        isOpen={isExpenseFormOpen}
        onClose={() => {
          setIsExpenseFormOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
        members={currentMembers}
        defaultRepresentative={activeGroup.representative}
        onSave={(payload, id) => {
          if (id) {
            updateExpenseInline(id, payload);
          } else {
            addExpenseInline(payload);
          }
        }}
      />

      {/* Paste Expenses Modal */}
      <PasteExpensesModal
        isOpen={isPasteExpensesOpen}
        onClose={() => setIsPasteExpensesOpen(false)}
        onConfirmBatch={batchAddExpenses}
        defaultRepresentative={activeGroup.representative}
      />

      {/* Paste Members Modal */}
      <PasteMembersModal
        isOpen={isPasteMembersOpen}
        onClose={() => setIsPasteMembersOpen(false)}
        onConfirmBatch={batchAddMembers}
        defaultContribution={activeGroup.plannedContribution}
      />

      {/* Natural Language Quick Text Modal */}
      <QuickTextInputModal
        isOpen={isQuickTextOpen}
        onClose={() => setIsQuickTextOpen(false)}
        onConfirmBatch={batchAddExpenses}
        defaultRepresentative={activeGroup.representative}
      />

      {/* Group Information Edit Modal */}
      <GroupEditModal
        isOpen={isEditGroupOpen}
        onClose={() => setIsEditGroupOpen(false)}
        group={activeGroup}
        onSaveGroup={updateGroup}
      />

      {/* Printable Settlement Report Modal */}
      <PrintableSettlementReport
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        group={activeGroup}
        members={currentMembers}
        expenses={currentExpenses}
        fundSummary={fundSummary}
        refunds={memberRefunds}
      />

      {/* Group Switcher Modal */}
      <GroupSwitcherModal
        isOpen={isGroupSwitcherOpen}
        onClose={() => setIsGroupSwitcherOpen(false)}
      />
    </div>
  );
}
