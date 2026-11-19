import React, { useState } from 'react';
import { formatCurrency } from '../../utils/currency';

export default function CategoryDonutChart({ categoryTotals = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const activeCategories = categoryTotals.filter(c => c.amount > 0);
  const totalAmount = activeCategories.reduce((acc, c) => acc + c.amount, 0);

  if (activeCategories.length === 0 || totalAmount === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs italic">
        Chưa có dữ liệu chi tiêu theo danh mục.
      </div>
    );
  }

  // Calculate SVG donut paths cleanly
  const size = 200;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const { segments } = activeCategories.reduce(
    (acc, cat, idx) => {
      const fraction = cat.amount / totalAmount;
      const strokeDasharray = `${fraction * circumference} ${circumference}`;
      const strokeDashoffset = -acc.offset;
      acc.segments.push({
        ...cat,
        strokeDasharray,
        strokeDashoffset,
        fraction,
        idx
      });
      acc.offset += fraction * circumference;
      return acc;
    },
    { segments: [], offset: 0 }
  );

  const selectedCat = hoveredIdx !== null ? activeCategories[hoveredIdx] : null;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 justify-center">
      {/* SVG Donut */}
      <div className="relative shrink-0 w-52 h-52 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          {segments.map(seg => (
            <circle
              key={seg.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={seg.color}
              strokeWidth={hoveredIdx === seg.idx ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={seg.strokeDasharray}
              strokeDashoffset={seg.strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredIdx(seg.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {selectedCat ? selectedCat.label : 'Tổng chi'}
          </span>
          <span className="text-sm font-extrabold text-slate-900 leading-tight">
            {formatCurrency(selectedCat ? selectedCat.amount : totalAmount)}
          </span>
          {selectedCat && (
            <span className="text-xs font-bold text-emerald-600">
              {selectedCat.percentage}%
            </span>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-2 max-h-56 overflow-y-auto pr-1">
        {activeCategories.map((cat, idx) => (
          <div
            key={cat.id}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
              hoveredIdx === idx ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-slate-700 font-semibold">{cat.label}</span>
              <span className="text-slate-400">({cat.count} mục)</span>
            </div>
            <div className="text-right">
              <span className="font-extrabold text-slate-800">{formatCurrency(cat.amount)}</span>
              <span className="text-slate-400 text-[10px] ml-1.5 font-bold">({cat.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
