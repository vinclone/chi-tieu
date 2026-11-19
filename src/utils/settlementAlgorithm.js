/**
 * Min-Cash-Flow Greedy Settlement Algorithm
 * Minimizes the total number of peer-to-peer bank/cash transfers needed
 * to settle all outstanding debts in the group.
 */

import { calculateMemberBalance } from './calculations.js';
import { formatCurrency } from './currency.js';

/**
 * Generate optimized list of debt settlement transfers
 *
 * @param {Array} members - Group members
 * @param {Array} expenses - Group expenses
 * @param {Array} settlements - Group settlements (already completed)
 * @returns {Array<{ fromMemberId: string, toMemberId: string, amount: number }>}
 */
export function generateSettlementSuggestions(members = [], expenses = [], settlements = []) {
  if (!members || members.length === 0) return [];

  // Calculate net balance for each member
  const balances = {};
  members.forEach(member => {
    balances[member.id] = calculateMemberBalance(member.id, expenses, settlements);
  });

  // Separate into debtors (owes money: balance < 0) and creditors (receives money: balance > 0)
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([memberId, balance]) => {
    // Treat any residual less than 1 VND as settled
    if (balance <= -1) {
      debtors.push({ memberId, amount: -balance });
    } else if (balance >= 1) {
      creditors.push({ memberId, amount: balance });
    }
  });

  // Sort descending by amount for greedy maximum reduction
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];

    // Don't transfer to oneself
    if (debtor.memberId === creditor.memberId) {
      d++;
      continue;
    }

    const transferAmount = Math.min(debtor.amount, creditor.amount);

    if (transferAmount >= 1) {
      transfers.push({
        id: `sug_${debtor.memberId}_${creditor.memberId}_${transfers.length}`,
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        amount: Math.round(transferAmount)
      });
    }

    debtor.amount -= transferAmount;
    creditor.amount -= transferAmount;

    if (debtor.amount < 1) d++;
    if (creditor.amount < 1) c++;
  }

  return transfers;
}

/**
 * Format settlement suggestions into an easy-to-read text message
 * suitable for sharing to group chats (Zalo, Messenger, Telegram)
 */
export function generateChatSummary(group, members = [], transfers = []) {
  if (!transfers || transfers.length === 0) {
    return `🎉 Nhóm "${group?.name || 'Chuyến đi'}" đã quyết toán xong tất cả các khoản chi! Không còn ai nợ ai.`;
  }

  const memberMap = new Map(members.map(m => [m.id, m]));
  const memberDebts = {};

  let totalDebt = 0;
  transfers.forEach(t => {
    totalDebt += t.amount;
    if (!memberDebts[t.fromMemberId]) {
      memberDebts[t.fromMemberId] = [];
    }
    memberDebts[t.fromMemberId].push(t);
  });

  const lines = [
    `📍 ${group?.name || 'Chuyến đi'} — TỔNG KẾT QUYẾT TOÁN TIỀN`,
    `⏱ Cập nhật: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
    '────────────────────'
  ];

  Object.entries(memberDebts).forEach(([fromId, list]) => {
    const sender = memberMap.get(fromId)?.nickname || memberMap.get(fromId)?.name || 'Thành viên';
    lines.push(`👤 ${sender}:`);
    list.forEach(t => {
      const receiver = memberMap.get(t.toMemberId)?.nickname || memberMap.get(t.toMemberId)?.name || 'Thành viên';
      lines.push(`  👉 Chuyển ${receiver}: ${formatCurrency(t.amount)}`);
    });
    lines.push('');
  });

  lines.push('────────────────────');
  lines.push(`💰 Tổng số tiền cần chuyển giao: ${formatCurrency(totalDebt)}`);
  lines.push('Mọi người chuyển khoản xong nhớ tick "Đã thanh toán" nhé! 🚀');

  return lines.join('\n');
}
