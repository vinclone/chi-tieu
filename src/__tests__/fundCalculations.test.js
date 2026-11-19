import { describe, it, expect } from 'vitest';
import { calculateFundSummary, calculateMemberRefunds, verifyFundIntegrity } from '../utils/fundCalculations.js';

describe('Group Fund Management Calculations', () => {
  const sampleGroup = {
    id: 'grp_test',
    name: 'Chuyến đi Dã ngoại Cuối tuần',
    plannedContribution: 450000,
    representative: 'Nguyễn Văn An'
  };

  const sampleMembers = [
    { id: 'm1', name: 'Nguyễn Văn An', contributionAmount: 450000, paidAmount: 450000, paymentStatus: 'paid' },
    { id: 'm2', name: 'Trần Hoàng Vinh', contributionAmount: 450000, paidAmount: 450000, paymentStatus: 'paid' },
    { id: 'm3', name: 'Lê Ngọc Bích', contributionAmount: 450000, paidAmount: 450000, paymentStatus: 'paid' },
    { id: 'm4', name: 'Phạm Mạnh Cường', contributionAmount: 450000, paidAmount: 450000, paymentStatus: 'paid' },
    { id: 'm5', name: 'Đặng Thanh Bình', contributionAmount: 450000, paidAmount: 450000, paymentStatus: 'paid' },
    { id: 'm6', name: 'Vũ Tiến Dũng', contributionAmount: 450000, paidAmount: 450000, paymentStatus: 'paid' },
    { id: 'm7', name: 'Hoàng Quỳnh Hoa', contributionAmount: 450000, paidAmount: 450000, paymentStatus: 'paid' },
    { id: 'm8', name: 'Trương Tuyết Mai', contributionAmount: 450000, paidAmount: 450000, paymentStatus: 'paid' },
    { id: 'm9', name: 'Đỗ Thành Nam', contributionAmount: 450000, paidAmount: 450000, paymentStatus: 'paid' }
  ];

  const sampleExpenses = [
    { id: 'e1', description: 'Thuê xe 16 chỗ', amount: 1350000 },
    { id: 'e2', description: 'Vé tham quan', amount: 450000 },
    { id: 'e3', description: 'Ăn trưa cơm niêu', amount: 630000 },
    { id: 'e4', description: 'Nước uống', amount: 150000 },
    { id: 'e5', description: 'Thuê lều', amount: 360000 },
    { id: 'e6', description: 'BBQ tối', amount: 360000 },
    { id: 'e7', description: 'Cà phê sáng', amount: 180000 },
    { id: 'e8', description: 'Ăn trưa ngày 2', amount: 90000 },
    { id: 'e9', description: 'Vé cầu đường', amount: 30000 }
  ];

  it('calculates exact fund totals matching Google Sheets model', () => {
    const summary = calculateFundSummary(sampleGroup, sampleMembers, sampleExpenses);

    expect(summary.memberCount).toBe(9);
    expect(summary.expenseCount).toBe(9);
    expect(summary.totalExpectedFund).toBe(4050000);
    expect(summary.totalCollected).toBe(4050000);
    expect(summary.totalExpenses).toBe(3600000);
    expect(summary.remainingFund).toBe(450000);
    expect(summary.costPerPerson).toBe(400000);
    expect(summary.refundPerPerson).toBe(50000);
    expect(summary.status).toBe('surplus');
  });

  it('calculates member refunds with equal allocation', () => {
    const refunds = calculateMemberRefunds(sampleMembers, 3600000, 'equal');

    expect(refunds.length).toBe(9);
    for (const r of refunds) {
      expect(r.paidAmount).toBe(450000);
      expect(r.allocatedCost).toBe(400000);
      expect(r.refundAmount).toBe(50000);
      expect(r.deficitAmount).toBe(0);
      expect(r.netBalance).toBe(50000);
    }

    const totalRefundDistributed = refunds.reduce((sum, r) => sum + r.refundAmount, 0);
    expect(totalRefundDistributed).toBe(450000);
    expect(verifyFundIntegrity(450000, refunds)).toBe(true);
  });

  it('handles custom member cost allocations', () => {
    const customAllocations = {
      m1: 500000, // m1 pays more
      m2: 300000  // m2 pays less
    };
    const refunds = calculateMemberRefunds(sampleMembers, 3600000, 'custom', customAllocations);

    const m1 = refunds.find(r => r.memberId === 'm1');
    const m2 = refunds.find(r => r.memberId === 'm2');

    expect(m1.allocatedCost).toBe(500000);
    expect(m1.netBalance).toBe(-50000); // 450k - 500k = -50k (deficit)
    expect(m1.deficitAmount).toBe(50000);
    expect(m1.refundAmount).toBe(0);

    expect(m2.allocatedCost).toBe(300000);
    expect(m2.netBalance).toBe(150000); // 450k - 300k = +150k (refund)
    expect(m2.refundAmount).toBe(150000);
  });

  it('handles deficit when expenses exceed collected contributions', () => {
    const highExpenses = [{ id: 'e_huge', amount: 5000000 }];
    const summary = calculateFundSummary(sampleGroup, sampleMembers, highExpenses);

    expect(summary.remainingFund).toBe(-950000);
    expect(summary.status).toBe('deficit');

    const refunds = calculateMemberRefunds(sampleMembers, 5000000, 'equal');
    const totalDeficit = refunds.reduce((sum, r) => sum + r.deficitAmount, 0);
    expect(totalDeficit).toBe(950000);
  });

  it('handles empty members or empty expenses gracefully', () => {
    const emptySummary = calculateFundSummary(sampleGroup, [], []);
    expect(emptySummary.totalCollected).toBe(0);
    expect(emptySummary.totalExpenses).toBe(0);
    expect(emptySummary.remainingFund).toBe(0);
    expect(emptySummary.costPerPerson).toBe(0);
    expect(emptySummary.refundPerPerson).toBe(0);
  });
});
