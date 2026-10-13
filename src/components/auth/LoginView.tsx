import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Clock,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { LanguageSelector } from '../common/LanguageSelector';

export const LoginView: React.FC = () => {
  const {
    login,
    setAuthView,
    signupSuccessMessage,
    registeredEmail,
    setSignupSuccessMessage,
    users,
    t
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pending / Rejected Status Interstitial
  const [approvalBlocked, setApprovalBlocked] = useState<{
    status: 'pending' | 'rejected';
    userName?: string;
  } | null>(null);

  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // If redirected from successful registration, prefill email
  useEffect(() => {
    if (registeredEmail) {
      setEmail(registeredEmail);
    }
  }, [registeredEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setApprovalBlocked(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Invalid email or password.');
      return;
    }

    const result = login(cleanEmail, password);
    if (!result.success) {
      if (result.approvalStatus === 'pending') {
        setApprovalBlocked({
          status: 'pending',
          userName: result.user?.name
        });
      } else if (result.approvalStatus === 'rejected') {
        setApprovalBlocked({
          status: 'rejected',
          userName: result.user?.name
        });
      } else {
        setError(result.message || 'Invalid email or password.');
      }
    }
  };

  const handleOpenSignUp = () => {
    setError(null);
    setSignupSuccessMessage(null);
    setApprovalBlocked(null);
    setAuthView('signup');
  };

  const handleRefreshStatus = () => {
    if (!email.trim() || !password) return;
    const cleanEmail = email.trim().toLowerCase();
    const result = login(cleanEmail, password);
    if (result.success) {
      setApprovalBlocked(null);
    } else if (result.approvalStatus === 'pending') {
      setApprovalBlocked({ status: 'pending', userName: result.user?.name });
    } else if (result.approvalStatus === 'rejected') {
      setApprovalBlocked({ status: 'rejected', userName: result.user?.name });
    } else {
      setApprovalBlocked(null);
      setError(result.message || 'Invalid email or password.');
    }
  };

  // 1. Pending Approval Interstitial Screen
  if (approvalBlocked?.status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/90 p-6 sm:p-8 text-center space-y-5 animate-in fade-in-50 zoom-in-95">
          <div className="w-16 h-16 bg-amber-50 border-2 border-amber-200 rounded-3xl flex items-center justify-center text-amber-600 mx-auto shadow-sm">
            <Clock className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-200">
              Account Under Review
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-2">
              {t.accountUnderReviewTitle}
            </h1>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-sm mx-auto">
              {t.accountUnderReviewDesc}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs space-y-1.5">
            <div className="flex justify-between text-slate-500">
              <span>Marketer:</span>
              <strong className="text-slate-800 font-semibold">
                {approvalBlocked.userName || email}
              </strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Status:</span>
              <span className="text-amber-700 font-bold uppercase">Pending Review</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleRefreshStatus}
              className="w-full min-h-[44px] py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.checkStatus}</span>
            </button>
            <button
              type="button"
              onClick={() => setApprovalBlocked(null)}
              className="w-full min-h-[40px] py-2 px-4 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              {t.backToLogin}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Rejected Approval Interstitial Screen
  if (approvalBlocked?.status === 'rejected') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/90 p-6 sm:p-8 text-center space-y-5 animate-in fade-in-50 zoom-in-95">
          <div className="w-16 h-16 bg-rose-50 border-2 border-rose-200 rounded-3xl flex items-center justify-center text-rose-600 mx-auto shadow-sm">
            <XCircle className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wide bg-rose-100 text-rose-800 border border-rose-200">
              Registration Declined
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-2">
              {t.registrationNotApprovedTitle}
            </h1>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-sm mx-auto">
              {t.registrationNotApprovedDesc}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setApprovalBlocked(null)}
              className="w-full min-h-[44px] py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.backToLogin}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Normal Login Screen
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 relative">
      {/* Top Bar with Language Selector */}
      <div className="w-full max-w-md flex justify-end mb-3 px-1">
        <LanguageSelector variant="compact" />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/90 p-6 sm:p-8">
        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-blue-600/20">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Alfa Service App
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Marketing Campaign & Posting Operations Platform
          </p>
        </div>

        {/* Success feedback after registration */}
        {signupSuccessMessage && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center gap-2.5 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{signupSuccessMessage}</span>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              {t.email}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="marketer@agency.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                {t.password}
              </label>
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                {t.forgotPassword}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label={showPassword ? t.hidePassword : t.showPassword}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{t.login}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
            Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@marketingapp.com');
                setPassword('Admin@123');
                setError(null);
                setApprovalBlocked(null);
              }}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold text-slate-800">Admin Account</div>
              <div className="text-[10.5px] text-slate-500 truncate">admin@marketingapp.com</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('marketer@marketingapp.com');
                setPassword('Marketer@123');
                setError(null);
                setApprovalBlocked(null);
              }}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300 text-left transition-colors cursor-pointer"
            >
              <div className="font-bold text-slate-800">Marketer Account</div>
              <div className="text-[10.5px] text-slate-500 truncate">marketer@marketingapp.com</div>
            </button>
          </div>
        </div>

        {/* Link to Signup */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={handleOpenSignUp}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            {t.dontHaveAccount}
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setForgotModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 space-y-4">
            <h3 className="text-base font-bold text-slate-900">{t.forgotPassword}</h3>
            {resetSent ? (
              <div className="space-y-3">
                <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  Password reset link has been sent to <strong>{resetEmail}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotModal(false);
                    setResetSent(false);
                  }}
                  className="w-full py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {t.close}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Enter your registered email address and we'll send instructions to reset your password.
                </p>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="marketer@agency.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (resetEmail.includes('@')) {
                        setResetSent(true);
                      }
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg cursor-pointer"
                  >
                    Send Instructions
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
