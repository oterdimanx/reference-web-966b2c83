import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Folders, Trash2, Edit3, Check, X, Merge, Palette } from 'lucide-react';
import { keywordService } from '@/services/keywordService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface GroupWithCount {
  name: string;
  color?: string;
  count: number;
}

interface GroupsManagerDialogProps {
  onGroupsChanged?: () => void;
}

const DEFAULT_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export function GroupsManagerDialog({ onGroupsChanged }: GroupsManagerDialogProps) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<GroupWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupValue, setEditGroupValue] = useState('');
  const [editGroupColor, setEditGroupColor] = useState('');
  const [originalGroupColor, setOriginalGroupColor] = useState('');
  const [deletingGroup, setDeletingGroup] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [mergeTarget, setMergeTarget] = useState('');
  const [mergeTargetColor, setMergeTargetColor] = useState(DEFAULT_COLORS[0]);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      loadGroups();
      setHasChanges(false);
    }
  }, [open, user]);

  const loadGroups = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [userGroups, groupCounts] = await Promise.all([
        keywordService.getUserGroups(user.id),
        keywordService.getGroupKeywordCounts(user.id)
      ]);
      
      const groupsWithCounts = userGroups.map(group => ({
        name: group.name,
        color: group.color,
        count: groupCounts[group.name] || 0
      })).sort((a, b) => b.count - a.count);
      
      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: "Error",
        description: "Failed to load groups",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRenameGroup = async (oldName: string, newName: string, newColor: string) => {
    if (!user || !newName.trim()) return;

    setLoading(true);
    try {
      // Rename group if name changed
      if (oldName !== newName.trim()) {
        await keywordService.renameUserGroup(user.id, oldName, newName.trim());
      }
      
      // Update color if changed
      if (newColor !== originalGroupColor) {
        await keywordService.updateGroupColor(user.id, newName.trim(), newColor);
      }
      
      await loadGroups();
      setEditingGroup(null);
      setEditGroupValue('');
      setEditGroupColor('');
      setOriginalGroupColor('');
      
      setHasChanges(true);
      toast({
        title: "Success",
        description: `Group "${newName.trim()}" updated successfully`
      });
    } catch (error) {
      console.error('Error updating group:', error);
      toast({
        title: "Error",
        description: "Failed to update group",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupName: string) => {
    if (!user) return;

    setLoading(true);
    try {
      await keywordService.deleteUserGroup(user.id, groupName);
      await loadGroups();
      setDeletingGroup(null);
      
      setHasChanges(true);
      toast({
        title: "Success",
        description: `Group "${groupName}" deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMergeGroups = async () => {
    if (!user || selectedGroups.size === 0 || !mergeTarget.trim()) return;

    setLoading(true);
    try {
      await keywordService.mergeUserGroups(user.id, Array.from(selectedGroups), mergeTarget.trim(), mergeTargetColor);
      await loadGroups();
      setSelectedGroups(new Set());
      setMergeTarget('');
      setMergeTargetColor(DEFAULT_COLORS[0]);
      setShowMergeDialog(false);
      
      setHasChanges(true);
      toast({
        title: "Success",
        description: `${selectedGroups.size} groups merged into "${mergeTarget.trim()}" successfully`
      });
    } catch (error) {
      console.error('Error merging groups:', error);
      toast({
        title: "Error",
        description: "Failed to merge groups",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupSelection = (groupName: string) => {
    const newSelection = new Set(selectedGroups);
    if (newSelection.has(groupName)) {
      newSelection.delete(groupName);
    } else {
      newSelection.add(groupName);
    }
    setSelectedGroups(newSelection);
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen && hasChanges && onGroupsChanged) {
      onGroupsChanged();
    }
    setOpen(newOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Folders size={16} className="mr-2" />
            Manage Groups
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Manage Groups</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Groups ({groups.length})</h3>
              {selectedGroups.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMergeDialog(true)}
                  className="text-blue-600"
                >
                  <Merge size={16} className="mr-1" />
                  Merge ({selectedGroups.size})
                </Button>
              )}
            </div>
            
            <ScrollArea className="h-[500px] border rounded-md p-4">
              {loading && groups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading groups...
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No groups found. Create groups by selecting keywords and using the "Add to Group" action.
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.map((group) => (
                    <div key={group.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedGroups.has(group.name)}
                          onChange={() => toggleGroupSelection(group.name)}
                          className="rounded"
                        />
                        
                        {editingGroup === group.name ? (
                          <div className="flex items-center gap-2 flex-1">
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-wrap gap-1">
                                {DEFAULT_COLORS.map((color) => (
                                  <button
                                    key={color}
                                    className={`w-5 h-5 rounded border-2 ${editGroupColor === color ? 'border-gray-800 ring-2 ring-blue-500' : 'border-gray-300'}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setEditGroupColor(color)}
                                    title={`Select ${color}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <Input
                              value={editGroupValue}
                              onChange={(e) => setEditGroupValue(e.target.value)}
                              className="font-medium flex-1"
                              placeholder="Enter group name"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRenameGroup(group.name, editGroupValue, editGroupColor)}
                              disabled={loading || !editGroupValue.trim()}
                              className="text-green-600 hover:text-green-600"
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingGroup(null);
                                setEditGroupValue('');
                                setEditGroupColor('');
                                setOriginalGroupColor('');
                              }}
                              disabled={loading}
                              className="text-gray-600 hover:text-gray-600"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-1">
                            <div 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: group.color || DEFAULT_COLORS[0] }}
                            />
                            <span className="font-medium">{group.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {group.count} keywords
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {editingGroup !== group.name && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingGroup(group.name);
                              setEditGroupValue(group.name);
                              setEditGroupColor(group.color || DEFAULT_COLORS[0]);
                              setOriginalGroupColor(group.color || DEFAULT_COLORS[0]);
                            }}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-600"
                          >
                            <Edit3 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingGroup(group.name)}
                            disabled={loading}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingGroup} onOpenChange={() => setDeletingGroup(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the group "{deletingGroup}"? This will remove the group from all keywords that use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingGroup && handleDeleteGroup(deletingGroup)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge Groups Dialog */}
      <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge Groups</AlertDialogTitle>
            <AlertDialogDescription>
              Merge {selectedGroups.size} selected groups into a single group. All keywords will be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="merge-target">Target Group Name</Label>
              <Input
                id="merge-target"
                placeholder="Enter target group name"
                value={mergeTarget}
                onChange={(e) => setMergeTarget(e.target.value)}
              />
            </div>
            <div>
              <Label>Target Group Color</Label>
              <div className="flex gap-2 mt-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded border-2 ${mergeTargetColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setMergeTargetColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setMergeTarget('');
              setMergeTargetColor(DEFAULT_COLORS[0]);
              setSelectedGroups(new Set());
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleMergeGroups}
              disabled={!mergeTarget.trim()}
            >
              Merge Groups
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}