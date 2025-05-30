
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
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());
  const sectionTranslations = translations[sectionKey] || {};
  
  const handleInputChange = (key: string, value: string) => {
    const editingKey = `${sectionKey}-${key}`;
    setEditingValues(prev => ({
      ...prev,
      [editingKey]: value
    }));
  };

  const saveTranslation = async (key: string, value: string) => {
    if (savingKeys.has(key)) return;
    
    setSavingKeys(prev => new Set(prev).add(key));
    try {
      await onTranslationChange(sectionKey, key, value);
      setEditingValues(prev => {
        const newValues = { ...prev };
        delete newValues[`${sectionKey}-${key}`];
        return newValues;
      });
    } catch (error) {
      console.error('Failed to save translation:', error);
    } finally {
      setSavingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  const handleKeyPress = (key: string, value: string, event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      saveTranslation(key, value);
    }
  };

  const handleBlur = (key: string, event: React.FocusEvent<HTMLInputElement>) => {
    const value = event.target.value;
    saveTranslation(key, value);
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
        <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
          Editing: {language === 'en' ? 'English' : 'Français'}
        </span>
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
              onBlur={(e) => handleBlur(key, e)}
              onKeyDown={(e) => handleKeyPress(key, (e.target as HTMLInputElement).value, e)}
              className="bg-white dark:bg-slate-800"
              disabled={savingKeys.has(key)}
            />
            {savingKeys.has(key) && (
              <div className="text-xs text-blue-600">Saving...</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
