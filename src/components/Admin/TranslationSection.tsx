
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Translations, Language } from '@/contexts/LanguageContext';
import { File } from 'lucide-react';

interface TranslationSectionProps {
  title: string;
  sectionKey: keyof Translations;
  translations: Translations;
  onTranslationChange: (section: keyof Translations, key: string, value: string) => Promise<void>;
  iconColor?: string;
  language: Language;
}

export function TranslationSection({ 
  title, 
  sectionKey, 
  translations, 
  onTranslationChange,
  iconColor = 'text-blue-600',
  language
}: TranslationSectionProps) {
  const [editingValues, setEditingValues] = useState<{[key: string]: string}>({});
  const sectionTranslations = translations[sectionKey] || {};
  
  const handleInputChange = (key: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [`${sectionKey}-${key}`]: value
    }));
  };

  const handleInputBlur = async (key: string, value: string) => {
    try {
      await onTranslationChange(sectionKey, key, value);
      // Clear the editing value after successful save
      setEditingValues(prev => {
        const newValues = { ...prev };
        delete newValues[`${sectionKey}-${key}`];
        return newValues;
      });
    } catch (error) {
      console.error('Failed to save translation:', error);
    }
  };

  const getInputValue = (key: string) => {
    const editingKey = `${sectionKey}-${key}`;
    if (editingKey in editingValues) {
      return editingValues[editingKey];
    }
    return sectionTranslations[key as keyof typeof sectionTranslations] || '';
  };
  
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
              value={getInputValue(key)}
              onChange={(e) => handleInputChange(key, e.target.value)}
              onBlur={(e) => handleInputBlur(key, e.target.value)}
              className="bg-white dark:bg-slate-800"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
