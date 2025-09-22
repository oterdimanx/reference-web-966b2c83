import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tags, Plus, Trash2, Edit3, Check, X, Merge } from 'lucide-react';
import { keywordService } from '@/services/keywordService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface TagWithCount {
  name: string;
  count: number;
}

export function TagsManagerDialog() {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editTagValue, setEditTagValue] = useState('');
  const [deletingTag, setDeletingTag] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [mergeTarget, setMergeTarget] = useState('');
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      loadTags();
    }
  }, [open, user]);

  const loadTags = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [userTags, tagCounts] = await Promise.all([
        keywordService.getUserTags(user.id),
        keywordService.getTagKeywordCounts(user.id)
      ]);
      
      const tagsWithCounts = userTags.map(tag => ({
        name: tag,
        count: tagCounts[tag] || 0
      })).sort((a, b) => b.count - a.count);
      
      setTags(tagsWithCounts);
    } catch (error) {
      console.error('Error loading tags:', error);
      toast({
        title: "Error",
        description: "Failed to load tags",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async () => {
    if (!user || !newTagInput.trim()) return;

    setLoading(true);
    try {
      // Create a dummy keyword preference to establish the tag
      await keywordService.updateKeywordPreferences(user.id, '', '', {
        tags: [newTagInput.trim()]
      });
      
      setNewTagInput('');
      await loadTags();
      
      toast({
        title: "Success",
        description: `Tag "${newTagInput.trim()}" created successfully`
      });
    } catch (error) {
      console.error('Error creating tag:', error);
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRenameTag = async (oldTag: string, newTag: string) => {
    if (!user || !newTag.trim()) return;

    setLoading(true);
    try {
      await keywordService.renameUserTag(user.id, oldTag, newTag.trim());
      await loadTags();
      setEditingTag(null);
      setEditTagValue('');
      
      toast({
        title: "Success",
        description: `Tag renamed from "${oldTag}" to "${newTag.trim()}" successfully`
      });
    } catch (error) {
      console.error('Error renaming tag:', error);
      toast({
        title: "Error",
        description: "Failed to rename tag",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagName: string) => {
    if (!user) return;

    setLoading(true);
    try {
      await keywordService.deleteUserTag(user.id, tagName);
      await loadTags();
      setDeletingTag(null);
      
      toast({
        title: "Success",
        description: `Tag "${tagName}" deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast({
        title: "Error",
        description: "Failed to delete tag",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMergeTags = async () => {
    if (!user || selectedTags.size === 0 || !mergeTarget.trim()) return;

    setLoading(true);
    try {
      await keywordService.mergeUserTags(user.id, Array.from(selectedTags), mergeTarget.trim());
      await loadTags();
      setSelectedTags(new Set());
      setMergeTarget('');
      setShowMergeDialog(false);
      
      toast({
        title: "Success",
        description: `${selectedTags.size} tags merged into "${mergeTarget.trim()}" successfully`
      });
    } catch (error) {
      console.error('Error merging tags:', error);
      toast({
        title: "Error",
        description: "Failed to merge tags",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTagSelection = (tagName: string) => {
    const newSelection = new Set(selectedTags);
    if (newSelection.has(tagName)) {
      newSelection.delete(tagName);
    } else {
      newSelection.add(tagName);
    }
    setSelectedTags(newSelection);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Tags size={16} className="mr-2" />
            Manage Tags
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Current Tags */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your Tags ({tags.length})</h3>
                {selectedTags.size > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMergeDialog(true)}
                    className="text-blue-600"
                  >
                    <Merge size={16} className="mr-1" />
                    Merge ({selectedTags.size})
                  </Button>
                )}
              </div>
              
              <ScrollArea className="h-[400px] border rounded-md p-4">
                {loading && tags.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading tags...
                  </div>
                ) : tags.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tags found. Create your first tag to get started.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tags.map((tag) => (
                      <div key={tag.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedTags.has(tag.name)}
                            onChange={() => toggleTagSelection(tag.name)}
                            className="rounded"
                          />
                          
                          {editingTag === tag.name ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editTagValue}
                                onChange={(e) => setEditTagValue(e.target.value)}
                                className="font-medium"
                                placeholder="Enter tag name"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRenameTag(tag.name, editTagValue)}
                                disabled={loading || !editTagValue.trim()}
                                className="text-green-600 hover:text-green-600"
                              >
                                <Check size={14} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingTag(null);
                                  setEditTagValue('');
                                }}
                                disabled={loading}
                                className="text-gray-600 hover:text-gray-600"
                              >
                                <X size={14} />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 flex-1">
                              <span className="font-medium">{tag.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {tag.count} keywords
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        {editingTag !== tag.name && (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingTag(tag.name);
                                setEditTagValue(tag.name);
                              }}
                              disabled={loading}
                              className="text-blue-600 hover:text-blue-600"
                            >
                              <Edit3 size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingTag(tag.name)}
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

            {/* Create New Tag */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Create New Tag</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-tag">Tag Name</Label>
                  <Input
                    id="new-tag"
                    placeholder="Enter tag name"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                  />
                </div>
                
                <Button
                  onClick={handleCreateTag}
                  disabled={loading || !newTagInput.trim()}
                  className="w-full"
                >
                  <Plus size={16} className="mr-2" />
                  Create Tag
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingTag} onOpenChange={() => setDeletingTag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the tag "{deletingTag}"? This will remove the tag from all keywords that use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingTag && handleDeleteTag(deletingTag)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge Tags Dialog */}
      <AlertDialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge Tags</AlertDialogTitle>
            <AlertDialogDescription>
              Merge {selectedTags.size} selected tags into a single tag. All keywords will be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="merge-target">Target Tag Name</Label>
            <Input
              id="merge-target"
              placeholder="Enter target tag name"
              value={mergeTarget}
              onChange={(e) => setMergeTarget(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setMergeTarget('');
              setSelectedTags(new Set());
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleMergeTags}
              disabled={!mergeTarget.trim()}
            >
              Merge Tags
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}