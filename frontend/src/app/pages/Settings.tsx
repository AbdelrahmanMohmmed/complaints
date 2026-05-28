import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { IntegrationSettings } from './IntegrationSettings';
import { User } from 'lucide-react';
import { request } from '../../services/api';

export function Settings() {
  const { t, language } = useLanguage();
  const { user, login } = useAuth();
  const isAr = language === 'ar';

  // Profile state
const [fName, setFName] = useState(user?.firstName || '');
const [lName, setLName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleSaveProfile = async () => {
    setProfileError('');
    setProfileSuccess('');
    if (!fName.trim() || !lName.trim() || !email.trim()) {
      setProfileError(isAr ? 'جميع الحقول مطلوبة.' : 'All fields are required.');
      return;
    }
    setProfileLoading(true);
    try {
      await request('/users/me', {
        method: 'PUT',
        body: JSON.stringify({ f_name: fName.trim(), l_name: lName.trim(), email: email.trim() }),
      });
      setProfileSuccess(isAr ? 'تم تحديث الملف الشخصي بنجاح.' : 'Profile updated successfully.');
    } catch (err: any) {
      setProfileError(err?.message || (isAr ? 'فشل تحديث الملف الشخصي.' : 'Failed to update profile.'));
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(isAr ? 'جميع حقول كلمة المرور مطلوبة.' : 'All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(isAr ? 'كلمتا المرور الجديدتان غير متطابقتين.' : 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(isAr ? 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.' : 'New password must be at least 6 characters.');
      return;
    }
    setPasswordLoading(true);
    try {
      await request('/users/me/password', {
        method: 'PUT',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      setPasswordSuccess(isAr ? 'تم تغيير كلمة المرور بنجاح.' : 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err?.message || (isAr ? 'فشل تغيير كلمة المرور.' : 'Failed to change password.'));
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {t('nav.settings')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {isAr ? 'إدارة إعدادات الحساب والتفضيلات' : 'Manage your account settings and preferences'}
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>{isAr ? 'معلومات الملف الشخصي' : 'Profile information'}</CardTitle>
          <CardDescription>{isAr ? 'تحديث معلوماتك الشخصية' : 'Update your personal information'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isAr ? 'الاسم الأول' : 'First name'}</Label>
              <Input value={fName} onChange={(e) => setFName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? 'اسم العائلة' : 'Last name'}</Label>
              <Input value={lName} onChange={(e) => setLName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{isAr ? 'البريد الإلكتروني' : 'Email'}</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {profileError && <p className="text-sm text-red-500">{profileError}</p>}
          {profileSuccess && <p className="text-sm text-green-500">{profileSuccess}</p>}

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={profileLoading}>
              {profileLoading ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : t('common.save')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle>{isAr ? 'تغيير كلمة المرور' : 'Change password'}</CardTitle>
          <CardDescription>{isAr ? 'تحديث كلمة مرور الحساب' : 'Update your account password'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{isAr ? 'كلمة المرور الحالية' : 'Current password'}</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={isAr ? 'أدخل كلمة المرور الحالية' : 'Enter current password'} />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? 'كلمة المرور الجديدة' : 'New password'}</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={isAr ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'} />
          </div>
          <div className="space-y-2">
            <Label>{isAr ? 'تأكيد كلمة المرور' : 'Confirm password'}</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm new password'} />
          </div>

          {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-green-500">{passwordSuccess}</p>}

          <div className="flex justify-end">
            <Button onClick={handleChangePassword} disabled={passwordLoading}>
              {passwordLoading ? (isAr ? 'جارٍ التحديث...' : 'Updating...') : (isAr ? 'تحديث كلمة المرور' : 'Update password')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integrations (Manager only) */}
      {user?.role === 'manager' && (
        <Card>
          <CardHeader>
            <CardTitle>{isAr ? 'التكاملات' : 'Integrations'}</CardTitle>
            <CardDescription>{isAr ? 'إدارة تكاملات الخدمات الخارجية' : 'Manage external service integrations'}</CardDescription>
          </CardHeader>
          <CardContent>
            <IntegrationSettings />
          </CardContent>
        </Card>
      )}
    </div>
  );
}