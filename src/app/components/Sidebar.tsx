import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  Building2,
  Plug,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Inbox,
  Globe2,
  Shield,
  UserCog,
  ScrollText,
  Activity,
  Tag,
  UserCircle,
  UsersRound,
} from 'lucide-react';
import { cn } from '../components/ui/utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { t, language } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAr = language === 'ar';

  const roleColors: Record<string, string> = {
    superAdmin: 'from-violet-600 to-purple-700',
    companyAdmin: 'from-blue-600 to-indigo-700',
    manager: 'from-emerald-500 to-teal-600',
    agent: 'from-orange-500 to-amber-600',
  };

  const roleBadgeColors: Record<string, string> = {
    superAdmin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    companyAdmin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    manager: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    agent: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  };

  const navigationByRole: Record<string, NavSection[]> = {
    superAdmin: [
      {
        title: language === 'ar' ? 'عام' : 'General',
        items: [
          { name: t('nav.systemOverview'), href: '/app', icon: LayoutDashboard },
        ],
      },
      {
        title: language === 'ar' ? 'إدارة النظام' : 'Management',
        items: [
          { name: t('nav.companies'), href: '/app/companies', icon: Building2 },
          { name: t('nav.domains'), href: '/app/domains', icon: Globe2 },
          { name: t('nav.users'), href: '/app/users', icon: UsersRound },
        ],
      },
      {
        title: language === 'ar' ? 'التحليلات' : 'Analytics',
        items: [
          { name: t('nav.systemAnalytics'), href: '/app/system-analytics', icon: Activity },
          { name: t('nav.logs'), href: '/app/logs', icon: ScrollText },
        ],
      },
      {
        title: language === 'ar' ? 'الإعدادات' : 'Config',
        items: [
          { name: t('nav.systemSettings'), href: '/app/settings', icon: Settings },
        ],
      },
    ],
    companyAdmin: [
      {
        items: [
          { name: t('nav.dashboard'), href: '/app', icon: LayoutDashboard },
          // { name: t('nav.feedback'), href: '/app/feedback', icon: MessageSquare },
          // { name: t('nav.categories'), href: '/app/categories', icon: Tag },
          // { name: t('nav.apis'), href: '/app/integrations', icon: Plug },
          { name: t('nav.users'), href: '/app/users', icon: Users },
          { name: t('nav.reports'), href: '/app/reports', icon: BarChart3 },
          { name: t('nav.settings'), href: '/app/settings', icon: Settings },
        ],
      },
    ],
    manager: [
      {
        items: [
          { name: t('nav.dashboard'), href: '/app', icon: LayoutDashboard },
          { name: t('nav.allComplaints'), href: '/app/feedback', icon: MessageSquare },
          { name: t('nav.teamPerformance'), href: '/app/team-performance', icon: BarChart3 },
          { name: t('nav.reports'), href: '/app/reports', icon: Activity },
          { name: t('nav.settings'), href: '/app/settings', icon: Settings },

        ],
      },
    ],
    agent: [
      {
        items: [
          { name: t('nav.myFeedback'), href: '/app/my-feedback', icon: Inbox },
          { name: t('nav.profile'), href: '/app/profile', icon: UserCircle },
        ],
      },
    ],
  };

  const sections = user?.role ? (navigationByRole[user.role] || []) : [];

  const isActive = (href: string) => {
    if (href === '/app') {
      return location.pathname === '/app' || location.pathname === '/app/';
    }
    return location.pathname.startsWith(href);
  };

  const gradientClass = user?.role ? roleColors[user.role] : 'from-blue-600 to-purple-600';
  const badgeClass = user?.role ? roleBadgeColors[user.role] : '';

  const roleIcon: Record<string, React.ComponentType<{ className?: string }>> = {
    superAdmin: Shield,
    companyAdmin: Building2,
    manager: UserCog,
    agent: Users,
  };

  const RoleIcon = user?.role ? (roleIcon[user.role] || Users) : Users;

  return (
    <aside
      className={cn(
        'fixed top-0 z-40 h-screen transition-all duration-300 flex flex-col',
        'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800',
        isAr ? 'border-l' : 'border-r',
        isCollapsed ? 'w-16' : 'w-64',
        isAr ? 'right-0' : 'left-0'
      )}
    >
      {/* Logo Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        {!isCollapsed ? (
          <Link to="/app" className="flex items-center gap-2.5 min-w-0">
            <div className={cn('w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm', gradientClass)}>
              <span className="text-white font-black text-xs">A2</span>
            </div>
            <div className="min-w-0">
              <span className="font-black text-base text-gray-900 dark:text-white block leading-tight">Ara2kom AI</span>
              <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-semibold', badgeClass)}>
                {t(`role.${user?.role}`)}
              </span>
            </div>
          </Link>
        ) : (
          <Link to="/app" className={cn('w-8 h-8 bg-gradient-to-br rounded-lg flex items-center justify-center mx-auto shadow-sm', gradientClass)}>
            <span className="text-white font-black text-xs">A2</span>
          </Link>
        )}

        {/* Desktop Toggle */}
        {!isCollapsed && (
          <button
            onClick={onToggle}
            className="hidden lg:flex w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            {isAr
              ? (isCollapsed ? <ChevronLeft className="w-3 h-3 text-gray-500 dark:text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-500 dark:text-gray-400" />)
              : (isCollapsed ? <ChevronRight className="w-3 h-3 text-gray-500 dark:text-gray-400" /> : <ChevronLeft className="w-3 h-3 text-gray-500 dark:text-gray-400" />)
            }
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className={sIdx > 0 ? 'mt-4' : ''}>
            {section.title && !isCollapsed && (
              <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {section.title}
              </p>
            )}
            {section.title && isCollapsed && (
              <div className="h-px bg-gray-100 dark:bg-gray-800 mx-2 mb-2" />
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onToggle();
                    }}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group relative',
                      active
                        ? cn('text-white shadow-sm', `bg-gradient-to-r ${gradientClass}`)
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    <item.icon className={cn('w-5 h-5 flex-shrink-0', active ? 'text-white' : '')} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium truncate">{item.name}</span>
                    )}
                    {item.badge && !isCollapsed && (
                      <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapsed Toggle */}
      {isCollapsed && (
        <div className="px-2 pb-2">
          <button
            onClick={onToggle}
            className="hidden lg:flex w-full justify-center py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            {isAr
              ? <ChevronLeft className="w-4 h-4" />
              : <ChevronRight className="w-4 h-4" />
            }
          </button>
        </div>
      )}

      {/* User Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3 flex-shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className={cn('w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm', gradientClass)}>
              <RoleIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={logout}
              title={isAr ? 'تسجيل الخروج' : 'Logout'}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            title={isAr ? 'تسجيل الخروج' : 'Logout'}
            className="w-full flex justify-center p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}