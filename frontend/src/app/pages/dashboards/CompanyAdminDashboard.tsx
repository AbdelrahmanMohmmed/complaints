import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { request } from '../../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  MessageSquare, Building2, Smile, TrendingDown
} from 'lucide-react';
import { cn } from '../../components/ui/utils';

interface DashboardStats {
  total_feedback: number;
  closed_count: number;
  high_priority_count: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  frustrated_count: number;
  neutral_emotion_count: number;
  disgusted_count: number;
  satisfied_count: number;
  monthly_data: { month: string; complaints: number; resolved: number }[];
  category_data: { name: string; value: number; problem_type_id?: number | null }[];
}

const SENTIMENT_COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280',
};

const BAR_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const RADIAN = Math.PI / 180;

type SentimentLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  name?: string;
  value?: number | string;
  percent?: number;
};

const renderSentimentLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  value,
  percent,
}: SentimentLabelProps) => {
  if (
    percent === undefined ||
    percent < 0.03 ||
    cx === undefined ||
    cy === undefined ||
    midAngle === undefined ||
    outerRadius === undefined
  ) {
    return null;
  }

  const LABEL_OFFSET = 40;
  const x = cx + (outerRadius + LABEL_OFFSET) * Math.cos(-midAngle * RADIAN);
  const y = cy + (outerRadius + LABEL_OFFSET) * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={14}
      fill="currentColor"
    >
      {`${name}: ${value}`}
    </text>
  );
};

export function CompanyAdminDashboard() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const isAr = language === 'ar';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await request<DashboardStats>('/dashboard/stats');
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">
      {isAr ? 'جارٍ تحميل لوحة التحكم...' : 'Loading dashboard...'}
    </div>
  );

  if (!stats) return (
    <div className="flex items-center justify-center h-64 text-red-500">
      {isAr ? 'فشل تحميل بيانات لوحة التحكم.' : 'Failed to load dashboard data.'}
    </div>
  );

  const sentimentData = [
    { name: t('sentiment.positive'), value: stats.positive_count, color: SENTIMENT_COLORS.positive },
    { name: t('sentiment.negative'), value: stats.negative_count, color: SENTIMENT_COLORS.negative },
    { name: t('sentiment.neutral'),  value: stats.neutral_count,  color: SENTIMENT_COLORS.neutral  },
  ];

  const categoryData = stats.category_data.map(item => ({
    ...item,
    name: item.problem_type_id !== undefined && item.problem_type_id !== null
      ? t(`problemType.${item.problem_type_id}`)
      : item.name,
  }));

  const totalEmotions = stats.frustrated_count + stats.disgusted_count + stats.neutral_emotion_count + stats.satisfied_count || 1;
  const emotionData = [
    { name: t('emotion.0'), value: stats.frustrated_count },
    { name: t('emotion.2'), value: stats.disgusted_count },
    { name: t('emotion.1'), value: stats.neutral_emotion_count },
    { name: t('emotion.3'), value: stats.satisfied_count },
  ];
  const frustrationRate = Math.round((stats.frustrated_count / totalEmotions) * 100);
  const disgustedRate = Math.round((stats.disgusted_count / totalEmotions) * 100);

  const kpis = [
    { label: t('dashboard.totalFeedback'), value: stats.total_feedback, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: t('dashboard.highPriority'), value: stats.high_priority_count, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: t('sentiment.negative'), value: stats.negative_count, icon: Smile, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: t('dashboard.frustrationRate'), value: `${frustrationRate}%`, icon: Smile, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: t('dashboard.disgustedRate'), value: `${disgustedRate}%`, icon: Smile, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ];

  return (
    <div className="space-y-6">

      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8 text-white">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-blue-200" />
              <span className="text-sm text-blue-200">{t('role.companyAdmin')}</span>
            </div>
            <h1 className="text-3xl font-black">{t('dashboard.title')}</h1>
            <p className="text-blue-200 text-sm">
              {isAr
                ? 'إدارة تعليقات شركتك وأداء فريقك'
                : "Manage your company's feedback and performance"}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.label}</p>
                  <div className={cn('w-8 h-8 flex items-center justify-center rounded-lg', kpi.bg)}>
                    <kpi.icon className={cn('w-4 h-4', kpi.color)} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Sentiment Pie */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.sentimentDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie 
                  data={sentimentData} 
                  dataKey="value" 
                  innerRadius={60} 
                  outerRadius={90} 
                  label={renderSentimentLabel}
                  labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Emotion Breakdown (Vertical Bar) */}
<Card>
  <CardHeader>
    <CardTitle>{t('dashboard.emotionBreakdown')}</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={emotionData} 
        margin={{ top: 10, right: 20, left: isAr ? 10 : 10, bottom: isAr ? 10 : 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={isAr ? -35 : -35}
          textAnchor="end"
          height={isAr ? 60 : 60}
          interval={0}
          tick={{ 
            fontSize: 12,
            dy: isAr ? 12 : 5
          }}
        />
        <YAxis 
          tickMargin={8}
          tick={{ 
            fontSize: 12,
            dx: isAr ? -15 : 0,
            textAnchor: 'end'
          }}
          axisLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
          tickLine={{ stroke: '#9ca3af' }}
        />
        <Tooltip />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#f59e0b" />
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>

      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.categoryDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={categoryData} 
                margin={{ top: 5, right: 20, left: -5, bottom: isAr ? 80 : 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={isAr ? -35 : -35} 
                  textAnchor={isAr ? "start" : "end"}
                  height={isAr ? 70 : 70}
                  interval={0} 
                  tick={{ fontSize: isAr ? 12 : 12 }} 
                />
                <YAxis tickMargin={isAr ? 12 : 12} width={isAr ? 44 : 44} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

    </div>
  );
}