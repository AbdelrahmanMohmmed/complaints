import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { request } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import {
  ArrowLeft, Calendar, TrendingUp, Tag, Smile,
  MessageSquare, StickyNote, Plus,
} from 'lucide-react';
import { cn } from '../components/ui/utils';

interface BackendFeedback {
  feedback_id: number;
  company_id: number;
  api_id: number | null;
  channel_name?: string | null;
  category_id: number | null;
  category_name: string | null;
  customer_name: string | null;
  feedback_context: string | null;
  status: string;
  sentiment: string | null;
  emotion: string | null;
  emotion_id: number | null;
  problem_type: string | null;
  problem_type_id: number | null;
  priority: string | null;
  created_at: string;
}

interface Category {
  category_id: number;
  category_name: string;
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
  analyzed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  critical: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
};

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
    .replace(/\w/g, (match) => match.toUpperCase());

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

export function FeedbackDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const isAr = language === 'ar';

  const [feedback, setFeedback] = useState<BackendFeedback | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Editable fields
  const [status, setStatus] = useState('open');
  const [priority, setPriority] = useState('low');
  const [categoryId, setCategoryId] = useState<string>('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Notes
  const [notes, setNotes] = useState<{ text: string; author: string; time: string }[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const canEdit = user?.role === 'manager' || user?.role === 'companyAdmin' || user?.role === 'superAdmin';
  const isAgent = user?.role === 'websiteConfigurator';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fb, cats] = await Promise.all([
          request<BackendFeedback>(`/feedback/${id}`),
          request<Category[]>('/categories/'),
        ]);
        setFeedback(fb);
        setStatus(normalizeStatus(fb.status || 'open'));
        setPriority(normalizePriority(fb.priority || 'low'));
        setCategoryId(fb.category_id ? String(fb.category_id) : '');
        setCategories(cats);
      } catch (err) {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!feedback) return;
    setSaveError('');
    setSaveSuccess('');
    setSaveLoading(true);
    try {
      // Update status
      await request(`/feedback/${feedback.feedback_id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      // Update priority + category
      await request(`/feedback/${feedback.feedback_id}/details`, {
        method: 'PATCH',
        body: JSON.stringify({
          priority,
          category_id: categoryId ? Number(categoryId) : null,
        }),
      });
      setFeedback(prev => prev ? { ...prev, status, priority, category_id: categoryId ? Number(categoryId) : null } : prev);
      setSaveSuccess('Changes saved successfully.');
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to save changes.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes(prev => [...prev, {
        text: newNote.trim(),
        author: user ? `${(user as any).f_name || ''} ${(user as any).l_name || ''}`.trim() : 'Unknown',
        time: new Date().toLocaleString(isAr ? 'ar-SA' : 'en-US'),
      }]);
      setNewNote('');
      setShowNoteInput(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString(isAr ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;

  if (notFound || !feedback) return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {isAr ? 'التعليق غير موجود' : 'Feedback not found'}
      </h2>
      <Button onClick={() => navigate(-1)} className="mt-4">{isAr ? 'العودة' : 'Go Back'}</Button>
    </div>
  );

  const backPath = isAgent ? '/app/my-feedback' : '/app/feedback';
  const sentiment = feedback.sentiment || 'neutral';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button variant="ghost" className="gap-2 w-fit" onClick={() => navigate(backPath)}>
          <ArrowLeft className="w-4 h-4" />
          {isAr ? 'عودة' : 'Back'}
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {t('feedback.details')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm font-mono">
            ID: {feedback.feedback_id}
          </p>
        </div>
        <Badge className={cn('capitalize', statusColors[status])}>
          {displayLabel(t(`status.${status}`), status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Feedback Content */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{t('feedback.content')}</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {isAr ? 'من: ' : 'From: '}{feedback.customer_name || 'Unknown'}
                  </p>
                </div>
                <Badge className={cn('capitalize', sentimentColors[sentiment])}>
                  {t(`sentiment.${sentiment}`)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {feedback.feedback_context || '—'}
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('common.actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status - all roles */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  {t('common.status')}
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">{t('status.open')}</SelectItem>
                    <SelectItem value="inProgress">{t('status.inProgress')}</SelectItem>
                    <SelectItem value="resolved">{t('status.resolved')}</SelectItem>
                    <SelectItem value="closed">{t('status.closed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority - manager/admin */}
              {canEdit && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    {t('feedback.priority')}
                  </label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('priority.low')}</SelectItem>
                      <SelectItem value="medium">{t('priority.medium')}</SelectItem>
                      <SelectItem value="high">{t('priority.high')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Category - manager/admin */}
              {canEdit && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    {t('feedback.category')}
                  </label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.category_id} value={String(cat.category_id)}>
                          {cat.category_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {saveError && <p className="text-sm text-red-500">{saveError}</p>}
              {saveSuccess && <p className="text-sm text-green-500">{saveSuccess}</p>}

              <Button className="w-full" onClick={handleSave} disabled={saveLoading}>
                {saveLoading ? 'جارٍ الحفظ...' : t('common.save')}
              </Button>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <StickyNote className="w-4 h-4" />
                  {t('feedback.notes')}
                </CardTitle>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs"
                  onClick={() => setShowNoteInput(!showNoteInput)}>
                  <Plus className="w-3.5 h-3.5" />
                  {t('feedback.addNote')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {showNoteInput && (
                <div className="space-y-2">
                  <Textarea
                    placeholder={t('feedback.notePlaceholder')}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                    className="resize-none text-sm"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setShowNoteInput(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                      {t('common.save')}
                    </Button>
                  </div>
                </div>
              )}
              {notes.length === 0 && !showNoteInput ? (
                <p className="text-sm text-gray-400 italic text-center py-4">
                  {isAr ? 'لا توجد ملاحظات بعد' : 'No notes yet. Add the first note.'}
                </p>
              ) : (
                notes.map((note, i) => (
                  <div key={i} className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{note.author}</span>
                      <span className="text-xs text-gray-400">{note.time}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{note.text}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{isAr ? 'معلومات العميل' : 'Customer Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">
                    {(feedback.customer_name || 'U').split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {feedback.customer_name || 'Unknown'}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'تاريخ الإنشاء' : 'Created'}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(feedback.created_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attributes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{isAr ? 'خصائص التعليق' : 'Attributes'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  icon: TrendingUp,
                  label: t('feedback.sentiment'),
                  value: <Badge className={cn('capitalize', sentimentColors[sentiment])}>{t(`sentiment.${sentiment}`)}</Badge>
                },
                {
                  icon: Smile,
                  label: t('feedback.emotion'),
                  value: (
                    <span className="text-sm font-medium capitalize">
                      {getEmotionLabel(t, feedback.emotion_id, feedback.emotion)}
                    </span>
                  )
                },
                {
                  icon: Tag,
                  label: t('feedback.problemType'),
                  value: (
                    <span className="text-sm font-medium">
                      {getProblemTypeLabel(t, feedback.problem_type_id, feedback.problem_type)}
                    </span>
                  )
                },
                {
                  icon: MessageSquare,
                  label: t('feedback.priority'),
                  value: <Badge className={cn('capitalize', priorityColors[priority])}>{t(`priority.${priority}`)}</Badge>
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                      <div className="mt-0.5">{value}</div>
                    </div>
                  </div>
                  <Separator className="mt-3" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}