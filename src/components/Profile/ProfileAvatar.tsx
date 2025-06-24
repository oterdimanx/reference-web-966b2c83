
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  website: string | null;
}

interface ProfileAvatarProps {
  profile: Profile | null;
  userEmail: string | undefined;
  userCreatedAt: string | undefined;
}

export const ProfileAvatar = ({ profile, userEmail, userCreatedAt }: ProfileAvatarProps) => {
  const { t } = useLanguage();
  
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return userEmail?.substring(0, 2).toUpperCase() || '?';
  };

  return (
    <Card className="md:col-span-1">
      <CardHeader>
        <CardTitle>{t('profilePage', 'accountInformation')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || userEmail || 'User'} />
          <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
        </Avatar>
        
        <h2 className="text-xl font-semibold mb-1">
          {profile?.full_name || userEmail?.split('@')[0] || 'User'}
        </h2>
        <p className="text-muted-foreground mb-4">{userEmail}</p>
        
        <div className="w-full mt-4 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">{t('profilePage', 'username')}:</span>
            <span>{profile?.username || '-'}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">{t('profilePage', 'memberSince')}:</span>
            <span>{new Date(userCreatedAt || Date.now()).toLocaleDateString()}</span>
          </div>
          {profile?.website && (
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">{t('profilePage', 'website')}:</span>
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {new URL(profile.website).hostname}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
