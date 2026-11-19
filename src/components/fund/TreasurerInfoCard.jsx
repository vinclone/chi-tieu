import React, { useState } from 'react';
import { 
  Building2, 
  CreditCard, 
  Phone, 
  CalendarClock, 
  Copy, 
  Check, 
  Edit3, 
  Save, 
  X, 
  UserCheck, 
  Info 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

export default function TreasurerInfoCard({ 
  group = {}, 
  onUpdateTreasurer 
}) {
  const { showToast } = useToast();
  const treasurer = group.treasurerInfo || {};

  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState(treasurer.name || group.representative || '');
  const [phone, setPhone] = useState(treasurer.phone || '');
  const [bankName, setBankName] = useState(treasurer.bankName || '');
  const [accountNumber, setAccountNumber] = useState(treasurer.accountNumber || '');
  const [accountHolder, setAccountHolder] = useState(treasurer.accountHolder || '');
  const [refundDeadline, setRefundDeadline] = useState(treasurer.refundDeadline || '');
  const [note, setNote] = useState(treasurer.note || '');

  // Keep state updated when group changes
  React.useEffect(() => {
    const t = group.treasurerInfo || {};
    setName(t.name || group.representative || '');
    setPhone(t.phone || '');
    setBankName(t.bankName || '');
    setAccountNumber(t.accountNumber || '');
    setAccountHolder(t.accountHolder || '');
    setRefundDeadline(t.refundDeadline || '');
    setNote(t.note || '');
  }, [group]);

  const handleCopyAccount = () => {
    if (!accountNumber) return;
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    showToast(`Đã sao chép STK: ${accountNumber}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateTreasurer({
      name,
      phone,
      bankName,
      accountNumber,
      accountHolder,
      refundDeadline,
      note
    });
    setIsEditing(false);
    showToast('Đã lưu thông tin thủ quỹ & ngân hàng thành công!');
  };

  const handleCancel = () => {
    const t = group.treasurerInfo || {};
    setName(t.name || group.representative || '');
    setPhone(t.phone || '');
    setBankName(t.bankName || '');
    setAccountNumber(t.accountNumber || '');
    setAccountHolder(t.accountHolder || '');
    setRefundDeadline(t.refundDeadline || '');
    setNote(t.note || '');
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-700 text-white rounded-lg">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Thông Tin Thủ Quỹ & Tài Khoản Hoàn Tiền
              </h3>
              <p className="text-xs text-slate-500">
                Người phụ trách thu quỹ, thanh toán và hoàn trả số dư
              </p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              type="button"
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Sửa</span>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={handleSave}
                type="button"
                className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded transition-colors font-medium"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu</span>
              </button>
              <button
                onClick={handleCancel}
                type="button"
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-3 text-xs">
            {/* Person & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[11px] block mb-0.5">Họ tên thủ quỹ / Đại diện</span>
                <span className="font-semibold text-slate-900">{name || 'Chưa cập nhật'}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 text-[11px] block mb-0.5">Số điện thoại / Zalo</span>
                <span className="font-semibold text-slate-900 font-mono flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {phone || 'Chưa cập nhật'}
                </span>
              </div>
            </div>

            {/* Bank Card Info */}
            <div className="p-3 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl shadow-inner relative overflow-hidden">
              <div className="flex items-center justify-between mb-2 text-xs text-blue-200">
                <span className="flex items-center gap-1 font-semibold uppercase tracking-wider text-[11px]">
                  <Building2 className="w-3.5 h-3.5 text-blue-300" />
                  {bankName || 'Ngân hàng'}
                </span>
                <CreditCard className="w-4 h-4 opacity-70" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-base font-bold tracking-wider text-white">
                    {accountNumber || '0000 0000 0000'}
                  </div>
                  <div className="text-[11px] uppercase tracking-wide text-blue-200/90 font-medium mt-0.5">
                    {accountHolder || name}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                  title="Sao chép số tài khoản"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã chép' : 'Chép STK'}</span>
                </button>
              </div>
            </div>

            {/* Deadline & Note */}
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200/60 text-amber-900 flex items-start gap-2">
              <CalendarClock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Hạn tất toán / hoàn tiền: </span>
                <span className="font-mono">{refundDeadline || 'Sau khi kết thúc chuyến đi'}</span>
                {note && <p className="text-[11px] text-amber-800/90 mt-0.5">{note}</p>}
              </div>
            </div>
          </div>
        ) : (
          /* Form for editing treasurer info */
          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 block mb-1">Họ tên thủ quỹ:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Số điện thoại:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 block mb-1">Ngân hàng:</label>
                <input
                  type="text"
                  value={bankName}
                  placeholder="VD: Vietcombank, Techcombank..."
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Số tài khoản:</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 block mb-1">Tên chủ tài khoản:</label>
                <input
                  type="text"
                  value={accountHolder}
                  placeholder="NGUYEN VAN AN"
                  onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                  className="w-full border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 uppercase font-mono"
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Hạn hoàn tiền:</label>
                <input
                  type="text"
                  value={refundDeadline}
                  placeholder="VD: 25/11/2026"
                  onChange={(e) => setRefundDeadline(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-600 block mb-1">Ghi chú hướng dẫn:</label>
              <textarea
                value={note}
                rows={2}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500"
              />
            </div>
          </form>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400" />
          Tiền thừa sẽ được chuyển khoản trực tiếp
        </span>
        <span>Mô hình Quỹ Nhóm</span>
      </div>
    </div>
  );
}
