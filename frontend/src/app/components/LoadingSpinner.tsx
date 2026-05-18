import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export function LoadingSpinner() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 dark:text-gray-400">{isAr ? 'جارٍ التحميل...' : 'Loading...'}</p>
      </div>
    </div>
  );
}
