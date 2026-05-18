import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { X, Shield, Building2, UserCog, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const roleConfig = {
  superAdmin: {
    icon: Shield,
    gradient: 'from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20',
    border: 'border-violet-200 dark:border-violet-800',
    iconBg: 'from-violet-600 to-purple-700',
    textColor: 'text-violet-800 dark:text-violet-200',
    dotColor: 'text-violet-600 dark:text-violet-400',
    en: {
      title: 'Welcome, Super Admin!',
      subtitle: 'You have full system access across all companies and domains.',
      features: [
        { bold: 'System Overview', text: 'Monitor KPIs across all companies and domains in real-time' },
        { bold: 'Company Management', text: 'Activate, suspend, and configure any company on the platform' },
        { bold: 'Domain Control', text: 'Create and manage industry domains for feedback categorization' },
        { bold: 'All Feedback', text: 'View every feedback item across the entire system with cross-company filters' },
      ],
    },
    ar: {
      title: 'مرحباً، مدير النظام!',
      subtitle: 'لديك صلاحية وصول كاملة لجميع الشركات والمجالات.',
      features: [
        { bold: 'نظرة عامة على النظام', text: 'مراقبة مؤشرات الأداء عبر جميع الشركات في الوقت الفعلي' },
        { bold: 'إدارة الشركات', text: 'تفعيل وتعليق وإعداد أي شركة على المنصة' },
        { bold: 'التحكم بالمجالات', text: 'إنشاء وإدارة مجالات الصناعة لتصنيف التعليقات' },
        { bold: 'جميع التعليقات', text: 'عرض كل تعليق في النظام مع فلاتر متعددة الشركات' },
      ],
    },
  },
  companyAdmin: {
    icon: Building2,
    gradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    iconBg: 'from-blue-600 to-indigo-700',
    textColor: 'text-blue-800 dark:text-blue-200',
    dotColor: 'text-blue-600 dark:text-blue-400',
    en: {
      title: 'Welcome, Company Admin!',
      subtitle: 'Manage your company\'s feedback, users, and API integrations.',
      features: [
        { bold: 'Feedback Dashboard', text: 'Full sentiment and category analytics for your company' },
        { bold: 'User Management', text: 'Add users, assign roles (Manager / CSS), and deactivate accounts' },
        { bold: 'API Integrations', text: 'Connect Email, Web Forms and other feedback channels' },
        { bold: 'Reports', text: 'Generate and export detailed performance reports' },
      ],
    },
    ar: {
      title: 'مرحباً، مدير الشركة!',
      subtitle: 'إدارة تعليقات شركتك والمستخدمين وتكاملات API.',
      features: [
        { bold: 'لوحة التعليقات', text: 'تحليلات كاملة للمشاعر والتصنيفات لشركتك' },
        { bold: 'إدارة المستخدمين', text: 'إضافة مستخدمين وتعيين الأدوار وتعطيل الحسابات' },
        { bold: 'تكاملات API', text: 'ربط البريد والنماذج الإلكترونية وقنوات التعليقات الأخرى' },
        { bold: 'التقارير', text: 'إنشاء وتصدير تقارير أداء مفصّلة' },
      ],
    },
  },
  manager: {
    icon: UserCog,
    gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    iconBg: 'from-emerald-500 to-teal-600',
    textColor: 'text-emerald-800 dark:text-emerald-200',
    dotColor: 'text-emerald-600 dark:text-emerald-400',
    en: {
      title: 'Welcome, Customer Service Supervisor (CSS)!',
      subtitle: 'Oversee your team\'s feedback handling and performance.',
      features: [
        { bold: 'Assign Feedback', text: 'Distribute feedback to CSSs and monitor workload' },
        { bold: 'Set Priority', text: 'Mark urgent feedback as high priority to ensure timely resolution' },
        { bold: 'Change Status', text: 'Update status from Open → In Progress → Resolved → Closed' },
        { bold: 'Reports & Analytics', text: 'View team performance, CSS metrics, and resolution trends' },
      ],
    },
    ar: {
      title: 'مرحباً، مشرف خدمة العملاء (CSS)!',
      subtitle: 'الإشراف على معالجة التعليقات وأداء فريقك.',
      features: [
        { bold: 'إسناد التعليقات', text: 'توزيع التعليقات على الموظفين ومراقبة عبء العمل' },
        { bold: 'تحديد الأولوية', text: 'تصنيف التعليقات العاجلة بأولوية عالية لضمان الحل السريع' },
        { bold: 'تغيير الحالة', text: 'تحديث الحالة من مفتوح → قيد المعالجة → تم الحل → مغلق' },
        { bold: 'التقارير والتحليلات', text: 'عرض أداء الفريق ومقاييس الموظفين واتجاهات الحل' },
      ],
    },
  },
  websiteConfigurator: {
    icon: Users,
    gradient: 'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20',
    border: 'border-orange-200 dark:border-orange-800',
    iconBg: 'from-orange-500 to-amber-600',
    textColor: 'text-orange-800 dark:text-orange-200',
    dotColor: 'text-orange-600 dark:text-orange-400',
    en: {
      title: 'Welcome, Website Configurator!',
      subtitle: 'View and manage the feedback items assigned to you.',
      features: [
        { bold: 'My Feedback', text: 'See only the feedback items assigned specifically to you' },
        { bold: 'Update Status', text: 'Change status to track your progress on each item' },
        { bold: 'Add Notes', text: 'Leave internal notes and comments on feedback for context' },
        { bold: 'Expandable Cards', text: 'Click any feedback card to expand it and take action inline' },
      ],
    },
    ar: {
      title: 'مرحباً، الموظف!',
      subtitle: 'عرض وإدارة التعليقات المُسندة إليك.',
      features: [
        { bold: 'تعليقاتي', text: 'عرض التعليقات المُسندة إليك فقط' },
        { bold: 'تحديث الحالة', text: 'تغيير الحالة لتتبع تقدمك في كل تعليق' },
        { bold: 'إضافة ملاحظات', text: 'ترك ملاحظات داخلية وتعليقات على التعليقات للسياق' },
        { bold: 'بطاقات قابلة للتوسيع', text: 'انقر على أي بطاقة لتوسيعها واتخاذ الإجراء مباشرةً' },
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
