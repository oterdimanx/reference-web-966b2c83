
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ThemePreference = 'light' | 'dark' | 'system';

interface UserPreferences {
  theme_preference: ThemePreference;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasAppliedInitialTheme, setHasAppliedInitialTheme] = useState(false);

  // Load user preferences when user is authenticated
  useEffect(() => {
    if (user) {
      loadPreferences();
    } else {
      setPreferences(null);
      setHasAppliedInitialTheme(false);
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Loading preferences for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('theme_preference')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        console.log('Loaded preferences:', data);
        setPreferences({
          theme_preference: data.theme_preference as ThemePreference
        });
      } else {
        console.log('No preferences found, creating default');
        // Create default preferences if none exist
        await createDefaultPreferences();
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!user) return;

    try {
      console.log('Creating default preferences for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .insert([
          {
            user_id: user.id,
            theme_preference: 'system'
          }
        ])
        .select('theme_preference')
        .single();

      if (error) {
        console.error('Error creating default preferences:', error);
        return;
      }

      console.log('Created default preferences:', data);
      setPreferences({
        theme_preference: data.theme_preference as ThemePreference
      });
    } catch (error) {
      console.error('Error creating default preferences:', error);
    }
  };

  const updateThemePreference = async (theme: ThemePreference) => {
    if (!user) {
      console.log('No user authenticated, skipping theme save');
      return;
    }

    try {
      console.log('Updating theme preference to:', theme);
      
      const { error } = await supabase
        .from('user_preferences')
        .update({ theme_preference: theme })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating theme preference:', error);
        toast.error('Failed to save theme preference');
        return;
      }

      console.log('Successfully updated theme preference');
      setPreferences(prev => prev ? { ...prev, theme_preference: theme } : { theme_preference: theme });
      toast.success('Theme preference saved');
    } catch (error) {
      console.error('Error updating theme preference:', error);
      toast.error('Failed to save theme preference');
    }
  };

  return {
    preferences,
    loading,
    updateThemePreference,
    hasAppliedInitialTheme,
    setHasAppliedInitialTheme
  };
}
