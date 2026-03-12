// NOTE: This profile page uses MOCK aggregates from `mockData.ts` to compute agent stats.
// TODO: Replace `mockFeedback` usage with real metrics from backend analytics or complaints endpoints.

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { mockFeedback } from '../data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import {
  User, Mail, Phone, Building2, CheckCircle2, Clock,
  MessageSquare, Star, Edit3, Save, X, Shield, Bell, Moon,
} from 'lucide-react';
import { cn } from '../components/ui/utils';
import { useTheme } from '../contexts/ThemeContext';

export function AgentProfile() {
  const { language, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isAr = language === 'ar';
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [notifications, setNotifications] = useState(true);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [is2FADialogOpen, setIs2FADialogOpen] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Agent's assigned feedback
  const myFeedback = mockFeedback.filter(fb => fb.assignedTo === 'agent-1' || fb.status === 'open' || fb.status === 'inProgress');
  const resolved = myFeedback.filter(fb => fb.status === 'resolved' || fb.status === 'closed').length;
  const open = myFeedback.filter(fb => fb.status === 'open').length;
  const inProgress = myFeedback.filter(fb => fb.status === 'inProgress').length;

  const stats = [
    {
      label: isAr ? 'المُسندة إليّ' : 'Assigned to Me',
      value: myFeedback.length,
      icon: MessageSquare,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: isAr ? 'مفتوح' : 'Open',
      value: open,
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: isAr ? 'قيد المعالجة' : 'In Progress',
      value: inProgress,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      label: isAr ? 'تم الحل' : 'Resolved',
      value: resolved,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
  ];

  const handleSave = () => {
    setIsEditing(false);
  };

  const initials = `${user?.firstName} ${user?.lastName}`.split(' ').map(n => n[0]).join('') || 'AG';

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          {isAr ? 'ملفي الشخصي' : 'My Profile'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          {isAr ? 'إدارة معلوماتك الشخصية وتفضيلاتك' : 'Manage your personal information and preferences'}
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-black">{initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">{firstName} {lastName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-xs">
                  {isAr ? 'موظف' : 'Agent'}
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  {isAr ? 'نشط' : 'Active'}
                </Badge>
                <Badge variant="outline" className="text-xs gap-1">
                  <Building2 className="w-3 h-3" />
                  TechCorp Solutions
                </Badge>
              </div>
            </div>

            <Button
              variant={isEditing ? 'outline' : 'default'}
              size="sm"
              className="gap-2 flex-shrink-0"
              onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? (isAr ? 'إلغاء' : 'Cancel') : (isAr ? 'تعديل' : 'Edit Profile')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-snug">{s.label}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{s.value}</p>
                </div>
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', s.bg)}>
                  <s.icon className={cn('w-4 h-4', s.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              {isAr ? 'المعلومات الشخصية' : 'Personal Information'}
            </CardTitle>
            {isEditing && (
              <Button size="sm" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white" onClick={handleSave}>
                <Save className="w-3.5 h-3.5" />
                {isAr ? 'حفظ' : 'Save Changes'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600 dark:text-gray-400">{isAr ? 'الاسم الأول' : 'First Name'}</Label>
              {isEditing ? (
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              ) : (
                <p className="text-sm font-medium text-gray-900 dark:text-white py-2">{firstName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600 dark:text-gray-400">{isAr ? 'الاسم الأخير' : 'Last Name'}</Label>
              {isEditing ? (
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              ) : (
                <p className="text-sm font-medium text-gray-900 dark:text-white py-2">{lastName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600 dark:text-gray-400">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</Label>
              <p className="text-sm font-medium text-gray-900 dark:text-white py-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {user?.email}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600 dark:text-gray-400">{isAr ? 'الشركة' : 'Company'}</Label>
              <p className="text-sm font-medium text-gray-900 dark:text-white py-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                TechCorp Solutions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      {/* <Card> */}
        {/* <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            {isAr ? 'التفضيلات' : 'Preferences'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4"> */}
          {/* Language */}
          {/* <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{isAr ? 'اللغة' : 'Language'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'تبديل بين العربية والإنجليزية' : 'Switch between Arabic and English'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleLanguage} className="gap-2">
              🌐 {language === 'ar' ? 'English' : 'العربية'}
            </Button>
          </div> */}
          <Separator />

          {/* Theme */}
          {/* <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{isAr ? 'المظهر' : 'Theme'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'تبديل بين الوضع الفاتح والداكن' : 'Toggle between light and dark mode'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme} className="gap-2">
              <Moon className="w-4 h-4" />
              {theme === 'dark' ? (isAr ? 'فاتح' : 'Light') : (isAr ? 'داكن' : 'Dark')}
            </Button>
          </div>
          <Separator /> */}

          {/* Notifications */}
          {/* <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{isAr ? 'الإشعارات' : 'Notifications'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'تنبيهات الشكاوى الجديدة' : 'Receive alerts for new assigned complaints'}</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                notifications ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
              )}
            >
              <span className={cn('inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
                notifications ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>
        </CardContent>
      </Card> */}

      {/* Security */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            {isAr ? 'الأمان' : 'Security'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{isAr ? 'كلمة المرور' : 'Password'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'آخر تغيير منذ 30 يوماً' : 'Last changed 30 days ago'}</p>
            </div>
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">{isAr ? 'تغيير' : 'Change'}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isAr ? 'تغيير كلمة المرور' : 'Change Password'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{isAr ? 'كلمة المرور الحالية' : 'Current Password'}</Label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => {
                        // TODO: Implement password change logic
                        setIsPasswordDialogOpen(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                    >
                      {isAr ? 'حفظ' : 'Save'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{isAr ? 'المصادقة الثنائية' : 'Two-Factor Auth'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {twoFactorEnabled ? (isAr ? 'مُفعّلة' : 'Enabled') : (isAr ? 'غير مُفعّلة' : 'Not enabled')}
              </p>
            </div>
            <Dialog open={is2FADialogOpen} onOpenChange={setIs2FADialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  {twoFactorEnabled ? (isAr ? 'تعطيل' : 'Disable') : (isAr ? 'تفعيل' : 'Enable')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {twoFactorEnabled ? (isAr ? 'تعطيل المصادقة الثنائية' : 'Disable Two-Factor Auth') : (isAr ? 'تفعيل المصادقة الثنائية' : 'Enable Two-Factor Auth')}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {twoFactorEnabled ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isAr ? 'هل أنت متأكد من تعطيل المصادقة الثنائية؟ هذا قد يجعل حسابك أقل أماناً.' : 'Are you sure you want to disable two-factor authentication? This will make your account less secure.'}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isAr ? 'سيتم إرسال رمز التحقق إلى بريدك الإلكتروني لتفعيل المصادقة الثنائية.' : 'A verification code will be sent to your email to enable two-factor authentication.'}
                      </p>
                      <div className="space-y-2">
                        <Label>{isAr ? 'رمز التحقق' : 'Verification Code'}</Label>
                        <Input placeholder={isAr ? 'أدخل الرمز' : 'Enter code'} />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIs2FADialogOpen(false)}>
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => {
                        // TODO: Implement 2FA toggle logic
                        setTwoFactorEnabled(!twoFactorEnabled);
                        setIs2FADialogOpen(false);
                      }}
                    >
                      {twoFactorEnabled ? (isAr ? 'تعطيل' : 'Disable') : (isAr ? 'تفعيل' : 'Enable')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
