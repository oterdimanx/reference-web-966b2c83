
import { useDirectoryManagement } from '@/hooks/useDirectoryManagement';
import { useSampleData } from '@/hooks/useSampleData';
import { DirectoryAddForm } from './DirectoryAddForm';
import { DirectoryTable } from './DirectoryTable';
import { Button } from '@/components/ui/button';

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

  const { populateSampleData, isLoading: isPopulating } = useSampleData();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {directoryWebsites.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No directory websites found. Would you like to add some sample data?</p>
          <Button 
            onClick={populateSampleData} 
            disabled={isPopulating}
            variant="outline"
          >
            {isPopulating ? 'Adding Sample Data...' : 'Add Sample Data'}
          </Button>
        </div>
      )}
      
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
