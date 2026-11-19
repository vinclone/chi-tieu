/**
 * Financial calculation engine for Group Trip Expense Manager
 * All calculations use integer VND to avoid floating-point inaccuracies.
 */

/**
 * Calculate individual member shares based on split type and inputs.
 * Guarantees that sum of calculated shares equals totalAmount down to 1 VND.
 *
 * @param {number} totalAmount - Total expense amount in VND (integer)
 * @param {string} splitType - 'equal' | 'custom' | 'percentage' | 'weighted'
 * @param {string[]} participantIds - Array of member IDs involved
 * @param {Object} splitInputs - Additional data needed for non-equal splits
 *   e.g. { customAmounts: { [id]: number }, percentages: { [id]: number }, weights: { [id]: number } }
 * @returns {{ valid: boolean, splits: Array<{ memberId: string, amount: number, meta?: any }>, error?: string, difference: number }}
 */
export function calculateExpenseShares(totalAmount, splitType, participantIds, splitInputs = {}) {
  const amount = Math.round(Number(totalAmount) || 0);

  if (amount <= 0) {
    return {
      valid: false,
      splits: participantIds.map(id => ({ memberId: id, amount: 0 })),
      difference: 0,
      error: 'Số tiền chi tiêu phải lớn hơn 0 ₫'
    };
  }

  if (!participantIds || participantIds.length === 0) {
    return { valid: false, splits: [], error: 'Phải chọn ít nhất một người tham gia', difference: amount };
  }

  const n = participantIds.length;

  switch (splitType) {
    case 'equal': {
      const base = Math.floor(amount / n);
      const remainder = amount - (base * n);

      const splits = participantIds.map((id, index) => ({
        memberId: id,
        // Distribute remainder 1 VND each to the first `remainder` members
        amount: index < remainder ? base + 1 : base
      }));

      return { valid: true, splits, difference: 0 };
    }

    case 'custom': {
      const customAmounts = splitInputs.customAmounts || {};
      let sum = 0;
      let hasNegative = false;
      const splits = participantIds.map(id => {
        const raw = Number(customAmounts[id]) || 0;
        if (raw < 0) hasNegative = true;
        const val = Math.max(0, Math.round(raw));
        sum += val;
        return { memberId: id, amount: val };
      });

      if (hasNegative) {
        return {
          valid: false,
          splits,
          difference: amount - sum,
          error: 'Số tiền chia cho từng người không thể là số âm'
        };
      }

      const diff = amount - sum;
      return {
        valid: diff === 0,
        splits,
        difference: diff,
        error: diff !== 0
          ? `Tổng tiền chia (${sum.toLocaleString('vi-VN')} ₫) chưa khớp với tổng chi phí (${amount.toLocaleString('vi-VN')} ₫). Lệch: ${Math.abs(diff).toLocaleString('vi-VN')} ₫`
          : undefined
      };
    }

    case 'percentage': {
      const percentages = splitInputs.percentages || {};
      let totalPercent = 0;

      participantIds.forEach(id => {
        totalPercent += Number(percentages[id]) || 0;
      });

      // Round total percentage to 2 decimal places for check
      const percentRounded = Math.round(totalPercent * 100) / 100;
      if (Math.abs(percentRounded - 100) > 0.01) {
        return {
          valid: false,
          splits: participantIds.map(id => ({
            memberId: id,
            amount: Math.round((amount * (Number(percentages[id]) || 0)) / 100),
            meta: { percent: Number(percentages[id]) || 0 }
          })),
          difference: 100 - percentRounded,
          error: `Tổng phần trăm hiện tại là ${percentRounded}%, phải bằng đúng 100%`
        };
      }

      // Calculate initial integer shares
      let sumShares = 0;
      let maxShareIndex = 0;
      let maxShareAmount = -1;

      const splits = participantIds.map((id, index) => {
        const p = Number(percentages[id]) || 0;
        const share = Math.round((amount * p) / 100);
        sumShares += share;
        if (share > maxShareAmount) {
          maxShareAmount = share;
          maxShareIndex = index;
        }
        return { memberId: id, amount: share, meta: { percent: p } };
      });

      // Adjust rounding difference to the largest share so sum is exact
      const diff = amount - sumShares;
      if (diff !== 0 && splits[maxShareIndex]) {
        splits[maxShareIndex].amount += diff;
      }

      return { valid: true, splits, difference: 0 };
    }

    case 'weighted': {
      const weights = splitInputs.weights || {};
      let totalWeight = 0;

      participantIds.forEach(id => {
        const w = Math.max(1, Math.round(Number(weights[id]) || 1));
        totalWeight += w;
      });

      if (totalWeight <= 0) {
        return { valid: false, splits: [], error: 'Tổng số phần phải lớn hơn 0', difference: amount };
      }

      let sumShares = 0;
      const rawCalculations = participantIds.map(id => {
        const w = Math.max(1, Math.round(Number(weights[id]) || 1));
        const exact = (amount * w) / totalWeight;
        const base = Math.floor(exact);
        const remainder = exact - base;
        sumShares += base;
        return { memberId: id, base, remainder, weight: w };
      });

      let remainingUnits = amount - sumShares;
      // Sort by remainder descending to distribute remaining 1 VND
      const sortedIndices = [...rawCalculations.keys()].sort(
        (a, b) => rawCalculations[b].remainder - rawCalculations[a].remainder
      );

      for (let i = 0; i < remainingUnits; i++) {
        const targetIdx = sortedIndices[i % sortedIndices.length];
        rawCalculations[targetIdx].base += 1;
      }

      const splits = rawCalculations.map(item => ({
        memberId: item.memberId,
        amount: item.base,
        meta: { weight: item.weight }
      }));

      return { valid: true, splits, difference: 0 };
    }

    default:
      return { valid: false, splits: [], error: `Loại chia "${splitType}" không hợp lệ`, difference: amount };
  }
}

