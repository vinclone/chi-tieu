/**
 * Group Fund & Expense Management Calculations
 * 
 * Flow:
 * 1. Members contribute money -> Group Fund
 * 2. Representative pays expenses from the fund
 * 3. Calculate remaining fund: Total Collected - Total Expenses
 * 4. Calculate actual cost per person (equal or custom)
 * 5. Calculate individual refunds: Contribution - Allocated Cost
 */

/**
 * Calculate the overall group fund summary
 * @param {Object} group 
 * @param {Array} members 
 * @param {Array} expenses 
 * @returns {Object}
 */
export function calculateFundSummary(group = {}, members = [], expenses = []) {
  const memberList = Array.isArray(members) ? members : [];
  const expenseList = Array.isArray(expenses) ? expenses : [];

  const memberCount = memberList.length;
  const plannedPerPerson = group.plannedContribution || 0;
  
  // Total expected fund based on planned contribution
  const totalExpectedFund = memberCount * plannedPerPerson;

  // Total collected = sum of member paid amounts
  const totalCollected = memberList.reduce((sum, m) => {
    // If paidAmount is explicitly set, use it; otherwise if status is 'paid', use contributionAmount
    const paid = typeof m.paidAmount === 'number' 
      ? m.paidAmount 
      : (m.paymentStatus === 'paid' ? (m.contributionAmount || plannedPerPerson) : 0);
    return sum + (Number(paid) || 0);
  }, 0);

  // Total actual expenses
  const totalExpenses = expenseList.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Remaining fund
  const remainingFund = totalCollected - totalExpenses;

  // Paid members count
  const paidMembersCount = memberList.filter(m => {
    if (m.paymentStatus === 'paid') return true;
    if (typeof m.paidAmount === 'number' && m.paidAmount > 0) return true;
    return false;
  }).length;

  const unpaidMembersCount = memberCount - paidMembersCount;

  // Equal cost per person
  const costPerPerson = memberCount > 0 ? Math.round(totalExpenses / memberCount) : 0;

  // Equal refund per person (based on remaining fund divided by members)
  const refundPerPerson = memberCount > 0 ? Math.round(remainingFund / memberCount) : 0;

  // Overall status
  let status = 'balanced';
  let statusText = 'Đã cân bằng';
  if (remainingFund > 0) {
    status = 'surplus';
    statusText = 'Dư quỹ (Hoàn trả lại)';
  } else if (remainingFund < 0) {
    status = 'deficit';
    statusText = 'Hụt quỹ (Cần đóng thêm)';
  }

  return {
    memberCount,
    expenseCount: expenseList.length,
    plannedPerPerson,
    totalExpectedFund,
    totalCollected,
    totalExpenses,
    remainingFund,
    costPerPerson,
    refundPerPerson,
    paidMembersCount,
    unpaidMembersCount,
    status,
    statusText
  };
}

/**
 * Calculate individual member refunds and allocated costs
 * Supports:
 * - 'equal': Total expenses divided equally among participating members
 * - 'custom': Custom allocated cost per member
 * 
 * @param {Array} members 
 * @param {number} totalExpenses 
 * @param {string} allocationType 'equal' | 'custom'
 * @param {Object} customAllocations { [memberId]: number }
 * @returns {Array<Object>}
 */
export function calculateMemberRefunds(
  members = [], 
  totalExpenses = 0, 
  allocationType = 'equal', 
  customAllocations = {}
) {
  if (!Array.isArray(members) || members.length === 0) return [];

  const n = members.length;
  const baseEqualCost = Math.floor(totalExpenses / n);
  let remainder = totalExpenses - (baseEqualCost * n);

  return members.map((member, index) => {
    const paid = typeof member.paidAmount === 'number'
      ? member.paidAmount
      : (member.paymentStatus === 'paid' ? (member.contributionAmount || 0) : 0);

    let allocatedCost = 0;

    if (allocationType === 'custom' && customAllocations[member.id] !== undefined) {
      allocatedCost = Math.round(Number(customAllocations[member.id]) || 0);
    } else {
      // Distribute integer remainder to first few members so total allocated equals exact total expenses
      allocatedCost = baseEqualCost + (index < remainder ? 1 : 0);
    }

    // Refund formula: Paid - Allocated Cost
    // If > 0: gets refund
    // If < 0: owes additional money
    // If == 0: settled
    const netBalance = paid - allocatedCost;

    let refundStatus = member.refundStatus || 'pending';
    let statusLabel = 'Chưa hoàn trả';

    if (netBalance > 0) {
      if (refundStatus === 'completed' || refundStatus === 'refunded') {
        statusLabel = 'Đã hoàn tiền';
      } else {
        statusLabel = 'Cần hoàn tiền';
      }
    } else if (netBalance < 0) {
      statusLabel = 'Cần đóng thêm';
    } else {
      statusLabel = 'Đã tất toán';
    }

    return {
      memberId: member.id,
      memberName: member.name,
      paidAmount: paid,
      allocatedCost,
      refundAmount: netBalance > 0 ? netBalance : 0,
      deficitAmount: netBalance < 0 ? Math.abs(netBalance) : 0,
      netBalance,
      refundStatus,
      statusLabel,
      bankAccount: member.bankAccount || '',
      bankName: member.bankName || '',
      phone: member.phone || '',
      paymentNote: member.paymentNote || '',
      refundNote: member.refundNote || '',
      note: member.refundNote || member.paymentNote || member.note || ''
    };
  });
}

/**
 * Verify integrity between remaining fund and sum of net balances
 * @param {number} remainingFund 
 * @param {Array} refunds 
 * @returns {boolean}
 */
export function verifyFundIntegrity(remainingFund, refunds = []) {
  if (!Array.isArray(refunds)) return false;
  const totalNet = refunds.reduce((sum, r) => sum + (r.netBalance || 0), 0);
  return Math.abs(totalNet - remainingFund) <= refunds.length; // allows 1-2 dong rounding margin
}
