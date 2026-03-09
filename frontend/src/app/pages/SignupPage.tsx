import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { mockDomains, Domain } from '../data/mockData';
import * as authService from '../../services/authService';
import type { SignupRequest } from '../../types/api';
import {
  Eye,
  EyeOff,
  Moon,
  Sun,
  Languages,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Globe,
  MessageSquare,
  Mail,
  UserPlus,
  Trash2,
  Facebook,
} from 'lucide-react';

const STEPS = [
  { id: 1, key: 'account', labelEn: 'Account', labelAr: 'الحساب' },
  { id: 2, key: 'domain', labelEn: 'Domain', labelAr: 'المجال' },
  { id: 3, key: 'apis', labelEn: 'APIs', labelAr: 'الواجهات' },
  { id: 4, key: 'extraUser', labelEn: 'Team (optional)', labelAr: 'فريق (اختياري)' },
];

const API_OPTIONS = [
  { id: 'facebook' as const, labelEn: 'Facebook', labelAr: 'فيسبوك', Icon: Facebook, required: true },
  { id: 'whatsapp' as const, labelEn: 'WhatsApp', labelAr: 'واتساب', Icon: MessageSquare, required: true },
  { id: 'x' as const, labelEn: 'X (Twitter)', labelAr: 'إكس (تويتر)', Icon: MessageSquare, required: true },
  { id: 'email' as const, labelEn: 'Email', labelAr: 'البريد', Icon: Mail, required: false },
];

const EXTRA_ROLES = [
  { value: 'manager' as const, labelEn: 'Manager', labelAr: 'مدير' },
  { value: 'agent' as const, labelEn: 'Agent', labelAr: 'وكيل' },
];

