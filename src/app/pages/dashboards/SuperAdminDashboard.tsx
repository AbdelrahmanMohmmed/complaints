// NOTE: This super admin dashboard uses aggregated MOCK domain and company metrics.
// TODO: Replace `mockDomains` and static arrays with real analytics endpoints.
// Optional Role we can add later
import React from 'react';
import { Link } from 'react-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { mockCompanies, mockDomains } from '../../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Building2, Globe2, MessageSquare, Users,
  TrendingUp, TrendingDown, ArrowRight, Plus,
  Shield, Activity, CheckCircle, AlertTriangle, Smile,
} from 'lucide-react';
import { cn } from '../../components/ui/utils';

const DOMAIN_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2'];

const SENTIMENT_COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280',
};

export function SuperAdminDashboard() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  // KPI data per spec: Total Companies, Active Companies, Total Users, Total Complaints (aggregated), Average Global Sentiment Score
  const kpis = [
    {
      label: t('dashboard.totalCompanies'),
      value: '42',
      change: '+3',
      trend: 'up',
      icon: Building2,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      sub: isAr ? 'مقارنة بالشهر الماضي' : 'vs last month',
    },
    {
      label: t('dashboard.activeCompanies'),
      value: '38',
      change: '+2',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      sub: isAr ? 'شركة نشطة' : 'currently active',
    },
    {
      label: isAr ? 'إجمالي المستخدمين' : 'Total Users (System)',
      value: '287',
      change: '+12',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      sub: isAr ? 'عبر المنصة' : 'platform-wide',
    },
    {
      label: isAr ? 'إجمالي الشكاوى' : 'Total Complaints',
      value: '12,450',
      change: '+18.2%',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      sub: isAr ? 'مجموع الكل' : 'aggregated',
    },
    {
      label: isAr ? 'متوسط درجة المشاعر' : 'Avg Global Sentiment',
      value: '7.2',
      change: '+0.4',
      trend: 'up',
      icon: Smile,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-900/20',
      sub: isAr ? 'من 10' : 'out of 10',
    },
  ];

  // Line Chart: Complaints trend (aggregated only, no company detail)
  const complaintsTrend = [
    { month: 'Sep', complaints: 1820, resolved: 1540 },
    { month: 'Oct', complaints: 2145, resolved: 1890 },
    { month: 'Nov', complaints: 1930, resolved: 1720 },
    { month: 'Dec', complaints: 2580, resolved: 2200 },
    { month: 'Jan', complaints: 2340, resolved: 2100 },
    { month: 'Feb', complaints: 2890, resolved: 2450 },
  ];

  // Pie Chart: Global sentiment distribution
  const globalSentimentData = [
    { name: t('sentiment.positive'), value: 5482, color: SENTIMENT_COLORS.positive },
    { name: t('sentiment.negative'), value: 3621, color: SENTIMENT_COLORS.negative },
    { name: t('sentiment.neutral'), value: 3347, color: SENTIMENT_COLORS.neutral },
  ];

  const feedbackByDomain = mockDomains.map((d, i) => ({
    name: d.name,
    feedback: d.totalFeedback,
    companies: d.companies,
    color: DOMAIN_COLORS[i % DOMAIN_COLORS.length],
  }));

  const systemAlerts = [
    { type: 'warning', message: isAr ? 'انتهى اشتراك Retail World منذ 3 أيام' : 'Retail World subscription expired 3 days ago', time: isAr ? 'منذ ساعتين' : '2h ago' },
    { type: 'info', message: isAr ? 'تجاوزت Healthcare Plus حد 500 شكوى يومياً' : 'Healthcare Plus exceeded 500 daily complaint limit', time: isAr ? 'منذ 5 ساعات' : '5h ago' },
    { type: 'success', message: isAr ? 'تم إلحاق شركة "LogiTech Inc." بنجاح' : 'New company "LogiTech Inc." onboarded successfully', time: isAr ? 'منذ يوم' : '1d ago' },
  ];

  const alertColors: Record<string, string> = {
    warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    success: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  };

  // Companies table per spec: Company Name, Status (Active/Suspended), Number of Users, Number of Complaints, Created Date
  const companiesTable = [
    { name: 'TechCorp Solutions', status: true, users: 12, complaints: 1247, joined: 'Jun 15, 2025' },
    { name: 'Healthcare Plus', status: true, users: 8, complaints: 892, joined: 'Aug 20, 2025' },
    { name: 'Retail World', status: false, users: 5, complaints: 543, joined: 'Oct 10, 2025' },
    { name: 'FinanceHub', status: true, users: 6, complaints: 324, joined: 'Jan 22, 2026' },
    { name: 'LogiTech Inc.', status: true, users: 3, complaints: 87, joined: 'Feb 28, 2026' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-violet-200" />
              <span className="text-violet-200 text-sm font-medium">{t('role.superAdmin')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mb-1">{t('dashboard.systemOverview')}</h1>
            <p className="text-violet-200 text-sm">
              {isAr ? 'نظرة شاملة على أداء النظام عبر جميع الشركات والمجالات' : 'Full visibility across all companies, domains and aggregated complaints'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/app/companies">
              <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/20 gap-1.5">
                <Plus className="w-4 h-4" />
                {isAr ? 'إضافة شركة' : 'Add Company'}
              </Button>
            </Link>
            <Link to="/app/domains">
              <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-1.5">
                <Globe2 className="w-4 h-4" />
                {isAr ? 'إضافة مجال' : 'Add Domain'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards — 5 cards per spec */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-snug">{kpi.label}</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{kpi.value}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    )}
                    <span className={cn('text-xs font-semibold', kpi.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                      {kpi.change}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 truncate">{kpi.sub}</span>
                  </div>
                </div>
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', kpi.bg)}>
                  <kpi.icon className={cn('w-5 h-5', kpi.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1: Line Chart (Complaints Trend) + Pie Chart (Global Sentiment) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Complaints Trend — aggregated only */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{isAr ? 'اتجاه الشكاوى (مجمّع)' : 'Complaints Trend (Aggregated)'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={complaintsTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="complaints" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3 }} name={isAr ? 'الشكاوى' : 'Complaints'} />
                <Line type="monotone" dataKey="resolved" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" name={isAr ? 'تم الحل' : 'Resolved'} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart: Global Sentiment Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{isAr ? 'توزيع المشاعر العالمي' : 'Global Sentiment Distribution'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={globalSentimentData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} dataKey="value" paddingAngle={3}>
                  {globalSentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-1">
              {globalSentimentData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Feedback by Domain + System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Feedback by Domain */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('dashboard.feedbackByDomain')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={feedbackByDomain} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="name" className="text-xs" tick={{ fontSize: 11 }} />
                <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="feedback" radius={[6, 6, 0, 0]} label={false}>
                  {feedbackByDomain.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{isAr ? 'تنبيهات النظام' : 'System Alerts'}</CardTitle>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemAlerts.map((alert, i) => (
              <div key={i} className={cn('flex items-start gap-3 p-3 rounded-lg border text-sm', alertColors[alert.type])}>
                {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                {alert.type === 'info' && <Activity className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                {alert.type === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className="leading-snug">{alert.message}</p>
                  <p className="text-xs opacity-60 mt-0.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Companies Table per spec: Company Name, Status (Active/Suspended), Number of Users, Number of Complaints, Created Date */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{isAr ? 'نظرة عامة على الشركات' : 'Companies Overview'}</CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{isAr ? 'لا يشمل تفاصيل الشكاوى أو بيانات العملاء' : 'Aggregated data only — no complaint text or customer data'}</p>
            </div>
            <Link to="/app/companies">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                {isAr ? 'عرض الكل' : 'View All'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left pb-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">{isAr ? 'الشركة' : 'Company Name'}</th>
                  <th className="text-left pb-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="text-left pb-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide hidden md:table-cell">{isAr ? 'عدد المستخدمين' : 'Users'}</th>
                  <th className="text-left pb-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide hidden lg:table-cell">{isAr ? 'الشكاوى' : 'Complaints'}</th>
                  <th className="text-left pb-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide hidden lg:table-cell">{isAr ? 'تاريخ الإنشاء' : 'Created Date'}</th>
                  <th className="pb-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {companiesTable.map((company, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{company.name}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge className={cn('text-xs', company.status
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      )}>
                        {company.status ? (isAr ? 'نشط' : 'Active') : (isAr ? 'موقوف' : 'Suspended')}
                      </Badge>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400 hidden md:table-cell">{company.users}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400 hidden lg:table-cell">{company.complaints.toLocaleString()}</td>
                    <td className="py-3 text-gray-500 dark:text-gray-500 text-xs hidden lg:table-cell">{company.joined}</td>
                    <td className="py-3">
                      <Link to="/app/companies">
                        <Button variant="ghost" size="sm" className="text-xs h-7">
                          {isAr ? 'عرض' : 'View'}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
