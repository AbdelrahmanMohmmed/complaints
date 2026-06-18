import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  createDomain,
  deleteDomain,
  listDomains,
  updateDomain,
  type DomainRecord,
} from '../../services/domainService';

import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

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
import { Plus, Building2, TrendingUp, Layers } from 'lucide-react';

export function DomainManagement() {
  const { t } = useLanguage();

  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDomainName, setNewDomainName] = useState('');
  const [savingCreate, setSavingCreate] = useState(false);

  const [editingDomain, setEditingDomain] = useState<DomainRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDomains = async () => {
      try {
        const data = await listDomains();
        if (!active) return;
        setDomains(data);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load domains');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDomains();

    return () => {
      active = false;
    };
  }, []);

  const totalCompanies = domains.reduce((sum, domain) => sum + domain.company_count, 0);
  const totalFeedback = domains.reduce((sum, domain) => sum + domain.feedback_count, 0);

  const handleCreate = async () => {
    const domainName = newDomainName.trim();
    if (!domainName) return;

    setSavingCreate(true);
    setError('');
    try {
      const created = await createDomain({ domain_name: domainName });
      setDomains((prev) => [...prev, created].sort((left, right) => left.domain_name.localeCompare(right.domain_name)));
      setNewDomainName('');
      setIsCreateOpen(false);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create domain');
    } finally {
      setSavingCreate(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingDomain) return;

    const domainName = editName.trim();
    if (!domainName) return;

    setSavingEdit(true);
    setError('');
    try {
      const updated = await updateDomain(editingDomain.domain_id, { domain_name: domainName });
      setDomains((prev) => prev.map((domain) => (domain.domain_id === updated.domain_id ? updated : domain)).sort((left, right) => left.domain_name.localeCompare(right.domain_name)));
      setEditingDomain(null);
      setEditName('');
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update domain');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (domainId: number) => {
    const confirmed = window.confirm('Delete this domain?');
    if (!confirmed) return;

    setError('');
    try {
      await deleteDomain(domainId);
      setDomains((prev) => prev.filter((domain) => domain.domain_id !== domainId));
      if (editingDomain?.domain_id === domainId) {
        setEditingDomain(null);
        setEditName('');
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete domain');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('superadmin.domains')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage business domains backed by the FastAPI database.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Domain</DialogTitle>
              <DialogDescription>
                Create a domain record in the backend so signup and admin pages can use it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="domain-name">Domain Name</Label>
                <Input
                  id="domain-name"
                  placeholder="Technology"
                  value={newDomainName}
                  onChange={(event) => setNewDomainName(event.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleCreate} disabled={savingCreate}>
                {savingCreate ? 'Saving...' : t('common.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 p-4">
          {error}
        </Card>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('superadmin.totalDomains')}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {domains.length}
              </p>
            </div>
            <Layers className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('superadmin.totalCompanies')}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {totalCompanies}
              </p>
            </div>
            <Building2 className="w-12 h-12 text-purple-600 dark:text-purple-400 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                إجمالي التعليقات
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {totalFeedback.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-600 dark:text-green-400 opacity-20" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain Name</TableHead>
                <TableHead>Companies</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    Loading domains...
                  </TableCell>
                </TableRow>
              ) : domains.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No domains found.
                  </TableCell>
                </TableRow>
              ) : (
                domains.map((domain) => (
                  <TableRow key={domain.domain_id}>
                    <TableCell>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {domain.domain_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {domain.company_count} companies
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {domain.feedback_count.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingDomain(domain);
                            setEditName(domain.domain_name);
                          }}
                        >
                          {t('common.edit')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(domain.domain_id)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={Boolean(editingDomain)} onOpenChange={(open) => {
        if (!open) {
          setEditingDomain(null);
          setEditName('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Domain</DialogTitle>
            <DialogDescription>
              Update the domain name in the backend.
            </DialogDescription>
          </DialogHeader>
          {editingDomain ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-domain-name">Domain Name</Label>
                <Input
                  id="edit-domain-name"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                />
              </div>
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(editingDomain.domain_id)}
                >
                  Delete Domain
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingDomain(null);
                      setEditName('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={savingEdit}>
                    {savingEdit ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}