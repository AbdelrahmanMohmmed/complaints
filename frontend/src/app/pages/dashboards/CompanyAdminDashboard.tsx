import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { request } from '../../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  MessageSquare, Clock, AlertCircle, CheckCircle, Building2, Smile, TrendingDown
} from 'lucide-react';
import { cn } from '../../components/ui/utils';

interface DashboardStats {
  total_feedback: number;
  open_count: number;
  in_progress_count: number;
  resolved_count: number;
  closed_count: number;
  high_priority_count: number;
  positive_count: number;
  negative_count: number;
  neutral_count: number;
  monthly_data: { month: string; complaints: number; resolved: number }[];
  category_data: { name: string; value: number }[];
}

const SENTIMENT_COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280',
};

const BAR_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

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
      Loading dashboard...
    </div>
  );

  if (!stats) return (
    <div className="flex items-center justify-center h-64 text-red-500">
      Failed to load dashboard data.
    </div>
  );

  const sentimentData = [
    { name: 'Positive', value: stats.positive_count, color: SENTIMENT_COLORS.positive },
    { name: 'Negative', value: stats.negative_count, color: SENTIMENT_COLORS.negative },
    { name: 'Neutral',  value: stats.neutral_count,  color: SENTIMENT_COLORS.neutral  },
  ];

  const kpis = [
    { label: 'Total Feedback',  value: stats.total_feedback,    icon: MessageSquare, color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20'   },
    { label: 'Open',            value: stats.open_count,        icon: AlertCircle,   color: 'text-sky-600',    bg: 'bg-sky-50 dark:bg-sky-900/20'     },
    { label: 'In Progress',     value: stats.in_progress_count, icon: Clock,         color: 'text-amber-600',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Resolved',        value: stats.resolved_count,    icon: CheckCircle,   color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'High Priority',   value: stats.high_priority_count, icon: TrendingDown, color: 'text-red-600',  bg: 'bg-red-50 dark:bg-red-900/20'     },
    { label: 'Negative',        value: stats.negative_count,    icon: Smile,         color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20'},
  ];

  return (
    <div className="space-y-6">

      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8 text-white">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-blue-200" />
              <span className="text-sm text-blue-200">Company Admin</span>
            </div>
            <h1 className="text-3xl font-black">Dashboard</h1>
            <p className="text-blue-200 text-sm">
              Manage your company's complaints and performance
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
            <CardTitle>Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={sentimentData} dataKey="value" innerRadius={60} outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                  {sentimentData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Complaints Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.monthly_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="complaints" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* Category Breakdown */}
      {stats.category_data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.category_data} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.category_data.map((_, index) => (
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