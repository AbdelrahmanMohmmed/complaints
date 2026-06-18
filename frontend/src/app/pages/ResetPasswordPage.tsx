import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import * as authService from '../../services/authService';
import { ArrowLeft, ArrowRight, Moon, Sun, Languages, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ResetPasswordPage() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isAr = language === 'ar';

  const stateEmail = (location.state as { email?: string } | null)?.email;
  const stateCode = (location.state as { code?: string } | null)?.code;

  const email = useMemo(() => stateEmail || searchParams.get('email') || '', [stateEmail, searchParams]);
  const code = useMemo(() => stateCode || searchParams.get('code') || '', [stateCode, searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validatePassword = (value: string): string => {
    if (value.length < 8) {
      return isAr ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(value)) {
      return isAr ? 'كلمة المرور يجب أن تحتوي على حرف كبير' : 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(value)) {
      return isAr ? 'كلمة المرور يجب أن تحتوي على حرف صغير' : 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(value)) {
      return isAr ? 'كلمة المرور يجب أن تحتوي على رقم' : 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-\[\]\/\\]/.test(value)) {
      return isAr ? 'كلمة المرور يجب أن تحتوي على رمز خاص' : 'Password must contain at least one special character';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !code) {
      setError(isAr ? 'رابط إعادة التعيين غير صالح' : 'Invalid reset session');
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setError(passwordValidationError);
      return;
    }

    if (password !== confirmPassword) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await authService.resetPassword(email, code, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || (isAr ? 'فشل إعادة تعيين كلمة المرور' : 'Failed to reset password'));
      return;
    }

    setSuccess(isAr ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully');
    setTimeout(() => navigate('/sign-in'), 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          to="/sign-in"
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}</span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={toggleLanguage} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Languages className="w-5 h-5" />
          </button>
          <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {isAr ? 'تعيين كلمة مرور جديدة' : 'Set New Password'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1" dir="ltr">{email}</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-3 text-sm mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl p-3 text-sm mb-4">
              <CheckCircle2 className="w-4 h-4 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isAr ? 'كلمة المرور الجديدة' : 'New Password'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  dir="ltr"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  dir="ltr"
                />
                <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl disabled:opacity-60"
            >
              {isLoading ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : (isAr ? 'حفظ كلمة المرور' : 'Save password')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
