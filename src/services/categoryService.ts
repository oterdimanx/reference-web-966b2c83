
import { supabase } from '@/integrations/supabase/client';
import { Category } from './directoryService';

export interface CreateCategoryData {
  name: string;
  description?: string | null;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string | null;
}

export const createCategory = async (categoryData: CreateCategoryData): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createCategory:', error);
    return null;
  }
};

export const updateCategory = async (id: string, updates: UpdateCategoryData): Promise<Category | null> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateCategory:', error);
    return null;
  }
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  try {
    // First check if category is being used
    const { data: websitesUsingCategory, error: checkError } = await supabase
      .from('directory_websites')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (checkError) {
      console.error('Error checking category usage:', checkError);
      throw checkError;
    }

    if (websitesUsingCategory && websitesUsingCategory.length > 0) {
      throw new Error('Cannot delete category that is currently being used by websites');
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    throw error;
  }
};

export const getCategoryUsageCount = async (categoryId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('directory_websites')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (error) {
      console.error('Error getting category usage count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getCategoryUsageCount:', error);
    return 0;
  }
};
