// NOTE: This page shows an agent's feedback using MOCK data from `mockData.ts`.
// TODO: Replace `mockFeedback` with real `/api/v1/complaints` data filtered by the current agent.

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { request } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '../components/ui/dialog';
import {
  MessageSquare, Clock, CheckCircle2, Inbox, Search,
  ChevronDown, ChevronUp, StickyNote, Tag, Phone, Mail, Globe, Smile,
} from 'lucide-react';
import { cn } from '../components/ui/utils';
import { WelcomeBanner } from '../components/WelcomeBanner';
interface BackendFeedback {
  feedback_id: number;
  company_id: number;
  api_id: number;
  category_id: number | null;
  customer_name: string | null;
  feedback_context: string | null;
  status: string | null;
  sentiment: string | null;
  emotion: string | null;
  priority: string | null;
  created_at: string;
}
const statusColors: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  inProgress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const sentimentColors: Record<string, string> = {
  positive: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  negative: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const sentimentDotColors: Record<string, string> = {
  positive: 'bg-green-500',
  negative: 'bg-red-500',
  neutral: 'bg-gray-400',
};

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Email: Mail,
  WhatsApp: MessageSquare,
  Phone: Phone,
  'Web Form': Globe,
};

export function MyFeedback() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const isAr = language === 'ar';

  // Agent sees all feedback for demo (pretend they're assigned)
  const [myFeedback, setMyFeedback] = useState<BackendFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackStatuses, setFeedbackStatuses] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const data = await request<BackendFeedback[]>('/feedback/');
        setMyFeedback(data);
        setFeedbackStatuses(
          Object.fromEntries(data.map(fb => [fb.feedback_id, fb.status || 'open']))
        );
      } catch (err) {
        console.error('Failed to fetch feedback', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedback();
  }, []);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
