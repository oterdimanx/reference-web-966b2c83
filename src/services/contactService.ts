import { supabase } from '@/integrations/supabase/client';

export interface ContactMessage {
  id: string;
  type: string;
  contact_name: string;
  description: string;
  user_id: string | null;
  priority_level: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export const contactService = {
  // Get all contact messages (admin only)
  async getAllContactMessages(): Promise<ContactMessage[]> {
    const { data, error } = await supabase
      .from('contact')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact messages:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      priority_level: item.priority_level as 'low' | 'medium' | 'high'
    }));
  },

  // Update message priority
  async updateMessagePriority(messageId: string, priority: 'low' | 'medium' | 'high'): Promise<void> {
    const { error } = await supabase
      .from('contact')
      .update({ priority_level: priority })
      .eq('id', messageId);

    if (error) {
      console.error('Error updating message priority:', error);
      throw error;
    }
  },

  // Delete message
  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('contact')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
};