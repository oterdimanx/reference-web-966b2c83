import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { csvExportService, ExportOptions } from '@/services/csvExportService';
import { UserKeyword } from '@/services/keywordService';
import { useToast } from '@/hooks/use-toast';

interface ExportDialogProps {
  keywords: UserKeyword[];
  selectedWebsiteId?: string;
}

export function ExportDialog({ keywords, selectedWebsiteId }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    includeRankings: true,
    includeHistoricalData: false,
    includePreferences: true,
  });
  const [dateRange, setDateRange] = useState<{ start: Date | undefined; end: Date | undefined }>({
    start: undefined,
    end: undefined,
  });
  const { toast } = useToast();

  const handleExport = async (exportType: 'current' | 'historical' | 'filtered') => {
    if (keywords.length === 0) {
      toast({
        title: "No Data",
        description: "No keywords available to export",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const exportOptions: ExportOptions = {
        ...options,
        dateRange: dateRange.start && dateRange.end ? {
          start: dateRange.start,
          end: dateRange.end
        } : undefined
      };

      switch (exportType) {
        case 'current':
          await csvExportService.exportKeywordsToCSV(keywords, exportOptions);
          break;
        case 'historical':
          if (!selectedWebsiteId) {
            toast({
              title: "Error",
              description: "Please select a website to export historical data",
              variant: "destructive"
            });
            return;
          }
          const keywordNames = keywords.map(k => k.keyword);
          await csvExportService.exportRankingHistoryToCSV(selectedWebsiteId, keywordNames, exportOptions);
          break;
        case 'filtered':
          await csvExportService.exportFilteredData(keywords, {}, exportOptions);
          break;
      }

      toast({
        title: "Export Successful",
        description: "Your data has been exported to CSV",
      });
      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download size={16} className="mr-2" />
          Export Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Keyword Data</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Options */}
          <div className="space-y-4">
            <h4 className="font-medium">Include in Export</h4>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rankings"
                  checked={options.includeRankings}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, includeRankings: checked as boolean }))
                  }
                />
                <Label htmlFor="rankings">Current Rankings</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preferences"
                  checked={options.includePreferences}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, includePreferences: checked as boolean }))
                  }
                />
                <Label htmlFor="preferences">User Preferences & Notes</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="historical"
                  checked={options.includeHistoricalData}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, includeHistoricalData: checked as boolean }))
                  }
                />
                <Label htmlFor="historical">Historical Data</Label>
              </div>
            </div>
          </div>

          {/* Date Range Selection */}
          {options.includeHistoricalData && (
            <div className="space-y-4">
              <h4 className="font-medium">Date Range (Optional)</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.start && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.start ? format(dateRange.start, "PPP") : "Start"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.start}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label className="text-sm">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange.end && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.end ? format(dateRange.end, "PPP") : "End"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.end}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          {/* Export Actions */}
          <div className="space-y-3">
            <Button
              onClick={() => handleExport('current')}
              disabled={loading}
              className="w-full"
            >
              Export Current Data ({keywords.length} keywords)
            </Button>
            
            {selectedWebsiteId && (
              <Button
                onClick={() => handleExport('historical')}
                disabled={loading || !options.includeHistoricalData}
                variant="outline"
                className="w-full"
              >
                Export Historical Data
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}