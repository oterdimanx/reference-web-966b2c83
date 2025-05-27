
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Language, Translations } from '@/types/translations';
import { enTranslations } from '@/translations/en';
import { frTranslations } from '@/translations/fr';

interface CustomTranslation {
  id: string;
  language: Language;
  section_key: keyof Translations;
  translation_key: string;
  value: string;
}

export function useCustomTranslations() {
  const queryClient = useQueryClient();
  const [migrationComplete, setMigrationComplete] = useState(false);
  
  const { data: customTranslations = [], isLoading } = useQuery({
    queryKey: ['custom-translations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_translations')
        .select('*');
      
      if (error) {
        console.error('Error fetching custom translations:', error);
        return [];
      }
      
      return data as CustomTranslation[];
    }
  });

  const saveTranslationMutation = useMutation({
    mutationFn: async ({ 
      language, 
      sectionKey, 
      translationKey, 
      value 
    }: {
      language: Language;
      sectionKey: keyof Translations;
      translationKey: string;
      value: string;
    }) => {
      const { data, error } = await supabase
        .from('custom_translations')
        .upsert({
          language,
          section_key: sectionKey,
          translation_key: translationKey,
          value
        }, {
          onConflict: 'language,section_key,translation_key'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-translations'] });
    }
  });

  const migrateLocalStorageToDatabase = async () => {
    if (migrationComplete) return;
    
    const customTranslationsLS = localStorage.getItem('customTranslations');
    if (!customTranslationsLS) {
      setMigrationComplete(true);
      return;
    }

    try {
      const parsed = JSON.parse(customTranslationsLS);
      const migrations = [];

      if (parsed.en) {
        Object.keys(parsed.en).forEach(sectionKey => {
          const section = parsed.en[sectionKey];
          if (section && typeof section === 'object') {
            Object.keys(section).forEach(translationKey => {
              migrations.push({
                language: 'en' as Language,
                section_key: sectionKey,
                translation_key: translationKey,
                value: section[translationKey]
              });
            });
          }
        });
      }

      if (parsed.fr) {
        Object.keys(parsed.fr).forEach(sectionKey => {
          const section = parsed.fr[sectionKey];
          if (section && typeof section === 'object') {
            Object.keys(section).forEach(translationKey => {
              migrations.push({
                language: 'fr' as Language,
                section_key: sectionKey,
                translation_key: translationKey,
                value: section[translationKey]
              });
            });
          }
        });
      }

      if (migrations.length > 0) {
        const { error } = await supabase
          .from('custom_translations')
          .upsert(migrations, {
            onConflict: 'language,section_key,translation_key'
          });

        if (error) {
          console.error('Error migrating translations:', error);
        } else {
          localStorage.removeItem('customTranslations');
          console.log(`Migrated ${migrations.length} translations to database`);
          queryClient.invalidateQueries({ queryKey: ['custom-translations'] });
        }
      }
    } catch (error) {
      console.error('Error parsing localStorage translations:', error);
    }
    
    setMigrationComplete(true);
  };

  const buildTranslations = (language: Language): Translations => {
    const baseTranslations = language === 'en' ? enTranslations : frTranslations;
    const result: Translations = JSON.parse(JSON.stringify(baseTranslations));

    customTranslations
      .filter(t => t.language === language)
      .forEach(translation => {
        const section = result[translation.section_key];
        if (section && typeof section === 'object') {
          (section as any)[translation.translation_key] = translation.value;
        }
      });

    return result;
  };

  return {
    customTranslations,
    saveTranslation: saveTranslationMutation.mutate,
    saveTranslationAsync: saveTranslationMutation.mutateAsync,
    isSaving: saveTranslationMutation.isPending,
    isLoading,
    buildTranslations,
    migrateLocalStorageToDatabase
  };
}
