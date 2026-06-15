import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { request } from '../../services/api';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Eye, Search, Download, UserCheck, AlertTriangle } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '../components/ui/dialog';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '../components/ui/sheet';
import { cn } from '../components/ui/utils';

interface BackendFeedback {
  feedback_id: number;
  company_id: number;
  api_id: number | null;
  channel_name?: string | null;
  customer_name: string | null;
  feedback_context: string | null;
  status: string;
  sentiment: string | null;
  sentiment_id: number | null;
  emotion: string | null;
  emotion_id: number | null;
  problem_type: string | null;
  problem_type_id: number | null;
  priority: string | null;
  created_at: string;
}

const sentimentColors: Record<string, string> = {
  positive: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700',
  negative: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800',
};

const SENTIMENT_ID_TO_KEY: Record<number, 'negative' | 'neutral' | 'positive'> = {
  0: 'negative',
  1: 'neutral',
  2: 'positive',
};

const SENTIMENT_KEY_TO_ID: Record<'negative' | 'neutral' | 'positive', number> = {
  negative: 0,
  neutral: 1,
  positive: 2,
};

const EMOTION_ID_TO_KEY: Record<number, 'satisfied' | 'frustrated' | 'neutral' | 'disgusted'> = {
  0: 'frustrated',
  1: 'neutral',
  2: 'disgusted',
  3: 'satisfied',
};

const EMOTION_KEY_TO_ID: Record<'frustrated' | 'neutral' | 'disgusted' | 'satisfied', number> = {
  frustrated: 0,
  neutral: 1,
  disgusted: 2,
  satisfied: 3,
};

const priorityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800',
};

const emotionColors: Record<string, string> = {
  satisfied: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700',
  frustrated: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
  disgusted: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800',
};

const classificationBadgeClass = 'capitalize text-xs transition-colors duration-200';

const normalizePriority = (value?: string | null) =>
  (value || 'low').toLowerCase();

const normalizeStatus = (value?: string | null) => {
  const normalized = (value || 'open').toLowerCase();
  if (normalized === 'inprogress' || normalized === 'in_progress') return 'inProgress';
  return normalized;
};

const HUMAN_LABELS: Record<string, string> = {
  inProgress: 'In Progress',
  analyzed: 'Analyzed',
  critical: 'Critical',
};

const toTitleCase = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());

const displayLabel = (labelKey: string, fallbackValue: string) => {
  if (labelKey === fallbackValue) return fallbackValue;
  if (labelKey.startsWith('status.') || labelKey.startsWith('priority.')) {
    return HUMAN_LABELS[fallbackValue] || toTitleCase(fallbackValue);
  }
  return labelKey;
};

const getProblemTypeLabel = (
  t: (key: string) => string,
  problemTypeId?: number | null,
  fallback?: string | null
) => (
  problemTypeId !== null && problemTypeId !== undefined
    ? t(`problemType.${problemTypeId}`)
    : (fallback || '—')
);

const getEmotionLabel = (
  t: (key: string) => string,
  emotionId?: number | null,
  fallback?: string | null
) => (
  emotionId !== null && emotionId !== undefined
    ? t(`emotion.${emotionId}`)
    : (fallback || '—')
);

const getSentimentKey = (
  sentimentId?: number | null,
  sentiment?: string | null
) => {
  if (sentimentId !== null && sentimentId !== undefined) {
    return SENTIMENT_ID_TO_KEY[sentimentId] || 'neutral';
  }
  if (sentiment) return sentiment.toLowerCase();
  return 'neutral';
};

const getSentimentSelectValue = (
  sentimentId?: number | null,
  sentiment?: string | null
) => {
  if (sentimentId !== null && sentimentId !== undefined) {
    return String(sentimentId);
  }
  const normalized = sentiment?.toLowerCase() as keyof typeof SENTIMENT_KEY_TO_ID | undefined;
  return normalized && SENTIMENT_KEY_TO_ID[normalized] !== undefined
    ? String(SENTIMENT_KEY_TO_ID[normalized])
    : '';
};

