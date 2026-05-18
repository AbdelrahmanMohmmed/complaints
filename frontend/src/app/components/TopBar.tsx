import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import {
  Search,
  Bell,
  Moon,
  Sun,
  Languages,
  User,
  LogOut,
  Menu,
  Settings,
} from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';

const roleGradients: Record<string, string> = {
  superAdmin: 'from-violet-600 to-purple-700',
  companyAdmin: 'from-blue-600 to-indigo-700',
  manager: 'from-emerald-500 to-teal-600',
  websiteConfigurator: 'from-orange-500 to-amber-600',
};

const roleBadgeColors: Record<string, string> = {
  superAdmin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  companyAdmin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  manager: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  websiteConfigurator: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAr = language === 'ar';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const gradientClass = user?.role ? (roleGradients[user.role] || 'from-blue-600 to-purple-600') : 'from-blue-600 to-purple-600';
  const badgeClass = user?.role ? (roleBadgeColors[user.role] || '') : '';
  const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'User';
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || displayName.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 px-4 sm:px-6">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden flex-shrink-0"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Search Bar */}
      {/* <div className="flex-1 max-w-sm hidden sm:block">
        <div className="relative">
          <Search className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400', isAr ? 'right-3' : 'left-3')} />
          <Input
            type="search"
            placeholder={t('common.search')}
            className={cn('bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-9 text-sm', isAr ? 'pr-10' : 'pl-10')}
          />
        </div>
      </div> */}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Language Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          title={language === 'en' ? 'العربية' : 'English'}
          className="w-9 h-9"
        >
          <Languages className="w-4 h-4" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          className="w-9 h-9"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </Button>

        {/* Notifications */}
        {/* <Button variant="ghost" size="icon" className="relative w-9 h-9">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button> */}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2 h-10">
              <div className={cn('w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0', gradientClass)}>
                <span className="text-white text-xs font-bold">
                  {initials}
                </span>
              </div>
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                  {displayName}
                </span>
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-semibold', badgeClass)}>
                  {t(`role.${user?.role}`)}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <div className="flex items-center gap-3 py-1">
                <div className={cn('w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0', gradientClass)}>
                  <span className="text-white text-sm font-bold">
                    {initials}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-gray-900 dark:text-white truncate">{displayName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</span>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-semibold mt-1 w-fit', badgeClass)}>
                    {t(`role.${user?.role}`)}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuItem className="gap-2">
              <User className="w-4 h-4" />
              {isAr ? 'الملف الشخصي' : 'Profile'}
            </DropdownMenuItem> */}
            <DropdownMenuItem onClick={() => navigate('/app/settings')} className="gap-2">
              <Settings className="w-4 h-4" />
              {isAr ? 'الإعدادات' : 'Settings'}
            </DropdownMenuItem>
            {/* <DropdownMenuItem onClick={toggleLanguage} className="gap-2">
              <Languages className="w-4 h-4" />
              {language === 'en' ? 'العربية' : 'English'}
            </DropdownMenuItem> */}
            {/* <DropdownMenuItem onClick={toggleTheme} className="gap-2">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {theme === 'light' ? (isAr ? 'الوضع المظلم' : 'Dark Mode') : (isAr ? 'الوضع الفاتح' : 'Light Mode')}
            </DropdownMenuItem> */}
            {/* <DropdownMenuSeparator /> */}
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 gap-2">
              <LogOut className="w-4 h-4" />
              {isAr ? 'تسجيل الخروج' : 'Logout'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
