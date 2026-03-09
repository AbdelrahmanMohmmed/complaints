// NOTE: Integration settings use MOCK integration records from `mockData.ts`.
// TODO: Replace `mockIntegrations` with real `/api/v1/integrations` endpoints.

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { mockIntegrations, Integration } from '../data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Plus,
  Plug,
  MessageSquare,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  XCircle,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { cn } from '../components/ui/utils';

const integrationIcons = {
  messaging: MessageSquare,
  email: Mail,
  phone: Phone,
  web: Globe,
};

export function IntegrationSettings() {
  const { t } = useLanguage();
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
  };

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

        {/* Add Integration Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                Add a new integration channel to collect feedback
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="integrationType">Integration Type</Label>
                <Select>
                  <SelectTrigger id="integrationType">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="messaging">Messaging (WhatsApp, Telegram)</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone System</SelectItem>
                    <SelectItem value="web">Web Widget</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="integrationName">Integration Name</Label>
                <Input
                  id="integrationName"
                  placeholder="e.g., WhatsApp Business"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">{t('integrations.apiKey')}</Label>
                <Input
                  id="apiKey"
                  placeholder="Enter API key..."
                  type="password"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                Connect
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Integrations
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {integrations.length}
              </p>
            </div>
            <Plug className="w-10 h-10 text-blue-600 dark:text-blue-400 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('integrations.connected')}
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {integrations.filter((i) => i.status === 'connected').length}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('integrations.disconnected')}
              </p>
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 mt-2">
                {integrations.filter((i) => i.status === 'disconnected').length}
              </p>
            </div>
            <XCircle className="w-10 h-10 text-gray-600 dark:text-gray-400 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Channels
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {new Set(integrations.map(i => i.type)).size}
            </p>
          </div>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const Icon = integrationIcons[integration.type as keyof typeof integrationIcons];
          const isConnected = integration.status === 'connected';

          return (
            <Card key={integration.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        isConnected
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-gray-100 dark:bg-gray-800'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-6 h-6',
                          isConnected
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-400'
                        )}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription className="capitalize">
                        {integration.type}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={cn(
                      isConnected
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                    )}
                  >
                    {isConnected ? t('integrations.connected') : t('integrations.disconnected')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {integration.apiKey && (
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-600 dark:text-gray-400">
                      {t('integrations.apiKey')}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={integration.apiKey}
                        type="password"
                        readOnly
                        className="bg-gray-50 dark:bg-gray-900"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyApiKey(integration.apiKey!)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {integration.lastSync && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Last Sync:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(integration.lastSync)}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {isConnected ? (
                    <>
                      <Button variant="outline" className="flex-1 gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Sync Now
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Configure
                      </Button>
                    </>
                  ) : (
                    <Button className="flex-1">
                      <Plug className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
