import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  ArrowLeft,
  ArrowRight,
  Camera,
  Mail,
  User,
  Phone,
  Lock,
  AlertCircle,
  CheckCircle2,
  Instagram,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';
import { LanguageSelector } from '../common/LanguageSelector';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  getCountryByCode,
  formatPhoneAsYouType,
  validateInternationalPhone,
  sanitizeCityName,
  validateCityName,
  sanitizePostalCode,
  validatePostalCode,
  getMaxNationalPhoneLength,
  getExpectedNationalPhoneLength,
  getPhoneDigitCount,
  POSTAL_CODE_LENGTH,
  CountryInfo
} from '../../utils/countries';
import { FlyerLanguage, FlyerCategory } from '../../types';
import { FLYER_CATEGORIES, getFlyerCategoryLabel } from '../../utils/flyerCategories';

type FieldErrors = Partial<
  Record<
    | 'name'
    | 'email'
    | 'password'
    | 'phone'
    | 'state'
    | 'city'
    | 'postalCode'
    | 'categories',
    string
  >
>;

const inputBase =
  'w-full py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow';
const inputOk =
  'border-slate-300 focus:ring-blue-500 focus:border-blue-500';
const inputErr =
  'border-rose-400 focus:ring-rose-400 focus:border-rose-400 bg-rose-50/40';

