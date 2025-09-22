import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Edit3, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { KeywordDifficultyBadge } from './KeywordDifficultyBadge';

interface DifficultySelectorProps {
  value?: string;
  websiteId: string;
  keyword: string;
  userId: string;
  onUpdate: (value: string) => void;
}

const DIFFICULTY_LEVELS = [
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Very High', value: 'Very High' }
];

export const DifficultySelector = ({ value, websiteId, keyword, userId, onUpdate }: DifficultySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!selectedDifficulty) return;

    setIsLoading(true);
    try {
      const { keywordService } = await import('@/services/keywordService');
      await keywordService.updateKeywordPreferences(userId, websiteId, keyword, {
        difficulty_estimate: selectedDifficulty
      });
      onUpdate(selectedDifficulty);
      setIsOpen(false);
      toast({ title: 'Difficulty updated successfully' });
    } catch (error) {
      console.error('Error updating difficulty:', error);
      toast({ title: 'Failed to update difficulty', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedDifficulty('');
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-auto p-1 hover:bg-muted">
          <div className="flex items-center gap-1">
            <KeywordDifficultyBadge difficulty={value || 'Unknown'} />
            <Edit3 size={12} className="opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="center">
        <div className="space-y-3">
          <div className="font-medium text-sm">Set Difficulty Level</div>
          
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty..." />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_LEVELS.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  <div className="flex items-center gap-2">
                    <KeywordDifficultyBadge difficulty={level.value} />
                    {level.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={isLoading || !selectedDifficulty}
              className="flex-1"
            >
              <Check size={12} className="mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X size={12} className="mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};