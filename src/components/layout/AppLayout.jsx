import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import GroupSwitcherModal from '../groups/GroupSwitcherModal';
import { useApp } from '../../context/AppContext';

export default function AppLayout({ children, onOpenExpenseModal }) {
  const { isGroupSwitcherOpen, setIsGroupSwitcherOpen } = useApp();

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-10">
        <Header onOpenExpenseModal={onOpenExpenseModal} />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNav />

      {/* Group Switcher & Manager Modal */}
      <GroupSwitcherModal
        isOpen={isGroupSwitcherOpen}
        onClose={() => setIsGroupSwitcherOpen(false)}
      />
    </div>
  );
}
