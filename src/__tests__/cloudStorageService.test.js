import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cloudStorageService } from '../services/cloudStorageService.js';

describe('cloudStorageService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('normalizes room code to uppercase alphanumeric with hyphens', () => {
    expect(cloudStorageService.normalizeRoomCode('  dalat trip 2026!  ')).toBe('DALAT-TRIP-2026-');
    expect(cloudStorageService.normalizeRoomCode('trip_123')).toBe('TRIP_123');
    expect(cloudStorageService.normalizeRoomCode('')).toBe('');
    expect(cloudStorageService.normalizeRoomCode(null)).toBe('');
  });

  it('generates a random room code with default TRIP prefix', () => {
    const code = cloudStorageService.generateRoomCode();
    expect(code).toMatch(/^TRIP-[A-Z0-9]{5}$/);
  });

  it('saves payload to cloud via POST request', async () => {
    const mockData = {
      activeGroupId: 'grp1',
      groups: [{ id: 'grp1', name: 'Ba Vì' }],
      members: [{ id: 'm1', name: 'An' }],
      expenses: [{ id: 'e1', amount: 500000 }]
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true })
    });

    const result = await cloudStorageService.saveToCloud('TRIP-ABC', mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://mantledb.sh/v2/chitieu-app/TRIP-ABC',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
    expect(result.roomCode).toBe('TRIP-ABC');
    expect(result.groups).toHaveLength(1);
  });

  it('loads payload from cloud via GET request', async () => {
    const cloudPayload = {
      version: 2,
      roomCode: 'TRIP-ABC',
      groups: [{ id: 'grp1', name: 'Đà Lạt' }],
      members: [],
      expenses: [],
      settlements: []
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => cloudPayload
    });

    const result = await cloudStorageService.loadFromCloud('TRIP-ABC');
    expect(result).toEqual(cloudPayload);
  });

  it('returns null if cloud returns 404 (room not found)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const result = await cloudStorageService.loadFromCloud('NON-EXISTENT');
    expect(result).toBeNull();
  });
});
