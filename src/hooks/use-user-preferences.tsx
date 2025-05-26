
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

  // Load user preferences when user is authenticated
  useEffect(() => {
    if (user) {
      loadPreferences();
    } else {
      setPreferences(null);
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
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
        setPreferences(data);
      } else {
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

      setPreferences(data);
    } catch (error) {
      console.error('Error creating default preferences:', error);
    }
  };

  const updateThemePreference = async (theme: ThemePreference) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ theme_preference: theme })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating theme preference:', error);
        toast.error('Failed to save theme preference');
        return;
      }

      setPreferences(prev => prev ? { ...prev, theme_preference: theme } : { theme_preference: theme });
    } catch (error) {
      console.error('Error updating theme preference:', error);
      toast.error('Failed to save theme preference');
    }
  };

  return {
    preferences,
    loading,
    updateThemePreference
  };
}