export const SignUpView: React.FC = () => {
  const { signup, setAuthView, users, t, language } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2>(1);

  // STEP 1
  const [avatar, setAvatar] = useState<string>('');
  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [preferredFlyerLanguage, setPreferredFlyerLanguage] = useState<FlyerLanguage>('en');
  const [preferredFlyerCategories, setPreferredFlyerCategories] = useState<FlyerCategory[]>([]);

  // STEP 2
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(DEFAULT_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const phoneMax = useMemo(
    () => getMaxNationalPhoneLength(selectedCountry.code),
    [selectedCountry.code]
  );
  const phoneExpected = useMemo(
    () => getExpectedNationalPhoneLength(selectedCountry.code),
    [selectedCountry.code]
  );
  const phoneDigits = getPhoneDigitCount(phoneNumber);

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-zA-Z]/.test(password) && /\d/.test(password)) score += 1;
    if (password.length >= 12 || /[^a-zA-Z0-9]/.test(password)) score += 1;
    const labels = ['', 'Weak', 'Good', 'Strong'];
    return { score, label: labels[score] };
  }, [password]);

  const clearFieldError = (key: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCountryChange = (countryCode: string) => {
    const nextCountry = getCountryByCode(countryCode);
    setSelectedCountry(nextCountry);
    setState('');
    setPhoneNumber((prev) => formatPhoneAsYouType(prev, nextCountry.code));
    setError(null);
    clearFieldError('phone');
  };

  const handlePhoneChange = (val: string) => {
    setPhoneNumber(formatPhoneAsYouType(val, selectedCountry.code));
    setError(null);
    clearFieldError('phone');
  };

  const handleCityChange = (val: string) => {
    setCity(sanitizeCityName(val));
    setError(null);
    clearFieldError('city');
  };

  const handlePostalChange = (val: string) => {
    setPostalCode(sanitizePostalCode(val));
    setError(null);
    clearFieldError('postalCode');
  };

  const handleContinueToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nextErrors: FieldErrors = {};

    const cleanEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailPattern.test(cleanEmail)) {
      nextErrors.email = 'Please enter a valid email address.';
    } else if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      nextErrors.email = 'An account with this email is already registered. Please sign in instead.';
    }

    if (!password || password.length < 8) {
      nextErrors.password = 'Password must contain at least 8 characters.';
    } else if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      nextErrors.password = 'Password must contain at least one letter and one number.';
    }

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      nextErrors.name = 'Please enter your full name (minimum 2 characters).';
    }
    if (preferredFlyerCategories.length === 0) {
      nextErrors.categories = 'Please select at least one preferred flyer category.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError(Object.values(nextErrors)[0] || null);
      return;
    }

    setFieldErrors({});
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nextErrors: FieldErrors = {};

    const cleanEmail = email.trim().toLowerCase();

    const phoneValidation = validateInternationalPhone(
      phoneNumber.startsWith('+')
        ? phoneNumber
        : `${selectedCountry.dialCode} ${phoneNumber}`,
      selectedCountry.code
    );
    if (!phoneValidation.isValid) {
      nextErrors.phone =
        phoneValidation.error || 'Please enter a valid international phone number.';
    }

    if (!state.trim()) {
      nextErrors.state = 'Please select or enter your State / Province.';
    }

    const cityValidation = validateCityName(city);
    if (!cityValidation.isValid) {
      nextErrors.city = cityValidation.error;
    }

    const postalValidation = validatePostalCode(postalCode);
    if (!postalValidation.isValid) {
      nextErrors.postalCode = postalValidation.error;
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError(Object.values(nextErrors)[0] || null);
      return;
    }

    const cleanInstagram = instagram.trim()
      ? instagram.trim().startsWith('@')
        ? instagram.trim()
        : `@${instagram.trim()}`
      : undefined;

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
      postalCode: sanitizePostalCode(postalCode),
      registeredAt: new Date().toISOString(),
      hasCompletedTour: false
    });

    setIsSubmittedSuccess(true);
  };

  if (isSubmittedSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white flex flex-col justify-center items-center p-4 sm:p-6">
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

          <button
            type="button"
            onClick={() => setAuthView('login')}
            className="w-full min-h-[44px] py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t.backToLogin}</span>
          </button>
        </div>
      </div>
    );
  }

  const FieldHint = ({
    errorMsg,
    hint
  }: {
    errorMsg?: string;
    hint?: string;
  }) =>
    errorMsg ? (
      <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 shrink-0" />
        {errorMsg}
      </p>
    ) : hint ? (
      <p className="mt-1 text-[10.5px] text-slate-500">{hint}</p>
    ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <div className="w-full max-w-md flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={() => (step === 2 ? setStep(1) : setAuthView('login'))}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 2 ? t.back : t.backToLogin}</span>
        </button>
        <LanguageSelector variant="compact" />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/90 p-6 sm:p-8">
        <div className="text-center mb-5">
          <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-2 shadow-sm shadow-blue-600/20">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t.getStartedHeading}
          </h1>
          <p className="text-xs text-slate-500 mt-1">{t.getStartedSubtitle}</p>

          {/* Progress */}
          <div className="mt-4 px-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
              <span className={step === 1 ? 'text-blue-700' : 'text-emerald-600'}>
                {t.step1Title}
              </span>
              <span className={step === 2 ? 'text-blue-700' : ''}>{t.step2Title}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300 ease-out"
                style={{ width: step === 1 ? '50%' : '100%' }}
              />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1.5">
              {t.stepIndicator(step, 2)}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleContinueToStep2} className="space-y-4" noValidate>
            <div className="flex flex-col items-center pb-1">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center shadow-xs ring-4 ring-slate-50">
                  {avatar ? (
                    <img src={avatar} alt="Avatar preview" className="w-full h-full object-cover" />
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

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                {t.name} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                    clearFieldError('name');
                  }}
                  placeholder="Raphael Rivera"
                  className={`${inputBase} pl-10 pr-3.5 ${fieldErrors.name ? inputErr : inputOk}`}
                />
              </div>
              <FieldHint errorMsg={fieldErrors.name} />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                {t.email} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                    clearFieldError('email');
                  }}
                  placeholder="marketer@agency.com"
                  className={`${inputBase} pl-10 pr-3.5 ${fieldErrors.email ? inputErr : inputOk}`}
                />
              </div>
              <FieldHint errorMsg={fieldErrors.email} />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                {t.password} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                    clearFieldError('password');
                  }}
                  placeholder="••••••••"
                  className={`${inputBase} pl-10 pr-10 ${fieldErrors.password ? inputErr : inputOk}`}
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
              {password && !fieldErrors.password && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden flex gap-0.5">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className={`h-full flex-1 rounded-full transition-colors ${
                          passwordStrength.score >= n
                            ? passwordStrength.score === 1
                              ? 'bg-rose-400'
                              : passwordStrength.score === 2
                                ? 'bg-amber-400'
                                : 'bg-emerald-500'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{passwordStrength.label}</span>
                </div>
              )}
              <FieldHint errorMsg={fieldErrors.password} hint={t.passwordRequirements} />
            </div>

         
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                {t.instagramHandle}{' '}
                <span className="text-slate-400 font-normal">({t.optional})</span>
              </label>
              <div className="relative">
                <Instagram className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@marketer.campaigns"
                  className={`${inputBase} pl-10 pr-3.5 ${inputOk}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                {t.preferredFlyerLanguage} <span className="text-rose-500">*</span>
              </label>
              <select
                value={preferredFlyerLanguage}
                onChange={(e) => setPreferredFlyerLanguage(e.target.value as FlyerLanguage)}
                className={`${inputBase} px-3.5 ${inputOk} cursor-pointer`}
              >
                <option value="en">English</option>
                <option value="es">Spanish (Español)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                {t.preferredFlyerCategory} <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Select one or more niches you want to receive content for.
              </p>
              <div
                className={`flex flex-wrap gap-1.5 p-2.5 rounded-xl border bg-slate-50 ${
                  fieldErrors.categories ? 'border-rose-400 bg-rose-50/40' : 'border-slate-300'
                }`}
              >
                {FLYER_CATEGORIES.map((cat) => {
                  const selected = preferredFlyerCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setPreferredFlyerCategories((prev) =>
                          selected ? prev.filter((c) => c !== cat.id) : [...prev, cat.id]
                        );
                        setError(null);
                        clearFieldError('categories');
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                      {getFlyerCategoryLabel(cat.id, language)}
                    </button>
                  );
                })}
              </div>
              {preferredFlyerCategories.length > 0 && (
                <p className="text-[10px] font-semibold text-slate-500 mt-1.5">
                  {preferredFlyerCategories.length} selected
                </p>
              )}
              <FieldHint errorMsg={fieldErrors.categories} />
            </div>

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

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                {t.country} <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCountry.code}
                onChange={(e) => handleCountryChange(e.target.value)}
                className={`${inputBase} px-3.5 ${inputOk} cursor-pointer`}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.dialCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  {t.phoneNumber} <span className="text-rose-500">*</span>
                </label>
                <span
                  className={`text-[10.5px] font-bold tabular-nums ${
                    phoneDigits >= phoneMax ? 'text-amber-600' : 'text-slate-400'
                  }`}
                >
                  {t.phoneDigitsHint(phoneDigits, phoneMax)}
                </span>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 shrink-0 select-none">
                  <span>{selectedCountry.flag}</span>
                  <span>{selectedCountry.dialCode}</span>
                </span>
                <div className="relative flex-1">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={`${'0'.repeat(Math.min(phoneExpected, 4))}…`}
                    maxLength={phoneMax + 6}
                    className={`${inputBase} pl-10 pr-3.5 ${fieldErrors.phone ? inputErr : inputOk}`}
                  />
                </div>
              </div>
              <FieldHint
                errorMsg={fieldErrors.phone}
                hint={`About ${phoneExpected} digits for ${selectedCountry.name} (max ${phoneMax}).`}
              />
            </div>

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
                    clearFieldError('state');
                  }}
                  className={`${inputBase} px-3.5 ${fieldErrors.state ? inputErr : inputOk} cursor-pointer`}
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
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setError(null);
                    clearFieldError('state');
                  }}
                  placeholder={t.selectState}
                  className={`${inputBase} px-3.5 ${fieldErrors.state ? inputErr : inputOk}`}
                />
              )}
              <FieldHint errorMsg={fieldErrors.state} />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  {t.city} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="address-level2"
                  value={city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  placeholder="Los Angeles"
                  className={`${inputBase} px-3.5 ${fieldErrors.city ? inputErr : inputOk}`}
                />
                <FieldHint errorMsg={fieldErrors.city} hint={t.cityNameHint} />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  {t.postalCode} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="postal-code"
                  value={postalCode}
                  onChange={(e) => handlePostalChange(e.target.value)}
                  placeholder={selectedCountry.postalPlaceholder}
                  maxLength={POSTAL_CODE_LENGTH}
                  className={`${inputBase} px-3.5 ${fieldErrors.postalCode ? inputErr : inputOk} tabular-nums`}
                />
                <FieldHint
                  errorMsg={fieldErrors.postalCode}
                  hint={`${t.postalCodeHint} (${postalCode.length}/${POSTAL_CODE_LENGTH})`}
                />
              </div>
            </div>

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
