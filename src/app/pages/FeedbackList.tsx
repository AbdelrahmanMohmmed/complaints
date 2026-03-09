// NOTE: This page currently reads feedback and user data from MOCK sources (`mockData.ts`).
// TODO: Replace `mockFeedback` and `mockUsers` with real `/api/v1/complaints` and `/api/v1/users` API calls.

import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { mockFeedback, mockUsers, Feedback } from '../data/mockData';
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
  const [feedbackStatuses, setFeedbackStatuses] = useState<
    Record<string, Feedback['status']>
  >({});
  const [feedbackPriorities, setFeedbackPriorities] = useState<
    Record<string, Feedback['priority']>
  >({});
  const [assignmentMap, setAssignmentMap] = useState<Record<string, string>>({});
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Agents are redirected to their own page
  if (user?.role === 'agent') {
    return <Navigate to="/app/my-feedback" replace />;
  }

  const agents = mockUsers.filter(u => u.role === 'agent');
  const isManager = user?.role === 'manager';
  const isSuperAdmin = user?.role === 'superAdmin';
  const isCompanyAdmin = user?.role === 'companyAdmin';

  const feedbackList: Feedback[] = mockFeedback.map((fb) => ({
    ...fb,
    status: feedbackStatuses[fb.id] || fb.status,
    priority: feedbackPriorities[fb.id] || fb.priority,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const getAgentName = (agentId?: string) => {
    if (!agentId) return isAr ? 'غير مُسند' : 'Unassigned';
    const agent = mockUsers.find(u => u.id === agentId);
    return agent?.name || agentId;
  };

  const openAssignDialog = (fb: Feedback, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFeedback(fb);
    setSelectedAgentId(assignmentMap[fb.id] || fb.assignedTo || '');
    setAssignDialogOpen(true);
  };

  const handleAssignConfirm = () => {
    if (selectedFeedback && selectedAgentId) {
      setAssignmentMap(prev => ({ ...prev, [selectedFeedback.id]: selectedAgentId }));
      setFeedbackStatuses(prev => ({ ...prev, [selectedFeedback.id]: 'inProgress' }));
    }
    setAssignDialogOpen(false);
    setSelectedFeedback(null);
    setSelectedAgentId('');
  };

  const handleStatusChange = (
    feedbackId: string,
    newStatus: Feedback['status'],
  ) => {
    setFeedbackStatuses((prev) => ({ ...prev, [feedbackId]: newStatus }));
  };

  const handlePriorityChange = (
    feedbackId: string,
    newPriority: Feedback['priority'],
  ) => {
    setFeedbackPriorities((prev) => ({ ...prev, [feedbackId]: newPriority }));
  };

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
                <TableHead className="font-semibold">{t('common.status')}</TableHead>
                {(isManager || isCompanyAdmin) && (
                  <TableHead className="hidden xl:table-cell font-semibold">{t('feedback.assignedTo')}</TableHead>
                )}
                {isSuperAdmin && (
                  <TableHead className="hidden xl:table-cell font-semibold">{isAr ? 'الشركة' : 'Company'}</TableHead>
                )}
                <TableHead className="hidden sm:table-cell font-semibold">{t('common.date')}</TableHead>
                {(isManager) && (
                  <TableHead className="font-semibold">{t('common.actions')}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedback.map((fb) => {
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
                      <span className="text-sm text-gray-600 dark:text-gray-400">{fb.category}</span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{fb.channel}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('capitalize text-xs', sentimentColors[fb.sentiment])}>
                        {t(`sentiment.${fb.sentiment}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <span className="text-xs capitalize text-gray-600 dark:text-gray-400">{fb.emotion}</span>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {isManager ? (
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
                    <TableCell>
                      {isManager ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Select
                            value={fb.status}
                            onValueChange={(val) =>
                              handleStatusChange(fb.id, val as Feedback['status'])
                            }
                          >
                            <SelectTrigger className="h-7 w-[120px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open" className="text-xs">{t('status.open')}</SelectItem>
                              <SelectItem value="inProgress" className="text-xs">{t('status.inProgress')}</SelectItem>
                              <SelectItem value="resolved" className="text-xs">{t('status.resolved')}</SelectItem>
                              <SelectItem value="closed" className="text-xs">{t('status.closed')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <Badge className={cn('capitalize text-xs', statusColors[fb.status])}>
                          {t(`status.${fb.status}`)}
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
                    {isManager && (
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
          ? `عرض ${filteredFeedback.length} من أصل ${mockFeedback.length} شكوى`
          : `Showing ${filteredFeedback.length} of ${mockFeedback.length} feedback items`
        }
      </div>

      {/* Assign Dialog (Manager only) */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isAr ? 'إسناد الشكوى' : 'Assign Feedback'}</DialogTitle>
            <DialogDescription>
              {isAr ? `اختر موظفاً لإسناد شكوى ${selectedFeedback?.customerName}` : `Select an agent to handle ${selectedFeedback?.customerName}'s feedback`}
            </DialogDescription>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm">
                <p className="font-semibold text-gray-900 dark:text-white">{selectedFeedback.customerName}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2">{selectedFeedback.content}</p>
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
                        <span className="text-white text-xs font-bold">{agent.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{agent.name}</p>
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