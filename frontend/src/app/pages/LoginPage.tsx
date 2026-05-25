import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Eye, EyeOff, Moon, Sun, Languages, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isAr = language === 'ar';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  const result = await login(email, password);
  setIsLoading(false);

  if (result.success) {
    navigate('/app', { replace: true });
  } else if (result.error === 'EMAIL_NOT_VERIFIED') {
    navigate('/verify-email/sent', { state: { email } });
  } else {
    setError(result.error || (isAr ? 'فشل تسجيل الدخول' : 'Login failed'));
  }
};

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{isAr ? 'العودة للرئيسية' : 'Back to home'}</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Languages className="w-5 h-5" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className={`flex flex-col items-center mb-8 ${isAr ? 'text-right' : 'text-center'}`}>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <span className="text-white font-black text-xl">A2</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {isAr ? 'مرحباً بعودتك' : 'Welcome back'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              {isAr ? 'سجّل دخولك للوصول إلى لوحة التحكم' : 'Login to access your dashboard'}
            </p>
          </div>

          {/* Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl p-4 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {isAr ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder={isAr ? 'بريدك الإلكتروني' : 'you@company.com'}
                  dir="ltr"
                />
              </div>

              {/* Password */}
              <div>
                <div className={`flex items-center justify-between mb-1.5 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isAr ? 'كلمة المرور' : 'Password'}
                  </label>
                  <Link to="/forgot-password" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${isAr ? 'pr-4 pl-12' : 'pl-4 pr-12'}`}
                    placeholder={isAr ? 'كلمة مرورك' : 'Your password'}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isAr ? 'جارٍ تسجيل الدخول...' : 'Signing in...'}</span>
                  </>
                ) : (
                  <span>{isAr ? 'تسجيل الدخول' : 'Sign in'}</span>
                )}
              </button>

              {/* Signup link */}
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {isAr ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                  {isAr ? 'سجّل الآن' : 'Sign Up'}
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
