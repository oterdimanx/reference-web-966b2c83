
import { supabase } from '@/integrations/supabase/client';

// Utility functions for image handling using Supabase Storage

export const saveImageToPublic = async (file: File, filename: string): Promise<string> => {
  try {
    // Create a unique filename to avoid collisions
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const uniqueFilename = `${filename}-${timestamp}.${extension}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('website-images')
      .upload(uniqueFilename, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }

    // Return the storage path (not the full URL)
    return data.path;
  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error('Failed to save image');
  }
};

export const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  
  // Check if it's an old localStorage path (migration support)
  if (imagePath.startsWith('/images/websites/')) {
    const filename = imagePath.split('/').pop();
    if (filename) {
      const localStorageData = localStorage.getItem(`website-image-${filename}`);
      if (localStorageData) {
        return localStorageData;
      }
    }
    // If localStorage data doesn't exist, return null (broken image)
    return null;
  }
  
  // For new Supabase Storage paths, get the public URL
  const { data } = supabase.storage
    .from('website-images')
    .getPublicUrl(imagePath);
  
  return data.publicUrl;
};

export const deleteImage = async (imagePath: string | null): Promise<void> => {
  if (!imagePath) return;
  
  // Handle old localStorage paths
  if (imagePath.startsWith('/images/websites/')) {
    const filename = imagePath.split('/').pop();
    if (filename) {
      localStorage.removeItem(`website-image-${filename}`);
    }
    return;
  }
  
  // Delete from Supabase Storage
  try {
    const { error } = await supabase.storage
      .from('website-images')
      .remove([imagePath]);
    
    if (error) {
      console.error('Error deleting image:', error);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};