const getEmotionSelectValue = (
  emotionId?: number | null,
  emotion?: string | null
) => {
  if (emotionId !== null && emotionId !== undefined) {
    return String(emotionId);
  }
  const normalized = emotion?.toLowerCase() as keyof typeof EMOTION_KEY_TO_ID | undefined;
  return normalized && EMOTION_KEY_TO_ID[normalized] !== undefined
    ? String(EMOTION_KEY_TO_ID[normalized])
    : '';
};

const CATEGORY_AR_LABELS: Record<string, string> = {
  servicequality: 'جودة الخدمة',
  servicequalityissue: 'مشكلة جودة الخدمة',
  productissues: 'مشاكل المنتج',
  billing: 'الفواتير',
  support: 'الدعم',
  other: 'أخرى',
  deliveryissue: 'مشكلة التوصيل',
  deliveryissues: 'مشاكل التوصيل',
  foodquality: 'جودة الطعام',
  hygiene: 'النظافة',
  pricing: 'التسعير',
  orderaccuracy: 'دقة الطلب',
  menu: 'القائمة',
};

const normalizeCategoryKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

const getCategoryDisplayLabel = (categoryName: string, isAr: boolean) => {
  if (!isAr) return categoryName;

  // Keep values already in Arabic as-is.
  if (/[\u0600-\u06FF]/.test(categoryName)) return categoryName;

  const normalizedKey = normalizeCategoryKey(categoryName);
  return CATEGORY_AR_LABELS[normalizedKey] || categoryName;
};

const PAGE_SIZE_OPTIONS = [20, 30, 50];

