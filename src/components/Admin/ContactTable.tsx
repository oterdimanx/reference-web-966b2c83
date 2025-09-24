import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ContactPriorityBadge } from './ContactPriorityBadge';
import { ContactMessage, contactService } from '@/services/contactService';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContactTableProps {
  messages: ContactMessage[];
  onMessagesChange: () => void;
}

export const ContactTable = ({ messages, onMessagesChange }: ContactTableProps) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const { t } = useLanguage();

  const handlePriorityChange = async (messageId: string, priority: 'low' | 'medium' | 'high') => {
    setLoadingStates(prev => ({ ...prev, [messageId]: true }));
    
    try {
      await contactService.updateMessagePriority(messageId, priority);
      toast.success('Priority updated successfully');
      onMessagesChange();
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Failed to update priority');
    } finally {
      setLoadingStates(prev => ({ ...prev, [messageId]: false }));
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    setLoadingStates(prev => ({ ...prev, [messageId]: true }));
    
    try {
      await contactService.deleteMessage(messageId);
      toast.success('Message deleted successfully');
      onMessagesChange();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    } finally {
      setLoadingStates(prev => ({ ...prev, [messageId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Message</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {messages.map((message) => (
          <TableRow key={message.id}>
            <TableCell className="font-medium">{message.contact_name}</TableCell>
            <TableCell>{message.type}</TableCell>
            <TableCell className="max-w-md truncate">{message.description}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <ContactPriorityBadge priority={message.priority_level} />
                <Select
                  value={message.priority_level}
                  onValueChange={(value) => handlePriorityChange(message.id, value as 'low' | 'medium' | 'high')}
                  disabled={loadingStates[message.id]}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TableCell>
            <TableCell>{formatDate(message.created_at)}</TableCell>
            <TableCell>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={loadingStates[message.id]}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Contact Message</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this contact message from {message.contact_name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteMessage(message.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};