
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWebsiteSubmission } from './useWebsiteSubmission';
import { createFormSchema, FormValues, PricingPlan } from '@/types/addWebsiteForm';

export function useAddWebsiteForm() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { submitWebsite } = useWebsiteSubmission();
  
  // Get URL parameters if coming from homepage form
  const urlParams = new URLSearchParams(window.location.search);
  const domainParam = urlParams.get('domain') || '';
  const keywordsParam = urlParams.get('keywords') || '';
  
  // Form validation schema with translated messages
  const formSchema = createFormSchema(t);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      domain: domainParam,
      description: '',
      contact_name: '',
      contact_email: user?.email || '',
      phone_prefix: '+33',
      phone_number: '',
      reciprocal_link: '',
      keywords: keywordsParam,
      pricing_id: ''
    }
  });
  
  const onSubmit = async (data: FormValues, pricingPlans?: PricingPlan[]) => {
    setIsSubmitting(true);
    
    try {
      await submitWebsite(data, pricingPlans, selectedImage);
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error instanceof Error && error.message !== 'Duplicate domain') {
        toast.error("An error occurred while adding the website.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    selectedImage,
    setSelectedImage,
    onSubmit
  };
}
