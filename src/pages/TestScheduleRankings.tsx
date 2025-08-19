import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Play, RefreshCw, AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface CronLog {
  id: string;
  job_name: string;
  execution_time: string;
  status: string;
  processed_requests: number;
  execution_duration: string | null;
  error_message?: string | null;
  request_source: string;
}

interface PendingRequest {
  id: string;
  keyword: string;
  status: string;
  requested_at: string;
}

interface EnrichedRequest {
  id: string;
  keyword: string;
  status: string;
  requested_at: string;
  domain: string;
}

const TestScheduleRankings = () => {
  const [result, setResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [cronLogs, setCronLogs] = useState<CronLog[]>([]);
  const [pendingRequests, setPendingRequests] = useState<EnrichedRequest[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const loadData = async () => {
    setIsLoadingData(true);
    try {
      // Load recent cron execution logs
      const { data: logs } = await supabase
        .from('cron_execution_logs')
        .select('*')
        .order('execution_time', { ascending: false })
        .limit(10);
      
      // Load pending ranking requests with website info
      const { data: requests } = await supabase
        .from('ranking_requests')
        .select(`
          id,
          keyword,
          status,
          requested_at,
          website_id
        `)
        .in('status', ['pending', 'processing'])
        .order('requested_at', { ascending: false })
        .limit(20);

      // Get website domains for the requests
      const enrichedRequests = [];
      if (requests) {
        for (const request of requests) {
          const { data: website } = await supabase
            .from('websites')
            .select('domain')
            .eq('id', request.website_id)
            .single();
          
          enrichedRequests.push({
            ...request,
            domain: website?.domain || 'Unknown'
          });
        }
      }
      
      setCronLogs((logs || []).map(log => ({
        ...log,
        execution_duration: log.execution_duration?.toString() || null
      })));
      setPendingRequests(enrichedRequests);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const testFunction = async () => {
    setIsLoading(true);
    setResult("Testing function...");
    
    try {
      const response = await supabase.functions.invoke('schedule-rankings', {
        body: { 
          triggered_by: 'manual_test',
          test_execution: true 
        }
      });
      
      if (response.error) {
        setResult(`Error: ${response.error.message}`);
      } else {
        setResult(`Success!\n\n${JSON.stringify(response.data, null, 2)}`);
      }
      
      // Refresh data after test
      setTimeout(() => loadData(), 1000);
    } catch (error) {
      setResult(`Error: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerCronManually = async () => {
    setIsLoading(true);
    setResult("Triggering cron job manually...");
    
    try {
      // Use direct HTTP call to simulate cron job
      const response = await fetch('https://jixmwjplysaqlyzhpcmk.supabase.co/functions/v1/schedule-rankings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeG13anBseXNhcWx5emhwY21rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjQzNzYyNCwiZXhwIjoyMDYyMDEzNjI0fQ.KuvbemiiLfpGDdb5D0DhBoWKhf8IUERILlUqJcIoOXw'
        },
        body: JSON.stringify({ triggered_by: 'manual_cron_simulation' })
      });
      
      const data = await response.json();
      setResult(`Cron Simulation - Status: ${response.status}\n\n${JSON.stringify(data, null, 2)}`);
      
      // Refresh data after manual trigger
      setTimeout(() => loadData(), 1000);
    } catch (error) {
      setResult(`Error: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'started':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Started</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  useEffect(() => {
    loadData();
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Test Schedule Rankings Function
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={testFunction} 
                  disabled={isLoading}
                  variant="default"
                >
                  {isLoading ? "Testing..." : "Test Function (Supabase Client)"}
                </Button>
                
                <Button 
                  onClick={triggerCronManually} 
                  disabled={isLoading}
                  variant="secondary"
                >
                  {isLoading ? "Triggering..." : "Simulate Cron Job Trigger"}
                </Button>
                
                <Button 
                  onClick={loadData} 
                  disabled={isLoadingData}
                  variant="outline"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
              </div>
              
              {result && (
                <div className="border rounded-lg p-4 bg-muted">
                  <h3 className="font-semibold mb-2">Test Result:</h3>
                  <pre className="whitespace-pre-wrap text-sm overflow-x-auto max-h-64">
                    {result}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Ranking Requests ({pendingRequests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No pending requests</p>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{request.keyword}</p>
                        <p className="text-sm text-muted-foreground">{request.domain}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(request.status)}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(request.requested_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cron Execution Logs */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Cron Execution Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : cronLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No execution logs yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cronLogs.map((log) => (
                    <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{log.job_name}</h4>
                          {getStatusBadge(log.status)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Source: {log.request_source}</p>
                          <p>Execution: {new Date(log.execution_time).toLocaleString()}</p>
                          {log.execution_duration && (
                            <p>Duration: {log.execution_duration}</p>
                          )}
                          {log.processed_requests > 0 && (
                            <p>Processed: {log.processed_requests} requests</p>
                          )}
                        </div>
                      </div>
                      {log.error_message && (
                        <div className="ml-4 max-w-xs">
                          <p className="text-sm text-red-600 break-words">{log.error_message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TestScheduleRankings;