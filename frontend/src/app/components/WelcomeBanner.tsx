import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { X, UserCog, Plug, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const roleConfig = {
  manager: {
    icon: UserCog,
    gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    iconBg: 'from-emerald-500 to-teal-600',
    textColor: 'text-emerald-800 dark:text-emerald-200',
    dotColor: 'text-emerald-600 dark:text-emerald-400',
    en: {
      title: 'Welcome, Manager!',
      subtitle: 'Manage your company\'s feedback, users, and integrations.',
      features: [
        { bold: 'Feedback Dashboard', text: 'Full sentiment and category analytics for your company' },
        { bold: 'User Management', text: 'Add users, assign roles, and manage your team' },
        { bold: 'API Integrations', text: 'Connect Email, Web Forms and other feedback channels' },
        { bold: 'Reports', text: 'Generate and export detailed performance reports' },
      ],
    },
    ar: {
      title: 'مرحباً، المدير!',
      subtitle: 'إدارة تعليقات شركتك والمستخدمين والتكاملات.',
      features: [
        { bold: 'لوحة التعليقات', text: 'تحليلات كاملة للمشاعر والتصنيفات' },
        { bold: 'إدارة المستخدمين', text: 'إضافة مستخدمين وتعيين الأدوار' },
        { bold: 'تكاملات API', text: 'ربط البريد والنماذج الإلكترونية' },
        { bold: 'التقارير', text: 'إنشاء وتصدير التقارير' },
      ],
    },
  },
  customerServiceSupervisor: {
    icon: Activity,
    gradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    iconBg: 'from-blue-600 to-indigo-700',
    textColor: 'text-blue-800 dark:text-blue-200',
    dotColor: 'text-blue-600 dark:text-blue-400',
    en: {
      title: 'Welcome, Customer Service Supervisor!',
      subtitle: 'Oversee your team\'s feedback handling and performance.',
      features: [
        { bold: 'View Dashboard', text: 'Monitor overall feedback metrics and trends' },
        { bold: 'Monitor Feedback', text: 'Track all feedback items and their status updates' },
        { bold: 'View Reports', text: 'Analyze team performance and resolution metrics' },
        { bold: 'Team Oversight', text: 'Supervise feedback handling and team productivity' },
      ],
    },
    ar: {
      title: 'مرحباً، مشرف خدمة العملاء!',
      subtitle: 'الإشراف على معالجة التعليقات وأداء الفريق.',
      features: [
        { bold: 'عرض لوحة التحكم', text: 'مراقبة مقاييس التعليقات والاتجاهات العامة' },
        { bold: 'مراقبة التعليقات', text: 'تتبع جميع التعليقات وحالاتها' },
        { bold: 'عرض التقارير', text: 'تحليل أداء الفريق والمقاييس' },
        { bold: 'الإشراف على الفريق', text: 'الإشراف على معالجة التعليقات والإنتاجية' },
      ],
    },
  },
  websiteConfigurator: {
    icon: Plug,
    gradient: 'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20',
    border: 'border-orange-200 dark:border-orange-800',
    iconBg: 'from-orange-500 to-amber-600',
    textColor: 'text-orange-800 dark:text-orange-200',
    dotColor: 'text-orange-600 dark:text-orange-400',
    en: {
      title: 'Welcome, Website Configurator!',
      subtitle: 'Manage API integrations and feedback channels.',
      features: [
        { bold: 'API Configuration', text: 'Connect and configure your feedback collection channels' },
        { bold: 'Integration Management', text: 'Set up Email, Web Forms, and other integration types' },
        { bold: 'Channel Settings', text: 'Configure how feedback flows from different sources' },
        { bold: 'Status Monitoring', text: 'Monitor the status and health of all integrations' },
      ],
    },
    ar: {
      title: 'مرحباً، محقق المتطلبات!',
      subtitle: 'إدارة تكاملات API وقنوات التعليقات.',
      features: [
        { bold: 'تكوين API', text: 'الاتصال وتكوين قنوات جمع التعليقات' },
        { bold: 'إدارة التكاملات', text: 'إعداد البريد والنماذج والقنوات الأخرى' },
        { bold: 'إعدادات القنوات', text: 'تكوين كيفية تدفق التعليقات من مصادر مختلفة' },
        { bold: 'مراقبة الحالة', text: 'مراقبة حالة وصحة جميع التكاملات' },
      ],
    },
  },
};

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useAuth();
  const { language } = useLanguage();

  if (!isVisible || !user?.role) return null;

  const config = roleConfig[user.role as keyof typeof roleConfig];
  if (!config) return null;

  const isAr = language === 'ar';
  const content = isAr ? config.ar : config.en;
  const RoleIcon = config.icon;

  return (
    <Card className={`p-5 bg-gradient-to-r ${config.gradient} ${config.border}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 flex-1">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <RoleIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-black text-base ${config.textColor} mb-0.5`}>
              {content.title}
            </h3>
            <p className={`text-sm ${config.textColor} opacity-80 mb-3`}>
              {content.subtitle}
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {content.features.map((f, i) => (
                <li key={i} className="flex items-start gap-1.5 text-sm">
                  <span className={`${config.dotColor} font-black mt-0.5`}>›</span>
                  <span className={config.textColor + ' opacity-80'}>
                    <strong className={config.textColor + ' opacity-100'}>{f.bold}:</strong>{' '}{f.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)} className="flex-shrink-0 h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
