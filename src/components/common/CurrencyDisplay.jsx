import React from 'react';
import { formatCurrency, formatCompactCurrency } from '../../utils/currency';

export default function CurrencyDisplay({
  amount,
  isBalance = false,
  compact = false,
  badge = false,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  className = ''
}) {
  const num = Number(amount) || 0;
  const isPositive = num > 0;
  const isNegative = num < 0;

  const formatted = compact ? formatCompactCurrency(num) : formatCurrency(Math.abs(num));

  const sizeClasses = {
    sm: 'text-xs font-semibold',
    md: 'text-sm font-bold',
    lg: 'text-base font-bold',
    xl: 'text-xl font-extrabold sm:text-2xl'
  };

  if (!isBalance) {
    return (
      <span className={`text-slate-900 ${sizeClasses[size]} ${className}`}>
        {formatted}
      </span>
    );
  }

  // Balance coloring logic
  let colorClass = 'text-slate-500';
  let badgeClass = 'bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full';
  let sign = '';

  if (isPositive) {
    colorClass = 'text-emerald-600';
    badgeClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full';
    sign = '+';
  } else if (isNegative) {
    colorClass = 'text-rose-600';
    badgeClass = 'bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full';
    sign = '-';
  }

  const activeStyle = badge ? badgeClass : colorClass;

  return (
    <span className={`inline-flex items-center gap-0.5 ${activeStyle} ${sizeClasses[size]} ${className}`}>
      {sign}{formatted}
    </span>
  );
}
