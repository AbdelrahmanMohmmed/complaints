import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Mail, ArrowLeft, ArrowRight, Moon, Sun, Languages, CheckCircle2 } from 'lucide-react';
import { request } from '../../services/api';

export function VerifyEmailSent() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isAr = language === 'ar';

  const email = (location.state as { email?: string })?.email || '';

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newCode = [...code];
    newCode[index] = value.slice(-1); // one digit per box
    setCode(newCode);
    // Auto-focus next
    if (value && index < 5) {
      const next = document.getElementById(`code-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`);
      prev?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError(isAr ? 'أدخل الرمز المكون من 6 أرقام' : 'Please enter the 6-digit code');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await request('/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, code: fullCode }),
      });
      navigate('/verify-email', { state: { success: true } });
    } catch (err: any) {
      setError(err?.message || (isAr ? 'رمز غير صحيح' : 'رمز غير صالح أو منتهي الصلاحية'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess('');
    setError('');
    try {
      await request('/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setResendSuccess(isAr ? 'تم إرسال رمز جديد!' : 'New code sent!');
      setCode(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err?.message || 'Failed to resend');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'العودة للرئيسية' : 'Back to home'}</span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={toggleLanguage} className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Languages className="w-5 h-5" />
          </button>
          <button onClick={toggleTheme} className="p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
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

          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {isAr ? 'أرسلنا رمز تحقق مكون من 6 أرقام إلى' : 'We sent a 6-digit verification code to'}
          </p>

          {email && (
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-6" dir="ltr">{email}</p>
          )}

          {/* Code Input */}
          <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                id={`code-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl
                  border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-white
                  focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  transition-colors"
              />
            ))}
          </div>

          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
          {resendSuccess && <p className="text-sm text-green-500 mb-4">{resendSuccess}</p>}

          <button
            onClick={handleVerify}
            disabled={isLoading || code.join('').length !== 6}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl
              hover:shadow-lg hover:shadow-blue-500/25 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {isAr ? 'تحقق من الرمز' : 'Verify code'}
              </>
            )}
          </button>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            {isAr ? 'لم تصلك الرسالة؟' : "Didn't receive the code?"}{' '}
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
            >
              {resendLoading ? '...' : (isAr ? 'إعادة الإرسال' : 'Resend')}
            </button>
          </p>

          <p className="mt-2 text-xs text-gray-400">
            {isAr ? 'الرمز صالح لمدة 15 دقيقة' : 'Code expires in 15 minutes'}
          </p>

        </div>
      </div>
    </div>
  );
}