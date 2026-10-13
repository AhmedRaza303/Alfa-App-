import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EditProfileModal } from './EditProfileModal';
import {
  User,
  Mail,
  Phone,
  Edit3,
  KeyRound,
  LogOut,
  Instagram,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, logout, showToast } = useApp();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  if (!currentUser) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPwdError('Password must be at least 6 characters.');
      return;
    }
    setPasswordModalOpen(false);
    setNewPassword('');
    setShowNewPassword(false);
    setPwdError(null);
    showToast('Password updated successfully', 'success');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      {/* Profile Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="max-w-md mx-auto flex flex-col items-center text-center">
          <div className="relative mb-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div className="flex items-center gap-2 mt-1">
            <h2 className="text-lg font-bold text-slate-900">
              {currentUser.name}
            </h2>
            <span
              className={`text-[11px] font-black tracking-wide uppercase px-2.5 py-0.5 rounded-full border ${
                currentUser.role === 'Admin'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {currentUser.role}
            </span>
          </div>

          {currentUser.instagram && (
            <p className="text-xs font-semibold text-blue-600 mb-1">
              {currentUser.instagram}
            </p>
          )}
          <p className="text-xs text-slate-500 max-w-sm">
            {currentUser.role} Account · {currentUser.company || 'MarketPulse Workspace'}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="min-h-[40px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
            <button
              type="button"
              onClick={() => setPasswordModalOpen(true)}
              className="min-h-[40px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Security</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 max-w-md mx-auto w-full space-y-4">
        {/* Account Information */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Account Information
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Role
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  currentUser.role === 'Admin'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {currentUser.role}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" /> Name
              </span>
              <span className="font-semibold text-slate-800">{currentUser.name}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
              </span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                {currentUser.email}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
              </span>
              <span className="font-semibold text-slate-800">{currentUser.phone}</span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 flex items-center gap-2">
                <Instagram className="w-3.5 h-3.5 text-slate-400" /> Instagram Handle
              </span>
              <span className="font-semibold text-blue-700">
                {currentUser.instagram || 'Not set'}
              </span>
            </div>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="pt-2">
          <button
            type="button"
            onClick={logout}
            className="w-full min-h-[44px] py-2.5 px-4 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setPasswordModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Change Password</h3>
            {pwdError && (
              <p className="text-xs text-rose-600 font-medium">{pwdError}</p>
            )}
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPwdError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg shadow-xs cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
