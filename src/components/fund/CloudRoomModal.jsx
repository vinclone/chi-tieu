import React, { useState } from 'react';
import { 
  Cloud, 
  Copy, 
  Check, 
  Share2, 
  RefreshCw, 
  KeyRound, 
  ExternalLink, 
  Users, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import Modal from '../common/Modal.jsx';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { cloudStorageService } from '../../services/cloudStorageService.js';

export default function CloudRoomModal({ isOpen, onClose }) {
  const { 
    roomCode, 
    changeRoomCode, 
    syncStatus, 
    lastSyncedAt, 
    syncCloudNow 
  } = useApp();
  const { showToast } = useToast();

  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const shareableUrl = cloudStorageService.getShareableLink(roomCode);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareableUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareableUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      showToast('Đã sao chép link chia sẻ vào bộ nhớ tạm!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Không thể sao chép, vui lòng copy thủ công', 'error');
    }
  };

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(roomCode);
      }
      showToast(`Đã sao chép mã chuyến đi: ${roomCode}`);
    } catch {
      // ignore
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const cleanCode = cloudStorageService.normalizeRoomCode(inputCode);
    setIsSyncing(true);
    try {
      await changeRoomCode(cleanCode);
      showToast(`Đã chuyển sang chuyến đi đám mây "${cleanCode}"!`);
      setInputCode('');
      onClose();
    } catch (err) {
      showToast('Lỗi kết nối phòng: ' + err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateNewRoom = async () => {
    const newCode = cloudStorageService.generateRoomCode('TRIP');
    setIsSyncing(true);
    try {
      await changeRoomCode(newCode);
      showToast(`Đã tạo chuyến đi đám mây mới: ${newCode}!`);
      onClose();
    } catch (err) {
      showToast('Lỗi tạo chuyến đi: ' + err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await syncCloudNow();
      showToast('Đã cập nhật dữ liệu mới nhất từ Đám mây!');
    } catch (err) {
      showToast('Lỗi đồng bộ: ' + err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lưu Trữ & Đồng Bộ Đám Mây (Cloud Database)">
      <div className="space-y-5 text-slate-800 text-xs">
        {/* Cloud Status Banner */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">
                  Đám Mây: <span className="font-mono text-emerald-800 tracking-wider">{roomCode}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Trực tuyến
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Dữ liệu được lưu trữ thật trên máy chủ Đám mây, chia sẻ dùng chung cho cả nhóm.
              </p>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            type="button"
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs transition-colors shrink-0"
            title="Làm mới / Đồng bộ lại từ đám mây"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>

        {/* Share Section: Link & Code */}
        <div className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-emerald-600" />
              Đường link chia sẻ cho bạn bè (Mở điện thoại / PC):
            </span>
            <button
              onClick={handleCopyCode}
              type="button"
              className="text-[11px] font-mono text-emerald-700 hover:underline"
            >
              Chỉ chép mã ({roomCode})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareableUrl}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all outline-none"
            />
            <button
              onClick={handleCopyLink}
              type="button"
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 shadow-xs ${
                copied
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Đã chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Chép link</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            💡 <strong>Cách dùng:</strong> Gửi link này vào nhóm Zalo/Messenger của bạn bè. Bất kỳ ai mở link trên iPhone, Android hay máy tính đều xem chung và nhập chi tiêu cùng lúc. Mọi thay đổi đều được lưu trực tiếp lên máy chủ đám mây!
          </p>
        </div>

        {/* Join or Switch Room Form */}
        <form onSubmit={handleJoinRoom} className="space-y-3 pt-2 border-t border-slate-100">
          <label className="font-bold text-slate-700 block">
            Tham gia hoặc đổi sang Mã Chuyến Đi khác:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="VD: DALAT-2026 hoặc TRIP-X84Y"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="flex-1 bg-white border border-slate-300 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs uppercase font-mono tracking-wider outline-none"
            />
            <button
              type="submit"
              disabled={!inputCode.trim() || isSyncing}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 active:bg-black disabled:opacity-50 text-white font-bold rounded-xl transition-colors shrink-0"
            >
              Tham gia
            </button>
          </div>
        </form>

        {/* Create new random room button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Muốn bắt đầu chuyến đi mới độc lập?
          </span>
          <button
            onClick={handleCreateNewRoom}
            type="button"
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            <span>Tạo mã chuyến đi mới</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
