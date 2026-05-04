import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { request } from '../../services/api';
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
  Download, FileText, TrendingUp, TrendingDown,
  MessageSquare, CheckCircle, Clock, Smile, Filter,
} from 'lucide-react';
import { cn } from '../components/ui/utils';

interface ReportsData {
  summary: {
    total_feedback: number;
    total_change: string;
    resolution_rate: number;
    resolution_rate_change: string;
    sentiment_pct: number;
    sentiment_change: string;
    positive_count: number;
    negative_count: number;
    neutral_count: number;
  };
  sentiment_trend: { month: string; positive: number; negative: number; neutral: number }[];
  category_data: { name: string; total: number; positive: number; negative: number; neutral: number }[];
  channel_data: { name: string; value: number; color: string }[];
  agent_data: { name: string; assigned: number; resolved: number; avgTime: number; satisfaction: number }[];
  resolution_trend: { week: string; resolved: number; avgTime: number }[];
}

export function Reports() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('sentiment');
  const isAr = language === 'ar';

  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const result = await request<ReportsData>(`/dashboard/reports?date_range=${dateRange}`);
        setData(result);
      } catch (err) {
        console.error('Failed to fetch reports', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [dateRange]);

  const exportCSV = () => {
    if (!data) return;
    const rows = data.sentiment_trend.map(r =>
      [r.month, r.positive, r.negative, r.neutral].join(',')
    );
    const csv = ['Month,Positive,Negative,Neutral', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'sentiment', label: isAr ? 'تحليل المشاعر' : 'Sentiment Analysis' },
    { id: 'category',  label: isAr ? 'التصنيفات' : 'Categories' },
    { id: 'channel',   label: isAr ? 'القنوات' : 'Channels' },
  ];

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      {isAr ? 'جاري التحميل...' : 'Loading reports...'}
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center h-64 text-red-500">
      {isAr ? 'فشل تحميل البيانات' : 'Failed to load report data.'}
    </div>
  );

  const { summary } = data;
  const totalSentiment = summary.positive_count + summary.negative_count + summary.neutral_count || 1;

  const summaryKpis = [
    {
      label: isAr ? 'إجمالي التعليقات' : 'Total Feedback',
      value: summary.total_feedback.toLocaleString(),
      change: summary.total_change,
      trend: summary.total_change.startsWith('+') ? 'up' : 'down',
      icon: MessageSquare,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: isAr ? 'معدل الحل' : 'Resolution Rate',
      value: `${summary.resolution_rate}%`,
      change: summary.resolution_rate_change,
      trend: 'up',
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      label: isAr ? 'نسبة الإيجابية' : 'Positive Rate',
      value: `${summary.sentiment_pct}%`,
      change: summary.sentiment_change,
      trend: summary.sentiment_change.startsWith('+') ? 'up' : 'down',
      icon: Smile,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
    },
    {
      label: isAr ? 'تعليقات سلبية' : 'Negative Feedback',
      value: summary.negative_count.toLocaleString(),
      change: '',
      trend: 'down',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {t('reports.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {isAr ? 'تحليلات شاملة وتقارير مفصّلة عن أداء التعليقات' : 'Comprehensive analytics and detailed performance insights'}
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
          <Button className="gap-2 h-9 bg-blue-600 hover:bg-blue-700 text-white" onClick={exportCSV}>
            <Download className="w-4 h-4" />
            {isAr ? 'تصدير CSV' : 'Export CSV'}
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
                  {kpi.change && (
                    <div className="flex items-center gap-1.5 mt-2">
                      {kpi.trend === 'up'
                        ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        : <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                      }
                      <span className={cn('text-xs font-semibold', kpi.trend === 'up' ? 'text-emerald-600' : 'text-red-500')}>
                        {kpi.change}
                      </span>
                      <span className="text-xs text-gray-400">{isAr ? 'الفترة السابقة' : 'vs last period'}</span>
                    </div>
                  )}
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
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Sentiment Tab */}
      {activeTab === 'sentiment' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'اتجاه المشاعر الشهري' : 'Monthly Sentiment Trend'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.sentiment_trend}>
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
                  <Tooltip />
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
                  <Pie
                    data={[
                      { name: t('sentiment.positive'), value: summary.positive_count, color: '#10b981' },
                      { name: t('sentiment.negative'), value: summary.negative_count, color: '#ef4444' },
                      { name: t('sentiment.neutral'),  value: summary.neutral_count,  color: '#6b7280' },
                    ]}
                    cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}
                  >
                    {['#10b981','#ef4444','#6b7280'].map((color, i) => <Cell key={i} fill={color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {[
                  { label: t('sentiment.positive'), value: summary.positive_count, color: '#10b981' },
                  { label: t('sentiment.neutral'),  value: summary.neutral_count,  color: '#6b7280' },
                  { label: t('sentiment.negative'), value: summary.negative_count, color: '#ef4444' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs text-gray-400">{item.value}</span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        {Math.round(item.value / totalSentiment * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Tab */}
      {activeTab === 'category' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'توزيع التعليقات بالتصنيف' : 'Feedback by Category'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.category_data} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="positive" fill="#10b981" name={t('sentiment.positive')} stackId="a" />
                  <Bar dataKey="negative" fill="#ef4444" name={t('sentiment.negative')} stackId="a" />
                  <Bar dataKey="neutral"  fill="#6b7280" name={t('sentiment.neutral')}  stackId="a" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'ملخص التصنيفات' : 'Category Summary'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {data.category_data.map(cat => (
                  <div key={cat.name} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</span>
                      <Badge variant="outline" className="text-xs">{cat.total} {isAr ? 'تعليقات' : 'items'}</Badge>
                    </div>
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                      <div className="bg-green-500" style={{ width: `${cat.total ? (cat.positive / cat.total) * 100 : 0}%` }} />
                      <div className="bg-red-500"   style={{ width: `${cat.total ? (cat.negative / cat.total) * 100 : 0}%` }} />
                      <div className="bg-gray-400"  style={{ width: `${cat.total ? (cat.neutral  / cat.total) * 100 : 0}%` }} />
                    </div>
                    <div className="flex justify-between mt-1 text-xs">
                      <span className="text-green-600">{cat.total ? Math.round((cat.positive / cat.total) * 100) : 0}% +</span>
                      <span className="text-red-600">{cat.total ? Math.round((cat.negative / cat.total) * 100) : 0}% -</span>
                    </div>
                  </div>
                ))}
                {data.category_data.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8">No category data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Channel Tab */}
      {activeTab === 'channel' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'توزيع قنوات التلقي' : 'Feedback Channels Distribution'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.channel_data}
                    cx="50%" cy="50%" outerRadius={100} dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.channel_data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{isAr ? 'تفاصيل القنوات' : 'Channel Details'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.channel_data.length === 0
                ? <p className="text-center text-gray-400 text-sm py-8">No channel data available</p>
                : (() => {
                    const total = data.channel_data.reduce((s, c) => s + c.value, 0) || 1;
                    return data.channel_data.map(channel => (
                      <div key={channel.name}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.color }} />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{channel.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{channel.value}</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {Math.round((channel.value / total) * 100)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${(channel.value / total) * 100}%`, backgroundColor: channel.color }} />
                        </div>
                      </div>
                    ));
                  })()
              }
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export CTA */}
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
                  {isAr ? 'قم بتصدير تقرير شامل لجميع البيانات المعروضة' : 'Download a comprehensive report with all current data'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 text-sm" size="sm" onClick={exportCSV}>
                <Download className="w-4 h-4" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}