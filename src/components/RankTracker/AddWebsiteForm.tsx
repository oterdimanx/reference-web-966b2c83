
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddWebsiteFormProps {
  onAddWebsite: (website: any) => void;
}

export function AddWebsiteForm({ onAddWebsite }: AddWebsiteFormProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [domain, setDomain] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const checkDuplicateDomain = async (domain: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }
      
      const { data, error, count } = await supabase
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Check if domain already exists for this user
      const isDuplicate = await checkDuplicateDomain(domain);
      
      if (isDuplicate) {
        toast.error(`Website "${domain}" already exists in your account.`);
        setIsSubmitting(false);
        return;
      }
      
      // Redirect to the Add Website page with form-first flow
      navigate(`/add-website?domain=${encodeURIComponent(domain)}&keywords=${encodeURIComponent(keywords)}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('homepage', 'addWebsiteTitle')}</CardTitle>
        <CardDescription>
          {t('homepage', 'addWebsiteDescription')}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">{t('homepage', 'websiteUrlLabel')}</Label>
            <Input
              id="domain"
              placeholder={t('homepage', 'websiteUrlPlaceholder')}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">{t('homepage', 'keywordsLabel')}</Label>
            <Input
              id="keywords"
              placeholder={t('homepage', 'keywordsPlaceholder')}
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              {t('homepage', 'keywordsHelp')}
            </p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              {t('homepage', 'paymentInfo')}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-rank-teal hover:bg-rank-teal/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : t('homepage', 'continueToFormButton')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
