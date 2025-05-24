
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { saveWebsiteDetailed } from '@/services/websiteService';
import { saveImageToPublic } from '@/utils/imageUtils';
import { RankingSummary } from '@/lib/mockData';

interface PricingPlan {
  id: string;
  title: string;
  price: number;
}

export function useAddWebsiteForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
  // Get URL parameters if coming from homepage form
  const urlParams = new URLSearchParams(window.location.search);
  const domainParam = urlParams.get('domain') || '';
  const keywordsParam = urlParams.get('keywords') || '';
  
  // Form validation schema with translated messages
  const formSchema = z.object({
    title: z.string().min(1, t('addWebsiteForm', 'titleRequired')),
    domain: z.string().min(1, t('addWebsiteForm', 'domainRequired')),
    description: z.string().min(1, t('addWebsiteForm', 'descriptionRequired')),
    contact_name: z.string().min(1, t('addWebsiteForm', 'contactNameRequired')),
    contact_email: z.string().email(t('addWebsiteForm', 'invalidEmail')),
    phone_prefix: z.string().default('+33'),
    phone_number: z.string()
      .min(1, t('addWebsiteForm', 'phoneRequired'))
      .regex(/^\d+$/, t('addWebsiteForm', 'phoneDigitsOnly')),
    reciprocal_link: z.string().optional(),
    keywords: z.string().min(1, t('addWebsiteForm', 'keywordsRequired')),
    pricing_id: z.string().min(1, t('addWebsiteForm', 'planRequired'))
  });

  type FormValues = z.infer<typeof formSchema>;
  
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
  
  const checkDuplicateDomain = async (domain: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }
      
      const { count } = await supabase
        .from('websites')
        .select('*', { count: 'exact' })
        .eq('domain', domain)
        .eq('user_id', user.id);
      
      return count !== undefined && count > 0;
    } catch (error) {
      console.error('Error checking duplicate domain:', error);
      return false;
    }
  };
  
  const saveUserSubscription = async (pricingPlan: PricingPlan) => {
    try {
      if (!user?.id) {
        throw new Error('No authenticated user');
      }
      
      // Check if user already has an active subscription for this plan
      const { data: existingSub } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('pricing_id', pricingPlan.id)
        .eq('is_active', true)
        .single();
        
      if (existingSub) {
        console.log('User already has active subscription for this plan');
        return;
      }
      
      // Create new subscription
      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          pricing_id: pricingPlan.id,
          is_active: true
        });
        
      if (error) {
        throw error;
      }
      
      console.log('User subscription saved successfully');
    } catch (error) {
      console.error('Error saving user subscription:', error);
      throw error;
    }
  };
  
  const onSubmit = async (data: FormValues, pricingPlans?: PricingPlan[]) => {
    setIsSubmitting(true);
    
    try {
      // Double check for duplicate domain
      const isDuplicate = await checkDuplicateDomain(data.domain);
      
      if (isDuplicate) {
        toast.error(`Website "${data.domain}" already exists in your account.`);
        setIsSubmitting(false);
        return;
      }

      // Handle image upload if selected
      let imagePath: string | null = null;
      if (selectedImage) {
        try {
          imagePath = await saveImageToPublic(selectedImage, data.domain);
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Failed to upload image');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Create a website entry with the form data
      const keywordsArray = data.keywords.split(',').filter(k => k.trim().length > 0);
      
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
      
      // Add the additional fields including image path
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
        imagePath: imagePath
      };
      
      const savedWebsite = await saveWebsiteDetailed(detailedWebsiteData);
      
      if (savedWebsite) {
        toast.success("Website added successfully!");
        // Navigate to home instead of staying on success page
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        toast.error("Failed to add website. Please try again.");
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("An error occurred while adding the website.");
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
