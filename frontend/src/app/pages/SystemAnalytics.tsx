import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  Activity, TrendingUp, TrendingDown, Download,
  Building2, Users, MessageSquare, Globe2, Cpu,
} from 'lucide-react';
import { cn } from '../components/ui/utils';

const PALETTE = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2'];

export function SystemAnalytics() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'growth' | 'usage' | 'performance'>('growth');

  const kpis = [
    {
      label: isAr ? 'معدل نمو الشركات' : 'Company Growth Rate',
      value: '+18%',
      trend: 'up',
      icon: Building2,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
    },
    {
      label: isAr ? 'معدل نمو المستخدمين' : 'User Growth Rate',
      value: '+24%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: isAr ? 'حجم الشكاوى الشهري' : 'Monthly Complaint Volume',
      value: '2,890',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: isAr ? 'وقت استجابة API' : 'API Response Time',
      value: '142ms',
      trend: 'down',
      icon: Cpu,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
  ];

  const platformGrowth = [
    { month: 'Sep', companies: 28, users: 195, complaints: 1820 },
    { month: 'Oct', companies: 31, users: 221, complaints: 2145 },
    { month: 'Nov', companies: 34, users: 248, complaints: 1930 },
    { month: 'Dec', companies: 37, users: 263, complaints: 2580 },
    { month: 'Jan', companies: 40, users: 275, complaints: 2340 },
    { month: 'Feb', companies: 42, users: 287, complaints: 2890 },
  ];

  const domainUsage = [
    { name: 'Technology', companies: 12, complaints: 2450, color: PALETTE[0] },
    { name: 'Healthcare', companies: 8, complaints: 1830, color: PALETTE[1] },
    { name: 'Retail', companies: 15, complaints: 3120, color: PALETTE[2] },
    { name: 'Banking', companies: 6, complaints: 1650, color: PALETTE[3] },
  ];

  const systemUptime = [
    { week: 'W1', uptime: 99.9, apiCalls: 12400 },
    { week: 'W2', uptime: 99.8, apiCalls: 14800 },
    { week: 'W3', uptime: 100, apiCalls: 13200 },
    { week: 'W4', uptime: 99.7, apiCalls: 16100 },
    { week: 'W5', uptime: 99.9, apiCalls: 17300 },
    { week: 'W6', uptime: 100, apiCalls: 18900 },
  ];

  const topCompanies = [
    { name: 'Retail World', domain: 'Retail', complaints: 3120, growth: '+12%', trend: 'up' },
    { name: 'TechCorp Solutions', domain: 'Technology', complaints: 2450, growth: '+8%', trend: 'up' },
    { name: 'Healthcare Plus', domain: 'Healthcare', complaints: 1830, growth: '+15%', trend: 'up' },
    { name: 'FinanceHub', domain: 'Banking', complaints: 1650, growth: '-3%', trend: 'down' },
  ];

  const tabs = [
    { id: 'growth', label: isAr ? 'النمو' : 'Platform Growth' },
    { id: 'usage', label: isAr ? 'الاستخدام' : 'Domain Usage' },
    { id: 'performance', label: isAr ? 'الأداء' : 'System Performance' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {isAr ? 'تحليلات النظام' : 'System Analytics'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {isAr ? 'إحصائيات شاملة عن أداء وعمليات المنصة' : 'Comprehensive platform performance, growth and operational metrics'}
          </p>
        </div>
        <Button size="sm" className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
          <Download className="w-4 h-4" />
          {isAr ? 'تصدير التقرير' : 'Export Report'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.label}</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{kpi.value}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {kpi.trend === 'up'
                      ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      : <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                    }
                    <span className={cn('text-xs font-semibold', kpi.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                      {isAr ? 'مقارنة بالشهر الماضي' : 'vs last month'}
                    </span>
                  </div>
                </div>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', kpi.bg)}>
                  <kpi.icon className={cn('w-6 h-6', kpi.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-violet-600 text-violet-600 dark:border-violet-400 dark:text-violet-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'growth' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'نمو المنصة الشهري' : 'Monthly Platform Growth'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={platformGrowth}>
                  <defs>
                    <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="companies" stroke="#7c3aed" fill="url(#compGrad)" strokeWidth={2} name={isAr ? 'الشركات' : 'Companies'} />
                  <Area type="monotone" dataKey="users" stroke="#2563eb" fill="url(#userGrad)" strokeWidth={2} name={isAr ? 'المستخدمون' : 'Users'} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Companies */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{isAr ? 'أكثر الشركات نشاطاً' : 'Most Active Companies'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      {[isAr ? 'الشركة' : 'Company', isAr ? 'المجال' : 'Domain', isAr ? 'الشكاوى' : 'Complaints', isAr ? 'النمو' : 'Growth'].map((h, i) => (
                        <th key={i} className="text-left pb-3 pr-4 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {topCompanies.map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{c.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className="text-xs">{c.domain}</Badge>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-semibold text-gray-900 dark:text-white">{c.complaints.toLocaleString()}</span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            {c.trend === 'up'
                              ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                              : <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                            }
                            <span className={cn('text-xs font-semibold', c.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                              {c.growth}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'usage' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'الشكاوى حسب المجال' : 'Complaints by Domain'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={domainUsage} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="complaints" radius={[6, 6, 0, 0]} name={isAr ? 'الشكاوى' : 'Complaints'}>
                    {domainUsage.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'توزيع الشركات حسب المجال' : 'Companies per Domain'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={domainUsage} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="companies" paddingAngle={3}>
                    {domainUsage.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {domainUsage.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{d.name}</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white ml-auto">{d.companies}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'وقت التشغيل الأسبوعي (%)' : 'Weekly Uptime (%)'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={systemUptime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis domain={[99, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="uptime" stroke="#059669" strokeWidth={2.5} dot={{ r: 4, fill: '#059669' }} name={isAr ? 'التشغيل' : 'Uptime %'} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'استدعاءات API الأسبوعية' : 'Weekly API Calls'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={systemUptime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="apiCalls" fill="#7c3aed" radius={[6, 6, 0, 0]} name={isAr ? 'استدعاءات API' : 'API Calls'} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
