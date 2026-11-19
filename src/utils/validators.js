/**
 * Form and data schema validators with Vietnamese error messages
 */

export function validateGroup(group) {
  const errors = {};
  if (!group.name || !group.name.trim()) {
    errors.name = 'Vui lòng nhập tên chuyến đi / nhóm';
  }
  if (group.startDate && group.endDate && group.endDate < group.startDate) {
    errors.endDate = 'Ngày kết thúc không thể trước ngày bắt đầu';
  }
  if (group.budget && Number(group.budget) < 0) {
    errors.budget = 'Ngân sách không thể là số âm';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateMember(member, existingMembers = []) {
  const errors = {};
  if (!member.name || !member.name.trim()) {
    errors.name = 'Vui lòng nhập họ tên hoặc tên thành viên';
  } else {
    const isDuplicate = existingMembers.some(
      m => m.id !== member.id && m.name.trim().toLowerCase() === member.name.trim().toLowerCase()
    );
    if (isDuplicate) {
      errors.name = 'Tên thành viên này đã tồn tại trong nhóm';
    }
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateExpense(expense, members = []) {
  const errors = {};
  const validMemberIds = new Set(members.map(m => m.id));

  if (!expense.title || !expense.title.trim()) {
    errors.title = 'Vui lòng nhập tên khoản chi tiêu';
  }

  const amt = Number(expense.amount);
  if (!amt || isNaN(amt) || amt <= 0) {
    errors.amount = 'Số tiền chi tiêu phải lớn hơn 0 ₫';
  } else if (amt > 1_000_000_000_000) {
    errors.amount = 'Số tiền vượt quá giới hạn cho phép';
  }

  if (!expense.payerId || !validMemberIds.has(expense.payerId)) {
    errors.payerId = 'Vui lòng chọn người đã thanh toán';
  }

  if (!expense.participantIds || expense.participantIds.length === 0) {
    errors.participantIds = 'Vui lòng chọn ít nhất một người cùng tham gia';
  } else {
    const invalidParticipants = expense.participantIds.filter(id => !validMemberIds.has(id));
    if (invalidParticipants.length > 0) {
      errors.participantIds = 'Một số người tham gia không thuộc nhóm hiện tại';
    }
  }

  if (!expense.date) {
    errors.date = 'Vui lòng chọn ngày chi tiêu';
  }

  // Validate split type & splits array
  const validSplitTypes = ['equal', 'custom', 'percentage', 'weighted'];
  if (expense.splitType && !validSplitTypes.includes(expense.splitType)) {
    errors.splitType = 'Phương thức chia tiền không hợp lệ';
  }

  if (Array.isArray(expense.splits) && amt > 0) {
    const sumSplits = expense.splits.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    if (sumSplits !== amt) {
      errors.splits = `Tổng các phần chia (${sumSplits.toLocaleString('vi-VN')} ₫) không khớp với số tiền chi (${amt.toLocaleString('vi-VN')} ₫)`;
    }
    const hasNegative = expense.splits.some(s => Number(s.amount) < 0);
    if (hasNegative) {
      errors.splits = 'Số tiền chia cho từng người không thể là số âm';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateSettlement(settlement, members = [], options = {}) {
  const errors = {};
  const validMemberIds = new Set(members.map(m => m.id));

  if (!settlement.fromMemberId || !validMemberIds.has(settlement.fromMemberId)) {
    errors.fromMemberId = 'Vui lòng chọn người chuyển tiền';
  }

  if (!settlement.toMemberId || !validMemberIds.has(settlement.toMemberId)) {
    errors.toMemberId = 'Vui lòng chọn người nhận tiền';
  }

  if (settlement.fromMemberId && settlement.toMemberId && settlement.fromMemberId === settlement.toMemberId) {
    errors.toMemberId = 'Người chuyển và người nhận không được trùng nhau';
  }

  const amt = Number(settlement.amount);
  if (!amt || isNaN(amt) || amt <= 0) {
    errors.amount = 'Số tiền thanh toán phải lớn hơn 0 ₫';
  }

  if (!settlement.date) {
    errors.date = 'Vui lòng chọn ngày thanh toán';
  }

  // Check overpayment if memberBalances is provided
  // options: { memberBalances: { [memberId]: number }, editingSettlementAmount?: number }
  if (options.memberBalances && settlement.fromMemberId && amt > 0) {
    const currentBalance = options.memberBalances[settlement.fromMemberId] || 0;
    const originalPaid = options.editingSettlementAmount || 0;
    // Current debt is: Math.abs(currentBalance) if negative, plus originalPaid if editing
    const effectiveDebt = (currentBalance < 0 ? -currentBalance : 0) + originalPaid;

    if (effectiveDebt <= 0) {
      errors.amount = 'Thành viên này hiện không có khoản nợ nào cần thanh toán';
    } else if (amt > effectiveDebt) {
      errors.amount = `Số tiền thanh toán (${amt.toLocaleString('vi-VN')} ₫) vượt quá số dư còn nợ (${effectiveDebt.toLocaleString('vi-VN')} ₫)`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate imported JSON backup structure with deep checks for schema and references
 */
export function validateImportedData(data) {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Tệp không phải là định dạng JSON hợp lệ' };
  }

  if (!Array.isArray(data.groups)) {
    return { isValid: false, error: 'Tệp thiếu danh sách nhóm (groups)' };
  }

  if (!Array.isArray(data.members)) {
    return { isValid: false, error: 'Tệp thiếu danh sách thành viên (members)' };
  }

  if (!Array.isArray(data.expenses)) {
    return { isValid: false, error: 'Tệp thiếu danh sách khoản chi (expenses)' };
  }

  const groupIds = new Set();
  for (const g of data.groups) {
    if (!g.id || !g.name) {
      return { isValid: false, error: 'Phát hiện nhóm thiếu mã ID hoặc tên nhóm' };
    }
    if (groupIds.has(g.id)) {
      return { isValid: false, error: `Phát hiện mã nhóm bị trùng lặp: ${g.id}` };
    }
    groupIds.add(g.id);
  }

  const memberIds = new Set();
  for (const m of data.members) {
    if (!m.id || !m.name) {
      return { isValid: false, error: 'Phát hiện thành viên thiếu mã ID hoặc tên' };
    }
    if (memberIds.has(m.id)) {
      return { isValid: false, error: `Phát hiện mã thành viên bị trùng lặp: ${m.id}` };
    }
    memberIds.add(m.id);
  }

  const expenseIds = new Set();
  for (const e of data.expenses) {
    const expenseTitle = e.title || e.description;
    if (!e.id || !expenseTitle) {
      return { isValid: false, error: 'Phát hiện khoản chi thiếu mã ID hoặc nội dung/tiêu đề' };
    }
    if (expenseIds.has(e.id)) {
      return { isValid: false, error: `Phát hiện mã khoản chi bị trùng lặp: ${e.id}` };
    }
    expenseIds.add(e.id);
    if (typeof e.amount !== 'number' || e.amount < 0) {
      return { isValid: false, error: `Khoản chi "${expenseTitle}" có số tiền không hợp lệ` };
    }
  }

  return {
    isValid: true,
    stats: {
      groupCount: data.groups.length,
      memberCount: data.members.length,
      expenseCount: data.expenses.length,
      settlementCount: Array.isArray(data.settlements) ? data.settlements.length : 0
    }
  };
}
