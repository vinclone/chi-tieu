/**
 * Cloud Storage Service
 * Provides multi-device persistent cloud storage and real-time room sharing for Group Trip Expense Manager.
 * Uses a zero-config, CORS-enabled hosted key-value cloud store (MantleDB) with LocalStorage offline caching.
 */

const CLOUD_API_BASE = 'https://mantledb.sh/v2/chitieu-app';
const LAST_ROOM_KEY = 'group_fund_last_cloud_room';

export const cloudStorageService = {
  /**
   * Normalize room code (uppercase, letters, numbers, hyphens)
   */
  normalizeRoomCode(code) {
    if (!code) return '';
    return String(code).trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '-');
  },

  /**
   * Generate a readable random room code, e.g., TRIP-7X49A
   */
  generateRoomCode(prefix = 'TRIP') {
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${rand}`;
  },

  /**
   * Get last active cloud room from local storage or URL query param
   */
  getActiveRoomCode() {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlRoom = params.get('room');
        if (urlRoom) {
          const norm = this.normalizeRoomCode(urlRoom);
          this.setLastRoomCode(norm);
          return norm;
        }
        return localStorage.getItem(LAST_ROOM_KEY) || '';
      }
    } catch {
      // ignore
    }
    return '';
  },

  /**
   * Save last active room code to local storage
   */
  setLastRoomCode(roomCode) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LAST_ROOM_KEY, this.normalizeRoomCode(roomCode));
      }
    } catch {
      // ignore
    }
  },

  /**
   * Build shareable link for a room
   */
  getShareableLink(roomCode) {
    const code = this.normalizeRoomCode(roomCode);
    if (typeof window === 'undefined') return `?room=${code}`;
    const url = new URL(window.location.href);
    url.searchParams.set('room', code);
    return url.toString();
  },

  /**
   * Save application trip state to Cloud
   */
  async saveToCloud(roomCode, data) {
    const code = this.normalizeRoomCode(roomCode);
    if (!code) {
      throw new Error('Mã chuyến đi (Room Code) không hợp lệ');
    }

    const payload = {
      version: 2,
      roomCode: code,
      activeGroupId: data.activeGroupId,
      groups: data.groups || [],
      members: data.members || [],
      expenses: data.expenses || [],
      settlements: data.settlements || [],
      updatedAt: new Date().toISOString()
    };

    const response = await fetch(`${CLOUD_API_BASE}/${encodeURIComponent(code)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Lỗi máy chủ lưu trữ đám mây (HTTP ${response.status})`);
    }

    this.setLastRoomCode(code);
    return payload;
  },

  /**
   * Load application trip state from Cloud
   */
  async loadFromCloud(roomCode) {
    const code = this.normalizeRoomCode(roomCode);
    if (!code) return null;

    try {
      const response = await fetch(`${CLOUD_API_BASE}/${encodeURIComponent(code)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.status === 404) {
        return null; // Room does not exist yet on cloud
      }

      if (!response.ok) {
        throw new Error(`Không thể kết nối máy chủ đám mây (HTTP ${response.status})`);
      }

      const parsed = await response.json();
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }

      // Ensure required collections are arrays
      if (!Array.isArray(parsed.groups)) parsed.groups = [];
      if (!Array.isArray(parsed.members)) parsed.members = [];
      if (!Array.isArray(parsed.expenses)) parsed.expenses = [];
      if (!Array.isArray(parsed.settlements)) parsed.settlements = [];

      this.setLastRoomCode(code);
      return parsed;
    } catch (err) {
      console.warn('Lỗi đọc dữ liệu từ đám mây:', err.message);
      throw err;
    }
  }
};
