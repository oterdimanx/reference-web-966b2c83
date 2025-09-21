import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { UserTrackingScriptGenerator } from '@/components/TrackingScript/UserTrackingScriptGenerator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const TrackingScript = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{t('trackingScriptPage', 'title')}</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/all-websites')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            {t('trackingScriptPage', 'backToWebsites')}
          </Button>
        </div>
        
        <div className="mb-6 text-muted-foreground">
          <p className="mb-2">
            {t('trackingScriptPage', 'description')}
          </p>
          <p>
            {t('trackingScriptPage', 'instructions')}
          </p>
        </div>

        <UserTrackingScriptGenerator />
      </main>
      <Footer />
    </div>
  );
};

export default TrackingScript;