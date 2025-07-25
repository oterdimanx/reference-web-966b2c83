import { supabase } from '@/integrations/supabase/client';

export const useSecureDomainValidation = () => {
  const validateDomain = (domain: string): boolean => {
    // Remove protocol and www prefix for validation
    let cleanDomain = domain.toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, ''); // Remove trailing slash

    // Basic domain format validation
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!domainRegex.test(cleanDomain)) {
      return false;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /localhost/i,
      /127\.0\.0\.1/,
      /192\.168\./,
      /10\./,
      /172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /\.local$/i,
      /javascript:/i,
      /data:/i,
      /file:/i,
    ];

    return !suspiciousPatterns.some(pattern => pattern.test(cleanDomain));
  };

  const sanitizeDomain = (domain: string): string => {
    // Remove protocol, www, and normalize
    return domain.toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .trim();
  };

  const checkDuplicateDomain = async (domain: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return false;
      }

      // Sanitize domain before checking
      const cleanDomain = sanitizeDomain(domain);
      
      // Validate domain format
      if (!validateDomain(cleanDomain)) {
        throw new Error('Invalid domain format');
      }
      
      const { count } = await supabase
        .from('websites')
        .select('*', { count: 'exact' })
        .eq('domain', cleanDomain)
        .eq('user_id', user.id);
      
      return count !== undefined && count > 0;
    } catch (error) {
      console.error('Error checking duplicate domain:', error);
      throw error; // Re-throw to let caller handle
    }
  };

  return { 
    checkDuplicateDomain, 
    validateDomain, 
    sanitizeDomain 
  };
};