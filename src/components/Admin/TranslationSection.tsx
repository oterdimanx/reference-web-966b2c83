
import { Input } from '@/components/ui/input';
import { Translations } from '@/contexts/LanguageContext';

interface TranslationSectionProps {
  title: string;
  sectionKey: keyof Translations;
  translations: Partial<Translations>;
  onTranslationChange: (section: keyof Translations, key: string, value: string) => void;
}

export function TranslationSection({ 
  title, 
  sectionKey, 
  translations, 
  onTranslationChange 
}: TranslationSectionProps) {
  const sectionTranslations = translations[sectionKey] || {};
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(sectionTranslations).map((key) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-medium">{key}</label>
            <Input 
              value={sectionTranslations[key as keyof typeof sectionTranslations] || ''}
              onChange={(e) => onTranslationChange(sectionKey, key, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
