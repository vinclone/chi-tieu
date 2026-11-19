import { describe, it, expect } from 'vitest';
import {
  calculateExpenseShares,
  calculateMemberPaidTotal,
  calculateMemberShareTotal,
  calculateMemberBalance,
  calculateMemberStatistics,
  verifyReconciliation
} from '../utils/calculations';

describe('Financial Calculation Core', () => {
  describe('calculateExpenseShares', () => {
    it('divides equally with exact division', () => {
      const res = calculateExpenseShares(600000, 'equal', ['m1', 'm2', 'm3']);
      expect(res.valid).toBe(true);
      expect(res.splits).toHaveLength(3);
      expect(res.splits[0].amount).toBe(200000);
      expect(res.splits[1].amount).toBe(200000);
      expect(res.splits[2].amount).toBe(200000);
      const total = res.splits.reduce((acc, s) => acc + s.amount, 0);
      expect(total).toBe(600000);
    });

    it('divides equally with rounding remainder distributed exactly to 1 VND', () => {
      // 100,000 / 3 = 33,333 remainder 1
      const res = calculateExpenseShares(100000, 'equal', ['m1', 'm2', 'm3']);
      expect(res.valid).toBe(true);
      expect(res.splits[0].amount).toBe(33334);
      expect(res.splits[1].amount).toBe(33333);
      expect(res.splits[2].amount).toBe(33333);
      const sum = res.splits.reduce((acc, s) => acc + s.amount, 0);
      expect(sum).toBe(100000);
    });

    it('handles custom split valid and invalid sums', () => {
      const validCustom = calculateExpenseShares(600000, 'custom', ['m1', 'm2', 'm3'], {
        customAmounts: { m1: 250000, m2: 200000, m3: 150000 }
      });
      expect(validCustom.valid).toBe(true);
      expect(validCustom.difference).toBe(0);

      const invalidCustom = calculateExpenseShares(600000, 'custom', ['m1', 'm2', 'm3'], {
        customAmounts: { m1: 250000, m2: 200000, m3: 100000 }
      });
      expect(invalidCustom.valid).toBe(false);
      expect(invalidCustom.difference).toBe(50000);
    });

    it('handles percentage split with exact 100% and rounding adjustment', () => {
      const res = calculateExpenseShares(1000000, 'percentage', ['m1', 'm2', 'm3'], {
        percentages: { m1: 50, m2: 30, m3: 20 }
      });
      expect(res.valid).toBe(true);
      expect(res.splits[0].amount).toBe(500000);
      expect(res.splits[1].amount).toBe(300000);
      expect(res.splits[2].amount).toBe(200000);
      const sum = res.splits.reduce((acc, s) => acc + s.amount, 0);
      expect(sum).toBe(1000000);
    });

    it('handles weighted split with proportions and remainder distribution', () => {
      // Total 400,000; weights 2, 1, 1 (total weights = 4)
      const res = calculateExpenseShares(400000, 'weighted', ['m1', 'm2', 'm3'], {
        weights: { m1: 2, m2: 1, m3: 1 }
      });
      expect(res.valid).toBe(true);
      expect(res.splits[0].amount).toBe(200000);
      expect(res.splits[1].amount).toBe(100000);
      expect(res.splits[2].amount).toBe(100000);
      const sum = res.splits.reduce((acc, s) => acc + s.amount, 0);
      expect(sum).toBe(400000);
    });

    it('handles expense with only two participants and excluding payer', () => {
      // Payer is m1, but participants are m2 and m3
      const res = calculateExpenseShares(300000, 'equal', ['m2', 'm3']);
      expect(res.valid).toBe(true);
      expect(res.splits).toHaveLength(2);
      expect(res.splits.find(s => s.memberId === 'm2').amount).toBe(150000);
      expect(res.splits.find(s => s.memberId === 'm3').amount).toBe(150000);
    });
  });

  describe('Member balance and reconciliation', () => {
    const sampleMembers = [
      { id: 'm1', name: 'Vinh' },
      { id: 'm2', name: 'Minh' },
      { id: 'm3', name: 'Khoa' }
    ];

    const sampleExpenses = [
      {
        id: 'e1',
        amount: 300000,
        payerId: 'm1',
        participantIds: ['m1', 'm2', 'm3'],
        splits: [
          { memberId: 'm1', amount: 100000 },
          { memberId: 'm2', amount: 100000 },
          { memberId: 'm3', amount: 100000 }
        ]
      },
      {
        id: 'e2',
        amount: 150000,
        payerId: 'm2',
        participantIds: ['m2', 'm3'],
        splits: [
          { memberId: 'm2', amount: 75000 },
          { memberId: 'm3', amount: 75000 }
        ]
      }
    ];

    it('calculates total paid and total share correctly', () => {
      expect(calculateMemberPaidTotal('m1', sampleExpenses)).toBe(300000);
      expect(calculateMemberPaidTotal('m2', sampleExpenses)).toBe(150000);
      expect(calculateMemberPaidTotal('m3', sampleExpenses)).toBe(0);

      expect(calculateMemberShareTotal('m1', sampleExpenses)).toBe(100000);
      expect(calculateMemberShareTotal('m2', sampleExpenses)).toBe(175000);
      expect(calculateMemberShareTotal('m3', sampleExpenses)).toBe(175000);
    });

    it('calculates net balances without settlements', () => {
      // m1: paid 300k, share 100k => +200k (owed)
      // m2: paid 150k, share 175k => -25k (owes)
      // m3: paid 0, share 175k => -175k (owes)
      expect(calculateMemberBalance('m1', sampleExpenses, [])).toBe(200000);
      expect(calculateMemberBalance('m2', sampleExpenses, [])).toBe(-25000);
      expect(calculateMemberBalance('m3', sampleExpenses, [])).toBe(-175000);

      const sum = 200000 - 25000 - 175000;
      expect(sum).toBe(0);
    });

    it('applies settlements correctly to adjust balances', () => {
      // m3 transfers 100k to m1
      const settlements = [
        {
          id: 's1',
          fromMemberId: 'm3',
          toMemberId: 'm1',
          paidAmount: 100000,
          status: 'paid'
        }
      ];

      // m1: was +200k, received 100k => now +100k
      // m3: was -175k, sent 100k => now -75k
      // m2: remains -25k
      expect(calculateMemberBalance('m1', sampleExpenses, settlements)).toBe(100000);
      expect(calculateMemberBalance('m2', sampleExpenses, settlements)).toBe(-25000);
      expect(calculateMemberBalance('m3', sampleExpenses, settlements)).toBe(-75000);

      const stats = calculateMemberStatistics(sampleMembers, sampleExpenses, settlements);
      const totalBalance = stats.reduce((acc, s) => acc + s.balance, 0);
      expect(totalBalance).toBe(0);
    });

    it('verifies group balance reconciliation invariant is 0', () => {
      const recon = verifyReconciliation(sampleMembers, sampleExpenses, []);
      expect(recon.isReconciled).toBe(true);
      expect(recon.sumBalances).toBe(0);
      expect(recon.invalidExpenses).toHaveLength(0);
    });
  });
});
