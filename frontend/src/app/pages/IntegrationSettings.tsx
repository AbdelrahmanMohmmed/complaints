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
  const { t } = useLanguage();

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
      setAddError('Please select a channel.');
      return;
    }

    if (newChannelName === 'gmail') {
      if (!newGmailUsername.trim() || !newGmailPassword.trim()) {
        setAddError('Please enter Gmail username and Gmail app password.');
        return;
      }
    } else if (!newApiKey.trim()) {
      setAddError('Please enter an API key.');
      return;
    }

    setAddError('');
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
      setAddError(err?.message || 'Failed to connect. Check your credentials.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (api_id: number) => {
    if (!confirm('Are you sure you want to remove this integration?')) return;
    setDeletingId(api_id);
    try {
      await request(`/integrations/${api_id}`, { method: 'DELETE' });
      setIntegrations(prev => prev.filter(i => i.api_id !== api_id));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete integration');
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
      alert(err?.message || 'Failed to update status');
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
            Connect external channels to receive feedback
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); setAddError(''); }}>
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
                Connect a new channel to start collecting feedback
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={newChannelName} onValueChange={setNewChannelName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter / X</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp Business</SelectItem>
                    <SelectItem value="gmail">Gmail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newChannelName === 'gmail' ? (
                <>
                  <div className="space-y-2">
                    <Label>Gmail Username</Label>
                    <Input
                      type="email"
                      placeholder="your-account@gmail.com"
                      value={newGmailUsername}
                      onChange={(e) => setNewGmailUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gmail App Password</Label>
                    <Input
                      type="password"
                      placeholder="Paste 16-character Gmail app password"
                      value={newGmailPassword}
                      onChange={(e) => setNewGmailPassword(e.target.value)}
                    />
                    <p className="text-xs text-gray-400">
                      Use a Gmail App Password (not your regular Gmail password).
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label>{t('integrations.apiKey')}</Label>
                  <Input
                    type="password"
                    placeholder="Paste your API key or Bearer token..."
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                  />
                  <p className="text-xs text-gray-400">
                    {newChannelName === 'facebook' && 'Use your Facebook Page Access Token'}
                    {newChannelName === 'twitter' && 'Use your Twitter Bearer Token (app-only)'}
                    {newChannelName === 'whatsapp' && 'Use your WhatsApp Cloud API Bearer Token'}
                  </p>
                </div>
              )}
              {addError && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {addError}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleAddIntegration} disabled={addLoading}>
                {addLoading ? 'Validating...' : 'Connect'}
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Integrations</p>
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
        <div className="text-center py-12 text-gray-500">Loading integrations...</div>
      ) : integrations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Plug className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No integrations yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Click "Add Integration" to connect your first channel
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
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Credentials</Label>
                    <Input
                      value="Configured securely"
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
                      {isActive ? 'Deactivate' : 'Reactivate'}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-2"
                      disabled={deletingId === integration.api_id}
                      onClick={() => handleDelete(integration.api_id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingId === integration.api_id ? 'Removing...' : 'Remove'}
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