const [noteTarget, setNoteTarget] = useState<BackendFeedback | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savedNotes, setSavedNotes] = useState<Record<string, string[]>>({});
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFeedback = myFeedback.filter(fb => {
  const matchesStatus = statusFilter === 'all' || feedbackStatuses[fb.feedback_id] === statusFilter;
  const matchesSearch = (fb.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (fb.feedback_context || '').toLowerCase().includes(searchQuery.toLowerCase());
  return matchesStatus && matchesSearch;
});

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

  const handleAddNote = (fb: BackendFeedback) => {
  setNoteTarget(fb);
  setNoteText('');
  setNoteDialogOpen(true);
};

  const handleSaveNote = () => {
  if (noteTarget && noteText.trim()) {
    setSavedNotes(prev => ({
      ...prev,
      [noteTarget.feedback_id]: [...(prev[noteTarget.feedback_id] || []), noteText.trim()],
    }));
  }
  setNoteDialogOpen(false);
  setNoteText('');
  setNoteTarget(null);
};

  const open = Object.values(feedbackStatuses).filter(s => s === 'open').length;
  const inProgress = Object.values(feedbackStatuses).filter(s => s === 'inProgress').length;
  const resolved = Object.values(feedbackStatuses).filter(s => s === 'resolved').length;

  const kpis = [
    {
      label: t('agent.assignedToMe'),
      value: myFeedback.length,
      icon: Inbox,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: t('status.open'),
      value: open,
      icon: MessageSquare,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: t('status.inProgress'),
      value: inProgress,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label: t('status.resolved'),
      value: resolved,
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <WelcomeBanner />

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-1/3 -translate-y-1/3" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Inbox className="w-5 h-5 text-orange-200" />
            <span className="text-orange-200 text-sm font-medium">{t('role.agent')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mb-1">{t('agent.myFeedback')}</h1>
          <p className="text-orange-200 text-sm">
            {isAr ? `مرحباً ${user?.firstName} ${user?.lastName}! هذه قائمة الشكاوى المُسندة إليك` : `Welcome, ${user?.firstName} ${user?.lastName}! Here are all feedback items assigned to you`}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-snug">{kpi.label}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{kpi.value}</p>
                </div>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', kpi.bg)}>
                  <kpi.icon className={cn('w-5 h-5', kpi.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
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
      </div>

      {/* Results */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {isAr ? `${filteredFeedback.length} شكوى من أصل ${myFeedback.length}` : `Showing ${filteredFeedback.length} of ${myFeedback.length} items`}
      </div>

      {/* Feedback Cards */}
      <div className="space-y-3">
        {filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Inbox className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {isAr ? 'لا توجد شكاوى مُطابقة' : 'No feedback items match your filters'}
              </p>
            </CardContent>
          </Card>
        ) : (
filteredFeedback.map((fb) => {
  const isExpanded = expandedId === fb.feedback_id;
  const currentStatus = feedbackStatuses[fb.feedback_id] || fb.status || 'open';
  const notes = savedNotes[fb.feedback_id] || [];

  return (
    <Card key={fb.feedback_id} className={cn('transition-all duration-200', isExpanded ? 'ring-2 ring-orange-500/30 shadow-md' : '')}>
      <CardContent className="p-0">
        {/* Card Header Row */}
        <div
          className="flex items-start gap-3 p-4 cursor-pointer"
          onClick={() => setExpandedId(isExpanded ? null : fb.feedback_id)}
        >
          {/* Sentiment Indicator */}
          <div className={cn('w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0', sentimentDotColors[fb.sentiment || 'neutral'])} />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{fb.customer_name || 'Unknown'}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className={cn('text-xs', statusColors[currentStatus])}>
                  {t(`status.${currentStatus}`)}
                </Badge>
                {isExpanded
                  ? <ChevronUp className="w-4 h-4 text-gray-400" />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />
                }
              </div>
            </div>

            <p className={cn('text-sm text-gray-600 dark:text-gray-400 mt-1.5', isExpanded ? '' : 'line-clamp-2')}>
              {fb.feedback_context || '—'}
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              {fb.sentiment && (
                <Badge className={cn('text-xs', sentimentColors[fb.sentiment])}>
                  {t(`sentiment.${fb.sentiment}`)}
                </Badge>
              )}
              <span className="text-xs text-gray-400">{formatDate(fb.created_at)}</span>
              {notes.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-orange-500 dark:text-orange-400">
                  <StickyNote className="w-3 h-3" />
                  {notes.length} {isAr ? 'ملاحظة' : 'note(s)'}
                </span>
              )}
            </div>
          </div>
        </div>

                  {/* Expanded Section */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-gray-700/50 p-4 space-y-4 bg-gray-50/50 dark:bg-gray-800/20">
                      {/* Agent Actions */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* Status Update */}
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                            {t('agent.updateStatus')}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {(['open', 'inProgress', 'resolved', 'closed'] as const).map(status => (
                              <button
                                key={status}
                                  onClick={() => handleStatusChange(fb.feedback_id, status)}                                className={cn(
                                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                                  currentStatus === status
                                    ? statusColors[status] + ' ring-2 ring-offset-1 ring-current'
                                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                )}
                              >
                                {t(`status.${status}`)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Add Note */}
                        <div className="flex-shrink-0">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                            {t('common.notes')}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 text-xs"
                            onClick={() => handleAddNote(fb)}
                          >
                            <StickyNote className="w-3.5 h-3.5" />
                            {t('feedback.addNote')}
                          </Button>
                        </div>
                      </div>

                      {/* Notes */}
                      {notes.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {isAr ? 'الملاحظات المحفوظة' : 'Saved Notes'}
                          </p>
                          {notes.map((note, ni) => (
                            <div key={ni} className="flex gap-2 p-2.5 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-800/30">
                              <StickyNote className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-gray-700 dark:text-gray-300">{note}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Feedback Details */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-2.5 bg-white dark:bg-gray-700/50 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">{t('feedback.emotion')}</p>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white capitalize flex items-center gap-1">
                            <Smile className="w-3 h-3" />
                            {fb.emotion}
                          </p>
                        </div>
                        <div className="p-2.5 bg-white dark:bg-gray-700/50 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">{t('feedback.priority')}</p>
                          <Badge className={cn('text-xs',
                            fb.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            fb.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          )}>
                            {t(`priority.${fb.priority}`)}
                          </Badge>
                        </div>
                        <div className="p-2.5 bg-white dark:bg-gray-700/50 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">{isAr ? 'آخر تحديث' : 'Last Updated'}</p>
<p className="text-xs font-semibold text-gray-900 dark:text-white">{formatDate(fb.created_at)}</p>                        </div>
                        <div className="p-2.5 bg-white dark:bg-gray-700/50 rounded-lg">
                          <p className="text-xs text-gray-400 mb-1">{isAr ? 'رقم الشكوى' : 'Feedback ID'}</p>
<p className="text-xs font-mono font-semibold text-gray-900 dark:text-white">{fb.feedback_id}</p>                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('feedback.addNote')}</DialogTitle>
            <DialogDescription>
{isAr ? `إضافة ملاحظة على شكوى ${noteTarget?.customer_name}` : `Add a note to ${noteTarget?.customer_name}'s feedback`}            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Textarea
              placeholder={t('feedback.notePlaceholder')}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSaveNote}
              disabled={!noteText.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {t('common.save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}