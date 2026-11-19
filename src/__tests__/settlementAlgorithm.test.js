import { describe, it, expect } from 'vitest';
import { generateSettlementSuggestions, generateChatSummary } from '../utils/settlementAlgorithm';

describe('Settlement Optimization Algorithm (Min-Cash-Flow)', () => {
  const members = [
    { id: 'vinh', name: 'Vinh' },
    { id: 'minh', name: 'Minh' },
    { id: 'khoa', name: 'Khoa' },
    { id: 'huy', name: 'Huy' }
  ];

  it('optimizes transfers matching the prompt example exactly', () => {
    // Balances:
    // Vinh: +500,000
    // Minh: +200,000
    // Khoa: -400,000
    // Huy: -300,000
    // Total debts = 700,000
    // Simulated via expenses:
    // Vinh paid 500k, Minh paid 200k, Khoa owes 400k, Huy owes 300k
    const expenses = [
      {
        id: 'e1',
        amount: 500000,
        payerId: 'vinh',
        splits: [
          { memberId: 'khoa', amount: 300000 },
          { memberId: 'huy', amount: 200000 }
        ]
      },
      {
        id: 'e2',
        amount: 200000,
        payerId: 'minh',
        splits: [
          { memberId: 'khoa', amount: 100000 },
          { memberId: 'huy', amount: 100000 }
        ]
      }
    ];

    const suggestions = generateSettlementSuggestions(members, expenses, []);
    expect(suggestions.length).toBeGreaterThan(0);

    // Sum of suggested transfers must equal 700,000
    const totalTransferred = suggestions.reduce((sum, t) => sum + t.amount, 0);
    expect(totalTransferred).toBe(700000);

    // Check no self-transfers
    suggestions.forEach(t => {
      expect(t.fromMemberId).not.toBe(t.toMemberId);
      expect(t.amount).toBeGreaterThan(0);
    });

    // Khoa pays 400k total
    const khoaTransfers = suggestions.filter(t => t.fromMemberId === 'khoa');
    const khoaTotal = khoaTransfers.reduce((s, t) => s + t.amount, 0);
    expect(khoaTotal).toBe(400000);

    // Huy pays 300k total
    const huyTransfers = suggestions.filter(t => t.fromMemberId === 'huy');
    const huyTotal = huyTransfers.reduce((s, t) => s + t.amount, 0);
    expect(huyTotal).toBe(300000);

    // Vinh receives 500k total
    const vinhReceived = suggestions.filter(t => t.toMemberId === 'vinh').reduce((s, t) => s + t.amount, 0);
    expect(vinhReceived).toBe(500000);

    // Minh receives 200k total
    const minhReceived = suggestions.filter(t => t.toMemberId === 'minh').reduce((s, t) => s + t.amount, 0);
    expect(minhReceived).toBe(200000);
  });

  it('handles already settled groups with empty suggestions', () => {
    const expenses = [
      {
        id: 'e1',
        amount: 200000,
        payerId: 'vinh',
        splits: [{ memberId: 'vinh', amount: 200000 }]
      }
    ];
    const suggestions = generateSettlementSuggestions(members, expenses, []);
    expect(suggestions).toHaveLength(0);
  });

  it('generates friendly chat summary in Vietnamese', () => {
    const transfers = [
      { fromMemberId: 'khoa', toMemberId: 'vinh', amount: 400000 },
      { fromMemberId: 'huy', toMemberId: 'vinh', amount: 100000 },
      { fromMemberId: 'huy', toMemberId: 'minh', amount: 200000 }
    ];
    const text = generateChatSummary({ name: 'Đà Lạt Trip' }, members, transfers);
    expect(text).toContain('Đà Lạt Trip');
    expect(text).toContain('Khoa');
    expect(text).toContain('Huy');
    expect(text).toContain('400.000');
  });
});
