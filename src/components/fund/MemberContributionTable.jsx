import React, { useState, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Search, 
  ClipboardPaste 
} from 'lucide-react';
import { formatCurrency, parseCurrencyInput, parseVietnameseMoneyText } from '../../utils/currency.js';
import { useToast } from '../../context/ToastContext.jsx';

export default function MemberContributionTable({
  members = [],
  plannedContribution = 0,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  onOpenPasteModal
}) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  // New inline row state
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState(plannedContribution ? String(plannedContribution) : '');
  const [newStatus, setNewStatus] = useState('paid');
  const [newNote, setNewNote] = useState('');

  React.useEffect(() => {
    if (plannedContribution) {
      setNewAmount(String(plannedContribution));
    }
  }, [plannedContribution]);

  const nameInputRef = useRef(null);

  const filteredMembers = members.filter(m => 
    !searchQuery.trim() || 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.nickname && m.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (m.paymentNote && m.paymentNote.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalCollected = members.reduce((sum, m) => {
    const paid = typeof m.paidAmount === 'number' 
      ? m.paidAmount 
      : (m.paymentStatus === 'paid' ? (m.contributionAmount || plannedContribution) : 0);
    return sum + (Number(paid) || 0);
  }, 0);

  const handleAddSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newName.trim()) {
      showToast('Vui lòng nhập tên thành viên', 'warning');
      nameInputRef.current?.focus();
      return;
    }

    const amount = parseVietnameseMoneyText(newAmount) || plannedContribution || 0;

    onAddMember({
      name: newName.trim(),
      contributionAmount: amount,
      paidAmount: newStatus === 'unpaid' ? 0 : amount,
      paymentStatus: newStatus,
      paymentNote: newNote.trim()
    });

    setNewName('');
    setNewNote('');
    nameInputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddSubmit();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Table header bar */}
      <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-700 text-white rounded-lg shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Đóng Góp Quỹ Thành Viên
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              {members.length} người • Định mức: {formatCurrency(plannedContribution)}/người
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick search */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm thành viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-40"
            />
          </div>

          {/* Paste from Excel */}
          <button
            onClick={onOpenPasteModal}
            type="button"
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 text-emerald-800 text-xs font-semibold rounded-lg transition-colors shrink-0 whitespace-nowrap min-h-[32px]"
            title="Dán danh sách thành viên từ Excel / Google Sheets"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Dán từ Excel</span>
          </button>
        </div>
      </div>

      {/* MOBILE VIEW: Clean Touch Cards (md:hidden) */}
      <div className="md:hidden divide-y divide-slate-100 overflow-y-auto flex-1 p-2.5 space-y-2.5">
        {filteredMembers.length === 0 && (
          <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs font-semibold text-slate-600">Chưa có thành viên nào</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Nhập tên thành viên bên dưới để bắt đầu</p>
          </div>
        )}
        {filteredMembers.map((member, index) => (
          <div key={member.id} className="bg-slate-50/90 border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => onUpdateMember(member.id, { name: e.target.value })}
                  className="font-bold text-slate-900 bg-transparent border-b border-transparent focus:border-emerald-500 focus:bg-white rounded px-1 text-sm outline-none w-full"
                />
              </div>

              <div className="text-right shrink-0">
                <input
                  type="text"
                  value={member.contributionAmount?.toLocaleString('vi-VN') || ''}
                  onChange={(e) => {
                    const parsed = parseCurrencyInput(e.target.value);
                    onUpdateMember(member.id, { 
                      contributionAmount: parsed,
                      paidAmount: member.paymentStatus === 'paid' ? parsed : member.paidAmount
                    });
                  }}
                  className="w-24 text-right font-mono font-bold text-emerald-800 bg-transparent border-b border-transparent focus:border-emerald-500 focus:bg-white rounded px-1 text-sm outline-none"
                />
                <span className="text-[10px] text-slate-400 font-bold ml-0.5">₫</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 text-xs">
              <select
                value={member.paymentStatus || 'paid'}
                onChange={(e) => {
                  const newStat = e.target.value;
                  const newPaid = newStat === 'paid' ? (member.contributionAmount || plannedContribution) : (newStat === 'unpaid' ? 0 : member.paidAmount);
                  onUpdateMember(member.id, { paymentStatus: newStat, paidAmount: newPaid });
                }}
                className="flex-1 bg-white border border-slate-300 focus:border-emerald-500 rounded-lg px-2 py-1.5 text-xs outline-none font-medium min-h-[36px]"
              >
                <option value="paid">✓ Đã đóng</option>
                <option value="unpaid">✗ Chưa đóng</option>
                <option value="partial">⏳ Đóng một phần</option>
                <option value="refunded">↺ Đã hoàn tiền</option>
              </select>

              <button
                onClick={() => onDeleteMember(member.id)}
                type="button"
                className="p-2 text-slate-400 hover:text-rose-600 active:bg-rose-50 rounded-lg transition-colors shrink-0"
                title="Xóa thành viên"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="Ghi chú (Note): CK VCB, tiền mặt..."
                value={member.paymentNote || ''}
                onChange={(e) => onUpdateMember(member.id, { paymentNote: e.target.value })}
                className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs outline-none text-slate-600 shadow-2xs"
              />
            </div>
          </div>
        ))}

        {/* Mobile Quick Add Card */}
        <div className="bg-emerald-50/60 border-2 border-dashed border-emerald-300 rounded-xl p-3 space-y-2">
          <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Thêm thành viên nhanh
          </span>
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              placeholder="Tên thành viên mới..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-white border border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs outline-none font-medium min-h-[36px]"
            />
            <input
              type="text"
              placeholder="450.000"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-24 text-right bg-white border border-slate-300 focus:border-emerald-500 rounded-lg px-2 py-1.5 text-xs outline-none font-mono font-bold text-emerald-800 min-h-[36px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ghi chú đóng tiền..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-white border border-slate-300 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs outline-none min-h-[36px]"
            />
            <button
              onClick={handleAddSubmit}
              type="button"
              className="px-3.5 py-1.5 bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-lg shrink-0 flex items-center gap-1 shadow-xs min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm</span>
            </button>
          </div>
        </div>
      </div>

      {/* DESKTOP SPREADSHEET TABLE (hidden md:block) */}
      <div className="hidden md:block overflow-x-auto flex-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
              <th className="py-2 px-2 w-9 text-center">STT</th>
              <th className="py-2 px-2 min-w-[110px]">Họ và tên</th>
              <th className="py-2 px-2 min-w-[90px] text-right">Tiền đóng</th>
              <th className="py-2 px-2 min-w-[105px]">Trạng thái</th>
              <th className="py-2 px-3 min-w-[150px]">Ghi chú (Note)</th>
              <th className="py-2 px-1 w-8 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-xs font-semibold text-slate-600">Chưa có thành viên nào</span>
                    <span className="text-[11px] text-slate-400">Thêm thành viên ở dòng bên dưới hoặc bấm "Dán từ Excel"</span>
                  </div>
                </td>
              </tr>
            )}
            {filteredMembers.map((member, index) => (
              <tr key={member.id} className="hover:bg-emerald-50/30 transition-colors group">
                <td className="py-2 px-3 text-center text-slate-500 font-mono">
                  {index + 1}
                </td>
                <td className="py-2 px-3 font-medium text-slate-900">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => onUpdateMember(member.id, { name: e.target.value })}
                    className="w-full bg-transparent border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded px-1 py-0.5 outline-none transition-colors"
                  />
                </td>
                <td className="py-2 px-3 text-right font-medium text-slate-800">
                  <input
                    type="text"
                    value={member.contributionAmount?.toLocaleString('vi-VN') || ''}
                    onChange={(e) => {
                      const parsed = parseCurrencyInput(e.target.value);
                      onUpdateMember(member.id, { 
                        contributionAmount: parsed,
                        paidAmount: member.paymentStatus === 'paid' ? parsed : member.paidAmount
                      });
                    }}
                    className="w-full text-right bg-transparent border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded px-1 py-0.5 outline-none font-mono transition-colors"
                  />
                </td>
                <td className="py-2 px-3">
                  <select
                    value={member.paymentStatus || 'paid'}
                    onChange={(e) => {
                      const newStat = e.target.value;
                      const newPaid = newStat === 'paid' ? (member.contributionAmount || plannedContribution) : (newStat === 'unpaid' ? 0 : member.paidAmount);
                      onUpdateMember(member.id, { paymentStatus: newStat, paidAmount: newPaid });
                    }}
                    className="bg-transparent border border-slate-200 hover:border-slate-300 focus:border-emerald-500 rounded px-2 py-0.5 text-xs outline-none"
                  >
                    <option value="paid">✓ Đã đóng</option>
                    <option value="unpaid">✗ Chưa đóng</option>
                    <option value="partial">⏳ Đóng một phần</option>
                    <option value="refunded">↺ Đã hoàn tiền</option>
                  </select>
                </td>
                <td className="py-2 px-3 text-slate-600">
                  <input
                    type="text"
                    value={member.paymentNote || ''}
                    placeholder="VD: Chuyển khoản VCB, Tiền mặt..."
                    onChange={(e) => onUpdateMember(member.id, { paymentNote: e.target.value })}
                    className="w-full bg-transparent border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded px-1 py-0.5 outline-none text-xs transition-colors"
                  />
                </td>
                <td className="py-2 px-2 text-center">
                  <button
                    onClick={() => onDeleteMember(member.id)}
                    type="button"
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-all"
                    title="Xóa thành viên"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}

            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan="6" className="py-6 text-center text-slate-400 text-xs">
                  Không tìm thấy thành viên nào. Hãy nhập bên dưới để thêm mới.
                </td>
              </tr>
            )}

            {/* Fast Inline Row for Adding New Members */}
            <tr className="bg-emerald-50/40 border-t-2 border-emerald-200">
              <td className="py-2 px-3 text-center text-emerald-700 font-bold">
                +
              </td>
              <td className="py-2 px-3">
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="Nhập họ tên thành viên..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-white border border-slate-300 focus:border-emerald-500 rounded px-2 py-1 text-xs outline-none shadow-sm"
                />
              </td>
              <td className="py-2 px-3">
                <input
                  type="text"
                  placeholder="450.000"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full text-right bg-white border border-slate-300 focus:border-emerald-500 rounded px-2 py-1 text-xs outline-none font-mono shadow-sm"
                />
              </td>
              <td className="py-2 px-3">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-emerald-500 rounded px-2 py-1 text-xs outline-none shadow-sm"
                >
                  <option value="paid">✓ Đã đóng</option>
                  <option value="unpaid">✗ Chưa đóng</option>
                  <option value="partial">⏳ Đóng một phần</option>
                </select>
              </td>
              <td className="py-2 px-3">
                <input
                  type="text"
                  placeholder="Ghi chú (CK / Tiền mặt)..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-white border border-slate-300 focus:border-emerald-500 rounded px-2 py-1 text-xs outline-none shadow-sm"
                />
              </td>
              <td className="py-2 px-2 text-center">
                <button
                  onClick={handleAddSubmit}
                  type="button"
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors shadow-sm"
                  title="Thêm (Enter)"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Total Bar (Full-width, cleanly formatted on both mobile & desktop) */}
      <div className="bg-slate-100/90 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-800">
        <span>Tổng thực thu ({members.length} người):</span>
        <span className="font-mono text-emerald-800 font-bold text-sm whitespace-nowrap">
          {formatCurrency(totalCollected)}
        </span>
      </div>
    </div>
  );
}
