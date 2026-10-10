import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { UserCheck, Shield, Plus, Trash2, Mail, Key, Check } from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const { currentStore, memberships, addStaffMember, removeStaffMember, userRole, setUserRole } =
    useStore();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'staff' | 'owner'>('staff');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const storeMemberships = memberships.filter(m => m.storeId === currentStore.id);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;

    addStaffMember(inviteEmail.trim(), inviteName.trim(), inviteRole);
    setInviteEmail('');
    setInviteName('');
    setShowInviteModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff & Permissions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage multi-tenant store collaborators, RBAC access controls, and administrative roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Testing Role Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <span className="text-[11px] text-slate-400 pl-1.5">Your Active View:</span>
            <button
              onClick={() => setUserRole('owner')}
              className={`px-2.5 py-1 rounded-lg transition ${
                userRole === 'owner' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Owner
            </button>
            <button
              onClick={() => setUserRole('staff')}
              className={`px-2.5 py-1 rounded-lg transition ${
                userRole === 'staff' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
              }`}
            >
              Staff
            </button>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Collaborator
          </button>
        </div>
      </div>

      {/* Role explanation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900">Owner Role</h3>
          </div>
          <p className="text-slate-500">
            Full authority over store configurations, publishing, deleting the store, theme visual changes, and adding new staff members.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1.5 text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900">Staff Role</h3>
          </div>
          <p className="text-slate-500">
            Authorized to manage products, catalog inventory adjustments, view incoming orders, and process order fulfillment transitions.
          </p>
        </div>
      </div>

      {/* Memberships Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Current Members ({storeMemberships.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {storeMemberships.map(mem => (
            <div
              key={mem.id}
              className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                  {mem.userName.slice(0, 1)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{mem.userName}</p>
                  <p className="text-slate-500 text-[11px]">{mem.userEmail}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    mem.role === 'owner'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {mem.role}
                </span>

                {mem.role !== 'owner' && (
                  <button
                    onClick={() => removeStaffMember(mem.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600"
                    title="Remove access"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900">Add Store Collaborator</h3>
            <p className="text-xs text-slate-500 mt-1">
              Grant a team member access to manage this store.
            </p>

            <form onSubmit={handleInvite} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Collaborator Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="alex@team.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="staff">Staff (Catalog & Order Fulfillment)</option>
                  <option value="owner">Owner (Full Store Admin)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-sm"
                >
                  Add Collaborator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
