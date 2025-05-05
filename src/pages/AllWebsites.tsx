
import { useState } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { WebsiteList } from '@/components/RankTracker/WebsiteList';
import { getRankingSummaries } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AllWebsites = () => {
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | undefined>(undefined);
  const rankingSummaries = getRankingSummaries();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">All Tracked Websites</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Complete Website Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <WebsiteList 
              websites={rankingSummaries}
              onSelectWebsite={setSelectedWebsiteId}
              selectedWebsiteId={selectedWebsiteId}
            />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AllWebsites;
