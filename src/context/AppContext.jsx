import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { storageService } from '../services/storageService.js';
import { useToast } from './ToastContext.jsx';
import { calculateFundSummary, calculateMemberRefunds } from '../utils/fundCalculations.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { showToast } = useToast();
  const [data, setData] = useState(() => storageService.loadData());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGroupSwitcherOpen, setIsGroupSwitcherOpen] = useState(false);
  const [allocationType, setAllocationType] = useState('equal');
  const [customAllocations, setCustomAllocations] = useState({});

  // Auto-save to localStorage whenever data changes
  useEffect(() => {
    storageService.saveData(data);
  }, [data]);

  // Derived active group
  const activeGroup = useMemo(() => {
    const found = data.groups.find(g => g.id === data.activeGroupId);
    return found || data.groups[0] || null;
  }, [data.groups, data.activeGroupId]);

  // Derived active group's members
  const currentMembers = useMemo(() => {
    if (!activeGroup) return [];
    return data.members.filter(m => m.groupId === activeGroup.id);
  }, [data.members, activeGroup]);

  // Derived active group's expenses
  const currentExpenses = useMemo(() => {
    if (!activeGroup) return [];
    return data.expenses
      .filter(e => e.groupId === activeGroup.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data.expenses, activeGroup]);

  // Derived active group's settlements
  const currentSettlements = useMemo(() => {
    if (!activeGroup) return [];
    return (data.settlements || [])
      .filter(s => s.groupId === activeGroup.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [data.settlements, activeGroup]);

  // Derived financial summary of group fund
  const fundSummary = useMemo(() => {
    return calculateFundSummary(activeGroup, currentMembers, currentExpenses);
  }, [activeGroup, currentMembers, currentExpenses]);

  // Derived member refunds and net balances
  const memberRefunds = useMemo(() => {
    return calculateMemberRefunds(
      currentMembers,
      fundSummary.totalExpenses,
      allocationType,
      customAllocations
    );
  }, [currentMembers, fundSummary.totalExpenses, allocationType, customAllocations]);

  // --- Group actions ---
  const switchGroup = useCallback((groupId) => {
    setData(prev => ({ ...prev, activeGroupId: groupId }));
  }, []);

  const addGroup = useCallback((groupPayload) => {
    const newId = `group_${Date.now()}`;
    const newGroup = {
      id: newId,
      name: groupPayload.name,
      tripName: groupPayload.tripName || groupPayload.name,
      description: groupPayload.description || '',
      location: groupPayload.location || '',
      startDate: groupPayload.startDate || '',
      endDate: groupPayload.endDate || '',
      duration: groupPayload.duration || '2 ngày 1 đêm',
      representative: groupPayload.representative || 'Đại diện nhóm',
      plannedContribution: Number(groupPayload.plannedContribution) || 0,
      currency: 'VND',
      treasurerInfo: groupPayload.treasurerInfo || {
        name: groupPayload.representative || '',
        phone: '',
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        refundDeadline: '',
        note: ''
      },
      createdAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      groups: [...prev.groups, newGroup],
      activeGroupId: newId
    }));
    showToast(`Đã tạo chuyến đi "${newGroup.name}" thành công!`);
    return newGroup;
  }, [showToast]);

  const updateGroup = useCallback((groupId, updates) => {
    setData(prev => ({
      ...prev,
      groups: prev.groups.map(g => g.id === groupId ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g)
    }));
    showToast('Đã cập nhật thông tin chuyến đi!');
  }, [showToast]);

  const updateTreasurerInfo = useCallback((treasurerInfo) => {
    if (!activeGroup) return;
    updateGroup(activeGroup.id, {
      treasurerInfo: {
        ...(activeGroup.treasurerInfo || {}),
        ...treasurerInfo
      }
    });
  }, [activeGroup, updateGroup]);

  const deleteGroup = useCallback((groupId) => {
    setData(prev => {
      const remainingGroups = prev.groups.filter(g => g.id !== groupId);
      const newActiveId = prev.activeGroupId === groupId ? (remainingGroups[0]?.id || '') : prev.activeGroupId;
      return {
        ...prev,
        groups: remainingGroups,
        activeGroupId: newActiveId,
        members: prev.members.filter(m => m.groupId !== groupId),
        expenses: prev.expenses.filter(e => e.groupId !== groupId),
        settlements: (prev.settlements || []).filter(s => s.groupId !== groupId)
      };
    });
    showToast('Đã xóa chuyến đi và toàn bộ dữ liệu liên quan.');
  }, [showToast]);

  // --- Inline & Fast Member Actions ---
  const addMemberInline = useCallback((memberPayload) => {
    if (!activeGroup) return null;
    const planned = activeGroup.plannedContribution || 0;
    const contribution = memberPayload.contributionAmount !== undefined 
      ? Number(memberPayload.contributionAmount) 
      : planned;

    const newMember = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      groupId: activeGroup.id,
      name: (memberPayload.name || 'Thành viên mới').trim(),
      nickname: memberPayload.nickname || memberPayload.name?.trim().split(' ').pop() || '',
      phone: memberPayload.phone || '',
      bankName: memberPayload.bankName || '',
      bankAccount: memberPayload.bankAccount || '',
      contributionAmount: contribution,
      paidAmount: memberPayload.paidAmount !== undefined 
        ? Number(memberPayload.paidAmount) 
        : (memberPayload.paymentStatus === 'unpaid' ? 0 : contribution),
      paymentStatus: memberPayload.paymentStatus || 'paid',
      paymentNote: memberPayload.paymentNote || '',
      refundStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
    showToast(`Đã thêm thành viên "${newMember.name}"!`);
    return newMember;
  }, [activeGroup, showToast]);

  const updateMemberInline = useCallback((memberId, updates) => {
    setData(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === memberId ? { ...m, ...updates } : m)
    }));
  }, []);

  const deleteMemberInline = useCallback((memberId) => {
    setData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId)
    }));
    showToast('Đã xóa thành viên.');
  }, [showToast]);

  const batchAddMembers = useCallback((membersList) => {
    if (!activeGroup || !Array.isArray(membersList) || membersList.length === 0) return;
    const newMembers = membersList.map((m, idx) => ({
      id: `mem_batch_${Date.now()}_${idx}`,
      groupId: activeGroup.id,
      name: m.name.trim(),
      nickname: m.nickname || m.name.trim().split(' ').pop(),
      phone: m.phone || '',
      bankName: m.bankName || '',
      bankAccount: m.bankAccount || '',
      contributionAmount: Number(m.contributionAmount) || activeGroup.plannedContribution || 0,
      paidAmount: m.paidAmount !== undefined ? Number(m.paidAmount) : (Number(m.contributionAmount) || activeGroup.plannedContribution || 0),
      paymentStatus: m.paymentStatus || 'paid',
      paymentNote: m.paymentNote || '',
      refundStatus: 'pending',
      createdAt: new Date().toISOString()
    }));

    setData(prev => ({
      ...prev,
      members: [...prev.members, ...newMembers]
    }));
    showToast(`Đã nhập thành công ${newMembers.length} thành viên!`);
  }, [activeGroup, showToast]);

  const updateMemberRefundStatus = useCallback((memberId, refundStatus) => {
    setData(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === memberId ? { ...m, refundStatus } : m)
    }));
    showToast('Đã cập nhật trạng thái hoàn tiền!');
  }, [showToast]);

  // --- Inline & Fast Expense Actions ---
  const addExpenseInline = useCallback((expensePayload) => {
    if (!activeGroup) return null;
    const newExpense = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      groupId: activeGroup.id,
      description: (expensePayload.description || expensePayload.title || '').trim(),
      title: (expensePayload.description || expensePayload.title || '').trim(),
      amount: Math.round(Number(expensePayload.amount) || 0),
      date: expensePayload.date || new Date().toISOString().split('T')[0],
      representative: expensePayload.representative || activeGroup.representative || 'Đại diện nhóm',
      category: expensePayload.category || 'other',
      note: expensePayload.note || '',
      createdAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses]
    }));
    showToast(`Đã thêm khoản chi "${newExpense.description}"!`);
    return newExpense;
  }, [activeGroup, showToast]);

  const updateExpenseInline = useCallback((expenseId, updates) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.id === expenseId ? {
        ...e,
        ...updates,
        amount: updates.amount !== undefined ? Math.round(Number(updates.amount)) : e.amount,
        description: updates.description || updates.title || e.description || e.title,
        title: updates.description || updates.title || e.description || e.title,
        updatedAt: new Date().toISOString()
      } : e)
    }));
  }, []);

  const deleteExpenseInline = useCallback((expenseId) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== expenseId)
    }));
    showToast('Đã xóa khoản chi tiêu.');
  }, [showToast]);

  const batchAddExpenses = useCallback((expensesList) => {
    if (!activeGroup || !Array.isArray(expensesList) || expensesList.length === 0) return;
    const newExpenses = expensesList.map((e, idx) => ({
      id: `exp_batch_${Date.now()}_${idx}`,
      groupId: activeGroup.id,
      date: e.date || new Date().toISOString().split('T')[0],
      description: (e.description || e.title || 'Khoản chi').trim(),
      title: (e.description || e.title || 'Khoản chi').trim(),
      amount: Math.round(Number(e.amount) || 0),
      representative: e.representative || activeGroup.representative || 'Đại diện nhóm',
      category: e.category || 'other',
      note: e.note || '',
      createdAt: new Date().toISOString()
    }));

    setData(prev => ({
      ...prev,
      expenses: [...newExpenses, ...prev.expenses]
    }));
    showToast(`Đã thêm thành công ${newExpenses.length} khoản chi!`);
  }, [activeGroup, showToast]);

  const archiveGroup = useCallback((groupId) => {
    setData(prev => ({
      ...prev,
      groups: prev.groups.map(g => g.id === groupId ? { ...g, isArchived: !g.isArchived } : g)
    }));
    showToast('Đã thay đổi trạng thái lưu trữ của chuyến đi.');
  }, [showToast]);

  const duplicateExpense = useCallback((expenseId) => {
    const target = data.expenses.find(e => e.id === expenseId);
    if (!target) return;
    const duplicated = {
      ...target,
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      description: `${target.description || target.title} (Bản sao)`,
      title: `${target.description || target.title} (Bản sao)`,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      expenses: [duplicated, ...prev.expenses]
    }));
    showToast(`Đã nhân bản khoản chi "${duplicated.description}"!`);
  }, [data.expenses, showToast]);

  const bulkDeleteExpenses = useCallback((expenseIds) => {
    const idsSet = new Set(expenseIds);
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => !idsSet.has(e.id))
    }));
    showToast(`Đã xóa ${expenseIds.length} khoản chi.`);
  }, [showToast]);

  const addSettlement = useCallback((settlementPayload) => {
    if (!activeGroup) return null;
    const newSettlement = {
      id: `set_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      groupId: activeGroup.id,
      fromMemberId: settlementPayload.fromMemberId,
      toMemberId: settlementPayload.toMemberId,
      amount: Math.round(Number(settlementPayload.amount)),
      paidAmount: Math.round(Number(settlementPayload.paidAmount || settlementPayload.amount)),
      paymentMethod: settlementPayload.paymentMethod || 'bank_transfer',
      date: settlementPayload.date || new Date().toISOString().split('T')[0],
      status: 'paid',
      note: settlementPayload.note || '',
      createdAt: new Date().toISOString()
    };

    setData(prev => ({
      ...prev,
      settlements: [newSettlement, ...(prev.settlements || [])]
    }));
    showToast('Đã ghi nhận thanh toán quyết toán thành công!');
    return newSettlement;
  }, [activeGroup, showToast]);

  const updateSettlement = useCallback((settlementId, updates) => {
    setData(prev => ({
      ...prev,
      settlements: (prev.settlements || []).map(s => s.id === settlementId ? {
        ...s,
        ...updates,
        amount: updates.amount !== undefined ? Math.round(Number(updates.amount)) : s.amount
      } : s)
    }));
    showToast('Đã cập nhật khoản quyết toán!');
  }, [showToast]);

  const deleteSettlement = useCallback((settlementId) => {
    setData(prev => ({
      ...prev,
      settlements: (prev.settlements || []).filter(s => s.id !== settlementId)
    }));
    showToast('Đã hủy khoản quyết toán.');
  }, [showToast]);

  // --- Reset & System actions ---
  const resetToDemo = useCallback(() => {
    const fresh = storageService.resetToDemoData();
    setData(fresh);
    showToast('Đã khôi phục dữ liệu mẫu chuyến đi Dã ngoại Cuối tuần thành công!');
  }, [showToast]);

  const clearAllData = useCallback(() => {
    const fresh = storageService.clearAll();
    setData(fresh);
    showToast('Đã xóa toàn bộ dữ liệu và tạo chuyến đi mới.');
  }, [showToast]);

  const reloadData = useCallback((newData) => {
    setData(newData);
    showToast('Dữ liệu đã được nạp thành công!');
  }, [showToast]);

  const value = {
    data,
    activeGroup,
    currentMembers,
    currentExpenses,
    currentSettlements,
    fundSummary,
    memberRefunds,
    allocationType,
    setAllocationType,
    customAllocations,
    setCustomAllocations,
    activeTab,
    setActiveTab,
    isGroupSwitcherOpen,
    setIsGroupSwitcherOpen,
    switchGroup,
    addGroup,
    updateGroup,
    deleteGroup,
    archiveGroup,
    updateTreasurerInfo,
    addMemberInline,
    updateMemberInline,
    deleteMemberInline,
    addMember: addMemberInline,
    updateMember: updateMemberInline,
    removeMember: deleteMemberInline,
    batchAddMembers,
    updateMemberRefundStatus,
    addExpenseInline,
    updateExpenseInline,
    deleteExpenseInline,
    addExpense: addExpenseInline,
    updateExpense: updateExpenseInline,
    deleteExpense: deleteExpenseInline,
    duplicateExpense,
    bulkDeleteExpenses,
    batchAddExpenses,
    addSettlement,
    updateSettlement,
    deleteSettlement,
    resetToDemo,
    clearAllData,
    reloadData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
