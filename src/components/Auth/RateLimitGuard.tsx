import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  lockedUntil?: number;
}

const RATE_LIMITS = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 30 * 60 * 1000, // 30 minutes lockout
};

const getRateLimitKey = (email: string, action: string) => 
  `rateLimit_${action}_${email}`;

export const useRateLimit = () => {
  const [isLocked, setIsLocked] = useState(false);

  const checkRateLimit = useCallback((email: string, action: 'login' | 'signup'): boolean => {
    const key = getRateLimitKey(email, action);
    const storedData = localStorage.getItem(key);
    const now = Date.now();

    if (!storedData) {
      return true; // No previous attempts
    }

    const rateLimitState: RateLimitState = JSON.parse(storedData);

    // Check if still locked out
    if (rateLimitState.lockedUntil && now < rateLimitState.lockedUntil) {
      const remainingMs = rateLimitState.lockedUntil - now;
      const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
      toast.error(`Too many attempts. Try again in ${remainingMinutes} minutes.`);
      setIsLocked(true);
      return false;
    }

    // Check if window has expired
    if (now - rateLimitState.lastAttempt > RATE_LIMITS.windowMs) {
      // Reset counter if window expired
      localStorage.setItem(key, JSON.stringify({
        attempts: 0,
        lastAttempt: now,
      }));
      setIsLocked(false);
      return true;
    }

    // Check if exceeded max attempts
    if (rateLimitState.attempts >= RATE_LIMITS.maxAttempts) {
      const newLockoutTime = now + RATE_LIMITS.lockoutMs;
      localStorage.setItem(key, JSON.stringify({
        ...rateLimitState,
        lockedUntil: newLockoutTime,
      }));
      const lockoutMinutes = Math.ceil(RATE_LIMITS.lockoutMs / (60 * 1000));
      toast.error(`Too many attempts. Account locked for ${lockoutMinutes} minutes.`);
      setIsLocked(true);
      return false;
    }

    setIsLocked(false);
    return true;
  }, []);

  const recordAttempt = useCallback((email: string, action: 'login' | 'signup', success: boolean) => {
    const key = getRateLimitKey(email, action);
    const now = Date.now();

    if (success) {
      // Clear rate limit on successful auth
      localStorage.removeItem(key);
      setIsLocked(false);
      return;
    }

    // Record failed attempt
    const storedData = localStorage.getItem(key);
    const currentState: RateLimitState = storedData 
      ? JSON.parse(storedData)
      : { attempts: 0, lastAttempt: now };

    const newState: RateLimitState = {
      attempts: currentState.attempts + 1,
      lastAttempt: now,
    };

    localStorage.setItem(key, JSON.stringify(newState));

    // Show warning if approaching limit
    const remaining = RATE_LIMITS.maxAttempts - newState.attempts;
    if (remaining <= 2 && remaining > 0) {
      toast.warning(`${remaining} attempts remaining before lockout.`);
    }
  }, []);

  const getRemainingLockTime = useCallback((email: string, action: 'login' | 'signup'): number => {
    const key = getRateLimitKey(email, action);
    const storedData = localStorage.getItem(key);
    
    if (!storedData) return 0;

    const rateLimitState: RateLimitState = JSON.parse(storedData);
    if (!rateLimitState.lockedUntil) return 0;

    const remaining = rateLimitState.lockedUntil - Date.now();
    return Math.max(0, remaining);
  }, []);

  return {
    checkRateLimit,
    recordAttempt,
    getRemainingLockTime,
    isLocked,
  };
};