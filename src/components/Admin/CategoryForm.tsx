
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Category } from '@/services/directoryService';
import { CreateCategoryData, UpdateCategoryData } from '@/services/categoryService';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: CreateCategoryData | UpdateCategoryData) => Promise<boolean>;
  onCancel?: () => void;
  isEditing?: boolean;
}

export function CategoryForm({ category, onSubmit, onCancel, isEditing = false }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim() || null
    });

    if (success) {
      if (!isEditing) {
        setFormData({ name: '', description: '' });
      }
      onCancel?.();
    }
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter category name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter category description (optional)"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting || !formData.name.trim()}>
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Category' : 'Create Category')}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
