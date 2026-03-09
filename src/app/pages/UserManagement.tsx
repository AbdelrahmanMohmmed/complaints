// NOTE: User management currently relies on MOCK user data from `mockData.ts`.
// TODO: Replace `mockUsers` with real `/api/v1/users` endpoints (list/create/update).

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { mockUsers, User } from '../data/mockData';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Plus, Users as UsersIcon, UserCheck, UserX } from 'lucide-react';
import { cn } from '../components/ui/utils';

const roleColors = {
  superAdmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  companyAdmin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  manager: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  agent: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
};

export function UserManagement() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, isActive: !user.isActive } : user
      )
    );
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
            Manage users, roles, and permissions
          </p>
        </div>

        {/* Add User Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t('users.addUser')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('users.addUser')}</DialogTitle>
              <DialogDescription>
                Create a new user account with specific role and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userName">{t('common.name')}</Label>
                <Input id="userName" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userEmail">{t('common.email')}</Label>
                <Input
                  id="userEmail"
                  type="email"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userRole">{t('common.role')}</Label>
                <Select>
                  <SelectTrigger id="userRole">
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="companyAdmin">{t('role.companyAdmin')}</SelectItem>
                    <SelectItem value="manager">{t('role.manager')}</SelectItem>
                    <SelectItem value="agent">{t('role.agent')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                {t('common.save')}
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
                Total Users
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
                Active Users
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {users.filter((u) => u.isActive).length}
              </p>
            </div>
            <UserCheck className="w-10 h-10 text-green-600 dark:text-green-400 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Inactive Users
              </p>
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 mt-2">
                {users.filter((u) => !u.isActive).length}
              </p>
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
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('capitalize', roleColors[user.role])}>
                      {t(`role.${user.role}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => toggleUserStatus(user.id)}
                      />
                      <Badge
                        className={cn(
                          user.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        )}
                      >
                        {user.isActive ? t('common.active') : t('common.inactive')}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      {t('common.edit')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