/**
 * Calculate total money a member paid for group expenses
 */
export function calculateMemberPaidTotal(memberId, expenses = []) {
  return expenses.reduce((acc, exp) => {
    return exp.payerId === memberId ? acc + (Number(exp.amount) || 0) : acc;
  }, 0);
}

/**
 * Calculate total share amount a member is responsible for
 */
export function calculateMemberShareTotal(memberId, expenses = []) {
  return expenses.reduce((acc, exp) => {
    const split = exp.splits?.find(s => s.memberId === memberId);
    return split ? acc + (Number(split.amount) || 0) : acc;
  }, 0);
}

/**
 * Calculate net balance for a member:
 * Balance = (Total Paid - Total Share) + Settlements Sent - Settlements Received
 * Positive (+) = is owed money (should receive)
 * Negative (-) = owes money (must pay)
 * Zero (0) = fully settled
 */
export function calculateMemberBalance(memberId, expenses = [], settlements = []) {
  const paid = calculateMemberPaidTotal(memberId, expenses);
  const share = calculateMemberShareTotal(memberId, expenses);

  const sent = settlements.reduce((acc, s) => {
    return (s.fromMemberId === memberId && s.status === 'paid') ? acc + (Number(s.paidAmount || s.amount) || 0) : acc;
  }, 0);

  const received = settlements.reduce((acc, s) => {
    return (s.toMemberId === memberId && s.status === 'paid') ? acc + (Number(s.paidAmount || s.amount) || 0) : acc;
  }, 0);

  return (paid - share) + sent - received;
}

/**
 * Calculate full breakdown for all members in a group
 */
export function calculateMemberStatistics(members = [], expenses = [], settlements = []) {
  return members.map(member => {
    const paid = calculateMemberPaidTotal(member.id, expenses);
    const share = calculateMemberShareTotal(member.id, expenses);

    const settlementsSent = settlements.filter(s => s.fromMemberId === member.id && s.status === 'paid');
    const settlementsReceived = settlements.filter(s => s.toMemberId === member.id && s.status === 'paid');

    const totalSent = settlementsSent.reduce((acc, s) => acc + (Number(s.paidAmount || s.amount) || 0), 0);
    const totalReceived = settlementsReceived.reduce((acc, s) => acc + (Number(s.paidAmount || s.amount) || 0), 0);

    const balance = (paid - share) + totalSent - totalReceived;

    const expenseCount = expenses.filter(exp =>
      exp.payerId === member.id || exp.participantIds?.includes(member.id)
    ).length;

    return {
      member,
      paid,
      share,
      totalSent,
      totalReceived,
      balance,
      expenseCount,
      isSettled: Math.abs(balance) === 0
    };
  });
}

