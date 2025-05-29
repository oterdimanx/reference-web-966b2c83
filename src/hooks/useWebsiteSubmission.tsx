
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { saveWebsiteDetailed } from '@/services/websiteService';
import { saveImageToPublic } from '@/utils/imageUtils';
import { RankingSummary } from '@/lib/mockData';
import { PricingPlan, FormValues } from '@/types/addWebsiteForm';
import { useSubscriptionManager } from './useSubscriptionManager';
import { useDomainValidation } from './useDomainValidation';

export const useWebsiteSubmission = () => {
  const navigate = useNavigate();
  const { saveUserSubscription } = useSubscriptionManager();
  const { checkDuplicateDomain } = useDomainValidation();

  const submitWebsite = async (
    data: FormValues, 
    pricingPlans: PricingPlan[] | undefined,
    selectedImage: File | null
  ) => {
    // Double check for duplicate domain
    const isDuplicate = await checkDuplicateDomain(data.domain);
    
    if (isDuplicate) {
      toast.error(`Website "${data.domain}" already exists in your account.`);
      throw new Error('Duplicate domain');
    }

    // Handle image upload if selected
    let imagePath: string | null = null;
    if (selectedImage) {
      try {
        imagePath = await saveImageToPublic(selectedImage, data.domain);
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Failed to upload image');
        throw error;
      }
    }
    
    // Create a website entry with the form data
    const keywordsArray = data.keywords.split(',').filter(k => k.trim().length > 0);
    
    console.log('Keywords processing:', {
      originalKeywords: data.keywords,
      keywordsArray: keywordsArray,
      firstKeyword: keywordsArray[0]?.trim()
    });
    
    const websiteData: RankingSummary = {
      websiteId: uuidv4(),
      domain: data.domain,
      avgPosition: Math.floor(Math.random() * 15) + 1, // Random position between 1-15
      change: Math.floor(Math.random() * 5), // Random change between 0-4
      keywordCount: keywordsArray.length,
      topKeyword: keywordsArray[0]?.trim() || 'N/A',
      topKeywordPosition: Math.floor(Math.random() * 10) + 1,
    };
    
    // Find selected pricing plan
    const selectedPlan = pricingPlans?.find(plan => plan.id === data.pricing_id);
    
    if (!selectedPlan) {
      throw new Error('Selected pricing plan not found');
    }
    
    // Save user subscription first
    await saveUserSubscription(selectedPlan);
    
    // Add the additional fields including image path and all keywords
    const detailedWebsiteData = {
      ...websiteData,
      title: data.title,
      description: data.description,
      contactName: data.contact_name,
      contactEmail: data.contact_email,
      phonePrefix: data.phone_prefix,
      phoneNumber: data.phone_number,
      reciprocalLink: data.reciprocal_link || null,
      pricingId: data.pricing_id,
      pricingTitle: selectedPlan?.title || 'Unknown',
      pricingPrice: selectedPlan?.price || 0,
      imagePath: imagePath,
      keywords: data.keywords // This should save the full keywords string
    };
    
    console.log('Detailed website data before saving:', detailedWebsiteData);
    
    const savedWebsite = await saveWebsiteDetailed(detailedWebsiteData);
    
    if (savedWebsite) {
      console.log('Saved website result:', savedWebsite);
      toast.success("Website added successfully!");
      // Navigate to home instead of staying on success page
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      toast.error("Failed to add website. Please try again.");
    }
  };

  return { submitWebsite };
};
