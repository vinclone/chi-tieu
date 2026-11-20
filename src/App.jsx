import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AppProvider, useApp } from './context/AppContext';
import AppLayout from './components/layout/AppLayout';

import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import MembersPage from './pages/MembersPage';
import SettlementPage from './pages/SettlementPage';
import StatisticsPage from './pages/StatisticsPage';
import SettingsPage from './pages/SettingsPage';
import ExpenseFormModal from './components/expenses/ExpenseFormModal';
import CloudRoomModal from './components/fund/CloudRoomModal';

function AppContent() {
  const { activeTab, currentMembers, activeGroup, addExpenseInline, isRoomModalOpen, setIsRoomModalOpen } = useApp();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  return (
    <AppLayout onOpenExpenseModal={() => setIsExpenseModalOpen(true)}>
      {activeTab === 'dashboard' && (
        <DashboardPage
          onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
          onOpenMemberModal={() => setIsMemberModalOpen(true)}
        />
      )}

      {activeTab === 'expenses' && (
        <ExpensesPage
          isAddModalOpen={isExpenseModalOpen}
          setIsAddModalOpen={setIsExpenseModalOpen}
        />
      )}

      {activeTab === 'members' && (
        <MembersPage
          isAddModalOpen={isMemberModalOpen}
          setIsAddModalOpen={setIsMemberModalOpen}
        />
      )}

      {activeTab === 'settlement' && <SettlementPage />}

      {activeTab === 'statistics' && (
        <StatisticsPage
          onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
        />
      )}

      {activeTab === 'settings' && <SettingsPage />}

      {/* Global Easy Expense Modal triggered from Mobile Header */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        members={currentMembers}
        defaultRepresentative={activeGroup?.representative}
        onSave={(payload) => {
          addExpenseInline(payload);
        }}
      />

      {/* Cloud Room Modal for real-time Cloud Sharing */}
      <CloudRoomModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
      />
    </AppLayout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ToastProvider>
  );
}
