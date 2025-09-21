
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWebsiteSubmission } from './useWebsiteSubmission';
import { createFormSchema, createSimpleFormSchema, FormValues, SimpleFormValues, PricingPlan } from '@/types/addWebsiteForm';

export function useAddWebsiteForm(pricingPlans?: PricingPlan[], isSimpleForm: boolean = false) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { submitWebsite } = useWebsiteSubmission();
  
  // Get URL parameters if coming from homepage form or pricing page
  const urlParams = new URLSearchParams(window.location.search);
  const domainParam = urlParams.get('domain') || '';
  const keywordsParam = urlParams.get('keywords') || '';
  const planParam = urlParams.get('plan') || '';
  
  // Determine default pricing plan
  const getDefaultPricingId = () => {
    if (planParam && pricingPlans) {
      // If coming from pricing page with specific plan
      const selectedPlan = pricingPlans.find(plan => plan.id === planParam);
      if (selectedPlan) {
        return planParam;
      }
    }
    
    // Default to cheapest plan
    if (pricingPlans && pricingPlans.length > 0) {
      const cheapestPlan = pricingPlans.reduce((min, plan) => 
        plan.price < min.price ? plan : min
      );
      return cheapestPlan.id;
    }
    
    return '';
  };
  
  // Form validation schema with translated messages
  const formSchema = isSimpleForm ? createSimpleFormSchema(t) : createFormSchema(t);
  
  const form = useForm<SimpleFormValues | FormValues>({
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
      ...(isSimpleForm ? {} : { pricing_id: getDefaultPricingId() })
    }
  });
  
  // Update form when pricing plans are loaded
  useState(() => {
    if (!isSimpleForm && pricingPlans && pricingPlans.length > 0) {
      const defaultPricingId = getDefaultPricingId();
      if (defaultPricingId && !form.getValues('pricing_id')) {
        form.setValue('pricing_id', defaultPricingId);
      }
    }
  });
  
  const onSubmit = async (data: SimpleFormValues | FormValues, pricingPlans?: PricingPlan[]) => {
    setIsSubmitting(true);
    
    try {
      await submitWebsite(data, pricingPlans, selectedImage);
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error instanceof Error && error.message !== 'Duplicate domain') {
        // Error handling is done in submitWebsite hook
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
