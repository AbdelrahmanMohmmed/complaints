// NOTE: This details view currently uses MOCK feedback, user, and timeline activity data.
// TODO: Replace `mockFeedback`, `mockUsers`, and `mockTimelineActivities` with real API calls.
// import React from "react";
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { mockFeedback, mockUsers, mockTimelineActivities } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import {
  ArrowLeft,
  Calendar,
  User,
  MessageSquare,
  TrendingUp,
  Tag,
  Smile,
  Clock,
  StickyNote,
  Plus,
} from 'lucide-react';
import { cn } from '../components/ui/utils';

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

export function FeedbackDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const isAr = language === 'ar';
  
  const feedback = mockFeedback.find((f) => f.id === id);
  const [status, setStatus] = useState(feedback?.status || 'open');
  const [assignedAgent, setAssignedAgent] = useState(feedback?.assignedTo || '');
  const [priority, setPriority] = useState(feedback?.priority || 'medium');
  const [notes, setNotes] = useState<{ text: string; author: string; time: string }[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  if (!feedback) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isAr ? 'الشكوى غير موجودة' : 'Feedback not found'}
        </h2>
        <Button onClick={() => navigate(-1)} className="mt-4">
          {isAr ? 'العودة' : 'Go Back'}
        </Button>
      </div>
    );
  }

  const agents = mockUsers.filter((u) => u.role === 'agent');
  const canAssign = user?.role === 'manager' || user?.role === 'companyAdmin' || user?.role === 'superAdmin';
  const canSetPriority = user?.role === 'manager' || user?.role === 'companyAdmin' || user?.role === 'superAdmin';
  const isAgent = user?.role === 'agent';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(isAr ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes(prev => [...prev, {
        text: newNote.trim(),
        author: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        time: new Date().toLocaleString(isAr ? 'ar-SA' : 'en-US'),
      }]);
      setNewNote('');
      setShowNoteInput(false);
    }
  };

  const backPath = isAgent ? '/app/my-feedback' : '/app/feedback';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Button
          variant="ghost"
          className="gap-2 w-fit"
          onClick={() => navigate(backPath)}
        >
          <ArrowLeft className="w-4 h-4" />
          {isAr ? 'عودة' : 'Back'}
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {t('feedback.details')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm font-mono">
            ID: {feedback.id}
          </p>
        </div>
        <Badge className={cn('capitalize', statusColors[status])}>
          {t(`status.${status}`)}
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
                    {isAr ? 'من: ' : 'From: '}{feedback.customerName}
                  </p>
                </div>
                <Badge className={cn('capitalize', sentimentColors[feedback.sentiment])}>
                  {t(`sentiment.${feedback.sentiment}`)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {feedback.content}
              </p>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('common.actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Change - All roles */}
         

              {/* Priority - Manager/Admin only */}
              {canSetPriority && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    {t('feedback.setPriority')}
                  </label>
                  <Select
                    value={priority}
                    onValueChange={(value) =>
                      setPriority(value as 'low' | 'medium' | 'high')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('priority.low')}</SelectItem>
                      <SelectItem value="medium">{t('priority.medium')}</SelectItem>
                      <SelectItem value="high">{t('priority.high')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Assign Agent - Manager/Admin only */}
              {canAssign && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    {t('feedback.assignAgent')}
                  </label>
                  <Select
                    value={assignedAgent}
                    onValueChange={(value) => setAssignedAgent(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isAr ? 'اختر موظفاً...' : 'Select agent...'} />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.firstName} {agent.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button className="w-full">{t('common.save')}</Button>
            </CardContent>
          </Card>

          {/* Notes Section - Agents can add notes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <StickyNote className="w-4 h-4" />
                  {t('feedback.notes')}
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                >
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
                <p className="text-sm text-gray-400 dark:text-gray-500 italic text-center py-4">
                  {isAr ? 'لا توجد ملاحظات بعد' : 'No notes yet. Add the first note.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {notes.map((note, i) => (
                    <div key={i} className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">{note.author}</span>
                        <span className="text-xs text-gray-400">{note.time}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{note.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('feedback.timeline')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTimelineActivities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      {index < mockTimelineActivities.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {activity.userName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
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
                    {feedback.customerName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {feedback.customerName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {feedback.customerEmail}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'تاريخ الإنشاء' : 'Created'}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(feedback.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attributes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{isAr ? 'خصائص الشكوى' : 'Attributes'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: TrendingUp, label: t('feedback.sentiment'), value: <Badge className={cn('capitalize', sentimentColors[feedback.sentiment])}>{t(`sentiment.${feedback.sentiment}`)}</Badge> },
                { icon: Smile, label: t('feedback.emotion'), value: <span className="text-sm font-medium capitalize">{feedback.emotion}</span> },
                { icon: Tag, label: t('feedback.category'), value: <span className="text-sm font-medium">{feedback.category}</span> },
                { icon: MessageSquare, label: t('feedback.channel'), value: <span className="text-sm font-medium">{feedback.channel}</span> },
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