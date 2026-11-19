import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportService } from '../services/exportService.js';

describe('exportService - CSV generation and Total Expenses calculation', () => {
  let createdBlobContent = '';
  let downloadedFileName = '';

  beforeEach(() => {
    createdBlobContent = '';
    downloadedFileName = '';

    // Mock DOM elements and URL methods
    global.Blob = class MockBlob {
      constructor(content, options) {
        this.content = content.join('');
        this.options = options;
        createdBlobContent = this.content;
      }
    };

    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();

    global.document = {
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn()
      },
      createElement: vi.fn(() => ({
        href: '',
        download: '',
        click: vi.fn()
      }))
    };
  });

  const mockGroup = {
    id: 'grp-test',
    name: 'Chuyến đi Ba Vì',
    location: 'Ba Vì, Hà Nội',
    duration: '2 ngày 1 đêm',
    representative: 'Nguyễn Văn An'
  };

  const mockExpenses = [
    { id: 'e1', date: '2026-11-20', title: 'Ăn trưa', amount: 500000, note: 'Nhà hàng' },
    { id: 'e2', date: '2026-11-20', title: 'Vé vào cổng', amount: 300000, note: 'Khu du lịch' }
  ];

  const mockMembers = [
    { id: 'm1', name: 'Nguyễn Văn An', paidAmount: 800000, paymentStatus: 'paid' },
    { id: 'm2', name: 'Trần Thị Bích', paidAmount: 800000, paymentStatus: 'paid' }
  ];

  it('exportExpensesCSV includes Total Expenses (Tổng chi) row and summary headers', () => {
    exportService.exportExpensesCSV(mockGroup, mockMembers, mockExpenses);

    expect(createdBlobContent).toContain('BẢNG KÊ CHI TIÊU CHI TIẾT - Chuyến đi Ba Vì');
    expect(createdBlobContent).toContain('TỔNG CHI TIÊU (TỔNG CHI)');
    expect(createdBlobContent).toContain('800000 VNĐ'); // 500k + 300k
    expect(createdBlobContent).toContain('Tổng cộng chi tiêu (Tổng chi)');
    expect(createdBlobContent).toContain('Tổng số 2 khoản chi');
  });

  it('exportFundSummaryReportCSV includes Total Expenses and financial overview', () => {
    const summary = {
      totalCollected: 1600000,
      paidMembersCount: 2,
      memberCount: 2,
      totalExpenses: 800000,
      expenseCount: 2,
      remainingFund: 800000,
      costPerPerson: 400000,
      refundPerPerson: 400000,
      statusText: 'Dư quỹ'
    };
    const refunds = [
      { memberId: 'm1', memberName: 'Nguyễn Văn An', paidAmount: 800000, allocatedCost: 400000, refundAmount: 400000, deficitAmount: 0, statusLabel: 'Được nhận lại' }
    ];

    exportService.exportFundSummaryReportCSV(mockGroup, mockMembers, mockExpenses, summary, refunds);

    expect(createdBlobContent).toContain('BÁO CÁO QUYẾT TOÁN THU CHI & QUỸ NHÓM');
    expect(createdBlobContent).toContain('Tổng cộng chi tiêu (Tổng chi)');
    expect(createdBlobContent).toContain('800000');
    expect(createdBlobContent).toContain('Tổng cộng thu quỹ:');
    expect(createdBlobContent).toContain('Tổng cộng quyết toán:');
  });

  it('exportMembersSummaryCSV includes total row for all member balances', () => {
    exportService.exportMembersSummaryCSV(mockGroup, mockMembers, mockExpenses, []);

    expect(createdBlobContent).toContain('BÁO CÁO TỔNG HỢP THÀNH VIÊN & SỐ DƯ');
    expect(createdBlobContent).toContain('Tổng cộng (Toàn đoàn)');
    expect(createdBlobContent).toContain('Cân đối 100%');
  });

  it('exportSettlementsCSV includes total settlement row', () => {
    const mockSettlements = [
      { id: 's1', date: '2026-11-20', fromMemberId: 'm2', toMemberId: 'm1', amount: 150000, paymentMethod: 'cash' }
    ];

    exportService.exportSettlementsCSV(mockGroup, mockMembers, mockSettlements);

    expect(createdBlobContent).toContain('LỊCH SỬ THANH TOÁN & QUYẾT TOÁN NỢ');
    expect(createdBlobContent).toContain('Tổng cộng đã thanh toán');
    expect(createdBlobContent).toContain('150000');
  });
});
