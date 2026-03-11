// NOTE: Company management currently uses MOCK company data from `mockData.ts`.
// TODO: Replace `mockCompanies` with real `/api/v1/companies` CRUD endpoints.

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { mockCompanies, Company } from '../data/mockData';

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

import { Plus, Building2 } from 'lucide-react';
import { cn } from '../components/ui/utils';

export function CompanyManagement() {

  const { t } = useLanguage();

  const [companies, setCompanies] = useState<Company[]>(mockCompanies);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);


  const formatDate = (dateString: string) => {

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  };


  const toggleCompanyStatus = (id: string) => {

    setCompanies((prev) =>
      prev.map((company) =>
        company.id === id
          ? { ...company, isActive: !company.isActive }
          : company
      )
    );

  };


  const updateCompany = (updatedCompany: Company) => {

    setCompanies((prev) =>
      prev.map((c) =>
        c.id === updatedCompany.id ? updatedCompany : c
      )
    );

  };


  const deleteCompany = (id: string) => {

    setCompanies((prev) =>
      prev.filter((c) => c.id !== id)
    );

  };


  return (

    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('superadmin.companies')}
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage companies and their subscriptions
          </p>

        </div>


        {/* Add Company */}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>

          <DialogTrigger asChild>

            <Button className="gap-2">

              <Plus className="w-4 h-4" />

              Add Company

            </Button>

          </DialogTrigger>

          <DialogContent>

            <DialogHeader>

              <DialogTitle>Add New Company</DialogTitle>

              <DialogDescription>
                Register a new company to the platform
              </DialogDescription>

            </DialogHeader>

            <div className="space-y-4 py-4">

              <div className="space-y-2">

                <Label htmlFor="companyName">Company Name</Label>

                <Input
                  id="companyName"
                  placeholder="e.g., TechCorp Solutions"
                />

              </div>


              <div className="space-y-2">

                <Label htmlFor="domain">Domain</Label>

                <Select>

                  <SelectTrigger id="domain">

                    <SelectValue placeholder="Select domain..." />

                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="technology">Resturants</SelectItem>

                    <SelectItem value="healthcare">
                      Sanitary Ware
                    </SelectItem>

                  </SelectContent>

                </Select>

              </div>


              <div className="space-y-2">

                <Label htmlFor="adminEmail">Admin Email</Label>

                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="admin@company.com"
                />

              </div>

            </div>

            <div className="flex justify-end gap-2">

              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                {t('common.cancel')}
              </Button>

              <Button
                onClick={() => setIsDialogOpen(false)}
              >
                {t('common.save')}
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
                Total Companies
              </p>

              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {companies.length}
              </p>

            </div>

            <Building2 className="w-10 h-10 text-blue-600 dark:text-blue-400 opacity-20" />

          </div>

        </Card>


        <Card className="p-6">

          <div>

            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Companies
            </p>

            <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {companies.filter((c) => c.isActive).length}
            </p>

          </div>

        </Card>


        <Card className="p-6">

          <div>

            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Inactive Companies
            </p>

            <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 mt-2">
              {companies.filter((c) => !c.isActive).length}
            </p>

          </div>

        </Card>


        <Card className="p-6">

          <div>

            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Feedback
            </p>

            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {companies
                .reduce((sum, c) => sum + c.totalFeedback, 0)
                .toLocaleString()}
            </p>

          </div>

        </Card>

      </div>


      {/* Companies Table */}

      <Card>

        <div className="overflow-x-auto">

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>Company Name</TableHead>

                <TableHead className="hidden lg:table-cell">
                  Domain
                </TableHead>

                <TableHead>Status</TableHead>

                <TableHead className="hidden md:table-cell">
                  Total Feedback
                </TableHead>

                <TableHead className="hidden xl:table-cell">
                  Created
                </TableHead>

                <TableHead>{t('common.actions')}</TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {companies.map((company) => (

                <TableRow key={company.id}>

                  <TableCell>

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">

                        <Building2 className="w-5 h-5 text-white" />

                      </div>

                      <div className="font-medium text-gray-900 dark:text-white">

                        {company.name}

                      </div>

                    </div>

                  </TableCell>


                  <TableCell className="hidden lg:table-cell">

                    <Badge variant="outline">
                      {company.domain}
                    </Badge>

                  </TableCell>


                  <TableCell>

                    <div className="flex items-center gap-2">

                      <Switch
                        checked={company.isActive}
                        onCheckedChange={() =>
                          toggleCompanyStatus(company.id)
                        }
                      />

                      <Badge
                        className={cn(
                          company.isActive
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        )}
                      >
                        {company.isActive
                          ? t('common.active')
                          : t('common.inactive')}
                      </Badge>

                    </div>

                  </TableCell>


                  <TableCell className="hidden md:table-cell">

                    <div className="text-sm text-gray-900 dark:text-white">

                      {company.totalFeedback.toLocaleString()}

                    </div>

                  </TableCell>


                  <TableCell className="hidden xl:table-cell">

                    <div className="text-sm text-gray-600 dark:text-gray-400">

                      {formatDate(company.createdAt)}

                    </div>

                  </TableCell>


                  <TableCell>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingCompany(company);
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


      {/* Edit Company Modal */}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>

        <DialogContent>

          <DialogHeader>

            <DialogTitle>Edit Company</DialogTitle>

            <DialogDescription>
              Update company information
            </DialogDescription>

          </DialogHeader>


          {editingCompany && (

            <div className="space-y-4 py-4">

              <div className="space-y-2">

                <Label>Company Name</Label>

                <Input
                  defaultValue={editingCompany.name}
                  onChange={(e) =>
                    setEditingCompany({
                      ...editingCompany,
                      name: e.target.value,
                    })
                  }
                />

              </div>


              <div className="space-y-2">

                <Label>Domain</Label>

                <Select
                  defaultValue={editingCompany.domain}
                  onValueChange={(value) =>
                    setEditingCompany({
                      ...editingCompany,
                      domain: value,
                    })
                  }
                >

                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>

                    <SelectItem value="technology">
                      Resturants
                    </SelectItem>

                    <SelectItem value="healthcare">
                      Sanitary Ware
                    </SelectItem>

                  </SelectContent>

                </Select>

              </div>


              <div className="flex justify-between items-center pt-4">

                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteCompany(editingCompany.id);
                    setIsEditOpen(false);
                  }}
                >
                  Delete Company
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
                      updateCompany(editingCompany);
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