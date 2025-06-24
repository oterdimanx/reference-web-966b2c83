
import { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileAvatar } from '@/components/Profile/ProfileAvatar';
import { ProfileForm } from '@/components/Profile/ProfileForm';
import { ProfileDisplay } from '@/components/Profile/ProfileDisplay';
import { z } from 'zod';

const profileFormSchema = z.object({
  full_name: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal(''))
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  website: string | null;
}

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user
  });
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name || null,
          username: values.username || null,
          website: values.website || null
        })
        .eq('id', user.id)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success(t('profilePage', 'profileUpdated'));
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(`${t('profilePage', 'profileUpdateFailed')}: ${error.message}`);
    }
  });
  
  // Handle form submission
  const handleSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };
  
  // Handle cancel editing
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  // If not logged in, redirect to auth page
  if (!loading && !user) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('profilePage', 'title')}</h1>
        
        {loading || profileLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <ProfileAvatar 
              profile={profile}
              userEmail={user?.email}
              userCreatedAt={user?.created_at}
            />
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>{t('profilePage', 'profileDetails')}</CardTitle>
                <CardDescription>
                  {isEditing ? t('profilePage', 'editProfileDetails') : t('profilePage', 'personalInformationPreferences')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <ProfileForm
                    profile={profile}
                    userEmail={user?.email}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={updateProfileMutation.isPending}
                  />
                ) : (
                  <ProfileDisplay
                    profile={profile}
                    userEmail={user?.email}
                    onEdit={() => setIsEditing(true)}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
