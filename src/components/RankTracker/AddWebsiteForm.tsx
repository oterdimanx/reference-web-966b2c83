
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AddWebsiteFormProps {
  onAddWebsite: (website: any) => void;
}

export function AddWebsiteForm({ onAddWebsite }: AddWebsiteFormProps) {
  const navigate = useNavigate();
  const [domain, setDomain] = useState('');
  const [keywords, setKeywords] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Redirect to the Add Website page with the form values as URL parameters
    navigate(`/add-website?domain=${encodeURIComponent(domain)}&keywords=${encodeURIComponent(keywords)}`);
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
            className="w-full bg-rank-teal hover:bg-rank-teal/90"
          >
            Continue
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
