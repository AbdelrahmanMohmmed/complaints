import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { request } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import {
  User, Mail, Building2, CheckCircle2, Clock,
  MessageSquare, Edit3, Save, X, Shield,
} from 'lucide-react';
import { cn } from '../components/ui/utils';

interface BackendUser {
  user_id: number;
  f_name: string;
  l_name: string;
  email: string;
  role_id: number;
  company_id: number;
}

interface DashboardStats {
  total_feedback: number;
  open_count: number;
  in_progress_count: number;
  resolved_count: number;
}

export function AgentProfile() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isAr = language === 'ar';

  // Profile state
  const [profile, setProfile] = useState<BackendUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Stats state
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Password state
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [me, dashStats] = await Promise.all([
          request<BackendUser>('/users/me'),
          request<DashboardStats>('/dashboard/stats'),
        ]);
        setProfile(me);
        setFirstName(me.f_name);
        setLastName(me.l_name);
        setEmail(me.email);
        setStats(dashStats);
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaveError('');
    setSaveSuccess('');
    setSaveLoading(true);
    try {
      const updated = await request<BackendUser>('/users/me', {
        method: 'PUT',
        body: JSON.stringify({ f_name: firstName, l_name: lastName, email }),
      });
      setProfile(updated);
      setSaveSuccess(isAr ? 'تم الحفظ بنجاح' : 'تم تحديث الملف الشخصي بنجاح.');
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err?.message || 'فشل تحديث الملف الشخصي.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPwdError('');
    setPwdSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError(isAr ? 'جميع الحقول مطلوبة' : 'جميع الحقول مطلوبة.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdError(isAr ? 'كلمة المرور قصيرة جداً' : 'Password must be at least 6 characters.');
      return;
    }
    setPwdLoading(true);
    try {
      await request('/users/me/password', {
        method: 'PUT',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      setPwdSuccess(isAr ? 'تم تغيير كلمة المرور بنجاح' : 'تم تغيير كلمة المرور بنجاح.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setIsPasswordDialogOpen(false), 1500);
    } catch (err: any) {
      setPwdError(err?.message || 'فشل تغيير كلمة المرور.');
    } finally {
      setPwdLoading(false);
    }
  };

  const initials = profile
    ? `${profile.f_name[0]}${profile.l_name[0]}`
    : (user?.firstName?.[0] || 'A') + (user?.lastName?.[0] || 'G');

  const statCards = [
    { label: isAr ? 'إجمالي التعليقات' : 'إجمالي التعليقات',  value: stats?.total_feedback ?? '—',    icon: MessageSquare, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: isAr ? 'مفتوح' : 'Open',                      value: stats?.open_count ?? '—',         icon: Clock,         color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20'     },
    { label: isAr ? 'قيد المعالجة' : 'In Progress',        value: stats?.in_progress_count ?? '—',  icon: Clock,         color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20'   },
    { label: isAr ? 'تم الحل' : 'Resolved',                value: stats?.resolved_count ?? '—',     icon: CheckCircle2,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

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
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-black">{initials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {profile ? `${profile.f_name} ${profile.l_name}` : '...'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 text-xs">
                  {isAr ? 'موظف' : 'Agent'}
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  {isAr ? 'نشط' : 'Active'}
                </Badge>
              </div>
            </div>
            <Button
              variant={isEditing ? 'outline' : 'default'}
              size="sm"
              className="gap-2 flex-shrink-0"
              onClick={() => { setIsEditing(!isEditing); setSaveError(''); setSaveSuccess(''); }}
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? (isAr ? 'إلغاء' : 'Cancel') : (isAr ? 'تعديل' : 'Edit Profile')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
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
              <Button
                size="sm"
                className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={handleSave}
                disabled={saveLoading}
              >
                <Save className="w-3.5 h-3.5" />
                {saveLoading ? (isAr ? 'جاري الحفظ...' : 'جارٍ الحفظ...') : (isAr ? 'حفظ' : 'Save Changes')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {saveError  && <p className="text-sm text-red-500">{saveError}</p>}
          {saveSuccess && <p className="text-sm text-green-500">{saveSuccess}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600 dark:text-gray-400">{isAr ? 'الاسم الأول' : 'First Name'}</Label>
              {isEditing
                ? <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                : <p className="text-sm font-medium text-gray-900 dark:text-white py-2">{profile?.f_name}</p>
              }
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600 dark:text-gray-400">{isAr ? 'الاسم الأخير' : 'Last Name'}</Label>
              {isEditing
                ? <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                : <p className="text-sm font-medium text-gray-900 dark:text-white py-2">{profile?.l_name}</p>
              }
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-600 dark:text-gray-400">{isAr ? 'البريد الإلكتروني' : 'Email'}</Label>
              {isEditing
                ? <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                : <p className="text-sm font-medium text-gray-900 dark:text-white py-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />{profile?.email}
                  </p>
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            {isAr ? 'الأمان' : 'Security'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{isAr ? 'كلمة المرور' : 'Password'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{isAr ? 'قم بتغيير كلمة مرورك' : 'Update your password'}</p>
            </div>
            <Dialog open={isPasswordDialogOpen} onOpenChange={(open) => { setIsPasswordDialogOpen(open); setPwdError(''); setPwdSuccess(''); }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">{isAr ? 'تغيير' : 'Change'}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isAr ? 'تغيير كلمة المرور' : 'Change Password'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {pwdError   && <p className="text-sm text-red-500">{pwdError}</p>}
                  {pwdSuccess && <p className="text-sm text-green-500">{pwdSuccess}</p>}
                  <div className="space-y-2">
                    <Label>{isAr ? 'كلمة المرور الحالية' : 'Current Password'}</Label>
                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? 'تأكيد كلمة المرور' : 'Confirm New Password'}</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={handleChangePassword}
                      disabled={pwdLoading}
                    >
                      {pwdLoading ? (isAr ? 'جاري الحفظ...' : 'جارٍ الحفظ...') : (isAr ? 'حفظ' : 'Save')}
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