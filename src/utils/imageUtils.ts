
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
    console.warn(`Legacy image path found but no localStorage data: ${imagePath}`);
    return null;
  }
  
  try {
    // For new Supabase Storage paths, get the public URL
    const { data } = supabase.storage
      .from('website-images')
      .getPublicUrl(imagePath);
    
    console.log(`Generated image URL for ${imagePath}:`, data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Error generating image URL:', error);
    return null;
  }
};

// Check if an image file exists in Supabase Storage
export const checkImageExists = async (imagePath: string): Promise<boolean> => {
  if (!imagePath) return false;
  
  try {
    console.log(`Checking if image exists: ${imagePath}`);
    
    // Try to get file info using download with a very small range
    const { data, error } = await supabase.storage
      .from('website-images')
      .download(imagePath);
    
    if (error) {
      console.log(`Image does not exist: ${imagePath}`, error.message);
      return false;
    }
    
    console.log(`Image exists: ${imagePath}`);
    return true;
  } catch (error) {
    console.error('Error checking image existence:', error);
    return false;
  }
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
