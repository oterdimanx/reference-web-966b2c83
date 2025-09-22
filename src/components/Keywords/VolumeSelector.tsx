import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Edit3, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VolumeSelectorProps {
  value?: string;
  websiteId: string;
  keyword: string;
  userId: string;
  onUpdate: (value: string) => void;
}

const VOLUME_PRESETS = [
  { label: '0-100', value: '0-100' },
  { label: '100-1K', value: '100-1K' },
  { label: '1K-10K', value: '1K-10K' },
  { label: '10K+', value: '10K+' },
  { label: 'Custom', value: 'custom' }
];

export const VolumeSelector = ({ value, websiteId, keyword, userId, onUpdate }: VolumeSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customValue, setCustomValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    const finalValue = selectedPreset === 'custom' ? customValue : selectedPreset;
    if (!finalValue.trim()) return;

    setIsLoading(true);
    try {
      const { keywordService } = await import('@/services/keywordService');
      await keywordService.updateKeywordPreferences(userId, websiteId, keyword, {
        volume_estimate: finalValue
      });
      onUpdate(finalValue);
      setIsOpen(false);
      toast({ title: 'Volume updated successfully' });
    } catch (error) {
      console.error('Error updating volume:', error);
      toast({ title: 'Failed to update volume', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedPreset('');
    setCustomValue('');
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-auto p-1 text-xs hover:bg-muted">
          <div className="flex items-center gap-1">
            <span>{value || 'Unknown'}</span>
            <Edit3 size={12} className="opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="center">
        <div className="space-y-3">
          <div className="font-medium text-sm">Set Volume Estimate</div>
          
          <Select value={selectedPreset} onValueChange={setSelectedPreset}>
            <SelectTrigger>
              <SelectValue placeholder="Select volume range..." />
            </SelectTrigger>
            <SelectContent>
              {VOLUME_PRESETS.map(preset => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPreset === 'custom' && (
            <Input
              placeholder="Enter custom volume (e.g., 5K, 500, 2.3M)"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              className="text-sm"
            />
          )}

          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={handleSave} 
              disabled={isLoading || (!selectedPreset || (selectedPreset === 'custom' && !customValue.trim()))}
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