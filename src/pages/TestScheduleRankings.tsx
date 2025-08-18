import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";

const TestScheduleRankings = () => {
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testFunction = async () => {
    setIsLoading(true);
    setResult("Testing function...");
    
    try {
      const response = await fetch('https://jixmwjplysaqlyzhpcmk.supabase.co/functions/v1/schedule-rankings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeG13anBseXNhcWx5emhwY21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0Mzc2MjQsImV4cCI6MjA2MjAxMzYyNH0.oV09rw5jJbHl0eS_0HSmZ-6K0U0m6rxTeEK80h7fHwo'
        },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      setResult(`Response Status: ${response.status}\n\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Test Schedule Rankings Function</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testFunction} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Testing..." : "Test Schedule Rankings"}
            </Button>
            
            {result && (
              <div className="border rounded-lg p-4 bg-muted">
                <h3 className="font-semibold mb-2">Result:</h3>
                <pre className="whitespace-pre-wrap text-sm overflow-x-auto">
                  {result}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default TestScheduleRankings;