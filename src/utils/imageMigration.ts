import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Utility to help users migrate broken image paths
 * This can be called from admin interface or during user interactions
 */
export const cleanupBrokenImagePaths = async (): Promise<void> => {
  try {
    // Find websites with broken image paths (starting with /images/websites/)
    const { data: websites, error } = await supabase
      .from('websites')
      .select('id, domain, image_path')
      .not('image_path', 'is', null)
      .like('image_path', '/images/websites/%');

    if (error) {
      console.error('Error fetching websites with broken image paths:', error);
      return;
    }

    if (!websites || websites.length === 0) {
      console.log('No websites with broken image paths found');
      return;
    }

    console.log(`Found ${websites.length} websites with potentially broken image paths`);

    // For each website, check if the localStorage data exists
    const updatePromises = websites.map(async (website) => {
      const filename = website.image_path?.split('/').pop();
      if (!filename) return;

      const localStorageData = localStorage.getItem(`website-image-${filename}`);
      
      if (!localStorageData) {
        // No localStorage data, clear the broken path
        console.log(`Clearing broken image path for ${website.domain}: ${website.image_path}`);
        return supabase
          .from('websites')
          .update({ image_path: null })
          .eq('id', website.id);
      }
    });

    await Promise.all(updatePromises);
    
    toast.success(`Cleaned up ${websites.length} broken image paths`);
    console.log('Image path cleanup completed');
  } catch (error) {
    console.error('Error during image cleanup:', error);
    toast.error('Failed to cleanup broken image paths');
  }
};

/**
 * Check if a website has a valid image
 */
export const hasValidImage = (imagePath: string | null): boolean => {
  if (!imagePath) return false;
  
  // Check if it's a new storage path (valid)
  if (!imagePath.startsWith('/images/websites/')) {
    return true;
  }
  
  // Check if localStorage data exists for old paths
  const filename = imagePath.split('/').pop();
  if (!filename) return false;
  
  return !!localStorage.getItem(`website-image-${filename}`);
};