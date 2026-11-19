import { describe, it, expect } from 'vitest';
import {
  validateGroup,
  validateMember,
  validateExpense,
  validateSettlement,
  validateImportedData
} from '../utils/validators';
import {
  calculateExpenseShares,
  calculateMemberBalance,
  verifyReconciliation
} from '../utils/calculations';

describe('Validation and Financial Edge Cases', () => {
  const sampleMembers = [
    { id: 'm1', name: 'Nguyễn Hoàng Vinh', nickname: 'Vinh', status: 'active' },
    { id: 'm2', name: 'Trần Quang Minh', nickname: 'Minh', status: 'active' },
    { id: 'm3', name: 'Lê Đăng Khoa', nickname: 'Khoa', status: 'removed' }
  ];

  describe('Group Validation', () => {
    it('rejects empty group names', () => {
      const res = validateGroup({ name: '   ' });
      expect(res.isValid).toBe(false);
      expect(res.errors.name).toBeDefined();
    });

    it('rejects end dates earlier than start dates', () => {
      const res = validateGroup({
        name: 'Đà Lạt Trip',
        startDate: '2026-11-25',
        endDate: '2026-11-20'
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.endDate).toBeDefined();
    });

    it('rejects negative budgets', () => {
      const res = validateGroup({
        name: 'Đà Lạt Trip',
        budget: -500000
      });
      expect(res.isValid).toBe(false);
      expect(res.errors.budget).toBeDefined();
    });
  });

  describe('Member Validation', () => {
    it('rejects empty member names', () => {
      const res = validateMember({ name: '' }, sampleMembers);
      expect(res.isValid).toBe(false);
      expect(res.errors.name).toBeDefined();
    });

    it('rejects duplicate member names in the same group', () => {
      const res = validateMember({ id: 'm_new', name: 'Nguyễn Hoàng Vinh' }, sampleMembers);
      expect(res.isValid).toBe(false);
      expect(res.errors.name).toContain('đã tồn tại');
    });

    it('allows editing same member without self-duplication false alarm', () => {
      const res = validateMember({ id: 'm1', name: 'Nguyễn Hoàng Vinh' }, sampleMembers);
      expect(res.isValid).toBe(true);
    });
  });

  describe('Expense Validation & Service-Level Rules', () => {
    it('rejects zero or negative expense amounts', () => {
      const zeroExp = validateExpense({ title: 'Cà phê', amount: 0, payerId: 'm1', participantIds: ['m1'], date: '2026-11-20' }, sampleMembers);
      expect(zeroExp.isValid).toBe(false);
      expect(zeroExp.errors.amount).toBeDefined();

      const negExp = validateExpense({ title: 'Cà phê', amount: -50000, payerId: 'm1', participantIds: ['m1'], date: '2026-11-20' }, sampleMembers);
      expect(negExp.isValid).toBe(false);
    });

    it('rejects empty participant list', () => {
      const res = validateExpense({ title: 'Cà phê', amount: 50000, payerId: 'm1', participantIds: [], date: '2026-11-20' }, sampleMembers);
      expect(res.isValid).toBe(false);
      expect(res.errors.participantIds).toBeDefined();
    });

    it('rejects payer not in group', () => {
      const res = validateExpense({ title: 'Cà phê', amount: 50000, payerId: 'ghost_user', participantIds: ['m1'], date: '2026-11-20' }, sampleMembers);
      expect(res.isValid).toBe(false);
      expect(res.errors.payerId).toBeDefined();
    });

    it('rejects splits whose sum does not equal expense amount', () => {
      const res = validateExpense({
        title: 'Ăn tối',
        amount: 300000,
        payerId: 'm1',
        participantIds: ['m1', 'm2'],
        date: '2026-11-20',
        splitType: 'custom',
        splits: [
          { memberId: 'm1', amount: 100000 },
          { memberId: 'm2', amount: 100000 } // Total 200k != 300k
        ]
      }, sampleMembers);
      expect(res.isValid).toBe(false);
      expect(res.errors.splits).toBeDefined();
    });

    it('rejects splits containing negative amounts', () => {
      const res = validateExpense({
        title: 'Ăn tối',
        amount: 300000,
        payerId: 'm1',
        participantIds: ['m1', 'm2'],
        date: '2026-11-20',
        splitType: 'custom',
        splits: [
          { memberId: 'm1', amount: 350000 },
          { memberId: 'm2', amount: -50000 }
        ]
      }, sampleMembers);
      expect(res.isValid).toBe(false);
      expect(res.errors.splits).toContain('số âm');
    });
  });

  describe('Settlement Validation & Overpayment Prevention', () => {
    it('rejects self-transfer settlement', () => {
      const res = validateSettlement({ fromMemberId: 'm1', toMemberId: 'm1', amount: 100000, date: '2026-11-20' }, sampleMembers);
      expect(res.isValid).toBe(false);
      expect(res.errors.toMemberId).toContain('không được trùng nhau');
    });

    it('rejects zero or negative settlement amounts', () => {
      const res = validateSettlement({ fromMemberId: 'm1', toMemberId: 'm2', amount: 0, date: '2026-11-20' }, sampleMembers);
      expect(res.isValid).toBe(false);
      expect(res.errors.amount).toBeDefined();
    });

    it('prevents member with positive balance from making a debt payment', () => {
      const memberBalances = { m1: 500000, m2: -500000 };
      const res = validateSettlement(
        { fromMemberId: 'm1', toMemberId: 'm2', amount: 100000, date: '2026-11-20' },
        sampleMembers,
        { memberBalances }
      );
      expect(res.isValid).toBe(false);
      expect(res.errors.amount).toContain('không có khoản nợ nào');
    });

    it('prevents debtor from overpaying more than their outstanding balance', () => {
      // m2 owes 200,000 VND
      const memberBalances = { m1: 200000, m2: -200000 };
      const res = validateSettlement(
        { fromMemberId: 'm2', toMemberId: 'm1', amount: 250000, date: '2026-11-20' },
        sampleMembers,
        { memberBalances }
      );
      expect(res.isValid).toBe(false);
      expect(res.errors.amount).toContain('vượt quá số dư còn nợ');
    });

    it('allows partial settlement payment', () => {
      const memberBalances = { m1: 200000, m2: -200000 };
      const res = validateSettlement(
        { fromMemberId: 'm2', toMemberId: 'm1', amount: 100000, date: '2026-11-20' },
        sampleMembers,
        { memberBalances }
      );
      expect(res.isValid).toBe(true);
    });
  });

  describe('Import JSON Validation', () => {
    it('detects missing group or member arrays', () => {
      expect(validateImportedData(null).isValid).toBe(false);
      expect(validateImportedData({ groups: [] }).isValid).toBe(false);
    });

    it('detects duplicate group IDs in imported backup', () => {
      const corruptData = {
        groups: [{ id: 'g1', name: 'Trip 1' }, { id: 'g1', name: 'Trip 2' }],
        members: [],
        expenses: []
      };
      const res = validateImportedData(corruptData);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('trùng lặp');
    });

    it('detects negative expense amounts in imported backup', () => {
      const corruptData = {
        groups: [{ id: 'g1', name: 'Trip 1' }],
        members: [{ id: 'm1', name: 'Vinh' }],
        expenses: [{ id: 'e1', title: 'Test', amount: -100000 }]
      };
      const res = validateImportedData(corruptData);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('không hợp lệ');
    });
  });

  describe('Calculation Edge Cases', () => {
    it('rejects 0 VND expense in calculateExpenseShares', () => {
      const res = calculateExpenseShares(0, 'equal', ['m1', 'm2']);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('lớn hơn 0');
    });

    it('handles 1 VND split among 3 members exactly', () => {
      const res = calculateExpenseShares(1, 'equal', ['m1', 'm2', 'm3']);
      expect(res.valid).toBe(true);
      expect(res.splits[0].amount).toBe(1);
      expect(res.splits[1].amount).toBe(0);
      expect(res.splits[2].amount).toBe(0);
      const sum = res.splits.reduce((s, x) => s + x.amount, 0);
      expect(sum).toBe(1);
    });

    it('handles large VND values without precision loss', () => {
      // 500,000,000 VND split equally among 3 members
      const res = calculateExpenseShares(500000000, 'equal', ['m1', 'm2', 'm3']);
      expect(res.valid).toBe(true);
      const sum = res.splits.reduce((s, x) => s + x.amount, 0);
      expect(sum).toBe(500000000);
    });

    it('handles personal expense paid by self for self only (net balance effect = 0)', () => {
      const expenses = [
        {
          id: 'e1',
          amount: 150000,
          payerId: 'm1',
          participantIds: ['m1'],
          splits: [{ memberId: 'm1', amount: 150000 }]
        }
      ];
      // m1 paid 150k, share 150k => balance 0
      expect(calculateMemberBalance('m1', expenses, [])).toBe(0);
      expect(verifyReconciliation(sampleMembers, expenses, []).isReconciled).toBe(true);
    });

    it('handles expense paid by m1 for m2 only (payer excluded from participants)', () => {
      const expenses = [
        {
          id: 'e1',
          amount: 200000,
          payerId: 'm1',
          participantIds: ['m2'],
          splits: [{ memberId: 'm2', amount: 200000 }]
        }
      ];
      // m1: paid 200k, share 0 => +200k
      // m2: paid 0, share 200k => -200k
      expect(calculateMemberBalance('m1', expenses, [])).toBe(200000);
      expect(calculateMemberBalance('m2', expenses, [])).toBe(-200000);
      expect(verifyReconciliation(sampleMembers, expenses, []).isReconciled).toBe(true);
    });
  });
});
