import { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { ContactTable } from '@/components/Admin/ContactTable';
import { contactService, ContactMessage } from '@/services/contactService';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export const ContactManagement = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await contactService.getAllContactMessages();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast.error('Failed to load contact messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleMessagesChange = () => {
    fetchMessages();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contact Messages Management</h1>
            <p className="text-muted-foreground">
              Manage and prioritize contact messages from users
            </p>
          </div>

          <div className="bg-card rounded-lg border p-6">
            {loading ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-8 w-32" />
                </div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Messages ({messages.length})</h2>
                </div>
                
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No contact messages found
                  </div>
                ) : (
                  <ContactTable 
                    messages={messages} 
                    onMessagesChange={handleMessagesChange} 
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};