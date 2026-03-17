import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import * as authService from '../../services/authService';
import { CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, Moon, Sun, Languages } from 'lucide-react';

export function VerifyEmail() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const isAr = language === 'ar';

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const location = useLocation();
  // Replace the useEffect entirely — no token needed anymore, just read state
useEffect(() => {
  const success = (location.state as { success?: boolean })?.success;
  if (success) {
    setStatus('success');
  } else {
    setStatus('error');
    setErrorMessage(isAr ? 'لم يتم التحقق بعد.' : 'Verification not completed.');
  }
}, []);

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
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {isAr ? 'جاري التحقق...' : 'Verifying your email...'}
              </h1>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                {isAr ? 'تم التحقق من بريدك' : 'Email Verified'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isAr ? 'يمكنك الآن تسجيل الدخول إلى حسابك.' : 'You can now sign in to your account.'}
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                {isAr ? 'تسجيل الدخول' : 'Sign In'}
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                {isAr ? 'فشل التحقق' : 'Verification Failed'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{errorMessage}</p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                {isAr ? 'الذهاب لتسجيل الدخول' : 'Go to Sign In'}
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
