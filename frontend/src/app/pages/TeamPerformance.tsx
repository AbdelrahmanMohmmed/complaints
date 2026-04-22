// NOTE: This team performance view uses MOCK agent performance and distribution data.
// TODO: Replace static arrays and any `mockData` imports with real analytics endpoints (e.g. `/api/v1/reports/team-performance`).

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp, TrendingDown, CheckCircle2, Clock, UserCheck,
  AlertCircle, Download, Star, Zap, Target,
} from 'lucide-react';
import { cn } from '../components/ui/utils';

const agentData = [
  {
    id: 'agent-1',
    name: 'Omar Hussein',
    email: 'omar@company.com',
    assigned: 45,
    resolved: 42,
    open: 3,
    avgTime: 4.2,
    satisfaction: 94,
    trend: 'up',
    streak: 12,
  },
  {
    id: 'agent-2',
    name: 'Fatima Ahmed',
    email: 'fatima@company.com',
    assigned: 38,
    resolved: 35,
    open: 3,
    avgTime: 5.1,
    satisfaction: 89,
    trend: 'up',
    streak: 7,
  },
  {
    id: 'agent-3',
    name: 'Khalid Nasser',
    email: 'khalid@company.com',
    assigned: 52,
    resolved: 48,
    open: 4,
    avgTime: 3.8,
    satisfaction: 97,
    trend: 'up',
    streak: 20,
  },
];

const weeklyPerformance = [
  { week: 'W1', omar: 12, fatima: 10, khalid: 15 },
  { week: 'W2', omar: 14, fatima: 11, khalid: 18 },
  { week: 'W3', omar: 10, fatima: 9, khalid: 14 },
  { week: 'W4', omar: 16, fatima: 12, khalid: 17 },
  { week: 'W5', omar: 18, fatima: 14, khalid: 19 },
  { week: 'W6', omar: 20, fatima: 15, khalid: 22 },
];

const resolutionTime = [
  { week: 'W1', avgHours: 18 },
  { week: 'W2', avgHours: 14 },
  { week: 'W3', avgHours: 16 },
  { week: 'W4', avgHours: 11 },
  { week: 'W5', avgHours: 9 },
  { week: 'W6', avgHours: 7 },
];

const categoryBreakdown = [
  { name: 'Service Quality', value: 180, color: '#3b82f6' },
  { name: 'Product Quality', value: 156, color: '#8b5cf6' },
  { name: 'Customer Support', value: 98, color: '#f59e0b' },
  { name: 'Delivery', value: 75, color: '#10b981' },
];

