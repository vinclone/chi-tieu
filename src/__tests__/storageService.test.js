import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../services/storageService';
import { INITIAL_DATA } from '../services/seedData';

// Polyfill localStorage for node environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = String(value); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
globalThis.localStorage = localStorageMock;

describe('Storage Service & JSON Backup / Restore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads seed data when storage is empty', () => {
    const data = storageService.loadData();
    expect(data.groups.length).toBeGreaterThan(0);
    expect(data.members).toHaveLength(0);
    expect(data.expenses).toHaveLength(0);
  });

  it('persists and retrieves updated state', () => {
    const customGroup = { id: 'custom_group_test', name: 'Nhóm Tùy Chỉnh' };
    const modified = {
      ...INITIAL_DATA,
      activeGroupId: 'custom_group_test',
      groups: [customGroup, ...INITIAL_DATA.groups]
    };
    storageService.saveData(modified);
    const loaded = storageService.loadData();
    expect(loaded.activeGroupId).toBe('custom_group_test');
  });

  it('heals orphan activeGroupId to first available group', () => {
    const orphanState = {
      ...INITIAL_DATA,
      activeGroupId: 'non_existent_orphan_id'
    };
    storageService.saveData(orphanState);
    const loaded = storageService.loadData();
    expect(loaded.activeGroupId).toBe(INITIAL_DATA.groups[0].id);
  });

  it('validates backup JSON and detects invalid schema', () => {
    const invalidJson = '{"notAValidBackup": true}';
    const res = storageService.validateBackup(invalidJson);
    expect(res.isValid).toBe(false);

    const validJson = JSON.stringify(INITIAL_DATA);
    const validRes = storageService.validateBackup(validJson);
    expect(validRes.isValid).toBe(true);
    expect(validRes.stats.groupCount).toBe(INITIAL_DATA.groups.length);
  });

  it('resets to demo data cleanly', () => {
    storageService.clearAll();
    const cleared = storageService.loadData();
    expect(cleared.expenses).toHaveLength(0);

    storageService.resetToDemoData();
    const restored = storageService.loadData();
    expect(restored.expenses.length).toBeGreaterThan(5);
  });
});
