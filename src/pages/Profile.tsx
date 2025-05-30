
import { useState } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Form schema
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
      toast.success("Profile updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    }
  });
  
  // Form for editing profile
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      email: user?.email || '',
      website: profile?.website || ''
    }
  });
  
  // Update form values when profile data changes
  useState(() => {
    if (profile && !isEditing) {
      form.reset({
        full_name: profile.full_name || '',
        username: profile.username || '',
        email: user?.email || '',
        website: profile.website || ''
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };
  
  // If not logged in, redirect to auth page
  if (!loading && !user) {
    return <Navigate to="/auth" />;
  }
  
  // Format initials for avatar fallback
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || '?';
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
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
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || user?.email || 'User'} />
                  <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
                </Avatar>
                
                <h2 className="text-xl font-semibold mb-1">
                  {profile?.full_name || user?.email?.split('@')[0] || 'User'}
                </h2>
                <p className="text-muted-foreground mb-4">{user?.email}</p>
                
                <div className="w-full mt-4 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Username:</span>
                    <span>{profile?.username || '-'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Member since:</span>
                    <span>{new Date(user?.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                  {profile?.website && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium">Website:</span>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {new URL(profile.website).hostname}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>
                  {isEditing ? 'Edit your profile information below' : 'Your personal information and preferences'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormDescription>
                              This is your public username
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="email@example.com" {...field} disabled />
                            </FormControl>
                            <FormDescription>
                              Email address cannot be changed
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsEditing(false);
                            form.reset({
                              full_name: profile?.full_name || '',
                              username: profile?.username || '',
                              email: user?.email || '',
                              website: profile?.website || ''
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Full Name</label>
                      <p className="text-base border rounded-md bg-slate-50 p-2">
                        {profile?.full_name || '-'}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Username</label>
                      <p className="text-base border rounded-md bg-slate-50 p-2">
                        {profile?.username || '-'}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-base border rounded-md bg-slate-50 p-2">
                        {user?.email}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Website</label>
                      <p className="text-base border rounded-md bg-slate-50 p-2">
                        {profile?.website ? (
                          <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {profile.website}
                          </a>
                        ) : (
                          '-'
                        )}
                      </p>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    </div>
                  </div>
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
