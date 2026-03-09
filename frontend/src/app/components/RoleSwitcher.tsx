import React, { useState } from 'react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from 'react-router';
import { Shield, Building2, UserCog, Users, ChevronDown, Zap } from 'lucide-react';
import { cn } from './ui/utils';

const DEMO_ACCOUNTS: Record<string, { email: string; label: string; labelAr: string; description: string; descriptionAr: string; color: string; gradFrom: string; gradTo: string }> = {
  superAdmin: {
    email: 'superadmin@ara2kom.ai',
    label: 'Super Admin',
    labelAr: 'مدير النظام',
    description: 'Full system access',
    descriptionAr: 'صلاحية كاملة للنظام',
    color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800',
    gradFrom: 'from-violet-600',
    gradTo: 'to-purple-700',
  },
  companyAdmin: {
    email: 'admin@ara2kom.ai',
    label: 'Company Admin',
    labelAr: 'مدير الشركة',
    description: 'Company management',
    descriptionAr: 'إدارة الشركة',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    gradFrom: 'from-blue-600',
    gradTo: 'to-indigo-700',
  },
  manager: {
    email: 'manager@ara2kom.ai',
    label: 'Manager',
    labelAr: 'مدير',
    description: 'Team & feedback control',
    descriptionAr: 'إدارة الفريق والشكاوى',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    gradFrom: 'from-emerald-500',
    gradTo: 'to-teal-600',
  },
  agent: {
    email: 'agent@ara2kom.ai',
    label: 'Agent',
    labelAr: 'موظف',
    description: 'Assigned feedback only',
    descriptionAr: 'الشكاوى المُسندة فقط',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    gradFrom: 'from-orange-500',
    gradTo: 'to-amber-600',
  },
};

const ROLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  superAdmin: Shield,
  companyAdmin: Building2,
  manager: UserCog,
  agent: Users,
};

const ROLE_USERS: Record<string, { id: string; name: string; email: string; companyId?: string }> = {
  superAdmin: { id: '1', name: 'Sara Hassan', email: 'superadmin@ara2kom.ai' },
  companyAdmin: { id: '2', name: 'Ahmed Al-Rashid', email: 'admin@ara2kom.ai', companyId: 'company-1' },
  manager: { id: '3', name: 'Layla Mansour', email: 'manager@ara2kom.ai', companyId: 'company-1' },
  agent: { id: '4', name: 'Omar Khalil', email: 'agent@ara2kom.ai', companyId: 'company-1' },
};

interface RoleSwitcherProps {
  compact?: boolean;
}

export function RoleSwitcher({ compact = false }: RoleSwitcherProps) {
  const { user, setUser } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isAr = language === 'ar';

  if (!user) return null;

  const currentConfig = DEMO_ACCOUNTS[user.role];
  const CurrentIcon = ROLE_ICONS[user.role] || Users;

  const handleSwitch = (role: UserRole) => {
    const userData = ROLE_USERS[role];
    setUser({ ...userData, role });
    setIsOpen(false);
    // Navigate to appropriate default page
    if (role === 'agent') {
      navigate('/app/my-feedback');
    } else {
      navigate('/app');
    }
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors',
            currentConfig.color
          )}
        >
          <Zap className="w-3 h-3" />
          {isAr ? 'تبديل الدور' : 'Switch Role'}
          <ChevronDown className={cn('w-3 h-3 transition-transform', isOpen ? 'rotate-180' : '')} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full mt-2 right-0 z-50 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {isAr ? 'تجربة الأدوار المختلفة' : 'Demo: Switch User Role'}
                </p>
              </div>
              <div className="p-2 space-y-1">
                {(Object.entries(DEMO_ACCOUNTS) as [UserRole, typeof DEMO_ACCOUNTS[string]][]).map(([role, config]) => {
                  const RoleIcon = ROLE_ICONS[role] || Users;
                  const isCurrentRole = user.role === role;
                  return (
                    <button
                      key={role}
                      onClick={() => handleSwitch(role)}
                      className={cn(
                        'w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left',
                        isCurrentRole
                          ? 'bg-gray-100 dark:bg-gray-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      )}
                    >
                      <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0', config.gradFrom, config.gradTo)}>
                        <RoleIcon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {isAr ? config.labelAr : config.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {isAr ? config.descriptionAr : config.description}
                        </p>
                      </div>
                      {isCurrentRole && (
                        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="p-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                  {isAr ? 'كلمة المرور: password' : 'Password for all: password'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // Full card version
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-amber-500" />
        <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
          {isAr ? 'تبديل الدور' : 'Demo: Switch Role'}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(DEMO_ACCOUNTS) as [UserRole, typeof DEMO_ACCOUNTS[string]][]).map(([role, config]) => {
          const RoleIcon = ROLE_ICONS[role] || Users;
          const isCurrentRole = user.role === role;
          return (
            <button
              key={role}
              onClick={() => handleSwitch(role)}
              className={cn(
                'flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all',
                isCurrentRole
                  ? 'border-current ring-2 ring-offset-1 ring-current ' + config.color
                  : 'border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              )}
            >
              <div className={cn('w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0', config.gradFrom, config.gradTo)}>
                <RoleIcon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-semibold">{isAr ? config.labelAr : config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
