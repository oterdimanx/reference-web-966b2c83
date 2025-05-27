
import { useDirectoryManagement } from '@/hooks/useDirectoryManagement';
import { DirectoryAddForm } from './DirectoryAddForm';
import { DirectoryTable } from './DirectoryTable';

export function DirectoryManagement() {
  const {
    directoryWebsites,
    categories,
    userWebsites,
    isLoading,
    addWebsiteToDirectory,
    removeWebsiteFromDirectory,
    toggleWebsiteStatus
  } = useDirectoryManagement();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <DirectoryAddForm
        categories={categories}
        userWebsites={userWebsites}
        onSubmit={addWebsiteToDirectory}
      />
      
      <DirectoryTable
        directoryWebsites={directoryWebsites}
        onToggleStatus={toggleWebsiteStatus}
        onDelete={removeWebsiteFromDirectory}
      />
    </div>
  );
}
