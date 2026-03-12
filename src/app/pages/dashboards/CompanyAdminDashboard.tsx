// NOTE: Company Admin Dashboard with Reports integrated

import React from 'react';
// import { Link } from 'react-router';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { mockFeedback } from '../../data/mockData';
import { Reports } from '../Reports';

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import {
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  Building2,
  Smile
} from 'lucide-react';

import { cn } from '../../components/ui/utils';

const COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280'
};

export function CompanyAdminDashboard() {

  const { t, language } = useLanguage();
  const { user } = useAuth();
  const isAr = language === 'ar';

  // Company feedback
  const companyFeedback = mockFeedback.filter(
    (fb) => fb.companyId === 'company-1'
  );

  const totalCount = companyFeedback.length;
  const openCount = companyFeedback.filter((fb) => fb.status === 'open').length;
  const inProgressCount = companyFeedback.filter((fb) => fb.status === 'inProgress').length;
  const resolvedCount = companyFeedback.filter((fb) => fb.status === 'resolved').length;
  const highPriorityCount = companyFeedback.filter((fb) => fb.priority === 'high').length;

  const sentimentData = [
    { name: 'Positive', value: 485, color: COLORS.positive },
    { name: 'Negative', value: 287, color: COLORS.negative },
    { name: 'Neutral', value: 475, color: COLORS.neutral }
  ];

  const monthlyData = [
    { month: 'Sep', complaints: 320, resolved: 280 },
    { month: 'Oct', complaints: 425, resolved: 390 },
    { month: 'Nov', complaints: 380, resolved: 340 },
    { month: 'Dec', complaints: 510, resolved: 460 },
    { month: 'Jan', complaints: 445, resolved: 400 },
    { month: 'Feb', complaints: 567, resolved: 510 }
  ];

  const kpis = [
    {
      label: 'Total Feedback',
      value: totalCount,
      icon: MessageSquare,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    // {
    //   label: 'Open',
    //   value: openCount,
    //   icon: AlertCircle,
    //   color: 'text-sky-600',
    //   bg: 'bg-sky-50'
    // },
    // {
    //   label: 'In Progress',
    //   value: inProgressCount,
    //   icon: Clock,
    //   color: 'text-amber-600',
    //   bg: 'bg-amber-50'
    // },
    // {
    //   label: 'Resolved',
    //   value: resolvedCount,
    //   icon: CheckCircle,
    //   color: 'text-green-600',
    //   bg: 'bg-green-50'
    // },
    {
      label: 'High Priority',
      value: highPriorityCount,
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      label: 'Average Sentiment',
      value: '6.8',
      icon: Smile,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  return (

    <div className="space-y-6">

      {/* HERO HEADER */}

      <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-8 text-white">

        <div className="flex justify-between items-center flex-wrap gap-4">

          <div>

            <div className="flex items-center gap-2 mb-2">

              <Building2 className="w-5 h-5 text-blue-200" />

              <span className="text-sm text-blue-200">
                Company Admin
              </span>

            </div>

            <h1 className="text-3xl font-black">
              Dashboard
            </h1>

            <p className="text-blue-200 text-sm">
              Manage your company's complaints and performance
            </p>

          </div>

          {/* <div className="flex gap-2">

            <Link to="/app/users">
              <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                <Plus className="w-4 h-4 mr-1" />
                Add Usder
              </Button>
            </Link>

            <Link to="/app/settings">
              <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white">
                <Plug className="w-4 h-4 mr-1" />
                API Settings
              </Button>
            </Link>

          </div> */}

        </div>

      </div>

      {/* KPI CARDS */}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

        {kpis.map((kpi, i) => (

          <Card key={i}>

            <CardContent className="p-4">

              <div className="flex flex-col gap-2">

                <div className="flex justify-between items-start">

                  <p className="text-xs text-gray-500">
                    {kpi.label}
                  </p>

                  <div className={cn("w-8 h-8 flex items-center justify-center rounded-lg", kpi.bg)}>
                    <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                  </div>

                </div>

                <p className="text-2xl font-bold">
                  {kpi.value}
                </p>

              </div>

            </CardContent>

          </Card>

        ))}

      </div>

      {/* CHARTS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* SENTIMENT PIE */}

        <Card>

          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
          </CardHeader>

          <CardContent>

            <ResponsiveContainer width="100%" height={250}>

              <PieChart>

                <Pie
                  data={sentimentData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
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

        {/* LINE CHART */}

        <Card>

          <CardHeader>
            <CardTitle>Complaints Over Time</CardTitle>
          </CardHeader>

          <CardContent>

            <ResponsiveContainer width="100%" height={250}>

              <LineChart data={monthlyData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="complaints"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />

                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                />

              </LineChart>

            </ResponsiveContainer>

          </CardContent>

        </Card>

      </div>

      {/* REPORTS SECTION */}
{/* 
      <Card>

        <CardHeader>

          <CardTitle>
            Reports
          </CardTitle>

        </CardHeader>

        <CardContent>

          <Reports />

        </CardContent>

      </Card> */}

    </div>

  );

}