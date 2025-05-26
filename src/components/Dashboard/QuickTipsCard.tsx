
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function QuickTipsCard() {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-lg mb-4">{t('quickTips', 'title')}</h3>
      <ul className="space-y-3">
        <li className="flex items-start">
          <span className="flex-shrink-0 h-5 w-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2 mt-0.5">
            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {t('quickTips', 'tip1')}
          </span>
        </li>
        <li className="flex items-start">
          <span className="flex-shrink-0 h-5 w-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2 mt-0.5">
            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {t('quickTips', 'tip2')}
          </span>
        </li>
        <li className="flex items-start">
          <span className="flex-shrink-0 h-5 w-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2 mt-0.5">
            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {t('quickTips', 'tip3')}
          </span>
        </li>
        <li className="flex items-start">
          <span className="flex-shrink-0 h-5 w-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-2 mt-0.5">
            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {t('quickTips', 'tip4')}
          </span>
        </li>
      </ul>
    </div>
  );
}
