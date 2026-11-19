import React, { useState, useMemo } from 'react';
import PageHeader from '../components/common/PageHeader';
import CategoryDonutChart from '../components/statistics/CategoryDonutChart';
import DailySpendingBarChart from '../components/statistics/DailySpendingBarChart';
import MemberBalanceChart from '../components/statistics/MemberBalanceChart';
import TopExpensesList from '../components/statistics/TopExpensesList';
import EmptyState from '../components/common/EmptyState';
import { useApp } from '../context/AppContext';
import {
  calculateCategoryTotals,
  calculateMemberStatistics,
  calculateGroupTotals
} from '../utils/calculations';
import { formatCurrency } from '../utils/currency';
import {
  BarChart3,
  PieChart,
  Calendar,
  Users,
  Trophy,
  X
} from 'lucide-react';

export default function StatisticsPage({ onOpenExpenseModal }) {
  const {
    activeGroup,
    currentMembers,
    currentExpenses,
    currentSettlements
  } = useApp();

  // Filters
  const [selectedMemberId, setSelectedMemberId] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filtered expenses for analytics
  const filteredExpenses = useMemo(() => {
    let result = [...currentExpenses];
    if (selectedMemberId !== 'all') {
      result = result.filter(e =>
        e.payerId === selectedMemberId || e.participantIds?.includes(selectedMemberId)
      );
    }
    if (selectedCategory !== 'all') {
      result = result.filter(e => e.category === selectedCategory);
    }
    return result;
  }, [currentExpenses, selectedMemberId, selectedCategory]);

  const categoryTotals = useMemo(() => calculateCategoryTotals(filteredExpenses), [filteredExpenses]);
  const memberStats = useMemo(() => calculateMemberStatistics(currentMembers, filteredExpenses, currentSettlements), [currentMembers, filteredExpenses, currentSettlements]);
  const groupTotals = useMemo(() => calculateGroupTotals(activeGroup, currentMembers, currentExpenses, currentSettlements), [activeGroup, currentMembers, currentExpenses, currentSettlements]);

  // Average expense per day
  const distinctDates = new Set(currentExpenses.map(e => e.date)).size || 1;
  const avgExpensePerDay = Math.round(groupTotals.totalExpenses / distinctDates);

  if (currentExpenses.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Thống kê & Phân tích chi tiêu"
          subtitle="Biểu đồ trực quan phân bổ chi phí theo danh mục, thời gian và thành viên"
        />
        <EmptyState
          icon={BarChart3}
          title="Chưa có dữ liệu để thống kê"
          description="Hãy thêm các khoản chi tiêu đầu tiên để xem biểu đồ phân bổ và số liệu chi tiết."
          actionText="Thêm khoản chi ngay"
          onAction={onOpenExpenseModal}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        title="Thống kê & Phân tích chi tiêu"
        subtitle="Biểu đồ trực quan phân bổ chi phí theo danh mục, thời gian và thành viên"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Member */}
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">Toàn bộ nhóm</option>
              {currentMembers.map(m => (
                <option key={m.id} value={m.id}>
                  Thành viên: {m.nickname || m.name}
                </option>
              ))}
            </select>

            {/* Filter by Category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="food">Ăn uống</option>
              <option value="transport">Di chuyển</option>
              <option value="hotel">Khách sạn</option>
              <option value="entertainment">Giải trí</option>
              <option value="shopping">Mua sắm</option>
              <option value="tickets">Vé tham quan</option>
              <option value="fuel">Xăng xe</option>
              <option value="other">Khác</option>
            </select>

            {(selectedMemberId !== 'all' || selectedCategory !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedMemberId('all');
                  setSelectedCategory('all');
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold inline-flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Bỏ lọc
              </button>
            )}
          </div>
        }
      />

      {/* Highlights KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Tổng chi đang xem
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 block">
            {formatCurrency(filteredExpenses.reduce((s, e) => s + Number(e.amount), 0))}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            {filteredExpenses.length} khoản chi được lọc
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Chi tiêu trung bình / ngày
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 block">
            {formatCurrency(avgExpensePerDay)}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            Tính trên {distinctDates} ngày có phát sinh chi phí
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Hiệu suất dùng ngân sách
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 block">
            {groupTotals.budget > 0 ? `${groupTotals.budgetUtilization}%` : 'Chưa đặt'}
          </span>
          <span className="text-xs text-slate-500 mt-1 block">
            {groupTotals.budget > 0 ? `Ngân sách: ${formatCurrency(groupTotals.budget)}` : 'Vào cài đặt để nhập ngân sách'}
          </span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Donut Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-600" />
                Cơ cấu chi tiêu theo danh mục
              </h3>
              <p className="text-xs text-slate-400">Tỷ trọng phần trăm từng loại chi phí</p>
            </div>
          </div>
          <CategoryDonutChart categoryTotals={categoryTotals} />
        </div>

        {/* Daily Spending Timeline Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                Chi tiêu theo từng ngày
              </h3>
              <p className="text-xs text-slate-400">Diễn biến số tiền chi qua các ngày của chuyến đi</p>
            </div>
          </div>
          <DailySpendingBarChart expenses={filteredExpenses} />
        </div>

        {/* Member Spending Comparison Chart */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                So sánh Đã chi (Paid) vs Phải chịu (Share)
              </h3>
              <p className="text-xs text-slate-400">Đánh giá mức độ đóng góp tài chính giữa các thành viên</p>
            </div>
          </div>
          <MemberBalanceChart memberStats={memberStats} />
        </div>

        {/* Top 5 Expenses */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Top 5 khoản chi lớn nhất
              </h3>
              <p className="text-xs text-slate-400">Các khoản tiêu tốn nhiều ngân sách nhất của nhóm</p>
            </div>
          </div>
          <TopExpensesList expenses={filteredExpenses} members={currentMembers} />
        </div>
      </div>
    </div>
  );
}
