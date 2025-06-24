
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  website: string | null;
}

interface ProfileDisplayProps {
  profile: Profile | null;
  userEmail: string | undefined;
  onEdit: () => void;
}

export const ProfileDisplay = ({ profile, userEmail, onEdit }: ProfileDisplayProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <label className="text-sm font-medium">{t('profilePage', 'fullName')}</label>
        <p className="text-base border rounded-md bg-slate-50 p-2">
          {profile?.full_name || '-'}
        </p>
      </div>
      
      <div className="space-y-1">
        <label className="text-sm font-medium">{t('profilePage', 'username')}</label>
        <p className="text-base border rounded-md bg-slate-50 p-2">
          {profile?.username || '-'}
        </p>
      </div>
      
      <div className="space-y-1">
        <label className="text-sm font-medium">{t('profilePage', 'email')}</label>
        <p className="text-base border rounded-md bg-slate-50 p-2">
          {userEmail}
        </p>
      </div>
      
      <div className="space-y-1">
        <label className="text-sm font-medium">{t('profilePage', 'website')}</label>
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
        <Button onClick={onEdit}>
          {t('profilePage', 'editProfile')}
        </Button>
      </div>
    </div>
  );
};
