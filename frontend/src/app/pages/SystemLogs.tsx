// we cab remove this page
// NOTE: This page currently uses MOCK log data for demo and layout purposes.
// TODO: Replace `mockLogs` with real `/api/v1/logs` data from the FastAPI backend.

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  ScrollText, Search, Download, CheckCircle, AlertTriangle,
  Info, XCircle, Building2, Users, Globe2, Shield, RefreshCw,
} from 'lucide-react';
import { cn } from '../components/ui/utils';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  category: 'company' | 'user' | 'system' | 'security';
  actor: string;
  action: string;
  target?: string;
  ip?: string;
}

const mockLogs: LogEntry[] = [
  { id: 'log-1', timestamp: '2026-03-02T09:45:00Z', level: 'success', category: 'company', actor: 'System', action: 'Company "LogiTech Inc." onboarded successfully', target: 'LogiTech Inc.', ip: '192.168.1.1' },
  { id: 'log-2', timestamp: '2026-03-02T08:30:00Z', level: 'warning', category: 'company', actor: 'Sara Hassan', action: 'Subscription suspended for Retail World', target: 'Retail World', ip: '10.0.0.5' },
  { id: 'log-3', timestamp: '2026-03-02T07:15:00Z', level: 'info', category: 'user', actor: 'Sara Hassan', action: 'New user added to TechCorp Solutions', target: 'omar@company.com', ip: '10.0.0.5' },
  { id: 'log-4', timestamp: '2026-03-01T22:10:00Z', level: 'error', category: 'system', actor: 'System', action: 'Webhook delivery failed for Healthcare Plus', target: 'int-webhook-4', ip: '—' },
  { id: 'log-5', timestamp: '2026-03-01T18:55:00Z', level: 'info', category: 'security', actor: 'Sara Hassan', action: 'Admin login from new IP address', target: 'superadmin@ara2kom.ai', ip: '185.220.101.10' },
  { id: 'log-6', timestamp: '2026-03-01T16:30:00Z', level: 'success', category: 'system', actor: 'System', action: 'Daily backup completed successfully', ip: '—' },
  { id: 'log-7', timestamp: '2026-03-01T14:00:00Z', level: 'info', category: 'company', actor: 'Sara Hassan', action: 'Domain "Healthcare" configuration updated', target: 'domain-2', ip: '10.0.0.5' },
  { id: 'log-8', timestamp: '2026-03-01T11:45:00Z', level: 'warning', category: 'system', actor: 'System', action: 'High API usage detected for TechCorp Solutions', target: 'company-1', ip: '—' },
  { id: 'log-9', timestamp: '2026-03-01T09:20:00Z', level: 'success', category: 'user', actor: 'Sara Hassan', action: 'User role updated: Manager → Company Admin', target: 'layla@company.com', ip: '10.0.0.5' },
  { id: 'log-10', timestamp: '2026-02-28T21:00:00Z', level: 'error', category: 'security', actor: 'System', action: 'Multiple failed login attempts blocked', target: 'unknown@test.com', ip: '45.33.32.156' },
  { id: 'log-11', timestamp: '2026-02-28T15:30:00Z', level: 'info', category: 'company', actor: 'Sara Hassan', action: 'FinanceHub plan upgraded to Enterprise', target: 'FinanceHub', ip: '10.0.0.5' },
  { id: 'log-12', timestamp: '2026-02-28T12:10:00Z', level: 'success', category: 'system', actor: 'System', action: 'AI model retrained with new feedback dataset', ip: '—' },
  { id: 'log-13', timestamp: '2026-02-27T10:00:00Z', level: 'info', category: 'user', actor: 'Sara Hassan', action: 'Bulk user import completed (15 users)', target: 'Healthcare Plus', ip: '10.0.0.5' },
  { id: 'log-14', timestamp: '2026-02-27T08:45:00Z', level: 'warning', category: 'security', actor: 'System', action: 'API rate limit exceeded by Retail World', target: 'company-3', ip: '—' },
];

const levelConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; badge: string; row: string }> = {
  info: { icon: Info, badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', row: '' },
  success: { icon: CheckCircle, badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', row: '' },
  warning: { icon: AlertTriangle, badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', row: 'bg-amber-50/40 dark:bg-amber-900/5' },
  error: { icon: XCircle, badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', row: 'bg-red-50/40 dark:bg-red-900/5' },
};

const categoryIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  company: Building2,
  user: Users,
  system: Globe2,
  security: Shield,
};

export function SystemLogs() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = mockLogs.filter(log => {
    const matchSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.target || '').toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'all' || log.level === levelFilter;
    const matchCat = categoryFilter === 'all' || log.category === categoryFilter;
    return matchSearch && matchLevel && matchCat;
  });

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleString(isAr ? 'ar-SA' : 'en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const counts = {
    total: mockLogs.length,
    errors: mockLogs.filter(l => l.level === 'error').length,
    warnings: mockLogs.filter(l => l.level === 'warning').length,
    success: mockLogs.filter(l => l.level === 'success').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {isAr ? 'سجلات النظام' : 'System Logs'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {isAr ? 'تتبع جميع الأنشطة والأحداث على مستوى النظام' : 'Track all system-level events, security alerts, and activity'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {isAr ? 'تحديث' : 'Refresh'}
          </Button>
          <Button size="sm" className="gap-2 bg-violet-600 hover:bg-violet-700 text-white">
            <Download className="w-4 h-4" />
            {isAr ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: isAr ? 'إجمالي السجلات' : 'Total Logs', value: counts.total, color: 'text-gray-900 dark:text-white', bg: 'bg-gray-50 dark:bg-gray-800', icon: ScrollText },
          { label: isAr ? 'الأخطاء' : 'Errors', value: counts.errors, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', icon: XCircle },
          { label: isAr ? 'التحذيرات' : 'Warnings', value: counts.warnings, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: AlertTriangle },
          { label: isAr ? 'ناجح' : 'Success', value: counts.success, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle },
        ].map((item, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
                  <p className={cn('text-3xl font-black mt-1', item.color)}>{item.value}</p>
                </div>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.bg)}>
                  <item.icon className={cn('w-5 h-5', item.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={isAr ? 'بحث في السجلات...' : 'Search logs...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder={isAr ? 'المستوى' : 'Level'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? 'الكل' : 'All Levels'}</SelectItem>
              <SelectItem value="info">{isAr ? 'معلومات' : 'Info'}</SelectItem>
              <SelectItem value="success">{isAr ? 'ناجح' : 'Success'}</SelectItem>
              <SelectItem value="warning">{isAr ? 'تحذير' : 'Warning'}</SelectItem>
              <SelectItem value="error">{isAr ? 'خطأ' : 'Error'}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder={isAr ? 'الفئة' : 'Category'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? 'الكل' : 'All Categories'}</SelectItem>
              <SelectItem value="company">{isAr ? 'شركة' : 'Company'}</SelectItem>
              <SelectItem value="user">{isAr ? 'مستخدم' : 'User'}</SelectItem>
              <SelectItem value="system">{isAr ? 'نظام' : 'System'}</SelectItem>
              <SelectItem value="security">{isAr ? 'أمان' : 'Security'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{isAr ? 'سجل الأحداث' : 'Event Log'}</CardTitle>
            <span className="text-xs text-gray-400">{filtered.length} {isAr ? 'سجل' : 'entries'}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                  {[
                    isAr ? 'الوقت' : 'Timestamp',
                    isAr ? 'المستوى' : 'Level',
                    isAr ? 'الفئة' : 'Category',
                    isAr ? 'المنفذ' : 'Actor',
                    isAr ? 'الحدث' : 'Action',
                    isAr ? 'الهدف' : 'Target',
                    'IP',
                  ].map((h, idx) => (
                    <th key={idx} className={cn(
                      'text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide',
                      idx >= 5 ? 'hidden xl:table-cell' : idx >= 3 ? 'hidden md:table-cell' : ''
                    )}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => {
                  const cfg = levelConfig[log.level];
                  const LevelIcon = cfg.icon;
                  const CatIcon = categoryIcon[log.category];
                  return (
                    <tr key={log.id} className={cn('border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors', cfg.row)}>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{formatDate(log.timestamp)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={cn('text-xs gap-1', cfg.badge)}>
                          <LevelIcon className="w-3 h-3" />
                          <span className="capitalize">{log.level}</span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <CatIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs capitalize text-gray-600 dark:text-gray-400">{log.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{log.actor}</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-sm text-gray-900 dark:text-white">{log.action}</span>
                      </td>
                      <td className="py-3 px-4 hidden xl:table-cell">
                        {log.target && <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{log.target}</span>}
                      </td>
                      <td className="py-3 px-4 hidden xl:table-cell">
                        <span className="text-xs text-gray-400 font-mono">{log.ip || '—'}</span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p>{isAr ? 'لا توجد سجلات مطابقة' : 'No matching log entries'}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
