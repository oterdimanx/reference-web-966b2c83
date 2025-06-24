
import { useState } from 'react';
import { toast } from 'sonner';
import { insertSampleCategories, insertSampleDirectoryWebsites } from '@/lib/sampleData';

export function useSampleData() {
  const [isLoading, setIsLoading] = useState(false);

  const populateSampleData = async () => {
    setIsLoading(true);
    try {
      console.log('Populating sample categories...');
      await insertSampleCategories();
      
      console.log('Populating sample directory websites...');
      await insertSampleDirectoryWebsites();
      
      toast.success('Sample data populated successfully!');
    } catch (error) {
      console.error('Error populating sample data:', error);
      toast.error('Failed to populate sample data');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    populateSampleData,
    isLoading
  };
}