export function SignupPage() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const isAr = language === 'ar';

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    f_name: '',
    l_name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
      phone: '',   // ← add this
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 2: Domain (required). Optional custom label; "remove label" = use domain name.
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [domainLabel, setDomainLabel] = useState('');

  // Step 3: At least one of Facebook, WhatsApp, X; Email optional
  const [apis, setApis] = useState({ facebook: false, whatsapp: false, x: false, email: false });

  // Step 4: Optional extra user (role: manager | agent only)
  const [extraUser, setExtraUser] = useState<{ name: string; email: string; role: 'manager' | 'agent' } | null>(null);
  const [showExtraUser, setShowExtraUser] = useState(false);

  const passwordStrength = (() => {
    if (!form.password) return 0;
    let score = 0;
    if (form.password.length >= 8) score++;
    if (/[A-Z]/.test(form.password)) score++;
    if (/[0-9]/.test(form.password)) score++;
    if (/[^A-Za-z0-9]/.test(form.password)) score++;
    return score;
  })();
  const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400'];
  const strengthLabels = isAr ? ['ضعيفة', 'مقبولة', 'جيدة', 'قوية'] : ['Weak', 'Fair', 'Good', 'Strong'];

  const atLeastOneApi = apis.facebook || apis.whatsapp || apis.x;
  const displayDomainLabel = domainLabel.trim() || selectedDomain?.name || '';

  const canProceedStep1 =
    form.f_name.trim() &&
    form.l_name.trim() &&
    form.company.trim() &&
    form.email.trim() &&
    form.phone.trim() &&   // ← add this
    form.password.length >= 6 &&
    form.password === form.confirmPassword;
  const canProceedStep2 = !!selectedDomain;
  const canProceedStep3 = atLeastOneApi;

  const handleNext = () => {
    setError('');
    if (step === 1 && !canProceedStep1) {
      setError(isAr ? 'يرجى تعبئة جميع الحقول وتطابق كلمة المرور' : 'Please fill all fields and match passwords');
      return;
    }
    if (step === 2 && !canProceedStep2) {
      setError(isAr ? 'يجب اختيار مجال واحد على الأقل' : 'You must select a domain');
      return;
    }
    if (step === 3 && !canProceedStep3) {
      setError(isAr ? 'يجب تفعيل واجهة واحدة على الأقل (فيسبوك، واتساب، أو إكس)' : 'Select at least one API (Facebook, WhatsApp, or X)');
      return;
    }
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedDomain || !atLeastOneApi) return;

    setIsLoading(true);
    const payload: SignupRequest = {
      f_name: form.f_name.trim(),
      l_name: form.l_name.trim(),
        email: form.email.trim(),
      company: form.company.trim(),
      password: form.password,
      phone: form.phone.trim(),   // ← add this
      domainId: Number(selectedDomain.id),
      domainLabel: domainLabel.trim() || undefined,
      apis: { ...apis },
      extraUser:
        showExtraUser && extraUser?.name.trim() && extraUser?.email.trim()
          ? { name: extraUser.name.trim(), email: extraUser.email.trim(), role: extraUser.role }
          : undefined,
    };

    try {
      const result = await authService.signup(payload);
      setIsLoading(false);
      if (result.success) {
        navigate('/verify-email/sent', { replace: true, state: { email: form.email } });
      } else {
        setError(result.message || (isAr ? 'فشل التسجيل' : 'Signup failed'));
      }
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  const benefits = isAr
    ? ['تحليل مشاعر بالذكاء الاصطناعي', 'لوحة تحكم تفاعلية', 'تصنيف تلقائي للشكاوى', 'دعم عربي وإنجليزي كامل']
    : ['AI-powered sentiment analysis', 'Interactive analytics dashboard', 'Auto-complaint categorization', 'Full Arabic & English support'];

  // Success state is now handled by redirect to /verify-email/sent
  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'العودة للرئيسية' : 'Back to Home'}</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Languages className="w-5 h-5" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-start">
          <div className={`hidden lg:block ${isAr ? 'order-2 text-right' : 'order-1'}`}>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
              <span className="text-white font-black text-xl">A2</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">
              {isAr ? 'انضم إلى Ara2kom AI' : 'Join Ara2kom AI'}
            </h2>
            <div className="flex gap-2 mb-6">
              {STEPS.map((s) => (
                <span
                  key={s.id}
                  className={`text-sm font-medium ${step === s.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  {isAr ? s.labelAr : s.labelEn}
                  {s.id < STEPS.length ? (isAr ? ' ←' : ' →') : ''}
                </span>
              ))}
            </div>
            <ul className="space-y-4">
              {benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${isAr ? 'order-1' : 'order-2'} w-full`}>
            <div className="lg:hidden text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-3">
                <span className="text-white font-black text-xl">A2</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                {isAr ? 'إنشاء حساب جديد' : 'Create Your Account'}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {STEPS.find((s) => s.id === step) ? (isAr ? STEPS.find((s) => s.id === step)!.labelAr : STEPS.find((s) => s.id === step)!.labelEn) : ''}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
              <h2 className={`text-xl font-black text-gray-900 dark:text-white mb-6 ${isAr ? 'text-right' : ''}`}>
                {step === 1 && (isAr ? 'الحساب' : 'Account')}
                {step === 2 && (isAr ? 'اختر المجال' : 'Select Domain')}
                {step === 3 && (isAr ? 'قنوات الاستقبال' : 'Channels & APIs')}
                {step === 4 && (isAr ? 'إضافة مستخدم (اختياري)' : 'Add Team Member (optional)')}
              </h2>

              {error && (
                <div className={`flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-4 text-sm mb-4 ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Account */}
              {step === 1 && (
                <div className={`space-y-4 ${isAr ? 'text-right' : ''}`}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {isAr ? 'الاسم الأول' : 'First Name'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.f_name}
                        onChange={(e) => setForm({ ...form, f_name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={isAr ? 'الاسم الأول' : 'John'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {isAr ? 'اسم العائلة' : 'Last Name'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.l_name}
                        onChange={(e) => setForm({ ...form, l_name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={isAr ? 'اسم العائلة' : 'Smith'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {isAr ? 'اسم الشركة' : 'Company Name'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={isAr ? 'شركتك' : 'Acme Corp'}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {isAr ? 'البريد الإلكتروني' : 'Work Email'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="you@company.com"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {isAr ? 'رقم الهاتف' : 'Phone Number'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="01xxxxxxxxx"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {isAr ? 'كلمة المرور' : 'Password'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isAr ? 'pr-4 pl-12' : 'pl-4 pr-12'}`}
                        placeholder={isAr ? 'كلمة مرور قوية' : 'Strong password'}
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-colors ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200 dark:bg-gray-700'}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isAr ? 'قوة كلمة المرور: ' : 'Strength: '}{strengthLabels[passwordStrength - 1] || ''}
                        </p>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        required
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border ${form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'} bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isAr ? 'pr-4 pl-12' : 'pl-4 pr-12'}`}
                        placeholder={isAr ? 'أعد كتابة كلمة المرور' : 'Re-enter password'}
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600 dark:hover:text-gray-300`}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Domain (required). Optional edit label / remove label */}
              {step === 2 && (
                <div className={`space-y-4 ${isAr ? 'text-right' : ''}`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isAr ? 'اختر مجالاً واحداً. يمكنك تعديل التسمية أو إزالتها لاستخدام الاسم الافتراضي.' : 'Select one domain. You can edit the label or remove it to use the default name.'}
                  </p>
                  <div className="space-y-2">
                    {mockDomains.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setSelectedDomain(d);
                          setDomainLabel('');
                        }}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${selectedDomain?.id === d.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'} ${isAr ? 'text-right flex-row-reverse' : ''}`}
                      >
                        <Globe className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white">{d.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{d.description}</div>
                        </div>
                        {selectedDomain?.id === d.id && <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                  {/* {selectedDomain && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isAr ? 'تسمية مخصصة (اختياري) — اتركها فارغة لاستخدام اسم المجال' : 'Custom label (optional) — leave blank to use domain name'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={domainLabel}
                          onChange={(e) => setDomainLabel(e.target.value)}
                          placeholder={selectedDomain.name}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setDomainLabel('')}
                          className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 transition-colors"
                          title={isAr ? 'إزالة التسمية' : 'Remove label'}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      {displayDomainLabel && (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {isAr ? 'العرض كـ: ' : 'Display as: '}<strong>{displayDomainLabel}</strong>
                        </p>
                      )}
                    </div>
                  )} */}
                </div>
              )}

              {/* Step 3: At least one API (Facebook, WhatsApp, X); Email optional */}
              {step === 3 && (
                <div className={`space-y-4 ${isAr ? 'text-right' : ''}`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isAr ? 'فعّل واجهة واحدة على الأقل (فيسبوك، واتساب، أو إكس). البريد اختياري.' : 'Enable at least one channel (Facebook, WhatsApp, or X). Email is optional.'}
                  </p>
                  <div className="space-y-3">
                    {API_OPTIONS.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${apis[opt.id] ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'} ${isAr ? 'flex-row-reverse' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={apis[opt.id]}
                          onChange={(e) => setApis((prev) => ({ ...prev, [opt.id]: e.target.checked }))}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <opt.Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-white">{isAr ? opt.labelAr : opt.labelEn}</span>
                        {opt.required && <span className="text-red-500 text-sm">*</span>}
                        {!opt.required && <span className="text-xs text-gray-500 dark:text-gray-400">({isAr ? 'اختياري' : 'optional'})</span>}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Optional extra user (manager | agent) */}
              {step === 4 && (
                <div className={`space-y-4 ${isAr ? 'text-right' : ''}`}>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isAr ? 'يمكنك إضافة مستخدم آخر بصلاحية مدير أو وكيل (بدون صلاحيات مدير نظام).' : 'You can add another user with Manager or Agent role (no admin roles).'}
                  </p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showExtraUser}
                      onChange={(e) => {
                        setShowExtraUser(e.target.checked);
                        if (!e.target.checked) setExtraUser(null);
                        else setExtraUser({ name: '', email: '', role: 'manager' });
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <UserPlus className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{isAr ? 'إضافة مستخدم آخر' : 'Add another user'}</span>
                  </label>
                  {showExtraUser && extraUser && (
                    <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{isAr ? 'الاسم' : 'Name'}</label>
                        <input
                          type="text"
                          value={extraUser.name}
                          onChange={(e) => setExtraUser((u) => (u ? { ...u, name: e.target.value } : null))}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          placeholder={isAr ? 'الاسم' : 'Full name'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{isAr ? 'البريد' : 'Email'}</label>
                        <input
                          type="email"
                          value={extraUser.email}
                          onChange={(e) => setExtraUser((u) => (u ? { ...u, email: e.target.value } : null))}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          placeholder="user@company.com"
                          dir="ltr"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{isAr ? 'الدور' : 'Role'}</label>
                        <select
                          value={extraUser.role}
                          onChange={(e) => setExtraUser((u) => (u ? { ...u, role: e.target.value as 'manager' | 'agent' } : null))}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        >
                          {EXTRA_ROLES.map((r) => (
                            <option key={r.value} value={r.value}>{isAr ? r.labelAr : r.labelEn}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className={`flex gap-3 mt-8 ${isAr ? 'flex-row-reverse' : ''}`}>
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    {isAr ? 'السابق' : 'Back'}
                  </button>
                ) : null}
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    {isAr ? 'التالي' : 'Next'}
                    {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{isAr ? 'جارٍ إنشاء الحساب...' : 'Creating Account...'}</span>
                      </>
                    ) : (
                      <span>{isAr ? 'إنشاء الحساب وإرسال التحقق' : 'Create Account & Send Verification'}</span>
                    )}
                  </button>
                )}
              </div>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                {isAr ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                  {isAr ? 'تسجيل الدخول' : 'Sign In'}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