export function TeamPerformance() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'trends'>('overview');

  const teamKpis = [
    {
      label: isAr ? 'إجمالي التعليقات المُسندة' : 'Total Assigned',
      value: '135',
      change: '+8.4%',
      trend: 'up',
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: isAr ? 'تم الحل' : 'Resolved',
      value: '125',
      change: '+22%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: isAr ? 'متوسط وقت الحل' : 'Avg Resolution Time',
      value: '7.4h',
      change: '-38%',
      trend: 'down',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label: isAr ? 'رضا العملاء' : 'Customer Satisfaction',
      value: '93.3%',
      change: '+4.2%',
      trend: 'up',
      icon: Star,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
    },
  ];

  const tabs = [
    { id: 'overview', label: isAr ? 'نظرة عامة' : 'Overview' },
    { id: 'agents', label: isAr ? 'أداء الموظفين' : 'Agent Performance' },
    { id: 'trends', label: isAr ? 'الاتجاهات' : 'Trends' },
  ];

  const formatInitials = (name: string) => name.split(' ').map(n => n[0]).join('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-1/3 -translate-y-1/3" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-emerald-200" />
              <span className="text-emerald-200 text-sm font-medium">{isAr ? 'مشرف خدمة العملاء (CSS)' : 'Customer Service Supervisor (CSS)'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mb-1">{isAr ? 'أداء الفريق' : 'أداء الفريق'}</h1>
            <p className="text-emerald-200 text-sm">
              {isAr ? 'تحليل شامل لأداء الموظفين ومعدلات حل التعليقات' : 'Comprehensive analysis of agent performance and resolution metrics'}
            </p>
          </div>
          <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/20 gap-1.5">
            <Download className="w-4 h-4" />
            {isAr ? 'تصدير التقرير' : 'تصدير التقرير'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {teamKpis.map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.label}</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{kpi.value}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {kpi.trend === 'up'
                      ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      : <TrendingDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    }
                    <span className={cn('text-xs font-semibold', kpi.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400')}>
                      {kpi.change}
                    </span>
                    <span className="text-xs text-gray-400">{isAr ? 'الشهر الماضي' : 'مقارنة بالشهر الماضي'}</span>
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
        <nav className="flex gap-1 -mb-px">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly resolved per agent */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{isAr ? 'التعليقات المُحلّة أسبوعياً لكل موظف' : 'Weekly Resolved by Agent'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={weeklyPerformance} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="omar" fill="#10b981" radius={[4, 4, 0, 0]} name="Omar" />
                    <Bar dataKey="fatima" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Fatima" />
                    <Bar dataKey="khalid" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Khalid" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{isAr ? 'التعليقات حسب التصنيف' : 'Feedback by Category'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>
                      {categoryBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {categoryBreakdown.map(c => (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{c.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{c.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Agent Performance Tab */}
      {activeTab === 'agents' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{isAr ? 'لوحة أداء الموظفين' : 'Agent Performance Leaderboard'}</CardTitle>
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs">
                {isAr ? 'هذا الشهر' : 'This Month'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {agentData
              .sort((a, b) => b.satisfaction - a.satisfaction)
              .map((agent, rank) => (
                <div key={agent.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  {/* Rank + Avatar */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-black',
                      rank === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                      rank === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' :
                      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                    )}>
                      #{rank + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">{formatInitials(agent.name)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{agent.name}</p>
                      <p className="text-xs text-gray-400">{agent.email}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-3 flex-1">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'مُسندة' : 'Assigned'}</p>
                      <p className="font-black text-gray-900 dark:text-white">{agent.assigned}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'تم الحل' : 'Resolved'}</p>
                      <p className="font-black text-emerald-600 dark:text-emerald-400">{agent.resolved}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'معدل الحل' : 'Rate'}</p>
                      <p className="font-black text-gray-900 dark:text-white">
                        {Math.round((agent.resolved / agent.assigned) * 100)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'متوسط الوقت' : 'Avg Time'}</p>
                      <p className="font-black text-gray-900 dark:text-white">{agent.avgTime}h</p>
                    </div>
                  </div>

                  {/* Satisfaction Bar */}
                  <div className="flex-shrink-0 min-w-[140px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'رضا العملاء' : 'Satisfaction'}</span>
                      <span className="text-xs font-black text-gray-900 dark:text-white">{agent.satisfaction}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all',
                          agent.satisfaction >= 95 ? 'bg-emerald-500' :
                          agent.satisfaction >= 90 ? 'bg-blue-500' : 'bg-amber-500'
                        )}
                        style={{ width: `${agent.satisfaction}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-gray-400">{agent.streak} {isAr ? 'يوم متواصل' : 'day streak'}</span>
                    </div>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'اتجاه وقت الحل (ساعات)' : 'Resolution Time Trend (hrs)'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={resolutionTime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="avgHours" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} name={isAr ? 'متوسط الساعات' : 'Avg Hours'} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'التعليقات المُحلّة أسبوعياً' : 'Weekly Resolved Feedback'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weeklyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="omar" fill="#10b981" radius={[4, 4, 0, 0]} name="Omar" stackId="a" />
                  <Bar dataKey="fatima" fill="#3b82f6" radius={[0, 0, 0, 0]} name="Fatima" stackId="a" />
                  <Bar dataKey="khalid" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Khalid" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
