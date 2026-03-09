// NOTE: Category management uses MOCK categories from `mockData.ts` for UI demo.
// TODO: Replace `mockCategories` with real category endpoints (e.g. `/api/v1/categories`).

import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { mockCategories, Category } from '../data/mockData';
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
import { Plus, FolderTree, Tag } from 'lucide-react';

export function CategoryManagement() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t('categories.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Organize feedback into meaningful categories
          </p>
        </div>

        {/* Add Category Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {t('categories.addCategory')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('categories.addCategory')}</DialogTitle>
              <DialogDescription>
                Create a new category to classify feedback
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input id="categoryName" placeholder="e.g., Service Quality" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryDomain">Domain</Label>
                <Input
                  id="categoryDomain"
                  placeholder="e.g., Technology"
                  defaultValue="Technology"
                  disabled
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
                Total Categories
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {categories.length}
              </p>
            </div>
            <FolderTree className="w-10 h-10 text-blue-600 dark:text-blue-400 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Feedback
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {categories.reduce((sum, c) => sum + c.feedbackCount, 0).toLocaleString()}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Avg per Category
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {Math.round(
                categories.reduce((sum, c) => sum + c.feedbackCount, 0) / categories.length
              )}
            </p>
          </div>
        </Card>
      </div>

      {/* Categories Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead className="hidden md:table-cell">Domain</TableHead>
                <TableHead>Feedback Count</TableHead>
                <TableHead>{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-white" />
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{category.domain}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {category.feedbackCount} items
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        {t('common.edit')}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        {t('common.delete')}
                      </Button>
                    </div>
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
