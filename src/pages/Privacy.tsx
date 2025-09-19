
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { DynamicHead } from '@/components/SEO/DynamicHead';

const Privacy = () => {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col min-h-screen">
      <DynamicHead 
        pageKey="privacy"
        fallbackTitle="Privacy Policy - Data Protection & GDPR Compliance"
        fallbackDescription="Learn how we collect, use, and protect your personal data. Our comprehensive privacy policy ensures GDPR compliance and transparency."
        fallbackKeywords="privacy policy, data protection, gdpr compliance, personal data, privacy rights"
      />
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">{t('legalPages', 'privacyTitle')}</h1>

          <div className="prose dark:prose-invert max-w-none">
            <p className="mb-4">
              {t('legalPages', 'privacyLastUpdated')}
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('legalPages', 'privacyIntroduction')}</h2>
            <p className="mb-4">
              {t('legalPages', 'privacyIntroText')}
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('legalPages', 'privacyInfoCollectedTitle')}</h2>
            <p className="mb-4">
              {t('legalPages', 'privacyInfoCollectedText')}
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>{t('legalPages', 'privacyInfoCollectedList1')}</li>
              <li>{t('legalPages', 'privacyInfoCollectedList2')}</li>
              <li>{t('legalPages', 'privacyInfoCollectedList3')}</li>
              <li>{t('legalPages', 'privacyInfoCollectedList4')}</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('legalPages', 'privacyHowWeUseTitle')}</h2>
            <p className="mb-4">
              {t('legalPages', 'privacyHowWeUseText')}
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>{t('legalPages', 'privacyHowWeUseList1')}</li>
              <li>{t('legalPages', 'privacyHowWeUseList2')}</li>
              <li>{t('legalPages', 'privacyHowWeUseList3')}</li>
              <li>{t('legalPages', 'privacyHowWeUseList4')}</li>
              <li>{t('legalPages', 'privacyHowWeUseList5')}</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('legalPages', 'privacyDataSharingTitle')}</h2>
            <p className="mb-4">
              {t('legalPages', 'privacyDataSharingText')}
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>{t('legalPages', 'privacyDataSharingList1')}</li>
              <li>{t('legalPages', 'privacyDataSharingList2')}</li>
              <li>{t('legalPages', 'privacyDataSharingList3')}</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('legalPages', 'privacyYourRightsTitle')}</h2>
            <p className="mb-4">
              {t('legalPages', 'privacyYourRightsText')}
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('legalPages', 'privacyChangesTitle')}</h2>
            <p className="mb-4">
              {t('legalPages', 'privacyChangesText')}
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">{t('legalPages', 'privacyContactTitle')}</h2>
            <p className="mb-4">
              {t('legalPages', 'privacyContactText')}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
