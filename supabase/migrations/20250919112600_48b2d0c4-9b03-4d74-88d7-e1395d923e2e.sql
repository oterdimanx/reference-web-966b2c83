-- Create page_metadata table for SEO management
CREATE TABLE public.page_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL,
  language VARCHAR(2) NOT NULL DEFAULT 'en',
  title TEXT,
  description TEXT,
  keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,
  canonical_url TEXT,
  robots TEXT DEFAULT 'index,follow',
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page_key, language)
);

-- Enable RLS
ALTER TABLE public.page_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage page metadata" 
ON public.page_metadata 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view page metadata" 
ON public.page_metadata 
FOR SELECT 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_page_metadata_page_key ON public.page_metadata(page_key);
CREATE INDEX idx_page_metadata_language ON public.page_metadata(language);
CREATE INDEX idx_page_metadata_page_lang ON public.page_metadata(page_key, language);

-- Create trigger for updated_at
CREATE TRIGGER update_page_metadata_updated_at
BEFORE UPDATE ON public.page_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default metadata for existing pages
INSERT INTO public.page_metadata (page_key, language, title, description, keywords) VALUES
('index', 'en', 'SEO Rank Tracker - Monitor Your Website Rankings', 'Track your website rankings, monitor keyword performance, and improve your SEO strategy with our comprehensive rank tracking tools.', 'seo, rank tracker, keyword tracking, search engine optimization'),
('index', 'fr', 'Suivi de Classement SEO - Surveillez Vos Positions', 'Suivez vos classements de site web, surveillez les performances des mots-clés et améliorez votre stratégie SEO avec nos outils de suivi complets.', 'seo, suivi de classement, suivi de mots-clés, optimisation moteur de recherche'),
('about', 'en', 'About Us - SEO Rank Tracker', 'Learn more about our mission to help businesses improve their search engine rankings and online visibility.', 'about, seo company, rank tracking service'),
('about', 'fr', 'À Propos - Suivi de Classement SEO', 'Découvrez notre mission d''aider les entreprises à améliorer leurs classements et leur visibilité en ligne.', 'à propos, entreprise seo, service de suivi'),
('pricing', 'en', 'Pricing Plans - SEO Rank Tracker', 'Choose the perfect plan for your SEO needs. Affordable pricing for businesses of all sizes.', 'pricing, seo plans, rank tracking pricing'),
('pricing', 'fr', 'Plans Tarifaires - Suivi de Classement SEO', 'Choisissez le plan parfait pour vos besoins SEO. Prix abordables pour les entreprises de toutes tailles.', 'tarifs, plans seo, prix suivi classement'),
('contact', 'en', 'Contact Us - SEO Rank Tracker', 'Get in touch with our team for support, questions, or partnership opportunities.', 'contact, support, seo help'),
('contact', 'fr', 'Nous Contacter - Suivi de Classement SEO', 'Contactez notre équipe pour le support, des questions ou des opportunités de partenariat.', 'contact, support, aide seo'),
('directories', 'en', 'Website Directories - SEO Rank Tracker', 'Explore our curated directory of websites and discover new opportunities for your SEO strategy.', 'directories, website directory, seo directory'),
('directories', 'fr', 'Annuaires de Sites - Suivi de Classement SEO', 'Explorez notre annuaire organisé de sites web et découvrez de nouvelles opportunités pour votre stratégie SEO.', 'annuaires, annuaire de sites, annuaire seo'),
('privacy', 'en', 'Privacy Policy - SEO Rank Tracker', 'Read our privacy policy to understand how we collect, use, and protect your personal information.', 'privacy policy, data protection, privacy'),
('privacy', 'fr', 'Politique de Confidentialité - Suivi de Classement SEO', 'Lisez notre politique de confidentialité pour comprendre comment nous collectons et protégeons vos informations.', 'politique de confidentialité, protection des données'),
('terms', 'en', 'Terms of Service - SEO Rank Tracker', 'Review our terms of service and understand the rules and guidelines for using our platform.', 'terms of service, terms and conditions, legal'),
('terms', 'fr', 'Conditions d''Utilisation - Suivi de Classement SEO', 'Consultez nos conditions d''utilisation et comprenez les règles pour utiliser notre plateforme.', 'conditions d''utilisation, conditions générales, légal'),
('auth', 'en', 'Sign In - SEO Rank Tracker', 'Sign in to your account to access your dashboard and manage your SEO campaigns.', 'login, sign in, authentication'),
('auth', 'fr', 'Connexion - Suivi de Classement SEO', 'Connectez-vous à votre compte pour accéder à votre tableau de bord et gérer vos campagnes SEO.', 'connexion, authentification'),
('sitemap', 'en', 'Sitemap - SEO Rank Tracker', 'XML sitemap for search engine crawlers to index our website content effectively.', 'sitemap, xml sitemap, seo sitemap'),
('sitemap', 'fr', 'Plan du Site - Suivi de Classement SEO', 'Plan de site XML pour que les robots des moteurs de recherche indexent efficacement notre contenu.', 'plan du site, sitemap xml'),
('notfound', 'en', '404 - Page Not Found - SEO Rank Tracker', 'The page you are looking for could not be found. Return to our homepage to continue browsing.', '404, page not found, error page'),
('notfound', 'fr', '404 - Page Non Trouvée - Suivi de Classement SEO', 'La page que vous recherchez est introuvable. Retournez à notre page d''accueil pour continuer.', '404, page non trouvée, erreur');