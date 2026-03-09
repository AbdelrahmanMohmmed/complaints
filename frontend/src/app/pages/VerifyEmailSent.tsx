import React from 'react';
import { Link, useLocation } from 'react-router';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail, ArrowLeft, ArrowRight, Moon, Sun, Languages } from 'lucide-react';

export function VerifyEmailSent() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const isAr = language === 'ar';
  const email = (location.state as { email?: string })?.email || '';

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
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            {isAr ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {isAr
              ? 'أرسلنا رسالة تحقق إلى بريدك. انقر الرابط في الرسالة لتفعيل حسابك، ثم سجّل الدخول.'
              : 'We sent a verification link to your email. Click the link to verify your account, then sign in.'}
          </p>
          {email && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 font-medium" dir="ltr">
              {email}
            </p>
          )}
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            {isAr ? 'تسجيل الدخول' : 'Sign In'}
            {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </Link>
          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            {isAr ? 'لم تصلك الرسالة؟' : "Didn't receive the email?"}{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
              {isAr ? 'تسجيل الدخول' : 'Sign in'}
            </Link>{' '}
            {isAr ? 'أو تحقق من مجلد البريد العشوائي.' : 'or check your spam folder.'}
          </p>
        </div>
      </div>
    </div>
  );
}
