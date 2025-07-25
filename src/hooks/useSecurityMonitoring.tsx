import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  event_type: string;
  target_user_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export const useSecurityMonitoring = () => {
  const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
    try {
      // Get client IP and user agent
      const userAgent = navigator.userAgent;
      
      // Call edge function to log security event with proper IP detection
      const { error } = await supabase.functions.invoke('log-security-event', {
        body: {
          ...event,
          user_agent: userAgent,
        },
      });

      if (error) {
        console.error('Failed to log security event:', error);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }, []);

  const logFailedAuth = useCallback((email: string, reason: string) => {
    logSecurityEvent({
      event_type: 'AUTH_FAILED',
      details: {
        email,
        reason,
        timestamp: new Date().toISOString(),
      },
    });
  }, [logSecurityEvent]);

  const logSuccessfulAuth = useCallback((userId: string, method: string) => {
    logSecurityEvent({
      event_type: 'AUTH_SUCCESS',
      target_user_id: userId,
      details: {
        method,
        timestamp: new Date().toISOString(),
      },
    });
  }, [logSecurityEvent]);

  const logSuspiciousActivity = useCallback((activity: string, details: Record<string, any>) => {
    logSecurityEvent({
      event_type: 'SUSPICIOUS_ACTIVITY',
      details: {
        activity,
        ...details,
        timestamp: new Date().toISOString(),
      },
    });
  }, [logSecurityEvent]);

  const logPrivilegeEscalation = useCallback((targetUserId: string, role: string) => {
    logSecurityEvent({
      event_type: 'PRIVILEGE_ESCALATION',
      target_user_id: targetUserId,
      details: {
        role,
        timestamp: new Date().toISOString(),
      },
    });
  }, [logSecurityEvent]);

  const logDataAccess = useCallback((resource: string, operation: string, details?: Record<string, any>) => {
    logSecurityEvent({
      event_type: 'DATA_ACCESS',
      details: {
        resource,
        operation,
        ...details,
        timestamp: new Date().toISOString(),
      },
    });
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
    logFailedAuth,
    logSuccessfulAuth,
    logSuspiciousActivity,
    logPrivilegeEscalation,
    logDataAccess,
  };
};