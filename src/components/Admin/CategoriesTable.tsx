
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';
import { Category } from '@/services/directoryService';
import { CategoryForm } from './CategoryForm';
import { UpdateCategoryData } from '@/services/categoryService';

interface CategoriesTableProps {
  categories: Category[];
  onEdit: (id: string, data: UpdateCategoryData) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function CategoriesTable({ categories, onEdit, onDelete }: CategoriesTableProps) {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleEdit = async (data: UpdateCategoryData) => {
    if (!editingCategory) return false;
    
    const success = await onEdit(editingCategory.id, data);
    if (success) {
      setEditingCategory(null);
    }
    return success;
  };

  const handleDelete = async (categoryId: string) => {
    await onDelete(categoryId);
  };

  if (editingCategory) {
    return (
      <CategoryForm
        category={editingCategory}
        onSubmit={handleEdit}
        onCancel={() => setEditingCategory(null)}
        isEditing={true}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories ({categories.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.description || '-'}</TableCell>
                <TableCell>
                  {new Date(category.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Category</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the category "{category.name}"? 
                            This action cannot be undone. Categories that are currently being 
                            used by websites cannot be deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(category.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {categories.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No categories found. Create your first category above.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
