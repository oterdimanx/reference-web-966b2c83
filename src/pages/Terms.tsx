
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const Terms = () => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">{t('legalPages', 'termsTitle')}</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="mb-4">
              {t('legalPages', 'termsLastUpdated')}
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('legalPages', 'termsIntroductionTitle')}</h2>
            <p className="mb-4">
              {t('legalPages', 'termsIntroductionText')}
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('legalPages', 'termsAccountsTitle')}</h2>
            <p className="mb-4">
              {t('legalPages', 'termsAccountsText')}
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('legalPages', 'termsUsageTitle')}</h2>
            <p className="mb-4">
              {t('legalPages', 'termsUsageText')}
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>{t('legalPages', 'termsUsageList1')}</li>
              <li>{t('legalPages', 'termsUsageList2')}</li>
              <li>{t('legalPages', 'termsUsageList3')}</li>
              <li>{t('legalPages', 'termsUsageList4')}</li>
              <li>{t('legalPages', 'termsUsageList5')}</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('legalPages', 'termsContentTitle')}</h2>
            <p className="mb-4">
              {t('legalPages', 'termsContentText')}
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('legalPages', 'termsSubscriptionTitle')}</h2>
            <p className="mb-4">
              {t('legalPages', 'termsSubscriptionText')}
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('legalPages', 'termsTerminationTitle')}</h2>
            <p className="mb-4">
              {t('legalPages', 'termsTerminationText')}
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('legalPages', 'termsLiabilityTitle')}</h2>
            <p className="mb-4">
              {t('legalPages', 'termsLiabilityText')}
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('legalPages', 'termsChangesTitle')}</h2>
            <p className="mb-4">
              {t('legalPages', 'termsChangesText')}
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('legalPages', 'termsContactTitle')}</h2>
            <p className="mb-4">
              {t('legalPages', 'termsContactText')}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
