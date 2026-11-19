import React from 'react';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';

export default function ExpenseFilters({
  search,
  setSearch,
  category,
  setCategory,
  payerId,
  setPayerId,
  sortBy,
  setSortBy,
  members = [],
  onReset
}) {
  const hasActiveFilters = search || category !== 'all' || payerId !== 'all' || sortBy !== 'date_desc';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên chi tiêu, ghi chú, số tiền..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          >
            <option value="date_desc">Mới nhất trước</option>
            <option value="date_asc">Cũ nhất trước</option>
            <option value="amount_desc">Số tiền: Cao → Thấp</option>
            <option value="amount_asc">Số tiền: Thấp → Cao</option>
          </select>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2.5 flex-wrap pt-1 border-t border-slate-100 text-xs">
        <span className="text-slate-400 font-semibold inline-flex items-center gap-1">
          <Filter className="w-3 h-3" /> Lọc theo:
        </span>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:bg-white"
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

        {/* Payer Filter */}
        <select
          value={payerId}
          onChange={(e) => setPayerId(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:bg-white"
        >
          <option value="all">Tất cả người trả</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>
              {m.nickname || m.name} trả
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-rose-600 hover:text-rose-700 font-bold ml-auto inline-flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
