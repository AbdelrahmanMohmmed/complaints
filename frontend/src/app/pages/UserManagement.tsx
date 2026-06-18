import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../components/ui/select';
import { Plus, Users as UsersIcon, UserCheck, UserX } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { request } from '../../services/api';

interface BackendUser {
  user_id: number;
  f_name: string;
  l_name: string;
  email: string;
  role_id: number;
  is_active: boolean;
  created_at: string;
}

const roleMap: Record<number, string> = { 1: 'manager', 2: 'customerServiceSupervisor', 3: 'websiteConfigurator' };
const roleIdMap: Record<string, number> = { manager: 1, customerServiceSupervisor: 2, websiteConfigurator: 3 };
const roleColors: Record<string, string> = {
  manager: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  customerServiceSupervisor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  websiteConfigurator: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

export function UserManagement() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Add user form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ f_name: '', l_name: '', email: '', password: '', role_id: '2' });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Edit user state
  const [editingUser, setEditingUser] = useState<BackendUser | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await request<BackendUser[]>('/users/');
      setUsers(data);
    } catch (err: any) {
      setError(err?.message || (isAr ? 'فشل تحميل المستخدمين' : 'Failed to load users'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    setAddError('');
    setAddLoading(true);
    try {
      const created = await request<BackendUser>('/users/', {
        method: 'POST',
        body: JSON.stringify({
          f_name: newUser.f_name.trim(),
          l_name: newUser.l_name.trim(),
          email: newUser.email.trim(),
          password: newUser.password,
          role_id: Number(newUser.role_id),
        }),
      });
      setUsers((prev) => [...prev, created]);
      setIsDialogOpen(false);
      setNewUser({ f_name: '', l_name: '', email: '', password: '', role_id: '2' });
    } catch (err: any) {
      setAddError(err?.message || (isAr ? 'فشل إنشاء المستخدم' : 'Failed to create user'));
    } finally {
      setAddLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });


const toggleUserStatus = async (user_id: number) => {
  try {
    const updated = await request<BackendUser>(`/users/${user_id}/status`, { method: 'PATCH' });
    setUsers((prev) => prev.map((u) => u.user_id === user_id ? updated : u));
  } catch (err: any) {
    alert(err?.message || (isAr ? 'فشل تحديث الحالة' : 'Failed to update status'));
  }
};

const updateUser = async () => {
  if (!editingUser) return;
  try {
    const updated = await request<BackendUser>(`/users/${editingUser.user_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        f_name: editingUser.f_name,
        l_name: editingUser.l_name,
        email: editingUser.email,
        role_id: editingUser.role_id,
      }),
    });
    setUsers((prev) => prev.map((u) => u.user_id === updated.user_id ? updated : u));
    setIsEditOpen(false);
  } catch (err: any) {
    alert(err?.message || (isAr ? 'فشل تحديث المستخدم' : 'Failed to update user'));
  }
};

  const deleteUser = async (user_id: number) => {
    try {
      await request(`/users/${user_id}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((user) => user.user_id !== user_id));
    } catch (err: any) {
      alert(err?.message || (isAr ? 'فشل حذف المستخدم' : 'Failed to delete user'));
    }
  };

  return (

    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('users.title')}
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isAr ? 'إدارة المستخدمين والأدوار والصلاحيات' : 'Manage users, roles, and permissions'}
          </p>

        </div>


        {/* Add User */}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>

          <DialogTrigger asChild>

            <Button className="gap-2">

              <Plus className="w-4 h-4" />

              {t('users.addUser')}

            </Button>

          </DialogTrigger>

          <DialogContent className="bg-white dark:bg-zinc-950">

            <DialogHeader>

              <DialogTitle>{t('users.addUser')}</DialogTitle>

              <DialogDescription>
                {isAr ? 'أنشئ حساب مستخدم جديد مع تحديد الدور والصلاحيات' : 'Create a new user account with specific role and permissions'}
              </DialogDescription>

            </DialogHeader>

            <div className="space-y-4 py-4">
  <div className="grid grid-cols-2 gap-3">
    <div className="space-y-2">
      <Label htmlFor="userFirstName">{isAr ? 'الاسم الأول' : 'First name'}</Label>
      <Input
        id="userFirstName"
        placeholder={isAr ? 'علي' : 'Ali'}
        value={newUser.f_name}
        onChange={(e) => setNewUser({ ...newUser, f_name: e.target.value })}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="userLastName">{isAr ? 'اسم العائلة' : 'Last name'}</Label>
      <Input
        id="userLastName"
        placeholder={isAr ? 'أحمد' : 'Ahmed'}
        value={newUser.l_name}
        onChange={(e) => setNewUser({ ...newUser, l_name: e.target.value })}
      />
    </div>
  </div>

  <div className="space-y-2">
    <Label htmlFor="userEmail">{t('common.email')}</Label>
    <Input
      id="userEmail"
      type="email"
      placeholder="user@example.com"
      value={newUser.email}
      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="userPassword">{isAr ? 'كلمة المرور' : 'Password'}</Label>
    <Input
      id="userPassword"
      type="password"
      placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter password'}
      value={newUser.password}
      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="userRole">{t('common.role')}</Label>
    <Select
      value={newUser.role_id}
      onValueChange={(v) => setNewUser({ ...newUser, role_id: v })}
    >
      <SelectTrigger id="userRole">
        <SelectValue placeholder={isAr ? 'اختر الدور...' : 'Select role...'} />
      </SelectTrigger>
      <SelectContent>
        {/* <SelectItem value="2">{t('role.manager')}</SelectItem> */}
        <SelectItem value="2">{t('role.customerServiceSupervisor')}</SelectItem>
        <SelectItem value="3">{t('role.websiteConfigurator')}</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {addError && <p className="text-sm text-red-500">{addError}</p>}
</div>

<div className="flex justify-end gap-2">
  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
    {t('common.cancel')}
  </Button>
  <Button onClick={handleAddUser} disabled={addLoading}>
    {addLoading ? (isAr ? 'جارٍ الإنشاء...' : 'Creating...') : t('common.save')}
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
                {isAr ? 'إجمالي المستخدمين' : 'Total users'}
              </p>

              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {users.length}
              </p>

            </div>

            <UsersIcon className="w-10 h-10 text-blue-600 dark:text-blue-400 opacity-20" />

          </div>

        </Card>

        <Card className="p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isAr ? 'المستخدمون النشطون' : 'Active users'}
              </p>

              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {users.filter((u) => u.is_active).length}
              </p>

            </div>

            <UserCheck className="w-10 h-10 text-green-600 dark:text-green-400 opacity-20" />

          </div>

        </Card>

        <Card className="p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isAr ? 'المستخدمون غير النشطين' : 'Inactive users'}
              </p>

              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 mt-2">
                {users.filter((u) => !u.is_active).length}             </p>

            </div>

            <UserX className="w-10 h-10 text-gray-600 dark:text-gray-400 opacity-20" />

          </div>

        </Card>

      </div>


      {/* Users Table */}

      <Card>

        <div className="overflow-x-auto">

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>{t('common.name')}</TableHead>

                <TableHead className="hidden md:table-cell">{t('common.email')}</TableHead>

                <TableHead>{t('common.role')}</TableHead>

                <TableHead>{t('common.status')}</TableHead>

                <TableHead className="hidden lg:table-cell">{t('common.date')}</TableHead>

                <TableHead>{t('common.actions')}</TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {users.map((user) => (

                  <TableRow key={user.user_id}>
                  <TableCell>

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">

                        <span className="text-white font-medium text-sm">

                            {user.f_name[0]}{user.l_name[0]}
                        </span>

                      </div>

                      <div className="font-medium text-gray-900 dark:text-white">

                          {user.f_name} {user.l_name}
                      </div>

                    </div>

                  </TableCell>

                  <TableCell className="hidden md:table-cell">

                    <div className="text-sm text-gray-600 dark:text-gray-400">

                      {user.email}

                    </div>

                  </TableCell>

                  <TableCell>

                    <Badge className={cn('capitalize', roleColors[roleMap[user.role_id]])}>
                      {t(`role.${roleMap[user.role_id]}`)}
                    </Badge>

                  </TableCell>

<TableCell>
  <div className={cn("flex items-center gap-2", isAr && "flex-row-reverse")}>
    {/* Remove the scale-x-[-1] wrapper */}
    <Switch
      checked={user.is_active}
      onCheckedChange={() => toggleUserStatus(user.user_id)}
      className={isAr ? "[&>span]:data-[state=checked]:translate-x-[-14px]" : ""}
    />
    <Badge className={cn(
      "whitespace-nowrap",
      user.is_active
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    )}>
      {user.is_active ? t('common.active') : t('common.inactive')}
    </Badge>
  </div>
</TableCell>

                    <TableCell className="hidden lg:table-cell">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(user.created_at)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => { setEditingUser(user); setIsEditOpen(true); }}>
                        {t('common.edit')}
                      </Button>
                    </TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        </div>

      </Card>


      {/* Edit User Dialog */}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>

        <DialogContent className="bg-white dark:bg-zinc-950">

          <DialogHeader>

            <DialogTitle>{isAr ? 'تعديل المستخدم' : 'Edit user'}</DialogTitle>

            <DialogDescription>

              {isAr ? 'تحديث معلومات المستخدم' : 'Update user information'}

            </DialogDescription>

          </DialogHeader>

          {editingUser && (

            <div className="space-y-4 py-4">

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{isAr ? 'الاسم الأول' : 'First name'}</Label>
                  <Input
                    defaultValue={editingUser.f_name}
                    onChange={(e) => setEditingUser({ ...editingUser, f_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? 'اسم العائلة' : 'Last name'}</Label>
                  <Input
                    defaultValue={editingUser.l_name}
                    onChange={(e) => setEditingUser({ ...editingUser, l_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">

                <Label>{isAr ? 'البريد الإلكتروني' : 'Email'}</Label>

                <Input

                  defaultValue={editingUser.email}

                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }

                />

              </div>

              <div className="space-y-2">

                <Label>{isAr ? 'الدور' : 'Role'}</Label>

                <Select
                  defaultValue={String(editingUser.role_id)}
                  onValueChange={(v) => setEditingUser({ ...editingUser, role_id: Number(v) })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">{t('role.manager')}</SelectItem>
                    <SelectItem value="3">{t('role.websiteConfigurator')}</SelectItem>
                  </SelectContent>
                </Select>

              </div>

              <div className="flex justify-between items-center pt-4">

                <Button
                  variant="destructive"
                  onClick={() => {
                      deleteUser(editingUser.user_id);
                      setIsEditOpen(false);
                  }}
                >
                  {isAr ? 'حذف المستخدم' : 'Delete user'}
                </Button>

                <div className="flex gap-2">

                  <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </Button>

                  <Button onClick={updateUser}>
                    {t('common.save')}
                  </Button>

                </div>

              </div>

            </div>

          )}

        </DialogContent>

      </Dialog>

    </div>

  );
}