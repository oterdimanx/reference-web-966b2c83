
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

interface AddWebsiteFormProps {
  onAddWebsite: (website: any) => void;
}

export function AddWebsiteForm({ onAddWebsite }: AddWebsiteFormProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { canAddWebsite, websitesUsed, websitesAllowed, subscription, isLoading } = useUserSubscription();
  const { isAdmin } = useAuth();
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
      // Check if user can add more websites
      if (!canAddWebsite && subscription?.hasSubscription) {
        toast.error(`You have reached your website limit (${websitesUsed}/${websitesAllowed}). Please upgrade your plan.`);
        setIsSubmitting(false);
        return;
      }
      
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
  
  // Show subscription status if user has one (but not for admins)
  const showSubscriptionAlert = !isAdmin && subscription?.hasSubscription && !canAddWebsite;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('homepage', 'addWebsiteTitle')}</CardTitle>
        <CardDescription>
          {t('homepage', 'addWebsiteDescription')}
        </CardDescription>
      </CardHeader>
      
      {showSubscriptionAlert && (
        <CardContent className="pt-0">
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Website limit reached!</strong>
              <br />
              You have used {websitesUsed} out of {websitesAllowed} websites allowed.
              <br />
              <Link to="/pricing" className="underline font-medium">
                Upgrade your plan to add more websites
              </Link>
            </AlertDescription>
          </Alert>
        </CardContent>
      )}
      
      <form onSubmit={handleSubmit}>
        <CardContent className={showSubscriptionAlert ? "pt-4 space-y-4" : "space-y-4"}>
          {subscription?.hasSubscription && canAddWebsite && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Current plan:</strong> {subscription.subscription?.pricing_title}
                <br />
                <strong>Websites:</strong> {websitesUsed} / {websitesAllowed} used
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="domain">{t('homepage', 'websiteUrlLabel')}</Label>
            <Input
              id="domain"
              placeholder={t('homepage', 'websiteUrlPlaceholder')}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
              disabled={showSubscriptionAlert}
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
              disabled={showSubscriptionAlert}
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
          {showSubscriptionAlert ? (
            <Button asChild className="w-full bg-rank-teal hover:bg-rank-teal/90">
              <Link to="/pricing">Upgrade Plan</Link>
            </Button>
          ) : (
            <Button 
              type="submit" 
              className="w-full bg-rank-teal hover:bg-rank-teal/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : t('homepage', 'continueToFormButton')}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
