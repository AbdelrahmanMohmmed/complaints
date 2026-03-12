// NOTE: This page currently reads feedback and user data from MOCK sources (`mockData.ts`).
// TODO: Replace `mockFeedback` and `mockUsers` with real `/api/v1/complaints` and `/api/v1/users` API calls.

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
<<<<<<< HEAD:frontend/src/app/pages/FeedbackList.tsx
import { useEffect, useState as _ } from 'react';
import { request } from '../../services/api';
=======
import { mockFeedback, mockUsers, Feedback, mockCategories } from '../data/mockData';
>>>>>>> origin/frontend:src/app/pages/FeedbackList.tsx
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '../components/ui/dialog';
import { Search, Download, UserCheck, AlertTriangle, Building2 } from 'lucide-react';
import { cn } from '../components/ui/utils';
interface BackendFeedback {
  feedback_id: number;
  company_id: number;
  api_id: number | null; 
  category_id: number | null;
  customer_name: string | null;
  feedback_context: string | null;
  status: string;
  sentiment: string | null;
  emotion: string | null;
  priority: string | null;
  created_at: string;
}
const sentimentColors: Record<string, string> = {
  positive: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  negative: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
};

const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  inProgress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function FeedbackList() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAr = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
<<<<<<< HEAD:frontend/src/app/pages/FeedbackList.tsx
const [feedbackList, setFeedbackList] = useState<BackendFeedback[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [feedbackStatuses, setFeedbackStatuses] = useState<Record<number, string>>({});
const [feedbackPriorities, setFeedbackPriorities] = useState<Record<number, string>>({});
const [assignDialogOpen, setAssignDialogOpen] = useState(false);
const [selectedFeedback, setSelectedFeedback] = useState<BackendFeedback | null>(null);

=======
  const [feedbackStatuses, setFeedbackStatuses] = useState<
    Record<string, Feedback['status']>
  >({});
  const [feedbackPriorities, setFeedbackPriorities] = useState<
    Record<string, Feedback['priority']>
  >({});
  const [feedbackCategories, setFeedbackCategories] = useState<
    Record<string, string>
  >({});

  const [feedbackSentiments, setFeedbackSentiments] = useState<
    Record<string, Feedback['sentiment']>
  >({});

  const [feedbackEmotions, setFeedbackEmotions] = useState<
    Record<string, Feedback['emotion']>
  >({});
  const [assignmentMap, setAssignmentMap] = useState<Record<string, string>>({});
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
>>>>>>> origin/frontend:src/app/pages/FeedbackList.tsx
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Agents are redirected to their own page
  if (user?.role === 'agent') {
    return <Navigate to="/app/my-feedback" replace />;
  }

const agents: any[] = []; // TODO: fetch from /users/ when needed
  const isManager = user?.role === 'manager';
  const isSuperAdmin = user?.role === 'superAdmin';
  const isCompanyAdmin = user?.role === 'companyAdmin';
const [fetchError, setFetchError] = useState('');

<<<<<<< HEAD:frontend/src/app/pages/FeedbackList.tsx
useEffect(() => {
  const fetchFeedback = async () => {
    try {
      const data = await request<BackendFeedback[]>('/feedback/');
      console.log('Fetched feedback:', data); // ← add this temporarily
      setFeedbackList(data);
      setFeedbackStatuses(Object.fromEntries(data.map(fb => [fb.feedback_id, fb.status || 'open'])));
      setFeedbackPriorities(Object.fromEntries(data.map(fb => [fb.feedback_id, fb.priority || 'low'])));
    } catch (err: any) {
      console.error('Failed to fetch feedback', err);
      setFetchError(err?.message || 'Failed to load feedback');
    } finally {
      setIsLoading(false);
    }
  };
  fetchFeedback();
}, []);
const filteredFeedback = feedbackList.filter((fb) => {
  const matchesSearch =
    (fb.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (fb.feedback_context || '').toLowerCase().includes(searchQuery.toLowerCase());
  const currentStatus = feedbackStatuses[fb.feedback_id] || fb.status;
  const currentPriority = feedbackPriorities[fb.feedback_id] || fb.priority || 'low';
  const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
  const matchesSentiment = sentimentFilter === 'all' || fb.sentiment === sentimentFilter;
  const matchesPriority = priorityFilter === 'all' || currentPriority === priorityFilter;
  return matchesSearch && matchesStatus && matchesSentiment && matchesPriority;
});
=======
  const feedbackList: Feedback[] = mockFeedback.map((fb) => ({
    ...fb,
    priority: feedbackPriorities[fb.id] || fb.priority,
    category: feedbackCategories[fb.id] || fb.category,
    sentiment: feedbackSentiments[fb.id] || fb.sentiment,
    emotion: feedbackEmotions[fb.id] || fb.emotion,
    assignedTo: assignmentMap[fb.id] || fb.assignedTo,
  }));

  const filteredFeedback = feedbackList.filter((fb) => {
    const matchesSearch =
      fb.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fb.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fb.status === statusFilter;
    const matchesSentiment = sentimentFilter === 'all' || fb.sentiment === sentimentFilter;
    const matchesPriority = priorityFilter === 'all' || fb.priority === priorityFilter;
    const matchesCompany = companyFilter === 'all' || fb.companyId === companyFilter;
    return matchesSearch && matchesStatus && matchesSentiment && matchesPriority && matchesCompany;
  });
>>>>>>> origin/frontend:src/app/pages/FeedbackList.tsx

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

<<<<<<< HEAD:frontend/src/app/pages/FeedbackList.tsx
=======
  const getAgentName = (agentId?: string) => {
    if (!agentId) return isAr ? 'غير مُسند' : 'Unassigned';
    const agent = mockUsers.find(u => u.id === agentId);
    return agent ? `${agent.firstName} ${agent.lastName}` : agentId;
  };
>>>>>>> origin/frontend:src/app/pages/FeedbackList.tsx


const handleAssignConfirm = () => {
  if (selectedFeedback && selectedAgentId) {
    setFeedbackStatuses(prev => ({ ...prev, [selectedFeedback.feedback_id]: 'inProgress' }));
  }
  setAssignDialogOpen(false);
  setSelectedFeedback(null);
  setSelectedAgentId('');
};

const handleStatusChange = async (feedbackId: number, newStatus: string) => {
  setFeedbackStatuses(prev => ({ ...prev, [feedbackId]: newStatus }));
  try {
    await request(`/feedback/${feedbackId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus }),
    });
  } catch (err) {
    console.error('Failed to update status', err);
  }
};

<<<<<<< HEAD:frontend/src/app/pages/FeedbackList.tsx
  const handlePriorityChange = async (feedbackId: number, newPriority: string) => {
  setFeedbackPriorities(prev => ({ ...prev, [feedbackId]: newPriority }));
};
=======
  const handlePriorityChange = (
    feedbackId: string,
    newPriority: Feedback['priority'],
  ) => {
    setFeedbackPriorities((prev) => ({ ...prev, [feedbackId]: newPriority }));
  };
  const handleCategoryChange = (id: string, value: string) => {
    setFeedbackCategories((prev) => ({ ...prev, [id]: value }));
  };

  const handleSentimentChange = (
    id: string,
    value: Feedback['sentiment']
  ) => {
    setFeedbackSentiments((prev) => ({ ...prev, [id]: value }));
  };

  const handleEmotionChange = (id: string, value: Feedback['emotion']) => {
    setFeedbackEmotions((prev) => ({ ...prev, [id]: value }));
  };
>>>>>>> origin/frontend:src/app/pages/FeedbackList.tsx

  const pageTitle = isSuperAdmin
    ? t('nav.allFeedback')
    : t('feedback.title');

  const pageSubtitle = isSuperAdmin
    ? (isAr ? 'عرض جميع الشكاوى عبر النظام' : 'System-wide feedback from all companies')
    : isManager
      ? (isAr ? 'إدارة شكاوى فريقك وتوزيعها' : 'Manage and assign your team\'s feedback')
      : (isAr ? 'عرض وإدارة شكاوى شركتك' : 'View and manage your company\'s feedback');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {pageTitle}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{pageSubtitle}</p>
        </div>
        <div className="flex gap-2">
          {(isSuperAdmin || isCompanyAdmin) && (
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              {t('common.export')}
            </Button>
          )}
        </div>
      </div>

      {/* Role-specific Info Banners */}
      {isManager && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-800 dark:text-emerald-300">
          <UserCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            {isAr
              ? 'يمكنك إسناد الشكاوى للموظفين وتغيير الأولوية والحالة. انقر على أي شكوى للتفاصيل.'
              : 'As Manager, you can assign feedback to agents, set priorities, and change statuses. Click a row to view details.'}
          </span>
        </div>
      )}
      {isSuperAdmin && (
        <div className="flex items-start gap-3 p-4 bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800 rounded-xl text-sm text-violet-800 dark:text-violet-300">
          <Building2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            {isAr ? 'عرض جميع الشكاوى من جميع الشركات والمجالات.' : 'Viewing all feedback across all companies and domains in the system.'}
          </span>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder={t('filter.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="open">{t('status.open')}</SelectItem>
                <SelectItem value="inProgress">{t('status.inProgress')}</SelectItem>
                <SelectItem value="resolved">{t('status.resolved')}</SelectItem>
                <SelectItem value="closed">{t('status.closed')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder={t('filter.sentiment')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="positive">{t('sentiment.positive')}</SelectItem>
                <SelectItem value="negative">{t('sentiment.negative')}</SelectItem>
                <SelectItem value="neutral">{t('sentiment.neutral')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder={t('filter.priority')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="high">{t('priority.high')}</SelectItem>
                <SelectItem value="medium">{t('priority.medium')}</SelectItem>
                <SelectItem value="low">{t('priority.low')}</SelectItem>
              </SelectContent>
            </Select>
            {isSuperAdmin && (
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={t('filter.company')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isAr ? 'جميع الشركات' : 'All Companies'}</SelectItem>
                  <SelectItem value="company-1">TechCorp Solutions</SelectItem>
                  <SelectItem value="company-2">Healthcare Plus</SelectItem>
                  <SelectItem value="company-3">Retail World</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </Card>

      {/* Feedback Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-800/30">
                <TableHead className="font-semibold hidden sm:table-cell text-xs">{isAr ? 'الرقم' : 'ID'}</TableHead>
                <TableHead className="font-semibold">{t('feedback.customer')}</TableHead>
                <TableHead className="hidden md:table-cell font-semibold">{t('feedback.content')}</TableHead>
                <TableHead className="hidden lg:table-cell font-semibold">{t('feedback.category')}</TableHead>
                <TableHead className="hidden xl:table-cell font-semibold">{t('feedback.channel')}</TableHead>
                <TableHead className="font-semibold">{t('feedback.sentiment')}</TableHead>
                <TableHead className="hidden xl:table-cell font-semibold">{t('feedback.emotion')}</TableHead>
                <TableHead className="hidden lg:table-cell font-semibold">{t('feedback.priority')}</TableHead>
<<<<<<< HEAD:frontend/src/app/pages/FeedbackList.tsx
                <TableHead className="font-semibold">{t('common.status')}</TableHead>
                
=======
                {(isManager || isCompanyAdmin) && (
                  <TableHead className="hidden xl:table-cell font-semibold">{t('feedback.assignedTo')}</TableHead>
                )}
>>>>>>> origin/frontend:src/app/pages/FeedbackList.tsx
                {isSuperAdmin && (
                  <TableHead className="hidden xl:table-cell font-semibold">{isAr ? 'الشركة' : 'Company'}</TableHead>
                )}
                <TableHead className="hidden sm:table-cell font-semibold">{t('common.date')}</TableHead>
                {(isManager || isCompanyAdmin) && (
                  <TableHead className="font-semibold">{t('common.actions')}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedback.map((fb) => {
<<<<<<< HEAD:frontend/src/app/pages/FeedbackList.tsx
  const currentStatus = feedbackStatuses[fb.feedback_id] || fb.status;
  const currentPriority = feedbackPriorities[fb.feedback_id] || fb.priority || 'low';
  return (
    <TableRow
      key={fb.feedback_id}
      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
      onClick={() => navigate(`/app/feedback/${fb.feedback_id}`)}
    >
      <TableCell className="hidden sm:table-cell">
        <span className="text-xs font-mono text-gray-400">{fb.feedback_id}</span>
      </TableCell>
      <TableCell>
        <div className="font-semibold text-gray-900 dark:text-white text-sm">{fb.customer_name || 'Unknown'}</div>
      </TableCell>
      <TableCell className="hidden md:table-cell max-w-xs">
        <div className="truncate text-sm text-gray-600 dark:text-gray-400">{fb.feedback_context || '—'}</div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <span className="text-sm text-gray-600 dark:text-gray-400">—</span>
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        <span className="text-sm text-gray-600 dark:text-gray-400">—</span>
      </TableCell>
      <TableCell>
        <Badge className={cn('capitalize text-xs', sentimentColors[fb.sentiment || 'neutral'])}>
          {t(`sentiment.${fb.sentiment || 'neutral'}`)}
        </Badge>
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        <span className="text-xs capitalize text-gray-600 dark:text-gray-400">{fb.emotion || '—'}</span>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        {isManager ? (
          <div onClick={(e) => e.stopPropagation()}>
            <Select
              value={currentPriority}
              onValueChange={(val) => handlePriorityChange(fb.feedback_id, val)}
            >
              <SelectTrigger className="h-7 w-[100px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low" className="text-xs">{t('priority.low')}</SelectItem>
                <SelectItem value="medium" className="text-xs">{t('priority.medium')}</SelectItem>
                <SelectItem value="high" className="text-xs">{t('priority.high')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <Badge className={cn('capitalize text-xs', priorityColors[currentPriority])}>
            {t(`priority.${currentPriority}`)}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        {isManager ? (
          <div onClick={(e) => e.stopPropagation()}>
            <Select
              value={currentStatus}
              onValueChange={(val) => handleStatusChange(fb.feedback_id, val)}
            >
              <SelectTrigger className="h-7 w-[120px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open" className="text-xs">{t('status.open')}</SelectItem>
                <SelectItem value="inProgress" className="text-xs">{t('status.inProgress')}</SelectItem>
                <SelectItem value="resolved" className="text-xs">{t('status.resolved')}</SelectItem>
                <SelectItem value="closed" className="text-xs">{t('status.closed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <Badge className={cn('capitalize text-xs', statusColors[currentStatus])}>
            {t(`status.${currentStatus}`)}
          </Badge>
        )}
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(fb.created_at)}</span>
      </TableCell>
      {isManager && (
        <TableCell>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
            onClick={(e) => { e.stopPropagation(); setSelectedFeedback(fb); setAssignDialogOpen(true); }}>
            <UserCheck className="w-3 h-3" />
            {isAr ? 'إسناد' : 'Assign'}
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
})}
=======
                const currentAssignee = assignmentMap[fb.id] || fb.assignedTo;
                return (
                  <TableRow
                    key={fb.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    onClick={() => navigate(`/app/feedback/${fb.id}`)}
                  >
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-xs font-mono text-gray-400">{fb.id}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{fb.customerName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{fb.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs">
                      <div className="truncate text-sm text-gray-600 dark:text-gray-400">{fb.content}</div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={feedbackCategories[fb.id] || fb.category}
                          onValueChange={(val) => handleCategoryChange(fb.id, val)}
                        >
                          <SelectTrigger className="h-7 w-[140px] text-xs">
                            <SelectValue />
                          </SelectTrigger>

                          <SelectContent>
                            {mockCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.slug}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>

                        </Select>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{fb.channel}</span>
                    </TableCell>
                    <TableCell>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={fb.sentiment}
                          onValueChange={(val) =>
                            handleSentimentChange(fb.id, val as Feedback['sentiment'])
                          }
                        >
                          <SelectTrigger className="h-7 w-[110px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="positive">{t('sentiment.positive')}</SelectItem>
                            <SelectItem value="neutral">{t('sentiment.neutral')}</SelectItem>
                            <SelectItem value="negative">{t('sentiment.negative')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <div onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={fb.emotion}
                          onValueChange={(val) => handleEmotionChange(fb.id, val as Feedback['emotion'])}
                        >
                          <SelectTrigger className="h-7 w-[120px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {/* <SelectItem value="happy">Happy</SelectItem> */}
                            <SelectItem value="satisfied">Satisfied</SelectItem>
                            <SelectItem value="frustrated">Frustrated</SelectItem>
                            <SelectItem value="disgusted">Disgusted</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {(isManager || isCompanyAdmin) ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={fb.priority}
                            onValueChange={(val) =>
                              handlePriorityChange(fb.id, val as Feedback['priority'])
                            }
                          >
                            <SelectTrigger className="h-7 w-[100px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low" className="text-xs">{t('priority.low')}</SelectItem>
                              <SelectItem value="medium" className="text-xs">{t('priority.medium')}</SelectItem>
                              <SelectItem value="high" className="text-xs">{t('priority.high')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <Badge className={cn('capitalize text-xs', priorityColors[fb.priority])}>
                          {t(`priority.${fb.priority}`)}
                        </Badge>
                      )}
                    </TableCell>

                    {(isManager || isCompanyAdmin) && (
                      <TableCell className="hidden xl:table-cell">
                        <span className={cn('text-xs', currentAssignee ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 italic')}>
                          {getAgentName(currentAssignee)}
                        </span>
                      </TableCell>
                    )}
                    {isSuperAdmin && (
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {fb.companyId === 'company-1' ? 'TechCorp' : fb.companyId === 'company-2' ? 'Healthcare+' : 'Retail World'}
                        </span>
                      </TableCell>
                    )}
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(fb.createdAt)}</span>
                    </TableCell>
                    {(isManager || isCompanyAdmin) && (
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={(e) => openAssignDialog(fb, e)}
                        >
                          <UserCheck className="w-3 h-3" />
                          {isAr ? 'إسناد' : 'Assign'}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
>>>>>>> origin/frontend:src/app/pages/FeedbackList.tsx
              {filteredFeedback.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-gray-400">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>{isAr ? 'لا توجد شكاوى مطابقة' : 'No feedback items match your filters'}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Results Count */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {isAr
  ? `عرض ${filteredFeedback.length} من أصل ${feedbackList.length} شكوى`
  : `Showing ${filteredFeedback.length} of ${feedbackList.length} feedback items`
}
      </div>

      {/* Assign Dialog (Manager only) */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? 'إسناد الشكوى' : 'Assign Feedback'}</DialogTitle>
            <DialogDescription>
{isAr ? `اختر موظفاً لإسناد شكوى ${selectedFeedback?.customer_name}` : `Select an agent to handle ${selectedFeedback?.customer_name}'s feedback`}            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm">
<p className="font-semibold text-gray-900 dark:text-white">{selectedFeedback.customer_name}</p>
<p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2">{selectedFeedback.feedback_context}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  {isAr ? 'اختر الموظف' : 'Select Agent'}
                </label>
                <div className="space-y-2">
                  {agents.map(agent => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                        selectedAgentId === agent.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
<<<<<<< HEAD:frontend/src/app/pages/FeedbackList.tsx
<span className="text-white text-xs font-bold">
  {agent.name.split(' ').map((n: string) => n[0]).join('')}
</span>                      </div>
=======
                        <span className="text-white text-xs font-bold">{`${agent.firstName} ${agent.lastName}`.split(' ').map(n => n[0]).join('')}</span>
                      </div>
>>>>>>> origin/frontend:src/app/pages/FeedbackList.tsx
                      <div>
                        <p className="text-sm font-medium">{agent.firstName} {agent.lastName}</p>
                        <p className="text-xs text-gray-400">{agent.email}</p>
                      </div>
                      {selectedAgentId === agent.id && (
                        <UserCheck className="w-4 h-4 ml-auto text-emerald-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              disabled={!selectedAgentId}
              onClick={handleAssignConfirm}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <UserCheck className="w-4 h-4 mr-2" />
              {isAr ? 'تأكيد الإسناد' : 'Confirm Assignment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}