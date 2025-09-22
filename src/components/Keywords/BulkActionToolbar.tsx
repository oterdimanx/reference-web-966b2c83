import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { X, Tag, Users, Palette, BarChart3, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BulkActionToolbarProps {
  selectedKeywords: string[];
  availableGroups: {name: string, color?: string}[];
  availableTags: string[];
  onDeselectAll: () => void;
  onBulkAssignGroup: (groupName: string, groupColor?: string) => void;
  onBulkAssignTags: (tags: string[]) => void;
  onBulkAssignVolume: (volume: string) => void;
  onBulkAssignDifficulty: (difficulty: string) => void;
  onCreateGroup: (groupName: string, groupColor: string) => void;
  className?: string;
}

export const BulkActionToolbar = ({
  selectedKeywords,
  availableGroups,
  availableTags,
  onDeselectAll,
  onBulkAssignGroup,
  onBulkAssignTags,
  onBulkAssignVolume,
  onBulkAssignDifficulty,
  onCreateGroup,
  className
}: BulkActionToolbarProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#3b82f6');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [showCreateTag, setShowCreateTag] = useState(false);

  if (selectedKeywords.length === 0) return null;

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleApplyTags = () => {
    if (selectedTags.length > 0) {
      onBulkAssignTags(selectedTags);
      setSelectedTags([]);
    }
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateGroup(newGroupName.trim(), newGroupColor);
      onBulkAssignGroup(newGroupName.trim(), newGroupColor);
      setNewGroupName('');
      setShowCreateGroup(false);
    }
  };

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      const tagName = newTagName.trim();
      setSelectedTags(prev => [...prev, tagName]);
      setNewTagName('');
      setShowCreateTag(false);
    }
  };

  const colorOptions = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {selectedKeywords.length} keyword{selectedKeywords.length > 1 ? 's' : ''} selected
          </Badge>
          <Button variant="ghost" size="sm" onClick={onDeselectAll}>
            <X size={14} />
            Deselect All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Group Assignment */}
        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Users size={14} />
            Assign to Group
          </label>
          <div className="flex gap-2">
            <Select onValueChange={(value) => {
              if (value === 'create-new') {
                setShowCreateGroup(true);
              } else {
                const group = availableGroups.find(g => g.name === value);
                onBulkAssignGroup(value, group?.color);
              }
            }}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select group..." />
              </SelectTrigger>
              <SelectContent>
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
                <SelectItem value="create-new">
                  <div className="flex items-center gap-2 text-primary">
                    <Palette size={12} />
                    Create New Group
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showCreateGroup && (
            <div className="mt-2 p-3 border rounded-lg bg-muted/50 space-y-2">
              <Input
                placeholder="Group name..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="h-8"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs">Color:</span>
                <div className="flex gap-1">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full border-2 ${
                        newGroupColor === color ? 'border-foreground' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewGroupColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateGroup} className="h-7">
                  Create & Assign
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowCreateGroup(false)} className="h-7">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Tag Assignment */}
        <div>
          <label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Tag size={14} />
            Assign Tags
          </label>
          <div className="space-y-2">
            {/* Existing Tags */}
            {availableTags.length > 0 && (
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {availableTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="text-xs cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Create New Tag */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setShowCreateTag(true)}
                className="h-7 text-xs"
              >
                <Tag size={12} className="mr-1" />
                Create New Tag
              </Button>
            </div>

            {showCreateTag && (
              <div className="p-3 border rounded-lg bg-muted/50 space-y-2">
                <Input
                  placeholder="Tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="h-8"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateTag();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateTag} className="h-7">
                    Create Tag
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowCreateTag(false)} className="h-7">
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Selected Tags and Apply Button */}
            {selectedTags.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map(tag => (
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
                <Button size="sm" onClick={handleApplyTags} className="h-7">
                  Apply Tags
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Volume Assignment */}
      <div>
        <label className="text-sm font-medium mb-2 flex items-center gap-2">
          <BarChart3 size={14} />
          Assign Volume
        </label>
        <Select onValueChange={(value) => onBulkAssignVolume(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select volume..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-100">0-100</SelectItem>
            <SelectItem value="100-1K">100-1K</SelectItem>
            <SelectItem value="1K-10K">1K-10K</SelectItem>
            <SelectItem value="10K+">10K+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty Assignment */}
      <div>
        <label className="text-sm font-medium mb-2 flex items-center gap-2">
          <TrendingUp size={14} />
          Assign Difficulty
        </label>
        <Select onValueChange={(value) => onBulkAssignDifficulty(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                Low
              </div>
            </SelectItem>
            <SelectItem value="Medium">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                Medium
              </div>
            </SelectItem>
            <SelectItem value="High">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                High
              </div>
            </SelectItem>
            <SelectItem value="Very High">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                Very High
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};