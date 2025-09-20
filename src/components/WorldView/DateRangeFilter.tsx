import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  isAllTime: boolean;
  onToggleAllTime: (allTime: boolean) => void;
}

export function DateRangeFilter({ onDateRangeChange, isAllTime, onToggleAllTime }: DateRangeFilterProps) {
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const handleAllTimeToggle = () => {
    const newAllTime = !isAllTime;
    onToggleAllTime(newAllTime);
    
    if (newAllTime) {
      setStartDate(undefined);
      setEndDate(undefined);
      onDateRangeChange(null, null);
    }
  };

  const handleApplyFilter = () => {
    if (!isAllTime && startDate && endDate) {
      onDateRangeChange(startDate, endDate);
    }
  };

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant={isAllTime ? "default" : "outline"}
            size="sm"
            onClick={handleAllTimeToggle}
          >
            {t('worldViewPage', 'filters.allTime')}
          </Button>
          <Button
            variant={!isAllTime ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleAllTime(false)}
          >
            {t('worldViewPage', 'filters.dateRange')}
          </Button>
        </div>

        {!isAllTime && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  {t('worldViewPage', 'filters.from')}
                </label>
                <Popover open={startOpen} onOpenChange={setStartOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {startDate ? format(startDate, "MMM dd, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setStartOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() || (endDate && date >= endDate)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  {t('worldViewPage', 'filters.to')}
                </label>
                <Popover open={endOpen} onOpenChange={setEndOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {endDate ? format(endDate, "MMM dd, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setEndOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() || (startDate && date <= startDate)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button
              onClick={handleApplyFilter}
              disabled={!startDate || !endDate}
              size="sm"
              className="w-full"
            >
              {t('worldViewPage', 'filters.apply')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}