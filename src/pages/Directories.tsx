
import { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { DirectoryWebsiteCard } from '@/components/Directory/DirectoryWebsiteCard';
import { DirectoryFilters } from '@/components/Directory/DirectoryFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDirectoryWebsites, getCategories, DirectoryWebsite, Category } from '@/services/directoryService';
import { useLanguage } from '@/contexts/LanguageContext';

const Directories = () => {
  const { t } = useLanguage();
  const [websites, setWebsites] = useState<DirectoryWebsite[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredWebsites, setFilteredWebsites] = useState<DirectoryWebsite[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [websitesData, categoriesData] = await Promise.all([
          getDirectoryWebsites(),
          getCategories()
        ]);
        
        setWebsites(websitesData);
        setCategories(categoriesData);
        setFilteredWebsites(websitesData);
      } catch (error) {
        console.error('Error fetching directory data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = websites;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(website => website.category_id === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(website =>
        website.domain.toLowerCase().includes(query) ||
        website.title?.toLowerCase().includes(query) ||
        website.description?.toLowerCase().includes(query) ||
        website.category?.name.toLowerCase().includes(query)
      );
    }

    setFilteredWebsites(filtered);
  }, [websites, selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Website Directory</h1>
          <p className="text-lg text-muted-foreground">
            Discover and explore our curated collection of supported websites, organized by categories.
          </p>
        </div>

        <DirectoryFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredWebsites.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredWebsites.length} website{filteredWebsites.length !== 1 ? 's' : ''}
              {selectedCategory && (
                <span> in {categories.find(c => c.id === selectedCategory)?.name}</span>
              )}
              {searchQuery && <span> matching "{searchQuery}"</span>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWebsites.map((website) => (
                <DirectoryWebsiteCard key={website.id} website={website} />
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold mb-2">No websites found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory
                  ? 'Try adjusting your filters or search terms.'
                  : 'No websites have been added to the directory yet.'}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Directories;
