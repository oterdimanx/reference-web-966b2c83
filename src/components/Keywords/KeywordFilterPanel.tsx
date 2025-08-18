import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Filter, RotateCcw } from "lucide-react";
import { keywordService } from "@/services/keywordService";
import { useAuth } from "@/contexts/AuthContext";

export interface KeywordFilters {
  search: string;
  tags: string[];
  group: string | null;
  priority: 'all' | 'priority' | 'non-priority';
  position: 'all' | 'top-10' | 'top-30' | 'unranked';
}

interface KeywordFilterPanelProps {
  filters: KeywordFilters;
  onFiltersChange: (filters: KeywordFilters) => void;
  className?: string;
}

export const KeywordFilterPanel = ({ filters, onFiltersChange, className }: KeywordFilterPanelProps) => {
  const { user } = useAuth();
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableGroups, setAvailableGroups] = useState<{name: string, color?: string}[]>([]);

  useEffect(() => {
    if (user) {
      loadFilterOptions();
    }
  }, [user]);

  const loadFilterOptions = async () => {
    if (!user) return;
    
    try {
      const [tags, groups] = await Promise.all([
        keywordService.getUserTags(user.id),
        keywordService.getUserGroups(user.id)
      ]);
      setAvailableTags(tags);
      setAvailableGroups(groups);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const handleGroupChange = (group: string) => {
    onFiltersChange({ ...filters, group: group === 'all' ? null : group });
  };

  const handlePriorityChange = (priority: string) => {
    onFiltersChange({ ...filters, priority: priority as KeywordFilters['priority'] });
  };

  const handlePositionChange = (position: string) => {
    onFiltersChange({ ...filters, position: position as KeywordFilters['position'] });
  };

  const resetFilters = () => {
    onFiltersChange({
      search: '',
      tags: [],
      group: null,
      priority: 'all',
      position: 'all'
    });
  };

  const hasActiveFilters = filters.search || filters.tags.length > 0 || filters.group || filters.priority !== 'all' || filters.position !== 'all';

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Filter size={16} />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2">
              <RotateCcw size={14} />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div>
          <Label htmlFor="keyword-search" className="text-xs">Search Keywords</Label>
          <Input
            id="keyword-search"
            placeholder="Search keywords..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-8"
          />
        </div>

        {/* Priority Filter */}
        <div>
          <Label className="text-xs">Priority</Label>
          <Select value={filters.priority} onValueChange={handlePriorityChange}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Keywords</SelectItem>
              <SelectItem value="priority">Priority Only</SelectItem>
              <SelectItem value="non-priority">Non-Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Position Filter */}
        <div>
          <Label className="text-xs">Position</Label>
          <Select value={filters.position} onValueChange={handlePositionChange}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              <SelectItem value="top-10">Top 10</SelectItem>
              <SelectItem value="top-30">Top 30</SelectItem>
              <SelectItem value="unranked">Unranked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Group Filter */}
        {availableGroups.length > 0 && (
          <div>
            <Label className="text-xs">Group</Label>
            <Select value={filters.group || 'all'} onValueChange={handleGroupChange}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {availableGroups.map(group => (
                  <SelectItem key={group.name} value={group.name}>
                    <div className="flex items-center gap-2">
                      {group.color && (
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: group.color }}
                        />
                      )}
                      {group.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Tag Filter */}
        {availableTags.length > 0 && (
          <div>
            <Label className="text-xs">Tags</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {availableTags.map(tag => (
                <Badge
                  key={tag}
                  variant={filters.tags.includes(tag) ? "default" : "outline"}
                  className="text-xs cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                    <X 
                      size={12} 
                      className="ml-1 cursor-pointer" 
                      onClick={() => handleTagToggle(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};