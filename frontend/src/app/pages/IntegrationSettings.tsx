import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { request } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import {
  Plus, Plug, MessageSquare, Mail, Phone, Globe, CheckCircle,
  XCircle, Trash2, RefreshCw, Twitter, Facebook,
} from 'lucide-react';
import { cn } from '../components/ui/utils';

interface BackendIntegration {
  api_id: number;
  channel_name: string;
  api_base_url: string;
  status: string;
}

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  twitter: Twitter,
  whatsapp: MessageSquare,
  gmail: Mail,
  email: Mail,
  phone: Phone,
  web: Globe,
};

const channelColors: Record<string, string> = {
  facebook: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  twitter: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
  whatsapp: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  gmail: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  email: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  phone: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  web: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

export function IntegrationSettings() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';

  const [integrations, setIntegrations] = useState<BackendIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Add form state
  const [newChannelName, setNewChannelName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [newGmailUsername, setNewGmailUsername] = useState('');
  const [newGmailPassword, setNewGmailPassword] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [scrapeUsername, setScrapeUsername] = useState('');
  const [scrapeMaxPosts, setScrapeMaxPosts] = useState('5');
  const [scrapeScrolls, setScrapeScrolls] = useState('2');
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeMessage, setScrapeMessage] = useState('');

  // Delete state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const data = await request<BackendIntegration[]>('/integrations/');
      setIntegrations(data);
    } catch (err: any) {
      console.error('Failed to fetch integrations', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIntegration = async () => {
    if (!newChannelName) {
      setAddError(isAr ? 'يرجى اختيار قناة.' : 'Please select a channel.');
      return;
    }

    if (newChannelName === 'gmail') {
      if (!newGmailUsername.trim() || !newGmailPassword.trim()) {
        setAddError(isAr ? 'يرجى إدخال اسم مستخدم Gmail وكلمة مرور التطبيق.' : 'Please enter Gmail username and Gmail app password.');
        return;
      }
    } else if (!newApiKey.trim()) {
      setAddError(isAr ? 'يرجى إدخال مفتاح API.' : 'Please enter an API key.');
      return;
    }

    setAddError('');
    setScrapeMessage('');
    setAddLoading(true);
    try {
      const payload =
        newChannelName === 'gmail'
          ? {
              channel_name: newChannelName,
              gmail_username: newGmailUsername.trim(),
              gmail_password: newGmailPassword.trim(),
            }
          : {
              channel_name: newChannelName,
              api_key: newApiKey.trim(),
            };

      const created = await request<BackendIntegration>('/integrations/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setIntegrations(prev => [...prev, created]);
      setIsDialogOpen(false);
      setNewChannelName('');
      setNewApiKey('');
      setNewGmailUsername('');
      setNewGmailPassword('');
    } catch (err: any) {
      setAddError(err?.message || (isAr ? 'فشل الاتصال. تحقق من بيانات الاعتماد.' : 'Failed to connect. Check your credentials.'));
    } finally {
      setAddLoading(false);
    }
  };

  const handleAutoFacebook = async () => {
    setAddError('');
    setScrapeMessage('');
    setAutoLoading(true);
    try {
      const created = await request<BackendIntegration>('/integrations/facebook/auto', {
        method: 'POST',
      });
      setIntegrations(prev => [...prev, created]);
      setIsDialogOpen(false);
      setNewChannelName('');
      setNewApiKey('');
      setNewGmailUsername('');
      setNewGmailPassword('');
      setScrapeUsername('');
      setScrapeMaxPosts('5');
      setScrapeScrolls('2');
    } catch (err: any) {
      setAddError(err?.message || (isAr ? 'فشل الاتصال. تحقق من بيانات الاعتماد.' : 'Failed to connect. Check your credentials.'));
    } finally {
      setAutoLoading(false);
    }
  };

  const handleScrapeTwitter = async () => {
    if (!scrapeUsername.trim()) {
      setAddError(isAr ? 'يرجى إدخال حساب تويتر.' : 'Please enter a Twitter account.');
      return;
    }

    const maxPosts = Number(scrapeMaxPosts);
    const scrollCount = Number(scrapeScrolls);

    if (!Number.isFinite(maxPosts) || maxPosts < 1) {
      setAddError(isAr ? 'عدد المنشورات غير صالح.' : 'Invalid number of posts.');
      return;
    }

    if (!Number.isFinite(scrollCount) || scrollCount < 0) {
      setAddError(isAr ? 'عدد التمريرات غير صالح.' : 'Invalid number of scrolls.');
      return;
    }

    setAddError('');
    setScrapeMessage('');
    setScrapeLoading(true);
    try {
      const result = await request<{ count: number }>('/integrations/twitter/scrape', {
        method: 'POST',
        body: JSON.stringify({
          username: scrapeUsername.trim(),
          max_posts: maxPosts,
          scroll_count: scrollCount,
        }),
      });
      setScrapeMessage(
        isAr
          ? `تم جلب ${result.count} رد/ردود بنجاح.`
          : `Scraped ${result.count} replies successfully.`
      );
    } catch (err: any) {
      setAddError(err?.message || (isAr ? 'فشل جلب الردود.' : 'Failed to scrape replies.'));
    } finally {
      setScrapeLoading(false);
    }
  };

  const handleDelete = async (api_id: number) => {
    if (!confirm(isAr ? 'هل أنت متأكد أنك تريد إزالة هذا التكامل؟' : 'Are you sure you want to remove this integration?')) return;
    setDeletingId(api_id);
    try {
      await request(`/integrations/${api_id}`, { method: 'DELETE' });
      setIntegrations(prev => prev.filter(i => i.api_id !== api_id));
    } catch (err: any) {
      alert(err?.message || (isAr ? 'فشل حذف التكامل' : 'Failed to delete integration'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (integration: BackendIntegration) => {
    const newStatus = integration.status === 'active' ? 'expired' : 'active';
    try {
      const updated = await request<BackendIntegration>(`/integrations/${integration.api_id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setIntegrations(prev => prev.map(i => i.api_id === updated.api_id ? updated : i));
    } catch (err: any) {
      alert(err?.message || (isAr ? 'فشل تحديث الحالة' : 'Failed to update status'));
    }
  };

  const activeCount = integrations.filter(i => i.status === 'active').length;
  const expiredCount = integrations.filter(i => i.status !== 'active').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('integrations.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isAr ? 'ربط القنوات الخارجية لاستقبال التعليقات' : 'Connect external channels to receive feedback'}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); setAddError(''); setScrapeMessage(''); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t('integrations.addIntegration')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('integrations.addIntegration')}</DialogTitle>
              <DialogDescription>
                {isAr ? 'اربط قناة جديدة لبدء جمع التعليقات' : 'Connect a new channel to start collecting feedback'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{isAr ? 'القناة' : 'Channel'}</Label>
                <Select value={newChannelName} onValueChange={setNewChannelName}>
                  <SelectTrigger>
                    <SelectValue placeholder={isAr ? 'اختر قناة...' : 'Select channel...'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">{isAr ? 'فيسبوك' : 'Facebook'}</SelectItem>
                    <SelectItem value="twitter">{isAr ? 'تويتر / X' : 'Twitter / X'}</SelectItem>
                    <SelectItem value="whatsapp">{isAr ? 'واتساب للأعمال' : 'WhatsApp Business'}</SelectItem>
                    <SelectItem value="gmail">Gmail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newChannelName === 'gmail' ? (
                <>
                  <div className="space-y-2">
                    <Label>{isAr ? 'اسم مستخدم Gmail' : 'Gmail username'}</Label>
                    <Input
                      type="email"
                      placeholder="your-account@gmail.com"
                      value={newGmailUsername}
                      onChange={(e) => setNewGmailUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? 'كلمة مرور تطبيق Gmail' : 'Gmail app password'}</Label>
                    <Input
                      type="password"
                      placeholder={isAr ? 'الصق كلمة مرور تطبيق Gmail (16 حرفا)' : 'Paste 16-character Gmail app password'}
                      value={newGmailPassword}
                      onChange={(e) => setNewGmailPassword(e.target.value)}
                    />
                    <p className="text-xs text-gray-400">
                      {isAr ? 'استخدم كلمة مرور تطبيق Gmail (وليس كلمة مرور Gmail العادية).' : 'Use a Gmail App Password (not your regular Gmail password).'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label>{t('integrations.apiKey')}</Label>
                  <Input
                    type="password"
                    placeholder={isAr ? 'الصق مفتاح API أو رمز Bearer...' : 'Paste your API key or Bearer token...'}
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                  />
                  <p className="text-xs text-gray-400">
                    {newChannelName === 'facebook' && (isAr ? 'استخدم رمز وصول صفحة فيسبوك' : 'Use your Facebook Page Access Token')}
                    {newChannelName === 'twitter' && (isAr ? 'استخدم رمز Bearer لتويتر (تطبيق فقط)' : 'Use your Twitter Bearer Token (app-only)')}
                    {newChannelName === 'whatsapp' && (isAr ? 'استخدم رمز Bearer لـ WhatsApp Cloud API' : 'Use your WhatsApp Cloud API Bearer Token')}
                  </p>
                </div>
              )}
              {newChannelName === 'twitter' && (
                <div className="space-y-3">
                  <Label className="text-sm text-gray-600 dark:text-gray-400">
                    {isAr ? 'إعدادات السحب' : 'Scrape settings'}
                  </Label>
                  <div className="space-y-2">
                    <Label>{isAr ? 'الحساب' : 'Account'}</Label>
                    <Input
                      type="text"
                      placeholder={isAr ? 'مثل: FoodHub' : 'e.g. FoodHub'}
                      value={scrapeUsername}
                      onChange={(e) => setScrapeUsername(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>{isAr ? 'عدد المنشورات' : 'Posts count'}</Label>
                      <Input
                        type="number"
                        min={1}
                        value={scrapeMaxPosts}
                        onChange={(e) => setScrapeMaxPosts(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{isAr ? 'عدد التمريرات' : 'Scrolls count'}</Label>
                      <Input
                        type="number"
                        min={0}
                        value={scrapeScrolls}
                        onChange={(e) => setScrapeScrolls(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
              {addError && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {addError}
                </p>
              )}
              {scrapeMessage && (
                <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  {scrapeMessage}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              {newChannelName === 'facebook' && (
                <Button variant="outline" onClick={handleAutoFacebook} disabled={autoLoading}>
                  {autoLoading ? (isAr ? 'جارٍ الربط...' : 'Connecting...') : (isAr ? 'ربط تلقائي' : 'Auto connect')}
                </Button>
              )}
              {newChannelName === 'twitter' && (
                <Button variant="outline" onClick={handleScrapeTwitter} disabled={scrapeLoading}>
                  {scrapeLoading ? (isAr ? 'جارٍ السحب...' : 'Scraping...') : (isAr ? 'سحب' : 'Scrape')}
                </Button>
              )}
              <Button onClick={handleAddIntegration} disabled={addLoading}>
                {addLoading ? (isAr ? 'جارٍ التحقق...' : 'Validating...') : (isAr ? 'اتصال' : 'Connect')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isAr ? 'إجمالي التكاملات' : 'Total integrations'}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{integrations.length}</p>
            </div>
            <Plug className="w-10 h-10 text-blue-600 dark:text-blue-400 opacity-20" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('integrations.connected')}</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{activeCount}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400 opacity-20" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('integrations.disconnected')}</p>
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 mt-2">{expiredCount}</p>
            </div>
            <XCircle className="w-10 h-10 text-gray-600 dark:text-gray-400 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Integrations Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">
          {isAr ? 'جارٍ تحميل التكاملات...' : 'Loading integrations...'}
        </div>
      ) : integrations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Plug className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {isAr ? 'لا توجد تكاملات بعد' : 'No integrations yet'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {isAr ? 'اضغط "إضافة تكامل" لربط قناتك الاولى' : 'Click "Add Integration" to connect your first channel'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {integrations.map((integration) => {
            const Icon = channelIcons[integration.channel_name] || Plug;
            const isActive = integration.status === 'active';
            const iconColor = channelColors[integration.channel_name] || channelColors.web;

            return (
              <Card key={integration.api_id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', iconColor)}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">{integration.channel_name}</CardTitle>
                        <CardDescription className="text-xs truncate max-w-[180px]">
                          {integration.api_base_url}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={cn(
                      isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    )}>
                      {isActive ? t('integrations.connected') : t('integrations.disconnected')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600 dark:text-gray-400">
                      {isAr ? 'بيانات الاعتماد' : 'Credentials'}
                    </Label>
                    <Input
                      value={isAr ? 'تم الإعداد بشكل آمن' : 'Configured securely'}
                      type="text"
                      readOnly
                      className="bg-gray-50 dark:bg-gray-900 text-xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => handleToggleStatus(integration)}
                    >
                      <RefreshCw className="w-4 h-4" />
                      {isActive ? (isAr ? 'إلغاء التفعيل' : 'Deactivate') : (isAr ? 'إعادة التفعيل' : 'Reactivate')}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-2"
                      disabled={deletingId === integration.api_id}
                      onClick={() => handleDelete(integration.api_id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingId === integration.api_id
                        ? (isAr ? 'جارٍ الإزالة...' : 'Removing...')
                        : (isAr ? 'إزالة' : 'Remove')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}