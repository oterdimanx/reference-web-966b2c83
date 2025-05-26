
import { Input } from '@/components/ui/input';
import { Translations } from '@/contexts/LanguageContext';
import { File } from 'lucide-react';

interface TranslationSectionProps {
  title: string;
  sectionKey: keyof Translations;
  translations: Partial<Translations>;
  onTranslationChange: (section: keyof Translations, key: string, value: string) => void;
  iconColor?: string;
}

export function TranslationSection({ 
  title, 
  sectionKey, 
  translations, 
  onTranslationChange,
  iconColor = 'text-blue-600'
}: TranslationSectionProps) {
  const sectionTranslations = translations[sectionKey] || {};
  
  return (
    <div className="space-y-4 border-t pt-4 first:border-t-0 first:pt-0">
      <h3 className="text-lg font-semibold flex items-center">
        <File className={`mr-2 ${iconColor}`} size={18} />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(sectionTranslations).map((key) => (
          <div key={key} className="space-y-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">
              {key}
            </label>
            <Input 
              value={sectionTranslations[key as keyof typeof sectionTranslations] || ''}
              onChange={(e) => onTranslationChange(sectionKey, key, e.target.value)}
              className="bg-white dark:bg-slate-800"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