export function FeedbackList() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAr = language === 'ar';
  const [selectedMobileFeedback, setSelectedMobileFeedback] = useState<BackendFeedback | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [emotionFilter, setEmotionFilter] = useState('all');
  const [feedbackList, setFeedbackList] = useState<BackendFeedback[]>([]);
  const [feedbackStatuses, setFeedbackStatuses] = useState<Record<number, string>>({});
  const [feedbackPriorities, setFeedbackPriorities] = useState<Record<number, string>>({});
  const [feedbackProblemTypes, setFeedbackProblemTypes] = useState<Record<number, number | null>>({});
  const [feedbackSentiments, setFeedbackSentiments] = useState<Record<number, number | null>>({});
  const [feedbackEmotions, setFeedbackEmotions] = useState<Record<number, number | null>>({});
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<BackendFeedback | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Agents are redirected to their own page
  if (user?.role === 'websiteConfigurator') {
    return <Navigate to="/app/my-feedback" replace />;
  }

  const agents: any[] = []; // TODO: fetch from /users/ when needed
  const isManagerOrSupervisor = user?.role === 'manager' || user?.role === 'customerServiceSupervisor';

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const data = await request<BackendFeedback[]>('/feedback/');
        setFeedbackList(data);
        setFeedbackStatuses(Object.fromEntries(data.map(fb => [fb.feedback_id, fb.status || 'open'])));
        setFeedbackPriorities(Object.fromEntries(data.map(fb => [fb.feedback_id, fb.priority || 'low'])));
        setFeedbackProblemTypes(Object.fromEntries(data.map(fb => [fb.feedback_id, fb.problem_type_id ?? null])));
        setFeedbackSentiments(Object.fromEntries(data.map(fb => [fb.feedback_id, fb.sentiment_id ?? null])));
        setFeedbackEmotions(Object.fromEntries(data.map(fb => [fb.feedback_id, fb.emotion_id ?? null])));
      } catch (err: any) {
        console.error('Failed to fetch feedback', err);
      }
    };
    fetchFeedback();
  }, []);

  const filteredFeedback = feedbackList.filter((fb) => {
    const matchesSearch =
      (fb.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fb.feedback_context || '').toLowerCase().includes(searchQuery.toLowerCase());
    const currentStatus = normalizeStatus(feedbackStatuses[fb.feedback_id] || fb.status);
    const currentPriority = normalizePriority(
      feedbackPriorities[fb.feedback_id] || fb.priority || 'low'
    );
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
    const sentimentKey = getSentimentKey(fb.sentiment_id, fb.sentiment);
    const matchesSentiment = sentimentFilter === 'all' || sentimentKey === sentimentFilter;
    const matchesPriority = priorityFilter === 'all' || currentPriority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || (fb.problem_type || '—') === categoryFilter;
    const matchesEmotion = emotionFilter === 'all' || String(fb.emotion_id ?? 'none') === emotionFilter;
    return matchesSearch && matchesStatus && matchesSentiment && matchesPriority && matchesCategory && matchesEmotion;
  });

  const handleRowClick = (fb: BackendFeedback) => {
    if (window.innerWidth < 640) {
      setSelectedMobileFeedback(fb);
      setMobileDetailOpen(true);
    } else {
      navigate(`/app/feedback/${fb.feedback_id}`);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredFeedback.length / pageSize));
  const paginatedFeedback = filteredFeedback.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sentimentFilter, priorityFilter, categoryFilter, emotionFilter, pageSize]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const categoryOptions = Array.from(
    new Set(feedbackList.map(fb => fb.problem_type || '—'))
  ).filter(name => name && name !== '—');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Customer', 'Feedback', 'Problem Type', 'Sentiment', 'Emotion', 'Priority', 'Status', 'Date'];
    const rows = filteredFeedback.map(fb => [
      fb.feedback_id,
      fb.customer_name || 'Unknown',
      `"${(fb.feedback_context || '').replace(/"/g, '""')}"`,
      getProblemTypeLabel(t, fb.problem_type_id, fb.problem_type),
      t(`sentiment.${getSentimentKey(fb.sentiment_id, fb.sentiment)}`),
      getEmotionLabel(t, fb.emotion_id, fb.emotion),
      fb.priority || '—',
      feedbackStatuses[fb.feedback_id] || fb.status,
      new Date(fb.created_at).toLocaleDateString('en-US'),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedback_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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

  const handlePriorityChange = async (feedbackId: number, newPriority: string) => {
    setFeedbackPriorities(prev => ({ ...prev, [feedbackId]: newPriority }));
    try {
      await request(`/feedback/${feedbackId}/priority`, {
        method: 'PATCH',
        body: JSON.stringify({ priority: newPriority }),
      });
    } catch (err) {
      console.error('Failed to update priority', err);
    }
  };

  const handleProblemTypeChange = async (feedbackId: number, newProblemTypeId: number | null) => {
    setFeedbackProblemTypes(prev => ({ ...prev, [feedbackId]: newProblemTypeId }));
    try {
      await request(`/feedback/${feedbackId}/problem-type`, {
        method: 'PATCH',
        body: JSON.stringify({ problem_type_id: newProblemTypeId }),
      });
    } catch (err) {
      console.error('Failed to update problem type', err);
    }
  };

  const handleSentimentChange = async (feedbackId: number, newSentimentId: number | null) => {
    setFeedbackSentiments(prev => ({ ...prev, [feedbackId]: newSentimentId }));
    try {
      await request(`/feedback/${feedbackId}/sentiment`, {
        method: 'PATCH',
        body: JSON.stringify({ sentiment_id: newSentimentId }),
      });
    } catch (err) {
      console.error('Failed to update sentiment', err);
    }
  };

  const handleEmotionChange = async (feedbackId: number, newEmotionId: number | null) => {
    setFeedbackEmotions(prev => ({ ...prev, [feedbackId]: newEmotionId }));
    try {
      await request(`/feedback/${feedbackId}/emotion`, {
        method: 'PATCH',
        body: JSON.stringify({ emotion_id: newEmotionId }),
      });
    } catch (err) {
      console.error('Failed to update emotion', err);
    }
  };

  const pageTitle = t('feedback.title');
  const pageSubtitle = isManagerOrSupervisor
    ? (isAr ? 'عرض وإدارة التعليقات' : 'View and manage feedback')
    : (isAr ? 'عرض تعليقاتك' : 'View your feedback');

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
          {(isManagerOrSupervisor) && (
            <Button variant="outline" size="sm" className="gap-2" onClick={exportToCSV}>
              <Download className="w-4 h-4" />
              {t('common.export')}
            </Button>
          )}
        </div>
      </div>

      {/* Filters - Scrollable on mobile */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[420px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t('feedback.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11"
          />
        </div>

        {/* Filters - scrollable container for mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[140px] sm:w-[150px] h-11 shrink-0">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? 'جميع التصنيفات' : 'All Categories'}</SelectItem>
              {categoryOptions.map(category => (
                <SelectItem key={category} value={category}>{getCategoryDisplayLabel(category, isAr)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="w-[140px] sm:w-[150px] h-11 shrink-0">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? 'جميع المشاعر' : 'All Sentiment'}</SelectItem>
              <SelectItem value="positive">{isAr ? 'إيجابي' : 'Positive'}</SelectItem>
              <SelectItem value="negative">{isAr ? 'سلبي' : 'Negative'}</SelectItem>
              <SelectItem value="neutral">{isAr ? 'محايد' : 'Neutral'}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={emotionFilter} onValueChange={setEmotionFilter}>
            <SelectTrigger className="w-[140px] sm:w-[150px] h-11 shrink-0">
              <SelectValue placeholder="Emotion" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? ' جميع الانفعالات' : 'All Emotions'}</SelectItem>
              <SelectItem value="satisfied">{isAr ? 'راضي' : 'Satisfied'}</SelectItem>
              <SelectItem value="frustrated">{isAr ? 'محبط' : 'Frustrated'}</SelectItem>
              <SelectItem value="neutral">{isAr ? 'محايد' : 'Neutral'}</SelectItem>
              <SelectItem value="disgusted">{isAr ? 'مشمئز' : 'Disgusted'}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px] sm:w-[150px] h-11 shrink-0">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? 'جميع الأولويات' : 'All Priorities'}</SelectItem>
              <SelectItem value="low">{isAr ? 'منخفضة' : 'Low'}</SelectItem>
              <SelectItem value="medium">{isAr ? 'متوسطة' : 'Medium'}</SelectItem>
              <SelectItem value="high">{isAr ? 'عالية' : 'High'}</SelectItem>
              <SelectItem value="critical">{isAr ? 'حرجة' : 'Critical'}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] sm:w-[150px] h-11 shrink-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isAr ? 'جميع الحالات' : 'All Status'}</SelectItem>
              <SelectItem value="open">{isAr ? 'مفتوح' : 'Open'}</SelectItem>
              <SelectItem value="inprogress">{isAr ? 'قيد المعالجة' : 'In Progress'}</SelectItem>
              <SelectItem value="resolved">{isAr ? 'تم الحل' : 'Resolved'}</SelectItem>
              <SelectItem value="closed">{isAr ? 'مغلق' : 'Closed'}</SelectItem>
              <SelectItem value="analyzed">{isAr ? 'محلل' : 'Analyzed'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop Table - hidden on mobile */}
      <div className="hidden sm:block">
        <Card data-tour="feedback-table">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-gray-800/30">
                  <TableHead className="font-semibold hidden sm:table-cell text-xs">{isAr ? 'الرقم' : 'ID'}</TableHead>
                  <TableHead className="font-semibold">{t('feedback.customer')}</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold">{t('feedback.content')}</TableHead>
                  <TableHead className="hidden xl:table-cell font-semibold">{t('feedback.problemType')}</TableHead>
                  <TableHead className="font-semibold">{t('feedback.sentiment')}</TableHead>
                  <TableHead className="hidden lg:table-cell font-semibold">{t('feedback.emotion')}</TableHead>
                  <TableHead className="hidden lg:table-cell font-semibold">{t('feedback.priority')}</TableHead>
                  <TableHead className="hidden lg:table-cell font-semibold">{isAr ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className="hidden xl:table-cell font-semibold">{t('feedback.channel')}</TableHead>
                  <TableHead className="hidden sm:table-cell font-semibold">{t('common.date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFeedback.map((fb) => {
                  const currentStatus = normalizeStatus(feedbackStatuses[fb.feedback_id] || fb.status);
                  const currentPriority = normalizePriority(
                    feedbackPriorities[fb.feedback_id] || fb.priority || 'low'
                  );
                  const currentSentimentKey = getSentimentKey(
                    feedbackSentiments[fb.feedback_id] ?? fb.sentiment_id,
                    fb.sentiment
                  );
                  const currentEmotionKey = EMOTION_ID_TO_KEY[
                    (feedbackEmotions[fb.feedback_id] ?? fb.emotion_id ?? 2) as number
                  ] || 'neutral';
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
                      <TableCell className="hidden xl:table-cell">
                        {isManagerOrSupervisor ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={feedbackProblemTypes[fb.feedback_id] != null ? String(feedbackProblemTypes[fb.feedback_id]) : ''}
                              onValueChange={(val) => handleProblemTypeChange(fb.feedback_id, val === '-1' ? null : Number(val))}
                            >
                              <SelectTrigger className="h-7 w-[140px] text-xs">
                                <SelectValue
                                  placeholder={getProblemTypeLabel(t, fb.problem_type_id, fb.problem_type)}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0" className="text-xs">{t('problemType.0')}</SelectItem>
                                <SelectItem value="1" className="text-xs">{t('problemType.1')}</SelectItem>
                                <SelectItem value="2" className="text-xs">{t('problemType.2')}</SelectItem>
                                <SelectItem value="3" className="text-xs">{t('problemType.3')}</SelectItem>
                                <SelectItem value="4" className="text-xs">{t('problemType.4')}</SelectItem>
                                <SelectItem value="5" className="text-xs">{t('problemType.5')}</SelectItem>
                                <SelectItem value="6" className="text-xs">{t('problemType.6')}</SelectItem>
                                <SelectItem value="7" className="text-xs">{t('problemType.7')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {getProblemTypeLabel(t, feedbackProblemTypes[fb.feedback_id] ?? fb.problem_type_id, fb.problem_type)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isManagerOrSupervisor ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={getSentimentSelectValue(feedbackSentiments[fb.feedback_id], fb.sentiment)}
                              onValueChange={(val) => handleSentimentChange(fb.feedback_id, val === '-1' ? null : Number(val))}
                            >
                              <SelectTrigger className={cn('h-7 w-[100px] text-xs transition-colors duration-200', sentimentColors[currentSentimentKey])}>
                                <SelectValue placeholder={t(`sentiment.${currentSentimentKey}`)} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0" className="text-xs">{t('sentiment.negative')}</SelectItem>
                                <SelectItem value="1" className="text-xs">{t('sentiment.neutral')}</SelectItem>
                                <SelectItem value="2" className="text-xs">{t('sentiment.positive')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <Badge className={cn(classificationBadgeClass, sentimentColors[currentSentimentKey])}>
                            {t(`sentiment.${currentSentimentKey}`)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {isManagerOrSupervisor ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={getEmotionSelectValue(feedbackEmotions[fb.feedback_id], fb.emotion)}
                              onValueChange={(val) => handleEmotionChange(fb.feedback_id, val === '-1' ? null : Number(val))}
                            >
                              <SelectTrigger className={cn('h-7 w-[110px] text-xs transition-colors duration-200', emotionColors[currentEmotionKey] || emotionColors.neutral)}>
                                <SelectValue placeholder={getEmotionLabel(t, fb.emotion_id, fb.emotion)} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0" className="text-xs">{t('emotion.0')}</SelectItem>
                                <SelectItem value="1" className="text-xs">{t('emotion.1')}</SelectItem>
                                <SelectItem value="2" className="text-xs">{t('emotion.2')}</SelectItem>
                                <SelectItem value="3" className="text-xs">{t('emotion.3')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <Badge className={cn(classificationBadgeClass, emotionColors[currentEmotionKey] || emotionColors.neutral)}>
                            {getEmotionLabel(t, feedbackEmotions[fb.feedback_id] ?? fb.emotion_id, fb.emotion)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {isManagerOrSupervisor ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={currentPriority}
                              onValueChange={(val) => handlePriorityChange(fb.feedback_id, val)}
                            >
                              <SelectTrigger className={cn('h-7 w-[100px] text-xs transition-colors duration-200', priorityColors[currentPriority])}>
                                <SelectValue placeholder={displayLabel(t(`priority.${currentPriority}`), currentPriority)} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low" className="text-xs">{t('priority.low')}</SelectItem>
                                <SelectItem value="medium" className="text-xs">{t('priority.medium')}</SelectItem>
                                <SelectItem value="high" className="text-xs">{t('priority.high')}</SelectItem>
                                <SelectItem value="critical" className="text-xs">{t('priority.critical')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <Badge className={cn(classificationBadgeClass, priorityColors[currentPriority])}>
                            {displayLabel(t(`priority.${currentPriority}`), currentPriority)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {isManagerOrSupervisor ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            <Select
                              value={currentStatus}
                              onValueChange={(val) => handleStatusChange(fb.feedback_id, val)}
                            >
                              <SelectTrigger className="h-7 w-[110px] text-xs">
                                <SelectValue placeholder={displayLabel(t(`status.${currentStatus}`), currentStatus)} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open" className="text-xs">{t('status.open')}</SelectItem>
                                <SelectItem value="inProgress" className="text-xs">{t('status.inProgress')}</SelectItem>
                                <SelectItem value="resolved" className="text-xs">{t('status.resolved')}</SelectItem>
                                <SelectItem value="closed" className="text-xs">{t('status.closed')}</SelectItem>
                                <SelectItem value="analyzed" className="text-xs">{t('status.analyzed')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                            {displayLabel(t(`status.${currentStatus}`), currentStatus)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{fb.channel_name || '—'}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(fb.created_at)}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {paginatedFeedback.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-gray-400">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p>{isAr ? 'لا توجد تعليقات مطابقة' : 'No feedback items match your filters'}</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Mobile Cards - visible only on mobile */}
      <div className="sm:hidden space-y-3">
        {paginatedFeedback.map((fb) => {
          const currentStatus = normalizeStatus(feedbackStatuses[fb.feedback_id] || fb.status);
          const currentPriority = normalizePriority(feedbackPriorities[fb.feedback_id] || fb.priority || 'low');
          const currentSentimentKey = getSentimentKey(
            feedbackSentiments[fb.feedback_id] ?? fb.sentiment_id,
            fb.sentiment
          );

          return (
            <Card
              key={fb.feedback_id}
              className="p-4 cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => handleRowClick(fb)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {fb.customer_name || 'Unknown'}
                    </span>
                    <Badge className={cn('text-[10px] px-1.5 py-0', sentimentColors[currentSentimentKey])}>
                      {t(`sentiment.${currentSentimentKey}`)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                    {fb.feedback_context || '—'}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={cn('text-[10px] px-1.5 py-0', priorityColors[currentPriority])}>
                      {currentPriority}
                    </Badge>
                    <span className="text-[10px] text-gray-400">
                      {formatDate(fb.created_at)}
                    </span>
                    {fb.channel_name && (
                      <span className="text-[10px] text-gray-400">
                        {fb.channel_name}
                      </span>
                    )}
                  </div>
                </div>
                <Eye className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </Card>
          );
        })}
        {paginatedFeedback.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>{isAr ? 'لا توجد تعليقات مطابقة' : 'No feedback items match your filters'}</p>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {isAr
          ? `عرض ${paginatedFeedback.length} من أصل ${filteredFeedback.length} تعليق (الكل: ${feedbackList.length})`
          : `Showing ${paginatedFeedback.length} of ${filteredFeedback.length} filtered items (total: ${feedbackList.length})`
        }
      </div>

      {/* Pagination Controls - Mobile friendly */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">{isAr ? 'عدد العناصر' : 'Rows per page'}</span>
          <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage <= 1}
          >
            {isAr ? 'السابق' : 'Prev'}
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400 px-2">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage >= totalPages}
          >
            {isAr ? 'التالي' : 'Next'}
          </Button>
        </div>
      </div>

      {/* Mobile Detail Drawer */}
      {selectedMobileFeedback && (
        <Sheet open={mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
          <SheetContent side={isAr ? 'right' : 'left'} className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{isAr ? 'تفاصيل التعليق' : 'Feedback Details'}</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 py-4">
              {/* Customer */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">{isAr ? 'العميل' : 'Customer'}</label>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedMobileFeedback.customer_name || 'Unknown'}</p>
              </div>

              {/* Content */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">{isAr ? 'المحتوى' : 'Content'}</label>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  {selectedMobileFeedback.feedback_context || '—'}
                </p>
              </div>

              {/* Sentiment */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">{isAr ? 'المشاعر' : 'Sentiment'}</label>
                <div className="mt-1">
                  {isManagerOrSupervisor ? (
                    <Select
                      value={getSentimentSelectValue(feedbackSentiments[selectedMobileFeedback.feedback_id], selectedMobileFeedback.sentiment)}
                      onValueChange={(val) => handleSentimentChange(selectedMobileFeedback.feedback_id, val === '-1' ? null : Number(val))}
                    >
                      <SelectTrigger className={cn('h-8 w-full text-xs', sentimentColors[getSentimentKey(feedbackSentiments[selectedMobileFeedback.feedback_id] ?? selectedMobileFeedback.sentiment_id, selectedMobileFeedback.sentiment)])}>
                        <SelectValue placeholder={t(`sentiment.${getSentimentKey(selectedMobileFeedback.sentiment_id, selectedMobileFeedback.sentiment)}`)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">{t('sentiment.negative')}</SelectItem>
                        <SelectItem value="1">{t('sentiment.neutral')}</SelectItem>
                        <SelectItem value="2">{t('sentiment.positive')}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={cn(classificationBadgeClass, sentimentColors[getSentimentKey(selectedMobileFeedback.sentiment_id, selectedMobileFeedback.sentiment)])}>
                      {t(`sentiment.${getSentimentKey(selectedMobileFeedback.sentiment_id, selectedMobileFeedback.sentiment)}`)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Emotion */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">{isAr ? 'الانفعال' : 'Emotion'}</label>
                <div className="mt-1">
                  {isManagerOrSupervisor ? (
                    <Select
                      value={getEmotionSelectValue(feedbackEmotions[selectedMobileFeedback.feedback_id], selectedMobileFeedback.emotion)}
                      onValueChange={(val) => handleEmotionChange(selectedMobileFeedback.feedback_id, val === '-1' ? null : Number(val))}
                    >
                      <SelectTrigger className="h-8 w-full text-xs">
                        <SelectValue placeholder={getEmotionLabel(t, selectedMobileFeedback.emotion_id, selectedMobileFeedback.emotion)} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">{t('emotion.0')}</SelectItem>
                        <SelectItem value="1">{t('emotion.1')}</SelectItem>
                        <SelectItem value="2">{t('emotion.2')}</SelectItem>
                        <SelectItem value="3">{t('emotion.3')}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={cn(classificationBadgeClass, emotionColors[EMOTION_ID_TO_KEY[(feedbackEmotions[selectedMobileFeedback.feedback_id] ?? selectedMobileFeedback.emotion_id ?? 2) as number] || 'neutral'])}>
                      {getEmotionLabel(t, feedbackEmotions[selectedMobileFeedback.feedback_id] ?? selectedMobileFeedback.emotion_id, selectedMobileFeedback.emotion)}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">{isAr ? 'الأولوية' : 'Priority'}</label>
                <div className="mt-1">
                  {isManagerOrSupervisor ? (
                    <Select
                      value={normalizePriority(feedbackPriorities[selectedMobileFeedback.feedback_id] || selectedMobileFeedback.priority || 'low')}
                      onValueChange={(val) => handlePriorityChange(selectedMobileFeedback.feedback_id, val)}
                    >
                      <SelectTrigger className={cn('h-8 w-full text-xs', priorityColors[normalizePriority(feedbackPriorities[selectedMobileFeedback.feedback_id] || selectedMobileFeedback.priority || 'low')])}>
                        <SelectValue placeholder={displayLabel(t(`priority.${normalizePriority(selectedMobileFeedback.priority)}`), normalizePriority(selectedMobileFeedback.priority))} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('priority.low')}</SelectItem>
                        <SelectItem value="medium">{t('priority.medium')}</SelectItem>
                        <SelectItem value="high">{t('priority.high')}</SelectItem>
                        <SelectItem value="critical">{t('priority.critical')}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={cn(classificationBadgeClass, priorityColors[normalizePriority(selectedMobileFeedback.priority)])}>
                      {displayLabel(t(`priority.${normalizePriority(selectedMobileFeedback.priority)}`), normalizePriority(selectedMobileFeedback.priority))}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">{isAr ? 'الحالة' : 'Status'}</label>
                <div className="mt-1">
                  {isManagerOrSupervisor ? (
                    <Select
                      value={normalizeStatus(feedbackStatuses[selectedMobileFeedback.feedback_id] || selectedMobileFeedback.status)}
                      onValueChange={(val) => handleStatusChange(selectedMobileFeedback.feedback_id, val)}
                    >
                      <SelectTrigger className="h-8 w-full text-xs">
                        <SelectValue placeholder={displayLabel(t(`status.${normalizeStatus(selectedMobileFeedback.status)}`), normalizeStatus(selectedMobileFeedback.status))} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">{t('status.open')}</SelectItem>
                        <SelectItem value="inProgress">{t('status.inProgress')}</SelectItem>
                        <SelectItem value="resolved">{t('status.resolved')}</SelectItem>
                        <SelectItem value="closed">{t('status.closed')}</SelectItem>
                        <SelectItem value="analyzed">{t('status.analyzed')}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {displayLabel(t(`status.${normalizeStatus(selectedMobileFeedback.status)}`), normalizeStatus(selectedMobileFeedback.status))}
                    </span>
                  )}
                </div>
              </div>

              {/* Channel */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">{isAr ? 'القناة' : 'Channel'}</label>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedMobileFeedback.channel_name || '—'}</p>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">{isAr ? 'التاريخ' : 'Date'}</label>
                <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(selectedMobileFeedback.created_at)}</p>
              </div>

              {/* Problem Type */}
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 uppercase">{isAr ? 'نوع المشكلة' : 'Problem Type'}</label>
                <div className="mt-1">
                  {isManagerOrSupervisor ? (
                    <Select
                      value={String(feedbackProblemTypes[selectedMobileFeedback.feedback_id] ?? -1)}
                      onValueChange={(val) => handleProblemTypeChange(selectedMobileFeedback.feedback_id, val === '-1' ? null : Number(val))}
                    >
                      <SelectTrigger className="h-8 w-full text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0,1,2,3,4,5,6,7].map(id => (
                          <SelectItem key={id} value={String(id)}>{t(`problemType.${id}`)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {getProblemTypeLabel(t, selectedMobileFeedback.problem_type_id, selectedMobileFeedback.problem_type)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Assign Dialog (Manager only) */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? 'إسناد التعليق' : 'Assign Feedback'}</DialogTitle>
            <DialogDescription>
              {isAr ? `اختر موظفاً لإسناد تعليق ${selectedFeedback?.customer_name}` : `Select an agent to handle ${selectedFeedback?.customer_name}'s feedback`}
            </DialogDescription>
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
                        <span className="text-white text-xs font-bold">
                          {agent.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
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