/**
 * Calculate high-level group totals & KPIs
 */
export function calculateGroupTotals(group, members = [], expenses = [], settlements = []) {
  const totalExpenses = expenses.reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0);
  const expenseCount = expenses.length;
  const memberCount = members.filter(m => m.status === 'active').length || members.length || 1;
  const avgSpendingPerMember = Math.round(totalExpenses / memberCount);

  const totalSettled = settlements
    .filter(s => s.status === 'paid')
    .reduce((acc, s) => acc + (Number(s.paidAmount || s.amount) || 0), 0);

  const memberStats = calculateMemberStatistics(members, expenses, settlements);

  // Total outstanding balance is the sum of all positive balances (which equals sum of all absolute negative balances)
  const totalOutstandingBalance = memberStats.reduce((acc, stat) => {
    return stat.balance > 0 ? acc + stat.balance : acc;
  }, 0);

  const budget = Number(group?.budget) || 0;
  const budgetUtilization = budget > 0 ? Math.round((totalExpenses / budget) * 100) : 0;
  const remainingBudget = budget > 0 ? budget - totalExpenses : null;

  return {
    totalExpenses,
    expenseCount,
    memberCount,
    avgSpendingPerMember,
    totalSettled,
    totalOutstandingBalance,
    budget,
    budgetUtilization,
    remainingBudget
  };
}

/**
 * Group expenses by category
 */
export function calculateCategoryTotals(expenses = []) {
  const categoryMap = {
    food: { id: 'food', label: 'Ăn uống', color: '#10B981', amount: 0, count: 0 },
    transport: { id: 'transport', label: 'Di chuyển', color: '#3B82F6', amount: 0, count: 0 },
    hotel: { id: 'hotel', label: 'Lưu trú / Khách sạn', color: '#8B5CF6', amount: 0, count: 0 },
    entertainment: { id: 'entertainment', label: 'Giải trí', color: '#F59E0B', amount: 0, count: 0 },
    shopping: { id: 'shopping', label: 'Mua sắm', color: '#EC4899', amount: 0, count: 0 },
    tickets: { id: 'tickets', label: 'Vé tham quan', color: '#06B6D4', amount: 0, count: 0 },
    fuel: { id: 'fuel', label: 'Xăng xe', color: '#F97316', amount: 0, count: 0 },
    other: { id: 'other', label: 'Khác', color: '#64748B', amount: 0, count: 0 },
  };

  let total = 0;
  expenses.forEach(exp => {
    const cat = categoryMap[exp.category] || categoryMap.other;
    const amt = Number(exp.amount) || 0;
    cat.amount += amt;
    cat.count += 1;
    total += amt;
  });

  return Object.values(categoryMap).map(cat => ({
    ...cat,
    percentage: total > 0 ? Math.round((cat.amount / total) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);
}

/**
 * Financial reconciliation check:
 * 1. Every expense sum of splits == expense amount
 * 2. Sum of all member balances == 0
 */
export function verifyReconciliation(members = [], expenses = [], settlements = []) {
  // Check expenses
  const invalidExpenses = [];
  expenses.forEach(exp => {
    const splitSum = exp.splits?.reduce((acc, s) => acc + (Number(s.amount) || 0), 0) || 0;
    if (splitSum !== Number(exp.amount)) {
      invalidExpenses.push({
        id: exp.id,
        title: exp.title,
        amount: exp.amount,
        splitSum,
        difference: exp.amount - splitSum
      });
    }
  });

  // Check balances sum to zero
  const stats = calculateMemberStatistics(members, expenses, settlements);
  const sumBalances = stats.reduce((acc, s) => acc + s.balance, 0);

  return {
    isReconciled: invalidExpenses.length === 0 && Math.abs(sumBalances) === 0,
    invalidExpenses,
    sumBalances
  };
}
