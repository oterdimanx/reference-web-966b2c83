import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, AlertTriangle, User } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLogEntry {
  id: string;
  user_id: string;
  granted_role: string;
  granted_by: string;
  granted_at: string;
  action: string;
}

export const SecurityAuditLog = () => {
  const { user, isAdmin } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      if (!user || !isAdmin) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('role_audit_log')
          .select('*')
          .order('granted_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setAuditLogs(data || []);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, [user, isAdmin]);

  if (!isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Audit Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : auditLogs.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No audit logs found</p>
        ) : (
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">
                      Role {log.action.toLowerCase()}: {log.granted_role}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      User ID: {log.user_id}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-1">
                    {format(new Date(log.granted_at), 'MMM dd, yyyy HH:mm')}
                  </Badge>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    By: {log.granted_by}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};