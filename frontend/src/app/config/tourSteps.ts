// src/config/tourSteps.ts
import { TourStep } from '../components/OnboardingTour';

export const getTourSteps = (isAr: boolean): TourStep[] => [
  {
    target: '[data-tour="sidebar-feedback"]',
    title: isAr ? 'جميع التعليقات' : 'All Feedback',
    description: isAr
      ? 'هنا تجد جميع التعليقات الواردة من مختلف المصادر مثل فيسبوك، تويتر، البريد الإلكتروني، ونماذج الويب.'
      : 'This is where all feedback from different sources appears — Facebook, Twitter, email, web forms, and more.',
    position: 'right',
    route: '/app/feedback',
  },
  {
    target: '[data-tour="feedback-table"]',
    title: isAr ? 'قائمة التعليقات' : 'Feedback List',
    description: isAr
      ? 'تصفح التعليقات، رشّحها حسب المشاعر أو الأولوية أو الحالة، وانقر على أي تعليق لعرض التفاصيل الكاملة.'
      : 'Browse feedback, filter by sentiment, priority, or status, and click any item to view full details.',
    position: 'bottom',
    route: '/app/feedback',
  },
  {
    target: '[data-tour="sidebar-integrations"]',
    title: isAr ? 'التكاملات' : 'Integrations',
    description: isAr
      ? 'اربط قنواتك الخارجية هنا. أضف فيسبوك، تويتر، Gmail، Freshdesk، أو أنشئ نموذج ويب لجمع التعليقات مباشرة.'
      : 'Connect your external channels here. Add Facebook, Twitter, Gmail, Freshdesk, or create a web form to collect feedback directly.',
    position: 'right',
    route: '/app/integrations',
  },
  {
    target: '[data-tour="integration-cards"]',
    title: isAr ? 'قنواتك المتصلة' : 'Your Connected Channels',
    description: isAr
      ? 'شاهد حالة كل قناة، فعّلها أو ألغِ تفعيلها، أو احذفها. انقر على "إضافة تكامل" لربط قناة جديدة.'
      : 'See the status of each channel, activate/deactivate, or remove them. Click "Add Integration" to connect a new channel.',
    position: 'bottom',
    route: '/app/integrations',
  },
  {
    target: '[data-tour="sidebar-reports"]',
    title: isAr ? 'التقارير والتحليلات' : 'Reports & Analytics',
    description: isAr
      ? 'احصل على رؤى شاملة مع رسوم بيانية تفاعلية: تحليل المشاعر، التصنيفات، القنوات، الأولويات، والمزيد.'
      : 'Get comprehensive insights with interactive charts: sentiment analysis, categories, channels, priorities, and more.',
    position: 'right',
    route: '/app/reports',
  },
  {
    target: '[data-tour="reports-tabs"]',
    title: isAr ? 'تبويبات التحليل' : 'Analysis Tabs',
    description: isAr
      ? 'تنقل بين المشاعر والتصنيفات والقنوات والانفعالات والأولويات. صدّر أي تقرير كملف CSV.'
      : 'Switch between sentiment, categories, channels, emotions, and priorities. Export any report as a CSV file.',
    position: 'bottom',
    route: '/app/reports',
  },
  {
    target: '[data-tour="sidebar-settings"]',
    title: isAr ? 'الإعدادات' : 'Settings',
    description: isAr
      ? 'حدّث معلومات ملفك الشخصي، غيّر كلمة المرور، وخصص إعدادات حسابك.'
      : 'Update your profile info, change your password, and customize your account settings.',
    position: 'right',
    route: '/app/settings',
  },
  {
    target: '[data-tour="sidebar-dashboard"]',
    title: isAr ? 'لوحة التحكم' : 'Dashboard',
    description: isAr
      ? 'نظرة عامة سريعة على أداء خدمة العملاء مع أهم المؤشرات والإحصائيات.'
      : 'A quick overview of your customer service performance with key metrics and stats.',
    position: 'right',
    route: '/app/dashboard',
  },
];