import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import * as authService from '../../services/authService';
import { ArrowLeft, ArrowRight, Moon, Sun, Languages, Mail, KeyRound, AlertCircle } from 'lucide-react';

export function ForgotPasswordPage() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const isAr = language === 'ar';

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const result = await authService.forgotPassword(email.trim());
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || (isAr ? 'فشل إرسال الرمز' : 'Failed to send code'));
      return;
    }

    setCodeSent(true);
    setSuccess(isAr ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني' : 'Verification code sent to your email');
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const result = await authService.verifyResetCode(email.trim(), code.trim());
    setIsLoading(false);

    if (!result.success) {
      setError(result.error || (isAr ? 'رمز غير صالح أو منتهي الصلاحية' : 'Invalid or expired code'));
      return;
    }

    navigate(`/reset-password?email=${encodeURIComponent(email.trim())}&code=${encodeURIComponent(code.trim())}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          to="/sign-in"
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'العودة لتسجيل الدخول' : 'Back to login'}</span>
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
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {codeSent ? <KeyRound className="w-7 h-7 text-white" /> : <Mail className="w-7 h-7 text-white" />}
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {codeSent ? (isAr ? 'أدخل رمز التحقق' : 'Enter the verification code') : (isAr ? 'نسيت كلمة المرور' : 'Forgot password')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {codeSent
                ? (isAr ? 'تحقق من بريدك الإلكتروني وأدخل الرمز المكون من 6 أرقام' : 'Check your email and enter the 6-digit code')
                : (isAr ? 'أدخل بريدك الإلكتروني لإرسال رمز إعادة التعيين' : 'Enter your email to receive a reset code')}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-3 text-sm mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl p-3 text-sm mb-4">
              {success}
            </div>
          )}

          {!codeSent ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {isAr ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={isAr ? 'you@example.com' : 'you@example.com'}
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-60"
              >
                {isLoading ? (isAr ? 'جارٍ الإرسال...' : 'Sending...') : (isAr ? 'إرسال الرمز' : 'Send code')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {isAr ? 'رمز التحقق' : 'Verification code'}
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-[0.3em] text-center"
                  placeholder="000000"
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-60"
              >
                {isLoading ? (isAr ? 'جارٍ التحقق...' : 'Verifying...') : (isAr ? 'تحقق من الرمز' : 'Verify code')}
              </button>
              <button
                type="button"
                onClick={handleSendCode as any}
                disabled={isLoading}
                className="w-full py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-60"
              >
                {isAr ? 'إعادة إرسال الرمز' : 'Resend code'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
