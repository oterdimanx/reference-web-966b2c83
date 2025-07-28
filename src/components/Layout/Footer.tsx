
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <div className="flex items-center justify-center md:justify-start">
              <div className="h-6 w-6 rounded gradient-bg flex items-center justify-center mr-2">
                <span className="text-white font-bold text-xs">RW</span>
              </div>
              <span className="font-bold text-lg text-rank-blue dark:text-white">
                {t('homepage', 'title')}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t('homepage', 'subtitle')}
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <Link to="/about" className="text-gray-600 hover:text-rank-blue dark:text-gray-300 dark:hover:text-white text-sm">
              {t('common', 'about')}
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-rank-blue dark:text-gray-300 dark:hover:text-white text-sm">
              Contact
            </Link>
            <Link to="/privacy" className="text-gray-600 hover:text-rank-blue dark:text-gray-300 dark:hover:text-white text-sm">
              {t('common', 'privacyPolicy')}
            </Link>
            <Link to="/terms" className="text-gray-600 hover:text-rank-blue dark:text-gray-300 dark:hover:text-white text-sm">
              {t('common', 'termsOfService')}
            </Link>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          {t('common', 'copyright').replace('{year}', currentYear.toString())}
        </div>
      </div>
    </footer>
  );
}
