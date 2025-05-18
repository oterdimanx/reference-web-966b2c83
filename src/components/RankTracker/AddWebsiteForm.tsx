
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { RankingSummary } from '@/lib/mockData';
import { v4 as uuidv4 } from 'uuid';

interface AddWebsiteFormProps {
  onAddWebsite: (website: RankingSummary) => void;
}

export function AddWebsiteForm({ onAddWebsite }: AddWebsiteFormProps) {
  const { toast } = useToast();
  const [domain, setDomain] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Create a new website entry
    const newWebsite: RankingSummary = {
      websiteId: uuidv4(),
      domain: domain,
      avgPosition: Math.floor(Math.random() * 15) + 1, // Random position between 1-15
      change: Math.floor(Math.random() * 5), // Random change between 0-4
      keywordCount: keywords.split(',').filter(k => k.trim().length > 0).length,
    };
    
    // Simulate API call delay
    setTimeout(() => {
      onAddWebsite(newWebsite);
      
      toast({
        title: "Website Added",
        description: `${domain} has been added for tracking`,
      });
      setIsLoading(false);
      setDomain('');
      setKeywords('');
    }, 1000);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Website</CardTitle>
        <CardDescription>
          Enter a website URL and keywords you want to track
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Website URL</Label>
            <Input
              id="domain"
              placeholder="example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (comma separated)</Label>
            <Input
              id="keywords"
              placeholder="seo, marketing, website design"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter up to 10 keywords you want to track for this website
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-rank-teal hover:bg-rank-teal/90"
          >
            {isLoading ? "Adding..." : "Add Website"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
