/**
 * Centralized LocalStorage Service
 * Handles persistence, versioning, error recovery, JSON import/export, and demo data reset.
 */

import { INITIAL_DATA, DEMO_DATA } from './seedData.js';
import { validateImportedData } from '../utils/validators.js';

const STORAGE_KEY = 'group_fund_manager_v3';
const LEGACY_KEY = 'group_fund_manager_v2';

export const storageService = {
  /**
   * Load entire application state from LocalStorage
   */
  loadData() {
    try {
      let serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        // Check if legacy key exists and is non-empty
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy) {
          try {
            const parsedLegacy = JSON.parse(legacy);
            if (parsedLegacy && Array.isArray(parsedLegacy.groups) && parsedLegacy.groups.length > 0) {
              // Migrate legacy or initialize v2
              localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
              return INITIAL_DATA;
            }
          } catch {
            // ignore
          }
        }
        this.saveData(INITIAL_DATA);
        return INITIAL_DATA;
      }

      const parsed = JSON.parse(serialized);

      // Basic structure validation
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.groups)) {
        console.warn('Dữ liệu lưu trữ bị lỗi cấu trúc, khôi phục dữ liệu mẫu ban đầu.');
        this.saveData(INITIAL_DATA);
        return INITIAL_DATA;
      }

      // Ensure all arrays exist
      if (!Array.isArray(parsed.members)) parsed.members = [];
      if (!Array.isArray(parsed.expenses)) parsed.expenses = [];
      if (!Array.isArray(parsed.settlements)) parsed.settlements = [];

      // Ensure activeGroupId is valid and exists in groups
      const hasActiveGroup = parsed.groups.some(g => g.id === parsed.activeGroupId);
      if (!hasActiveGroup && parsed.groups.length > 0) {
        parsed.activeGroupId = parsed.groups[0].id;
      }

      return parsed;
    } catch (err) {
      console.error('Không thể đọc dữ liệu từ LocalStorage:', err);
      return INITIAL_DATA;
    }
  },

  /**
   * Persist state to LocalStorage
   */
  saveData(data) {
    try {
      const payload = {
        version: 2,
        activeGroupId: data.activeGroupId,
        groups: data.groups || [],
        members: data.members || [],
        expenses: data.expenses || [],
        settlements: data.settlements || [],
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (err) {
      console.error('Không thể ghi dữ liệu vào LocalStorage:', err);
      return false;
    }
  },

  /**
   * Reset application state to initial demo data
   */
  resetToDemoData() {
    this.saveData(DEMO_DATA);
    return DEMO_DATA;
  },

  /**
   * Clear all application data and start fresh
   */
  clearAll() {
    const blankData = {
      version: 2,
      activeGroupId: 'group_new_default',
      groups: [
        {
          id: 'group_new_default',
          name: 'Chuyến đi mới',
          tripName: 'Chuyến đi dã ngoại mới',
          location: '',
          startDate: '',
          endDate: '',
          duration: '1 ngày',
          representative: 'Trưởng nhóm',
          plannedContribution: 0,
          description: 'Chuyến đi chưa có chi phí',
          treasurerInfo: {
            name: '',
            phone: '',
            bankName: '',
            accountNumber: '',
            accountHolder: '',
            refundDeadline: '',
            note: ''
          },
          createdAt: new Date().toISOString()
        }
      ],
      members: [],
      expenses: [],
      settlements: []
    };
    this.saveData(blankData);
    return blankData;
  },

  /**
   * Generate downloadable JSON file blob and trigger browser download
   */
  downloadJSONBackup(data) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    link.href = url;
    link.download = `sao-luu-chi-tieu-quy-nhom-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Parse and validate imported JSON file content
   */
  validateBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      return validateImportedData(parsed);
    } catch (e) {
      return { isValid: false, error: 'Tệp không phải định dạng JSON hợp lệ: ' + e.message };
    }
  },

  /**
   * Apply imported backup data with 'replace' or 'merge' strategy
   */
  applyBackup(currentData, importedData, mode = 'replace') {
    if (mode === 'replace') {
      const groups = importedData.groups || [];
      const validActiveId = groups.some(g => g.id === importedData.activeGroupId)
        ? importedData.activeGroupId
        : (groups[0]?.id || null);

      const validated = {
        version: 2,
        activeGroupId: validActiveId,
        groups,
        members: importedData.members || [],
        expenses: importedData.expenses || [],
        settlements: importedData.settlements || []
      };
      this.saveData(validated);
      return validated;
    }

    // Merge mode: append without duplicates
    const existingGroupIds = new Set(currentData.groups.map(g => g.id));
    const newGroups = (importedData.groups || []).filter(g => !existingGroupIds.has(g.id));

    const existingMemberIds = new Set(currentData.members.map(m => m.id));
    const newMembers = (importedData.members || []).filter(m => !existingMemberIds.has(m.id));

    const existingExpenseIds = new Set(currentData.expenses.map(e => e.id));
    const newExpenses = (importedData.expenses || []).filter(e => !existingExpenseIds.has(e.id));

    const existingSettlementIds = new Set(currentData.settlements.map(s => s.id));
    const newSettlements = (importedData.settlements || []).filter(s => !existingSettlementIds.has(s.id));

    const merged = {
      version: 2,
      activeGroupId: currentData.activeGroupId,
      groups: [...currentData.groups, ...newGroups],
      members: [...currentData.members, ...newMembers],
      expenses: [...currentData.expenses, ...newExpenses],
      settlements: [...currentData.settlements, ...newSettlements]
    };

    this.saveData(merged);
    return merged;
  }
};
