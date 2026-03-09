import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';

import { IntegrationSettings } from './IntegrationSettings';

import { User, Database } from 'lucide-react';

export function Settings() {

  const { t } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'integrations'>('profile');

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {t('nav.settings')}
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your account and system preferences
        </p>
      </div>


      {/* ========================= */}
      {/* INTEGRATIONS FULL PAGE */}
      {/* ========================= */}

      {activeTab === 'integrations' && user?.role === 'companyAdmin' ? (

        <div className="space-y-6">

          {/* Back Button */}
          <Button
            variant="outline"
            onClick={() => setActiveTab('profile')}
            className="w-fit"
          >
            ← Back to Settings
          </Button>

          <IntegrationSettings />

        </div>

      ) : (

        /* ========================= */
        /* SETTINGS LAYOUT */
        /* ========================= */

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">

          {/* LEFT NAVIGATION */}
          <Card className="h-fit">

            <CardHeader>
              <CardTitle className="text-base">
                Settings
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">

              {/* PROFILE */}
              <Button
                variant="ghost"
                onClick={() => setActiveTab('profile')}
                className={`w-full justify-start gap-3 rounded-lg px-3 py-2 transition
                ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white hover:bg-blue-600'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </Button>


              {/* INTEGRATIONS (Company Admin only) */}
              {user?.role === 'companyAdmin' && (

                <Button
                  variant="ghost"
                  onClick={() => setActiveTab('integrations')}
                  className={`w-full justify-start gap-3 rounded-lg px-3 py-2 transition
                  ${
                    activeTab === 'integrations'
                      ? 'bg-blue-600 text-white hover:bg-blue-600'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  Integrations
                </Button>

              )}

            </CardContent>

          </Card>


          {/* RIGHT CONTENT */}
          <div className="space-y-6">

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (

              <Card>

                <CardHeader>

                  <CardTitle>
                    Profile Settings
                  </CardTitle>

                  <CardDescription>
                    Update your personal information and preferences
                  </CardDescription>

                </CardHeader>


                <CardContent className="space-y-6">

                  {/* Avatar */}
                  <div className="flex items-center gap-4">

                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>

                    <div>

                      <Button variant="outline" size="sm">
                        Change Photo
                      </Button>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        JPG, PNG or GIF. Max 2MB
                      </p>

                    </div>

                  </div>

                  <Separator />


                  {/* Name Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input placeholder="John" />
                    </div>

                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input placeholder="Doe" />
                    </div>

                  </div>


                  {/* Email */}
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                    />
                  </div>


                  <Separator />


                  {/* Buttons */}
                  <div className="flex justify-end gap-2">

                    <Button variant="outline">
                      {t('common.cancel')}
                    </Button>

                    <Button>
                      {t('common.save')}
                    </Button>

                  </div>

                </CardContent>

              </Card>

            )}

          </div>

        </div>

      )}

    </div>
  );
}