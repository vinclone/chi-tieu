import React, { useState } from 'react';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import GroupFormModal from './GroupFormModal';
import { useApp } from '../../context/AppContext';
import { formatDateRange } from '../../utils/date';
import {
  FolderGit2,
  Plus,
  Check,
  Edit2,
  Trash2,
  Archive,
  ArchiveRestore,
  MapPin,
  Users,
  Receipt
} from 'lucide-react';

export default function GroupSwitcherModal({ isOpen, onClose }) {
  const {
    data,
    activeGroup,
    switchGroup,
    addGroup,
    updateGroup,
    deleteGroup,
    archiveGroup
  } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  const activeGroups = data.groups.filter(g => !g.isArchived);
  const archivedGroups = data.groups.filter(g => g.isArchived);
  const displayedGroups = showArchived ? archivedGroups : activeGroups;

  const handleSelectGroup = (groupId) => {
    switchGroup(groupId);
    onClose();
  };

  const handleSaveGroup = (groupData) => {
    if (groupToEdit) {
      updateGroup(groupToEdit.id, groupData);
    } else {
      addGroup(groupData);
    }
    setGroupToEdit(null);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Quản lý chuyến đi & nhóm" maxWidth="max-w-2xl">
        <div className="space-y-4">
          {/* Header Actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setShowArchived(false)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  !showArchived ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Đang hoạt động ({activeGroups.length})
              </button>
              <button
                type="button"
                onClick={() => setShowArchived(true)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  showArchived ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Đã lưu trữ ({archivedGroups.length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setGroupToEdit(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo chuyến đi mới</span>
            </button>
          </div>

          {/* Group List */}
          <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
            {displayedGroups.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                {showArchived ? 'Chưa có chuyến đi nào được lưu trữ.' : 'Chưa có chuyến đi nào.'}
              </div>
            ) : (
              displayedGroups.map(group => {
                const isCurrent = group.id === activeGroup?.id;
                const memberCount = data.members.filter(m => m.groupId === group.id).length;
                const expenseCount = data.expenses.filter(e => e.groupId === group.id).length;

                return (
                  <div
                    key={group.id}
                    onClick={() => handleSelectGroup(group.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isCurrent ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <FolderGit2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{group.name}</h4>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" /> Hiện tại
                            </span>
                          )}
                          {group.isArchived && (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                              Đã lưu trữ
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                          {group.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {group.location}
                            </span>
                          )}
                          <span>{formatDateRange(group.startDate, group.endDate)}</span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            {memberCount} thành viên
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Receipt className="w-3 h-3 text-slate-400" />
                            {expenseCount} khoản chi
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => {
                          setGroupToEdit(group);
                          setIsFormOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => archiveGroup(group.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        title={group.isArchived ? "Mở lại chuyến đi" : "Lưu trữ chuyến đi"}
                      >
                        {group.isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                      </button>
                      {data.groups.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setGroupToDelete(group)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Xóa chuyến đi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* Edit / Create Submodal */}
      <GroupFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setGroupToEdit(null);
        }}
        groupToEdit={groupToEdit}
        onSave={handleSaveGroup}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={() => {
          if (groupToDelete) {
            deleteGroup(groupToDelete.id);
            setGroupToDelete(null);
          }
        }}
        title="Xác nhận xóa chuyến đi"
        message={`Bạn có chắc chắn muốn xóa chuyến đi "${groupToDelete?.name}"? Mọi thành viên, khoản chi tiêu và thanh toán trong nhóm này sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
        confirmText="Xác nhận xóa"
      />
    </>
  );
}
