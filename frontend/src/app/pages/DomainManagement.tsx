// NOTE: Domain management currently uses MOCK domain data from `mockData.ts`.
// TODO: Replace `mockDomains` with real `/api/v1/domains` CRUD endpoints.

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { mockDomains, Domain } from '../data/mockData';

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
import { Textarea } from '../components/ui/textarea';

import { Plus, Building2, TrendingUp, Layers } from 'lucide-react';

export function DomainManagement() {

  const { t } = useLanguage();

  const [domains, setDomains] = useState<Domain[]>(mockDomains);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  const updateDomain = (updatedDomain: Domain) => {

    setDomains((prev) =>
      prev.map((d) => (d.id === updatedDomain.id ? updatedDomain : d))
    );

  };


  const deleteDomain = (id: string) => {

    setDomains((prev) => prev.filter((d) => d.id !== id));

  };


  return (

    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('superadmin.domains')}
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage business domains and categories
          </p>

        </div>


        {/* Add Domain */}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>

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
                Create a new business domain for companies to subscribe to
              </DialogDescription>

            </DialogHeader>

            <div className="space-y-4 py-4">

              <div className="space-y-2">

                <Label htmlFor="name">Domain Name</Label>

                <Input id="name" placeholder="مثال: التقنية" />

              </div>

              <div className="space-y-2">

                <Label htmlFor="description">Description</Label>

                <Textarea
                  id="description"
                  placeholder="Describe the domain..."
                  rows={3}
                />

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
                {domains.reduce((sum, d) => sum + d.companies, 0)}
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
                {domains
                  .reduce((sum, d) => sum + d.totalFeedback, 0)
                  .toLocaleString()}
              </p>

            </div>

            <TrendingUp className="w-12 h-12 text-green-600 dark:text-green-400 opacity-20" />

          </div>

        </Card>

      </div>


      {/* Domains Table */}

      <Card>

        <div className="overflow-x-auto">

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>Domain Name</TableHead>

                <TableHead className="hidden md:table-cell">
                  Description
                </TableHead>

                <TableHead>Companies</TableHead>

                <TableHead className="hidden lg:table-cell">
                  إجمالي التعليقات
                </TableHead>

                <TableHead className="hidden sm:table-cell">
                  Created
                </TableHead>

                <TableHead>{t('common.actions')}</TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {domains.map((domain) => (

                <TableRow key={domain.id}>

                  <TableCell>

                    <div className="font-medium text-gray-900 dark:text-white">
                      {domain.name}
                    </div>

                  </TableCell>

                  <TableCell className="hidden md:table-cell max-w-sm">

                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {domain.description}
                    </div>

                  </TableCell>

                  <TableCell>

                    <Badge variant="secondary">
                      {domain.companies} companies
                    </Badge>

                  </TableCell>

                  <TableCell className="hidden lg:table-cell">

                    <div className="text-sm text-gray-900 dark:text-white">
                      {domain.totalFeedback.toLocaleString()}
                    </div>

                  </TableCell>

                  <TableCell className="hidden sm:table-cell">

                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(domain.createdAt)}
                    </div>

                  </TableCell>

                  <TableCell>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingDomain(domain);
                        setIsEditOpen(true);
                      }}
                    >
                      {t('common.edit')}
                    </Button>

                  </TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        </div>

      </Card>


      {/* Edit Domain Modal */}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>

        <DialogContent>

          <DialogHeader>

            <DialogTitle>Edit Domain</DialogTitle>

            <DialogDescription>
              Update domain information
            </DialogDescription>

          </DialogHeader>

          {editingDomain && (

            <div className="space-y-4 py-4">

              <div className="space-y-2">

                <Label>Domain Name</Label>

                <Input
                  defaultValue={editingDomain.name}
                  onChange={(e) =>
                    setEditingDomain({
                      ...editingDomain,
                      name: e.target.value,
                    })
                  }
                />

              </div>

              <div className="space-y-2">

                <Label>Description</Label>

                <Textarea
                  rows={3}
                  defaultValue={editingDomain.description}
                  onChange={(e) =>
                    setEditingDomain({
                      ...editingDomain,
                      description: e.target.value,
                    })
                  }
                />

              </div>


              <div className="flex justify-between items-center pt-4">

                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteDomain(editingDomain.id);
                    setIsEditOpen(false);
                  }}
                >
                  Delete Domain
                </Button>


                <div className="flex gap-2">

                  <Button
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={() => {
                      updateDomain(editingDomain);
                      setIsEditOpen(false);
                    }}
                  >
                    Save
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