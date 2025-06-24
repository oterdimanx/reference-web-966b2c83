
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  getCategories, 
  Category 
} from '@/services/directoryService';
import { 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  getCategoryUsageCount,
  CreateCategoryData,
  UpdateCategoryData 
} from '@/services/categoryService';

export function useCategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async (categoryData: CreateCategoryData) => {
    try {
      const result = await createCategory(categoryData);
      if (result) {
        toast.success('Category created successfully');
        fetchCategories();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error creating category:', error);
      if (error.code === '23505') { // Unique constraint violation
        toast.error('A category with this name already exists');
      } else {
        toast.error('Failed to create category');
      }
      return false;
    }
  };

  const editCategory = async (id: string, updates: UpdateCategoryData) => {
    try {
      const result = await updateCategory(id, updates);
      if (result) {
        toast.success('Category updated successfully');
        fetchCategories();
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error updating category:', error);
      if (error.code === '23505') { // Unique constraint violation
        toast.error('A category with this name already exists');
      } else {
        toast.error('Failed to update category');
      }
      return false;
    }
  };

  const removeCategory = async (id: string) => {
    try {
      const usageCount = await getCategoryUsageCount(id);
      if (usageCount > 0) {
        toast.error(`Cannot delete category that is being used by ${usageCount} website(s)`);
        return false;
      }

      await deleteCategory(id);
      toast.success('Category deleted successfully');
      fetchCategories();
      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      if (error.message.includes('currently being used')) {
        toast.error('Cannot delete category that is currently being used by websites');
      } else {
        toast.error('Failed to delete category');
      }
      return false;
    }
  };

  return {
    categories,
    isLoading,
    addCategory,
    editCategory,
    removeCategory,
    refreshCategories: fetchCategories
  };
}
