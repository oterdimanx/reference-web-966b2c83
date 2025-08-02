import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { saveWebsiteDetailed } from '@/services/websiteService';
import { saveImageToPublic } from '@/utils/imageUtils';
import { useDomainValidation } from './useDomainValidation';
import { useSecureDomainValidation } from './useSecureDomainValidation';
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
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate domain format
      const isValidDomain = await validateDomain(data.domain);
      if (!isValidDomain) {
        throw new Error('Invalid domain format');
      }
      
      // Clean domain (remove protocol, www, etc.)
      const cleanDomain = data.domain.replace(/^https?:\/\//, '').replace(/^www\./, '').toLowerCase();
      
      // Check for duplicate domain
      const isDuplicate = await checkDuplicateDomain(cleanDomain);
      if (isDuplicate) {
        throw new Error('Domain already exists for this user');
      }

      // Upload image if provided
      let imagePath = null;
      if (selectedImage) {
        imagePath = await saveImageToPublic(selectedImage, 'website');
      }

      // Create website object
      const websiteData = {
        websiteId: crypto.randomUUID(),
        title: data.title,
        domain: cleanDomain,
        description: data.description,
        contact_name: data.contact_name,
        contact_email: data.contact_email,
        phone_prefix: data.phone_prefix,
        phone_number: data.phone_number,
        keywords: data.keywords,
        reciprocal_link: data.reciprocal_link,
        image_path: imagePath,
        userId: user.id,
        avgPosition: 0,
        keywordCount: 0,
        positionChange: 0,
        topKeyword: null,
        topKeywordPosition: null,
        pricing_id: null, // No pricing needed for existing subscribers
        change: 0 // Add missing property
      };

      // Save website
      const savedWebsite = await saveWebsiteDetailed(websiteData);
      
      if (savedWebsite) {
        toast.success('Website added successfully!');
        navigate('/');
      } else {
        throw new Error('Failed to save website');
      }
    } catch (error) {
      console.error('Error submitting website:', error);
      toast.error('Failed to add website. Please try again.');
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