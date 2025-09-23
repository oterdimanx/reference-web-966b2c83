import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Debug utility to check the status of images in storage
 */
export const debugImageStorage = async (): Promise<void> => {
  try {
    console.log('🔍 Debugging image storage...');
    
    // Check if bucket exists and is accessible
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
      return;
    }
    
    const websiteImagesBucket = buckets?.find(b => b.name === 'website-images');
    if (!websiteImagesBucket) {
      console.error('❌ website-images bucket not found');
      return;
    }
    
    console.log('✅ website-images bucket found:', websiteImagesBucket);
    
    // List all files in the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('website-images')
      .list('', { limit: 100 });
    
    if (filesError) {
      console.error('❌ Error listing files:', filesError);
      return;
    }
    
    console.log(`📁 Found ${files?.length || 0} files in storage:`, files);
    
    // Check each file's public URL
    if (files && files.length > 0) {
      for (const file of files) {
        const { data: urlData } = supabase.storage
          .from('website-images')
          .getPublicUrl(file.name);
        
        console.log(`🔗 ${file.name} -> ${urlData.publicUrl}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
};

/**
 * Compare database image paths with actual storage files
 */
export const auditWebsiteImages = async (): Promise<void> => {
  try {
    console.log('🔍 Auditing website images...');
    
    // Get all websites with image paths
    const { data: websites, error: websitesError } = await supabase
      .from('websites')
      .select('id, domain, image_path')
      .not('image_path', 'is', null);
    
    if (websitesError) {
      console.error('❌ Error fetching websites:', websitesError);
      return;
    }
    
    console.log(`📊 Found ${websites?.length || 0} websites with image paths`);
    
    // Get all files in storage
    const { data: files, error: filesError } = await supabase.storage
      .from('website-images')
      .list('', { limit: 100 });
    
    if (filesError) {
      console.error('❌ Error listing storage files:', filesError);
      return;
    }
    
    const storageFiles = new Set(files?.map(f => f.name) || []);
    
    // Check each website's image
    const results = {
      total: websites?.length || 0,
      found: 0,
      missing: 0,
      missingList: [] as string[]
    };
    
    if (websites) {
      for (const website of websites) {
        if (storageFiles.has(website.image_path)) {
          results.found++;
          console.log(`✅ ${website.domain}: ${website.image_path} found`);
        } else {
          results.missing++;
          results.missingList.push(`${website.domain}: ${website.image_path}`);
          console.log(`❌ ${website.domain}: ${website.image_path} MISSING`);
        }
      }
    }
    
    console.log('📈 Audit Results:', results);
    
    if (results.missing > 0) {
      toast.error(`Found ${results.missing} missing images out of ${results.total}`);
    } else {
      toast.success(`All ${results.total} images found in storage`);
    }
    
  } catch (error) {
    console.error('❌ Audit error:', error);
    toast.error('Failed to audit images');
  }
};

// Make debug functions available globally in development
if (process.env.NODE_ENV === 'development') {
  (window as any).debugImageStorage = debugImageStorage;
  (window as any).auditWebsiteImages = auditWebsiteImages;
}