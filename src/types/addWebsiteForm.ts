
import { z } from 'zod';

export interface PricingPlan {
  id: string;
  title: string;
  price: number;
}

export const createFormSchema = (t: (section: string, key: string) => string) => 
  z.object({
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

export const createSimpleFormSchema = (t: (section: string, key: string) => string) => 
  z.object({
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
    keywords: z.string().min(1, t('addWebsiteForm', 'keywordsRequired'))
  });

export type FormValues = z.infer<ReturnType<typeof createFormSchema>>;
export type SimpleFormValues = z.infer<ReturnType<typeof createSimpleFormSchema>>;
