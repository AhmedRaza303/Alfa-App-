import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  ArrowLeft,
  ArrowRight,
  Camera,
  Trash2,
  Mail,
  User,
  Phone,
  Lock,
  AlertCircle,
  Upload,
  CheckCircle2,
  Instagram,
  Eye,
  EyeOff,
  Globe,
  MapPin,
  Check,
  Building,
  CheckSquare,
  Square
} from 'lucide-react';
import { LanguageSelector } from '../common/LanguageSelector';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  getCountryByCode,
  getCountryByDialCode,
  formatPhoneAsYouType,
  validateInternationalPhone,
  CountryInfo
} from '../../utils/countries';
import { FlyerLanguage, FlyerCategory } from '../../types';

export const SignUpView: React.FC = () => {
  const { signup, setAuthView, users, t } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wizard Step: 1 | 2
  const [step, setStep] = useState<1 | 2>(1);

  // STEP 1 Fields (Personal Profile)
  const [avatar, setAvatar] = useState<string>('');
  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [preferredFlyerLanguage, setPreferredFlyerLanguage] = useState<FlyerLanguage>('en');
  const [preferredFlyerCategories, setPreferredFlyerCategories] = useState<FlyerCategory[]>([
    'work_injury',
    'car_accident'
  ]);

  // STEP 2 Fields (Account & Location)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(DEFAULT_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // General error state & submission success screen
  const [error, setError] = useState<string | null>(null);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  // Avatar Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setError('Unsupported image format. Please upload JPG, PNG, or WEBP.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large. Maximum size is 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Category toggle handler
  const handleToggleCategory = (cat: FlyerCategory) => {
    setPreferredFlyerCategories((prev) => {
      if (prev.includes(cat)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter((c) => c !== cat);
      } else {
        return [...prev, cat];
      }
    });
  };

  // Country change handler (Synchronizes Phone dialing code & resets incompatible state)
  const handleCountryChange = (countryCode: string) => {
    const nextCountry = getCountryByCode(countryCode);
    setSelectedCountry(nextCountry);
    setState(''); // Reset state/region on country change
    setError(null);
  };

  // Phone input formatting
  const handlePhoneChange = (val: string) => {
    const formatted = formatPhoneAsYouType(val, selectedCountry.code);
    setPhoneNumber(formatted);
    setError(null);
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleContinueToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
      return;
    }

    if (preferredFlyerCategories.length === 0) {
      setError('Please select at least one preferred flyer category.');
      return;
    }

    setStep(2);
  };

  // Step 2 Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Email validation & duplicate check
    const cleanEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailPattern.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    const alreadyExists = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (alreadyExists) {
      setError('An account with this email is already registered. Please sign in instead.');
      return;
    }

    // 2. Password validation (minimum 8 chars with letter & number)
    if (!password || password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    if (!hasLetter || !hasDigit) {
      setError('Password must contain at least one letter and one number.');
      return;
    }

    // 3. International Phone validation
    const phoneValidation = validateInternationalPhone(
      phoneNumber.startsWith('+') ? phoneNumber : `${selectedCountry.dialCode} ${phoneNumber}`,
      selectedCountry.code
    );
    if (!phoneValidation.isValid) {
      setError(phoneValidation.error || 'Please enter a valid international phone number.');
      return;
    }

    // 4. Location fields validation
    if (!state.trim()) {
      setError('Please select or enter your State / Province.');
      return;
    }
    if (!city.trim()) {
      setError('Please enter your City.');
      return;
    }
    if (!postalCode.trim()) {
      setError('Please enter your Postal Code.');
      return;
    }

    // Normalize Instagram handle
    const cleanInstagram = instagram.trim()
      ? instagram.trim().startsWith('@')
        ? instagram.trim()
        : `@${instagram.trim()}`
      : undefined;

    // Create new applicant in AppContext with approvalStatus = 'pending'
    signup({
      name: name.trim(),
      email: cleanEmail,
      password: password,
      phone: phoneNumber.trim(),
      phoneCountryCode: selectedCountry.dialCode,
      instagram: cleanInstagram,
      avatar:
        avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      role: 'Marketer',
      company: 'BrandPulse Agency',
      approvalStatus: 'pending',
      preferredFlyerLanguage,
      preferredFlyerCategories,
      country: selectedCountry.name,
      countryCode: selectedCountry.code,
      state: state.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      registeredAt: new Date().toISOString(),
      hasCompletedTour: false
    });

    // Show Confirmation Screen
    setIsSubmittedSuccess(true);
  };

  // SUCCESS CONFIRMATION VIEW
  if (isSubmittedSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/90 p-6 sm:p-8 text-center space-y-5 animate-in fade-in-50 zoom-in-95">
          <div className="w-16 h-16 bg-amber-50 border-2 border-amber-200 rounded-3xl flex items-center justify-center text-amber-600 mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-200">
              Pending Admin Approval
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-2">
              {t.registrationSubmittedTitle}
            </h1>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-sm mx-auto">
              {t.registrationSubmittedDesc}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs space-y-1.5">
            <div className="flex justify-between text-slate-500">
              <span>Account:</span>
              <strong className="text-slate-800 font-semibold">{name}</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Email:</span>
              <strong className="text-slate-800 font-semibold">{email}</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Status:</span>
              <span className="text-amber-700 font-bold uppercase">Pending</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="w-full min-h-[44px] py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t.backToLogin}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 relative">
      {/* Top Header with Back Button and Language Selector */}
      <div className="w-full max-w-md flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={() => (step === 2 ? setStep(1) : setAuthView('login'))}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 2 ? t.back : t.backToLogin}</span>
        </button>

        {/* Language Selector */}
        <LanguageSelector variant="compact" />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/90 p-6 sm:p-8">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-5">
          <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-2 shadow-sm shadow-blue-600/20">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t.getStartedHeading}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.getStartedSubtitle}
          </p>

          {/* Progress Indicator: Step 1 of 2 / Step 2 of 2 */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step === 1 ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-emerald-500'
                }`}
              />
              <span
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  step === 2 ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-200'
                }`}
              />
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              {t.stepIndicator(step, 2)}
            </span>
          </div>
        </div>

        {/* Validation Error Banner */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: PERSONAL PROFILE                                                  */}
        {/* ========================================================================= */}
        {step === 1 && (
          <form onSubmit={handleContinueToStep2} className="space-y-4">
            {/* 1. Profile Picture */}
            <div className="flex flex-col items-center pb-1">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center shadow-xs">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-9 h-9 text-slate-400" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-all cursor-pointer"
                  title={t.uploadPhoto}
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex items-center gap-3 mt-2 text-xs">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  {avatar ? t.changePhoto : t.uploadPhoto}
                </button>
                {avatar && (
                  <>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="font-medium text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                    >
                      {t.removePhoto}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* 2. Name (Required) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                {t.name} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  placeholder="Raphael Rivera"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>
            </div>

            {/* 3. Instagram Handle (Optional) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                {t.instagramHandle} <span className="text-slate-400 font-normal">({t.optional})</span>
              </label>
              <div className="relative">
                <Instagram className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => {
                    setInstagram(e.target.value);
                    setError(null);
                  }}
                  placeholder="@marketer.campaigns"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>
            </div>

            {/* 4. Preferred Flyer Language */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                {t.preferredFlyerLanguage} <span className="text-rose-500">*</span>
              </label>
              <select
                value={preferredFlyerLanguage}
                onChange={(e) => setPreferredFlyerLanguage(e.target.value as FlyerLanguage)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow cursor-pointer"
              >
                <option value="en">English</option>
                <option value="es">Spanish (Español)</option>
              </select>
            </div>

            {/* 5. Preferred Flyer Category (Multi-select) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                {t.preferredFlyerCategory} <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleCategory('work_injury')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    preferredFlyerCategories.includes('work_injury')
                      ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-3xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{t.workInjury}</span>
                  {preferredFlyerCategories.includes('work_injury') ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleCategory('car_accident')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    preferredFlyerCategories.includes('car_accident')
                      ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-3xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{t.carAccident}</span>
                  {preferredFlyerCategories.includes('car_accident') ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Actions: Back to Login & Continue */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setAuthView('login')}
                className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {t.backToLogin}
              </button>

              <button
                type="submit"
                className="w-1/2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t.continue}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ACCOUNT & LOCATION                                                */}
        {/* ========================================================================= */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* 1. Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                {t.email} <span className="text-rose-500">*</span>
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>
            </div>

            {/* 2. Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                {t.password} <span className="text-rose-500">*</span>
              </label>
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
              <p className="text-[10.5px] text-slate-500 mt-1">
                {t.passwordRequirements}
              </p>
            </div>

            {/* 3. Country (Synchronized with Phone Code) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                {t.country} <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCountry.code}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.dialCode})
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Phone Number (Country-aware) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                {t.phoneNumber} <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shrink-0 select-none">
                  <span>{selectedCountry.flag}</span>
                  <span>{selectedCountry.dialCode}</span>
                </span>
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="300 1234567"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  />
                </div>
              </div>
            </div>

            {/* 5. State / Region */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                {t.state} <span className="text-rose-500">*</span>
              </label>
              {selectedCountry.states && selectedCountry.states.length > 0 ? (
                <select
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setError(null);
                  }}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow cursor-pointer"
                >
                  <option value="">{t.selectState}</option>
                  {selectedCountry.states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setError(null);
                  }}
                  placeholder={t.enterCity}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              )}
            </div>

            {/* 6. City & Postal Code (Side-by-side) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  {t.city} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setError(null);
                  }}
                  placeholder="Los Angeles"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  {t.postalCode} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    setError(null);
                  }}
                  placeholder={selectedCountry.postalPlaceholder}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>
            </div>

            {/* Actions: Back & Sign Up */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.back}</span>
              </button>

              <button
                type="submit"
                className="w-2/3 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t.signUp}</span>
                <Check className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
