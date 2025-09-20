
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { DynamicHead } from '@/components/SEO/DynamicHead';
import { Link } from 'react-router-dom';

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <DynamicHead pageKey="about" />
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">{t('aboutPage', 'title')}</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="mb-4">
              {t('aboutPage', 'intro')}
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('aboutPage', 'missionTitle')}</h2>
            <p className="mb-4">
              {t('aboutPage', 'missionText')}
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('aboutPage', 'teamTitle')}</h2>
            <p className="mb-4">
              {t('aboutPage', 'teamText')}
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('aboutPage', 'technologyTitle')}</h2>
            <p className="mb-4">
              {t('aboutPage', 'technologyText')}
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('aboutPage', 'contactTitle')}</h2>
            <p className="mb-4">
              {t('aboutPage', 'contactText')}
              <Link to="/contact" className="text-black-600 hover:text-rank-gray dark:text-gray-300 dark:hover:text-white text-sm">
                Contact.
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
