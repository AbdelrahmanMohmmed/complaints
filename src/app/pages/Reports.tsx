import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import {
  Download, FileText, TrendingUp, TrendingDown, BarChart3,
  MessageSquare, CheckCircle, Clock, Smile, Filter,
} from 'lucide-react';
import { cn } from '../components/ui/utils';

const COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280',
  email: '#3b82f6',
  whatsapp: '#22c55e',
  phone: '#f59e0b',
  web: '#8b5cf6',
};

export function Reports() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('sentiment');
  const isAr = language === 'ar';

  const sentimentTrend = [
    { month: 'Sep', positive: 180, negative: 95, neutral: 145 },
    { month: 'Oct', positive: 210, negative: 112, neutral: 163 },
    { month: 'Nov', positive: 195, negative: 98, neutral: 147 },
    { month: 'Dec', positive: 265, negative: 130, neutral: 195 },
    { month: 'Jan', positive: 240, negative: 115, neutral: 180 },
    { month: 'Feb', positive: 285, negative: 108, neutral: 174 },
  ];

  const categoryData = [
    { name: 'Service Quality', total: 324, positive: 180, negative: 90, neutral: 54 },
    { name: 'Product Quality', total: 456, positive: 220, negative: 150, neutral: 86 },
    { name: 'Customer Support', total: 287, positive: 120, negative: 110, neutral: 57 },
    { name: 'Delivery', total: 180, positive: 95, negative: 45, neutral: 40 },
  ];

  const channelData = [
    { name: isAr ? 'واتساب' : 'WhatsApp', value: 384, color: COLORS.whatsapp },
    { name: isAr ? 'البريد الإلكتروني' : 'Email', value: 512, color: COLORS.email },
    { name: isAr ? 'الهاتف' : 'Phone', value: 213, color: COLORS.phone },
    { name: isAr ? 'النموذج الإلكتروني' : 'Web Form', value: 138, color: COLORS.web },
  ];

  const agentReportData = [
    { name: 'Omar Hussein', assigned: 45, resolved: 42, avgTime: 4.2, satisfaction: 94 },
    { name: 'Fatima Ahmed', assigned: 38, resolved: 35, avgTime: 5.1, satisfaction: 89 },
    { name: 'Khalid Nasser', assigned: 52, resolved: 48, avgTime: 3.8, satisfaction: 97 },
    { name: 'Mona Saad', assigned: 29, resolved: 27, avgTime: 6.2, satisfaction: 86 },
  ];

  const resolutionData = [
    { week: 'W1', resolved: 45, avgTime: 18 },
    { week: 'W2', resolved: 62, avgTime: 14 },
    { week: 'W3', resolved: 58, avgTime: 16 },
    { week: 'W4', resolved: 75, avgTime: 11 },
    { week: 'W5', resolved: 83, avgTime: 9 },
    { week: 'W6', resolved: 91, avgTime: 7 },
  ];

  const summaryKpis = [
    { label: isAr ? 'إجمالي الشكاوى' : 'Total Feedback', value: '1,247', change: '+12.5%', trend: 'up', icon: MessageSquare, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: isAr ? 'معدل الحل' : 'Resolution Rate', value: '91.2%', change: '+3.1%', trend: 'up', icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: isAr ? 'متوسط وقت الحل' : 'Avg Resolution Time', value: '7.4h', change: '-28%', trend: 'down_good', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: isAr ? 'رضا العملاء' : 'Customer Satisfaction', value: '91.5%', change: '+4.2%', trend: 'up', icon: Smile, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  ];

  const tabs = [
    { id: 'sentiment', label: isAr ? 'تحليل المشاعر' : 'Sentiment Analysis' },
    { id: 'category', label: isAr ? 'التصنيفات' : 'Categories' },
    { id: 'channel', label: isAr ? 'القنوات' : 'Channels' },
    ...(user?.role !== 'manager' ? [] : [{ id: 'agents', label: isAr ? 'أداء الموظفين' : 'Agent Performance' }]),
    { id: 'agents', label: isAr ? 'أداء الموظفين' : 'Agent Performance' },
    { id: 'resolution', label: isAr ? 'معدل الحل' : 'Resolution Trends' },
  ];

  const uniqueTabs = tabs.filter((tab, index, self) => self.findIndex(t => t.id === tab.id) === index);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {t('reports.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {isAr ? 'تحليلات شاملة وتقارير مفصّلة عن أداء الشكاوى' : 'Comprehensive analytics and detailed performance insights'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[160px] h-9">
              <Filter className="w-3.5 h-3.5 mr-1 text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{isAr ? 'اليوم' : 'Today'}</SelectItem>
              <SelectItem value="7days">{isAr ? 'آخر 7 أيام' : 'Last 7 days'}</SelectItem>
              <SelectItem value="30days">{isAr ? 'آخر 30 يوم' : 'Last 30 days'}</SelectItem>
              <SelectItem value="90days">{isAr ? 'آخر 90 يوم' : 'Last 90 days'}</SelectItem>
              <SelectItem value="year">{isAr ? 'هذا العام' : 'This year'}</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2 h-9 bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="w-4 h-4" />
            {isAr ? 'تصدير PDF' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryKpis.map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{kpi.label}</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{kpi.value}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {kpi.trend === 'up' || kpi.trend === 'down_good'
                      ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      : <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                    }
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {kpi.change}
                    </span>
                    <span className="text-xs text-gray-400">{isAr ? 'الشهر الماضي' : 'vs last period'}</span>
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
          {uniqueTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'sentiment' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'اتجاه المشاعر الشهري' : 'Monthly Sentiment Trend'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={sentimentTrend}>
                  <defs>
                    <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="positive" stroke="#10b981" fill="url(#posGrad)" strokeWidth={2} name={t('sentiment.positive')} />
                  <Area type="monotone" dataKey="negative" stroke="#ef4444" fill="url(#negGrad)" strokeWidth={2} name={t('sentiment.negative')} />
                  <Line type="monotone" dataKey="neutral" stroke="#6b7280" strokeWidth={2} strokeDasharray="5 5" name={t('sentiment.neutral')} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'توزيع المشاعر' : 'Sentiment Breakdown'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={[
                    { name: t('sentiment.positive'), value: 485, color: '#10b981' },
                    { name: t('sentiment.negative'), value: 287, color: '#ef4444' },
                    { name: t('sentiment.neutral'), value: 475, color: '#6b7280' },
                  ]} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {[{ color: '#10b981' }, { color: '#ef4444' }, { color: '#6b7280' }].map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {[
                  { label: t('sentiment.positive'), value: 485, pct: '38.9%', color: '#10b981' },
                  { label: t('sentiment.neutral'), value: 475, pct: '38.1%', color: '#6b7280' },
                  { label: t('sentiment.negative'), value: 287, pct: '23.0%', color: '#ef4444' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs text-gray-400">{item.value}</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{item.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'category' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'توزيع الشكاوى بالتصنيف' : 'Feedback by Category'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="positive" fill="#10b981" radius={[0, 4, 4, 0]} name={t('sentiment.positive')} stackId="a" />
                  <Bar dataKey="negative" fill="#ef4444" radius={[0, 0, 0, 0]} name={t('sentiment.negative')} stackId="a" />
                  <Bar dataKey="neutral" fill="#6b7280" radius={[0, 4, 4, 0]} name={t('sentiment.neutral')} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'ملخص التصنيفات' : 'Category Summary'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</span>
                      <Badge variant="outline" className="text-xs">{cat.total} {isAr ? 'شكوى' : 'items'}</Badge>
                    </div>
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-500" style={{ width: `${(cat.positive / cat.total) * 100}%` }} />
                      <div className="bg-red-500" style={{ width: `${(cat.negative / cat.total) * 100}%` }} />
                      <div className="bg-gray-400" style={{ width: `${(cat.neutral / cat.total) * 100}%` }} />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="text-green-600 dark:text-green-400">{Math.round((cat.positive / cat.total) * 100)}% +</span>
                      <span className="text-red-600 dark:text-red-400">{Math.round((cat.negative / cat.total) * 100)}% -</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'channel' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'توزيع قنوات التلقي' : 'Feedback Channels Distribution'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={channelData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {channelData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'تفاصيل القنوات' : 'Channel Details'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {channelData.map((channel) => (
                <div key={channel.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.color }} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{channel.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{channel.value}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {Math.round((channel.value / channelData.reduce((sum, c) => sum + c.value, 0)) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(channel.value / channelData.reduce((sum, c) => sum + c.value, 0)) * 100}%`, backgroundColor: channel.color }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'agents' && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{isAr ? 'تقرير أداء الموظفين' : 'Agent Performance Report'}</CardTitle>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" />
                {isAr ? 'تصدير' : 'Export'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {[
                      isAr ? 'الموظف' : 'Agent',
                      isAr ? 'مُسندة' : 'Assigned',
                      isAr ? 'تم الحل' : 'Resolved',
                      isAr ? 'معدل الحل' : 'Rate',
                      isAr ? 'متوسط الوقت' : 'Avg Time',
                      isAr ? 'رضا العملاء' : 'Satisfaction',
                    ].map((h) => (
                      <th key={h} className="text-left pb-3 pr-4 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {agentReportData.map((agent) => (
                    <tr key={agent.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{agent.name.split(' ').map(n => n[0]).join('')}</span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{agent.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{agent.assigned}</td>
                      <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{agent.resolved}</td>
                      <td className="py-3 pr-4">
                        <span className={cn('text-xs font-semibold px-2 py-1 rounded-full',
                          (agent.resolved / agent.assigned) > 0.9
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        )}>
                          {Math.round((agent.resolved / agent.assigned) * 100)}%
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-700 dark:text-gray-300">{agent.avgTime}h</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden w-16">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${agent.satisfaction}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">{agent.satisfaction}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'resolution' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'الشكاوى المُحلّة أسبوعياً' : 'Weekly Resolved Feedback'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={resolutionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="resolved" fill="#3b82f6" radius={[6, 6, 0, 0]} name={isAr ? 'تم الحل' : 'Resolved'} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'متوسط وقت الحل (ساعات)' : 'Average Resolution Time (hours)'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={resolutionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="avgTime" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} name={isAr ? 'متوسط الساعات' : 'Avg Hours'} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Generate Report CTA */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{isAr ? 'تصدير تقرير مفصّل' : 'Export Detailed Report'}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  {isAr ? 'قم بتصدير تقرير PDF شامل لجميع البيانات المعروضة' : 'Generate a comprehensive PDF report with all current data and visualizations'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 text-sm" size="sm">
                <Download className="w-4 h-4" />
                CSV
              </Button>
              <Button className="gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                <FileText className="w-4 h-4" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
