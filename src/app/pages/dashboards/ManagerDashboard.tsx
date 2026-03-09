// NOTE: This manager dashboard uses MOCK feedback and user data for charts and pending items.
// TODO: Replace `mockUsers`, `mockFeedback`, and static chart series with real team performance endpoints.

import React, { useState } from 'react';
import { Link } from 'react-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { mockFeedback, mockUsers } from '../../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import {
  MessageSquare, TrendingUp, TrendingDown, Clock, AlertCircle,
  ArrowRight, UserCheck, CheckCircle2, BarChart3, Users,
} from 'lucide-react';
import { cn } from '../../components/ui/utils';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../components/ui/select';

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  inProgress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function ManagerDashboard() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [selectedAgent, setSelectedAgent] = useState<Record<string, string>>({});

  const agents = mockUsers.filter(u => u.role === 'agent');

  const statusDistData = [
    { name: t('status.open'), value: 45, color: '#3b82f6' },
    { name: t('status.inProgress'), value: 23, color: '#f59e0b' },
    { name: t('status.resolved'), value: 134, color: '#10b981' },
    { name: t('status.closed'), value: 87, color: '#6b7280' },
  ];

  const agentWorkload = agents.map(agent => ({
    name: agent.name.split(' ')[0],
    assigned: Math.floor(Math.random() * 20) + 5,
    resolved: Math.floor(Math.random() * 18) + 3,
  }));

  const resolutionTrend = [
    { week: 'W1', avgHours: 18 },
    { week: 'W2', avgHours: 14 },
    { week: 'W3', avgHours: 16 },
    { week: 'W4', avgHours: 11 },
    { week: 'W5', avgHours: 9 },
    { week: 'W6', avgHours: 8 },
  ];

  const kpis = [
    {
      label: t('dashboard.teamFeedback'),
      value: '289',
      change: '+8.4%',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      sub: isAr ? 'قيد المعالجة' : 'active total',
    },
    {
      label: t('dashboard.pendingAssignment'),
      value: '17',
      change: '+3',
      trend: 'up',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      sub: isAr ? 'تحتاج تعيين' : 'need agent',
    },
    {
      label: t('dashboard.highPriority'),
      value: '8',
      change: '-2',
      trend: 'down',
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      sub: isAr ? 'عالية الأولوية' : 'urgent items',
    },
    {
      label: t('dashboard.resolvedThisMonth'),
      value: '134',
      change: '+22%',
      trend: 'up',
      icon: CheckCircle2,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      sub: isAr ? 'هذا الشهر' : 'this month',
    },
  ];

  const pendingFeedback = mockFeedback.filter(fb => !fb.assignedTo || fb.status === 'open').slice(0, 5);

  const handleAssign = (feedbackId: string, agentId: string) => {
    setSelectedAgent(prev => ({ ...prev, [feedbackId]: agentId }));
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-1/3 -translate-y-1/3" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-emerald-200" />
              <span className="text-emerald-200 text-sm font-medium">{t('role.manager')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mb-1">{t('dashboard.title')}</h1>
            <p className="text-emerald-200 text-sm">
              {isAr ? 'إدارة فريقك وتوزيع الشكاوى بكفاءة' : 'Manage your team and distribute feedback efficiently'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/app/feedback">
              <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border border-white/20 gap-1.5">
                <MessageSquare className="w-4 h-4" />
                {isAr ? 'الشكاوى' : 'View Feedback'}
              </Button>
            </Link>
            <Link to="/app/reports">
              <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 gap-1.5">
                <BarChart3 className="w-4 h-4" />
                {isAr ? 'التقارير' : 'Reports'}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.label}</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{kpi.value}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {kpi.trend === 'up'
                      ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      : <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    }
                    <span className={cn('text-xs font-semibold', kpi.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                      {kpi.change}
                    </span>
                    <span className="text-xs text-gray-400">{kpi.sub}</span>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('dashboard.statusDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusDistData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>
                  {statusDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {statusDistData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{item.name}</span>
                  <span className="text-xs font-semibold text-gray-900 dark:text-white ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agent Workload */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{t('dashboard.agentWorkload')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={agentWorkload} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="assigned" fill="#10b981" radius={[4, 4, 0, 0]} name={isAr ? 'مُسندة' : 'Assigned'} />
                <Bar dataKey="resolved" fill="#3b82f6" radius={[4, 4, 0, 0]} name={isAr ? 'تم الحل' : 'Resolved'} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resolution Time Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{isAr ? 'متوسط وقت الحل (ساعة)' : 'Avg Resolution Time (hrs)'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={resolutionTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="avgHours" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} name={isAr ? 'وقت الحل' : 'Avg Hours'} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pending Assignment - Manager's Core View */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{isAr ? 'شكاوى تحتاج إسناد' : 'Feedback Pending Assignment'}</CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isAr ? 'انقر على "إسناد" لتوزيع الشكاوى على الموظفين' : 'Assign feedback items to your agents below'}
              </p>
            </div>
            <Link to="/app/feedback">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                {isAr ? 'عرض الكل' : 'View All'}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingFeedback.map((fb) => (
            <div key={fb.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{fb.customerName}</span>
                  <Badge className={cn('text-xs', priorityColors[fb.priority])}>{t(`priority.${fb.priority}`)}</Badge>
                  <Badge className={cn('text-xs', statusColors[fb.status])}>{t(`status.${fb.status}`)}</Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{fb.content}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-gray-400">{fb.category}</span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                  <span className="text-xs text-gray-400">{fb.channel}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Select
                  value={selectedAgent[fb.id] || (fb.assignedTo || '')}
                  onValueChange={(val) => handleAssign(fb.id, val)}
                >
                  <SelectTrigger className="h-8 text-xs w-36">
                    <SelectValue placeholder={isAr ? 'اختر موظفاً' : 'Select agent'} />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id} className="text-xs">
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <UserCheck className="w-3.5 h-3.5" />
                  {isAr ? 'إسناد' : 'Assign'}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
