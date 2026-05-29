import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.feedback': 'Feedback',
    'nav.users': 'Users',
    'nav.integrations': 'Integrations',
    'nav.categories': 'Categories',
    'nav.domains': 'Domains',
    'nav.companies': 'Companies',
    'nav.settings': 'Settings',
    'nav.connectedChannels': 'Connected Channels',
    'nav.allFeedback': 'All Feedback',
    'nav.apis': 'APIs',
    'nav.reports': 'Reports',
    'nav.myFeedback': 'My Feedback',
    'nav.systemSettings': 'System Settings',
    'nav.systemOverview': 'System Overview',
    'nav.systemAnalytics': 'System Analytics',
    'nav.logs': 'Logs',
    'nav.allComplaints': 'All Feedback',
    'nav.teamPerformance': 'Team Performance',
    'nav.profile': 'My Profile',
    
    // Common
    'common.search': 'Search...',
    'feedback.searchPlaceholder': 'Search feedback ...',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.add': 'Add',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.name': 'Name',
    'common.email': 'Email',
    'common.role': 'Role',
    'common.active': 'Active',
    'common.inactive': 'Inactive',
    'common.all': 'All',
    'common.assign': 'Assign',
    'common.view': 'View',
    'common.notes': 'Notes',
    'common.addNote': 'Add Note',
    'common.close': 'Close',
    'common.generate': 'Generate',
    'common.download': 'Download',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.totalFeedback': 'Total Feedback',
    'dashboard.positiveRatio': 'Positive Ratio',
    'dashboard.openFeedback': 'Open Feedback',
    'dashboard.highPriority': 'High Priority',
    'dashboard.sentimentDistribution': 'Sentiment Distribution',
    'dashboard.monthlyTrend': 'Monthly Feedback Trend',
    'dashboard.categoryDistribution': 'Category Distribution',
    'dashboard.emotionBreakdown': 'Emotion Breakdown',
    'dashboard.totalCompanies': 'Total Companies',
    'dashboard.activeCompanies': 'Active Companies',
    'dashboard.totalDomains': 'Total Domains',
    'dashboard.systemFeedback': 'System Feedback',
    'dashboard.totalUsers': 'Total Users',
    'dashboard.activeUsers': 'Active Users',
    'dashboard.feedbackByDomain': 'Feedback by Domain',
    'dashboard.companyOverview': 'Company Overview',
    'dashboard.teamFeedback': 'Team Feedback',
    'dashboard.pendingAssignment': 'Pending Assignment',
    'dashboard.resolvedThisMonth': 'Resolved This Month',
    'dashboard.statusDistribution': 'Status Distribution',
    'dashboard.agentWorkload': 'Agent Workload',
    'dashboard.systemOverview': 'System Overview',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.priorityDistribution': 'Priority Distribution',
    'dashboard.teamPerformance': 'Team Performance',
    'dashboard.resolutionTrend': 'Resolution Trend',
    'dashboard.feedbackVolume': 'Feedback Volume',
    'dashboard.frustrationRate': 'Frustration Rate',
    'dashboard.disgustedRate': 'Disgusted Rate',
    
    // Feedback
    'feedback.title': 'Feedback Management',
    'feedback.customer': 'Customer',
    'feedback.content': 'Content',
    'feedback.sentiment': 'Sentiment',
    'feedback.emotion': 'Emotion',
    'feedback.priority': 'Priority',
    'feedback.category': 'Category',
    'feedback.problemType': 'Problem Type',
    'feedback.channel': 'Channel',
    'feedback.assignedTo': 'Assigned To',
    'feedback.createdAt': 'Created At',
    'feedback.details': 'Feedback Details',
    'feedback.assignAgent': 'Assign to Agent',
    'feedback.changeStatus': 'Change Status',
    'feedback.timeline': 'Timeline',
    'feedback.setPriority': 'Set Priority',
    'feedback.notes': 'Notes',
    'feedback.addNote': 'Add Note',
    'feedback.noteContent': 'Note Content',
    'feedback.notePlaceholder': 'Add a note or comment...',
    
    // Status
    'status.open': 'Open',
    'status.inProgress': 'In Progress',
    'status.resolved': 'Resolved',
    'status.closed': 'Closed',
    
    // Sentiment
    'sentiment.positive': 'Positive',
    'sentiment.negative': 'Negative',
    'sentiment.neutral': 'Neutral',

    // Emotion
    'emotion.0': 'Frustrated',
    'emotion.1': 'Neutral',
    'emotion.2': 'Disgusted',
    'emotion.3': 'Satisfied',
    
    // Priority
    'priority.low': 'Low',
    'priority.medium': 'Medium',
    'priority.high': 'High',
    'priority.critical': 'Critical',

    // Months
    'month.jan': 'January',
    'month.feb': 'February',
    'month.mar': 'March',
    'month.apr': 'April',
    'month.may': 'May',
    'month.jun': 'June',
    'month.jul': 'July',
    'month.aug': 'August',
    'month.sep': 'September',
    'month.oct': 'October',
    'month.nov': 'November',
    'month.dec': 'December',

    // Problem Type
    'problemType.0': 'Delivery Issue',
    'problemType.1': 'Food Quality',
    'problemType.2': 'Hygiene',
    'problemType.3': 'Service Quality',
    'problemType.4': 'Pricing',
    'problemType.5': 'Order Accuracy',
    'problemType.6': 'Bad Atmosphere',
    'problemType.7': 'Menu',
    
    // Users
    'users.title': 'User Management',
    'users.addUser': 'Add User',
    'users.editUser': 'Edit User',
    
    // Roles
    'role.manager': 'Manager',
    'role.customerServiceSupervisor': 'Customer Service Supervisor',
    'role.websiteConfigurator': 'Website Configurator',
    
    // Integrations / APIs
    'integrations.title': 'API Management',
    'integrations.addIntegration': 'Add Integration',
    'integrations.apiKey': 'API Key',
    'integrations.connected': 'Connected',
    'integrations.disconnected': 'Disconnected',
    
    // Categories
    'categories.title': 'Category Management',
    'categories.addCategory': 'Add Category',
    
    // Manager
    'manager.teamPerformance': 'Team Performance',
    'manager.pendingAssignment': 'Pending Assignment',
    'manager.agentWorkload': 'Agent Workload',
    
    // Reports
    'reports.title': 'Reports & Analytics',
    'reports.generate': 'Generate Report',
    'reports.export': 'Export Data',
    'reports.dateRange': 'Date Range',
    'reports.sentimentReport': 'Sentiment Analysis Report',
    'reports.categoryReport': 'Category Report',
    'reports.agentReport': 'Agent Performance Report',
    'reports.channelReport': 'Channel Distribution Report',
    'reports.summary': 'Summary',
    'reports.negativeRate': 'Negative Rate',
    'reports.emotionTab': 'Emotions',
    'reports.priorityTab': 'Priority',
    'reports.emotionDistribution': 'Emotion Distribution',
    'reports.emotionBySentiment': 'Emotion by Sentiment',
    'reports.priorityDistribution': 'Priority Distribution',
    'reports.priorityByCategory': 'Priority by Category',
    'reports.priorityTrend': 'Priority Trend',
    
    // Filters
    'filter.dateRange': 'Date Range',
    'filter.category': 'Category',
    'filter.status': 'Status',
    'filter.channel': 'Channel',
    'filter.sentiment': 'Sentiment',
    'filter.company': 'Company',
    'filter.agent': 'Agent',
    'filter.priority': 'Priority',
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.feedback': 'التعليقات',
    'nav.users': 'المستخدمون',
    'nav.integrations': 'التكاملات',
    'nav.categories': 'التصنيفات',
    'nav.domains': 'المجالات',
    'nav.companies': 'الشركات',
    'nav.settings': 'الإعدادات',
    'nav.connectedChannels': 'القنوات المتصلة',
    'nav.allFeedback': 'جميع التعليقات',
    'nav.apis': 'واجهات API',
    'nav.reports': 'التقارير',
    'nav.myFeedback': 'تعليقاتي',
    'nav.systemSettings': 'إعدادات النظام',
    'nav.systemOverview': 'نظرة عامة على النظام',
    'nav.systemAnalytics': 'تحليلات النظام',
    'nav.logs': 'السجلات',
    'nav.allComplaints': 'جميع التعليقات',
    'nav.teamPerformance': 'أداء الفريق',
    'nav.profile': 'ملفي الشخصي',
    
    // Common
    'common.search': 'بحث...',
    'common.filter': 'تصفية',
    'common.export': 'تصدير',
    'common.add': 'إضافة',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.actions': 'الإجراءات',
    'common.status': 'الحالة',
    'common.date': 'التاريخ',
    'common.name': 'الاسم',
    'common.email': 'البريد الإلكتروني',
    'common.role': 'الدور',
    'common.active': 'نشط',
    'common.inactive': 'غير نشط',
    'common.all': 'الكل',
    'common.assign': 'إسناد',
    'common.view': 'عرض',
    'common.notes': 'الملاحظات',
    'common.addNote': 'إضافة ملاحظة',
    'common.close': 'إغلاق',
    'common.generate': 'إنشاء',
    'common.download': 'تنزيل',
    
    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.totalFeedback': 'إجمالي التعليقات',
    'dashboard.positiveRatio': 'نسبة الإيجابية',
    'dashboard.openFeedback': 'التعليقات المفتوحة',
    'dashboard.highPriority': 'أولوية عالية',
    'dashboard.sentimentDistribution': 'توزيع المشاعر',
    'dashboard.monthlyTrend': 'الاتجاه الشهري للتعليقات',
    'dashboard.categoryDistribution': 'توزيع التصنيفات',
    'dashboard.emotionBreakdown': 'تفصيل العواطف',
    'dashboard.totalCompanies': 'إجمالي الشركات',
    'dashboard.activeCompanies': 'الشركات النشطة',
    'dashboard.totalDomains': 'إجمالي المجالات',
    'dashboard.systemFeedback': 'تعليقات النظام',
    'dashboard.totalUsers': 'إجمالي المستخدمين',
    'dashboard.activeUsers': 'المستخدمون النشطون',
    'dashboard.feedbackByDomain': 'التعليقات حسب المجال',
    'dashboard.companyOverview': 'نظرة عامة على الشركة',
    'dashboard.teamFeedback': 'تعليقات الفريق',
    'dashboard.pendingAssignment': 'في انتظار الإسناد',
    'dashboard.resolvedThisMonth': 'تم حلها هذا الشهر',
    'dashboard.statusDistribution': 'توزيع الحالات',
    'dashboard.agentWorkload': 'عبء عمل الموظفين',
    'dashboard.systemOverview': 'نظرة عامة على النظام',
    'dashboard.recentActivity': 'النشاط الأخير',
    'dashboard.quickActions': 'إجراءات سريعة',
    'dashboard.priorityDistribution': 'توزيع الأولويات',
    'dashboard.teamPerformance': 'أداء الفريق',
    'dashboard.resolutionTrend': 'اتجاه الحل',
    'dashboard.feedbackVolume': 'حجم التعليقات',
    'dashboard.frustrationRate': 'نسبة الإحباط',
    'dashboard.disgustedRate': 'نسبة الاشمئزاز',
    
    // Feedback
    'feedback.title': 'إدارة التعليقات',
    'feedback.customer': 'العميل',
    'feedback.content': 'المحتوى',
    'feedback.sentiment': 'المشاعر',
    'feedback.emotion': 'العاطفة',
    'feedback.priority': 'الأولوية',
    'feedback.category': 'التصنيف',
    'feedback.problemType': 'نوع المشكلة',
    'feedback.channel': 'القناة',
    'feedback.assignedTo': 'مُعيّن إلى',
    'feedback.createdAt': 'تاريخ الإنشاء',
    'feedback.details': 'تفاصيل التعليق',
    'feedback.assignAgent': 'تعيين إلى موظف',
    'feedback.changeStatus': 'تغيير الحالة',
    'feedback.timeline': 'الخط الزمني',
    'feedback.setPriority': 'تحديد الأولوية',
    'feedback.notes': 'الملاحظات',
    'feedback.addNote': 'إضافة ملاحظة',
    'feedback.noteContent': 'محتوى الملاحظة',
    'feedback.notePlaceholder': 'أضف ملاحظة أو تعليقاً...',
    'feedback.searchPlaceholder': 'ابحث عن التعليقات ...',
    
    // Status
    'status.open': 'مفتوح',
    'status.inProgress': 'قيد المعالجة',
    'status.resolved': 'تم الحل',
    'status.closed': 'مغلق',
    
    // Sentiment
    'sentiment.positive': 'إيجابي',
    'sentiment.negative': 'سلبي',
    'sentiment.neutral': 'محايد',

    // Emotion
    'emotion.0': 'محبط',
    'emotion.1': 'محايد',
    'emotion.2': 'مشمئز',
    'emotion.3': 'راضٍ',
    
    // Priority
    'priority.low': 'منخفض',
    'priority.medium': 'متوسط',
    'priority.high': 'عالي',
    'priority.critical': 'حرج',

    // Months
    'month.jan': 'يناير',
    'month.feb': 'فبراير',
    'month.mar': 'مارس',
    'month.apr': 'أبريل',
    'month.may': 'مايو',
    'month.jun': 'يونيو',
    'month.jul': 'يوليو',
    'month.aug': 'أغسطس',
    'month.sep': 'سبتمبر',
    'month.oct': 'أكتوبر',
    'month.nov': 'نوفمبر',
    'month.dec': 'ديسمبر',

    // Problem Type
    'problemType.0': 'مشكله توصيل',
    'problemType.1': 'جودة الطعام',
    'problemType.2': 'النظافة',
    'problemType.3': 'جودة الخدمة',
    'problemType.4': 'الأسعار',
    'problemType.5': 'دقة الطلب',
    'problemType.6': 'أجواء سيئة',
    'problemType.7': 'قائمة الطعام',
    
    // Users
    'users.title': 'إدارة المستخدمين',
    'users.addUser': 'إضافة مستخدم',
    'users.editUser': 'تعديل مستخدم',
    
    // Roles
    'role.manager': 'المدير',
    'role.customerServiceSupervisor': 'مشرف خدمة العملاء',
    'role.websiteConfigurator': 'مهيئ الموقع',
    
    // Integrations / APIs
    'integrations.title': 'إدارة واجهات API',
    'integrations.addIntegration': 'إضافة تكامل',
    'integrations.apiKey': 'مفتاح API',
    'integrations.connected': 'متصل',
    'integrations.disconnected': 'غير متصل',
    
    // Categories
    'categories.title': 'إدارة التصنيفات',
    'categories.addCategory': 'إضافة تصنيف',
    
    // Super Admin
    'superadmin.domains': 'إدارة المجالات',
    'superadmin.companies': 'إدارة الشركات',
    'superadmin.systemStats': 'إحصائيات النظام',
    'superadmin.totalCompanies': 'إجمالي الشركات',
    'superadmin.totalDomains': 'إجمالي المجالات',
    'superadmin.feedbackPerDomain': 'التعليقات لكل مجال',
    'superadmin.activateCompany': 'تفعيل',
    'superadmin.suspendCompany': 'تعليق',
    'superadmin.addDomain': 'إضافة مجال',
    'superadmin.addCompany': 'إضافة شركة',
    
    // Manager
    'manager.assignFeedback': 'إسناد التعليقات',
    'manager.teamPerformance': 'أداء الفريق',
    'manager.pendingAssignment': 'في انتظار الإسناد',
    'manager.agentWorkload': 'عبء عمل الموظفين',
    
    // Agent
    'agent.myFeedback': 'تعليقاتي',
    'agent.assignedToMe': 'المُسندة إليّ',
    'agent.updateStatus': 'تحديث الحالة',
    'agent.addNote': 'إضافة ملاحظة',
    'agent.resolvedToday': 'تم حلها اليوم',
    
    // Reports
    'reports.title': 'التقارير والتحليلات',
    'reports.generate': 'إنشاء تقرير',
    'reports.export': 'تصدير البيانات',
    'reports.dateRange': 'نطاق التاريخ',
    'reports.sentimentReport': 'تقرير تحليل المشاعر',
    'reports.categoryReport': 'تقرير التصنيفات',
    'reports.agentReport': 'تقرير أداء الموظفين',
    'reports.channelReport': 'تقرير توزيع القنوات',
    'reports.summary': 'الملخص',
    'reports.negativeRate': 'نسبة السلبية',
    'reports.emotionTab': 'العواطف',
    'reports.priorityTab': 'الأولوية',
    'reports.emotionDistribution': 'توزيع العواطف',
    'reports.emotionBySentiment': 'العواطف حسب المشاعر',
    'reports.priorityDistribution': 'توزيع الأولوية',
    'reports.priorityByCategory': 'الأولوية حسب التصنيف',
    'reports.priorityTrend': 'اتجاه الأولوية',
    
    // Filters
    'filter.dateRange': 'نطاق التاريخ',
    'filter.category': 'التصنيف',
    'filter.status': 'الحالة',
    'filter.channel': 'القناة',
    'filter.sentiment': 'المشاعر',
    'filter.company': 'الشركة',
    'filter.agent': 'الموظف',
    'filter.priority': 'الأولوية',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('ara2kom-language') as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('ara2kom-language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}