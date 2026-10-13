import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, setAuthView, signupSuccessMessage, registeredEmail, setSignupSuccessMessage } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotModal, setForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // If redirected from successful registration, prefill email and clear any prior error
  useEffect(() => {
    if (registeredEmail) {
      setEmail(registeredEmail);
    }
  }, [registeredEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Invalid email or password.');
      return;
    }

    const result = login(email, password);
    if (!result.success) {
      setError(result.message || 'Invalid email or password.');
    }
  };

  const handleOpenSignUp = () => {
    setError(null);
    setSignupSuccessMessage(null);
    setAuthView('signup');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/90 p-6 sm:p-8">
        {/* Brand Lockup */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-md shadow-blue-600/20">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            MarketPulse
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Marketer Communication & Posting Management Platform
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
              Email
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
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Forgot Password?
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
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full min-h-[46px] py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
          >
            <span>Login</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Fixed Demo Accounts Quick Selection */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 text-center">
            Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@marketingapp.com');
                setPassword('Admin@123');
                setError(null);
              }}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-200 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Admin</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">Role: Admin</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">admin@marketingapp.com</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('marketer@marketingapp.com');
                setPassword('Marketer@123');
                setError(null);
              }}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-200 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Marketer</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Role: Marketer</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">marketer@marketingapp.com</p>
            </button>
          </div>
        </div>

        {/* Section 1: Clearly visible "Create New Account" button */}
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 mb-2.5">
            New marketer to the platform?
          </p>
          <button
            type="button"
            onClick={handleOpenSignUp}
            className="w-full min-h-[44px] py-2.5 px-4 bg-slate-50 hover:bg-slate-100/90 active:bg-slate-200 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Create New Account</span>
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setForgotModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6 z-10 space-y-3">
            <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
            <p className="text-xs text-slate-500">
              Enter your work email address to receive password instructions.
            </p>
            {resetSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                Instructions sent to {resetEmail || 'your email'}! (Simulated)
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setResetSent(true);
                }}
                className="space-y-3"
              >
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@agency.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModal(false);
                      setResetSent(false);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-600"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
