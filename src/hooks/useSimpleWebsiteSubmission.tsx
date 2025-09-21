import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { saveWebsiteDetailed } from '@/services/websiteService';
import { saveImageToPublic } from '@/utils/imageUtils';
import { useDomainValidation } from './useDomainValidation';
import { useSecureDomainValidation } from './useSecureDomainValidation';
import { sanitizeDomain } from '@/utils/domainUtils';
import { toast } from 'sonner';

export interface FormValues {
  title: string;
  domain: string;
  description: string;
  contact_name: string;
  contact_email: string;
  phone_prefix: string;
  phone_number: string;
  keywords: string;
  reciprocal_link: string;
}

export const useSimpleWebsiteSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { checkDuplicateDomain } = useDomainValidation();
  const { validateDomain } = useSecureDomainValidation();

  const submitWebsite = async (data: FormValues, selectedImage: File | null) => {
    console.log('SimpleWebsiteSubmission: Starting submission with data:', data);
    
    if (!user) {
      console.error('SimpleWebsiteSubmission: No authenticated user');
      toast.error('User not authenticated');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('SimpleWebsiteSubmission: Validating domain:', data.domain);
      
      // Validate domain format
      const isValidDomain = await validateDomain(data.domain);
      if (!isValidDomain) {
        console.error('SimpleWebsiteSubmission: Invalid domain format:', data.domain);
        throw new Error('Invalid domain format');
      }
      
      // Clean domain using the utility function
      const cleanDomain = sanitizeDomain(data.domain);
      console.log('SimpleWebsiteSubmission: Clean domain:', cleanDomain);
      
      // Check for duplicate domain
      const isDuplicate = await checkDuplicateDomain(cleanDomain);
      if (isDuplicate) {
        console.error('SimpleWebsiteSubmission: Duplicate domain found:', cleanDomain);
        throw new Error('Domain already exists for this user');
      }

      // Upload image if provided
      let imagePath = null;
      if (selectedImage) {
        console.log('SimpleWebsiteSubmission: Uploading image:', selectedImage.name);
        imagePath = await saveImageToPublic(selectedImage, 'website');
        console.log('SimpleWebsiteSubmission: Image uploaded to:', imagePath);
      }

      // Create website object with proper camelCase properties to match DetailedWebsite interface
      const websiteData = {
        websiteId: crypto.randomUUID(),
        title: data.title,
        domain: cleanDomain,
        description: data.description,
        contactName: data.contact_name,        // camelCase for DetailedWebsite
        contactEmail: data.contact_email,      // camelCase for DetailedWebsite  
        phonePrefix: data.phone_prefix,        // camelCase for DetailedWebsite
        phoneNumber: data.phone_number,        // camelCase for DetailedWebsite
        keywords: data.keywords,
        reciprocalLink: data.reciprocal_link,  // camelCase for DetailedWebsite
        imagePath: imagePath,                  // camelCase for DetailedWebsite
        avgPosition: 0,
        keywordCount: 0,
        change: 0,
        topKeyword: null,
        topKeywordPosition: null,
        pricingId: null, // No pricing needed for existing subscribers
      };

      console.log('SimpleWebsiteSubmission: Final website data to save:', websiteData);

      // Save website
      const savedWebsite = await saveWebsiteDetailed(websiteData);
      
      if (savedWebsite) {
        console.log('SimpleWebsiteSubmission: Website saved successfully:', savedWebsite);
        toast.success('Website added successfully!');
        navigate('/');
      } else {
        console.error('SimpleWebsiteSubmission: saveWebsiteDetailed returned null');
        throw new Error('Failed to save website - database operation returned null');
      }
    } catch (error) {
      console.error('SimpleWebsiteSubmission: Error submitting website:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to add website: ${errorMessage}`);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitWebsite,
    isSubmitting
  };
};