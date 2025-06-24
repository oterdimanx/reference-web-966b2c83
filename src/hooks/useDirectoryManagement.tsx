
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  getDirectoryWebsites, 
  getCategories, 
  createDirectoryWebsite, 
  updateDirectoryWebsite, 
  deleteDirectoryWebsite,
  DirectoryWebsite,
  Category,
  CreateDirectoryWebsiteData
} from '@/services/directoryService';
import { getUserWebsites } from '@/services/websiteService';
import { RankingSummary } from '@/lib/mockData';

export function useDirectoryManagement() {
  const [directoryWebsites, setDirectoryWebsites] = useState<DirectoryWebsite[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userWebsites, setUserWebsites] = useState<RankingSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    console.log('Fetching directory management data...');
    try {
      const [directoryData, categoriesData, websitesData] = await Promise.all([
        getDirectoryWebsites(),
        getCategories(),
        getUserWebsites()
      ]);
      
      console.log('Directory websites fetched:', directoryData);
      console.log('Categories fetched:', categoriesData);
      console.log('User websites fetched:', websitesData);
      
      setDirectoryWebsites(directoryData);
      setCategories(categoriesData);
      setUserWebsites(websitesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const addWebsiteToDirectory = async (formData: CreateDirectoryWebsiteData) => {
    try {
      console.log('Adding website to directory:', formData);
      const result = await createDirectoryWebsite(formData);
      if (result) {
        toast.success('Website added to directory');
        fetchData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding website:', error);
      toast.error('Failed to add website to directory');
      return false;
    }
  };

  const removeWebsiteFromDirectory = async (id: string) => {
    try {
      const success = await deleteDirectoryWebsite(id);
      if (success) {
        toast.success('Website removed from directory');
        fetchData();
      }
      return success;
    } catch (error) {
      console.error('Error deleting website:', error);
      toast.error('Failed to remove website from directory');
      return false;
    }
  };

  const toggleWebsiteStatus = async (website: DirectoryWebsite) => {
    try {
      const result = await updateDirectoryWebsite(website.id, {
        is_active: !website.is_active
      });
      if (result) {
        toast.success(`Website ${website.is_active ? 'deactivated' : 'activated'}`);
        fetchData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating website:', error);
      toast.error('Failed to update website status');
      return false;
    }
  };

  return {
    directoryWebsites,
    categories,
    userWebsites,
    isLoading,
    addWebsiteToDirectory,
    removeWebsiteFromDirectory,
    toggleWebsiteStatus
  };
}
