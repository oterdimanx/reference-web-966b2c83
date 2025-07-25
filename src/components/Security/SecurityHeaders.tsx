import { useEffect } from 'react';

export const SecurityHeaders = () => {
  useEffect(() => {
    // Set security-related meta tags dynamically
    const setMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const setHttpEquivTag = (httpEquiv: string, content: string) => {
      let meta = document.querySelector(`meta[http-equiv="${httpEquiv}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.httpEquiv = httpEquiv;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Content Security Policy (restrictive but functional)
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.dicebear.com https://esm.sh",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://jixmwjplysaqlyzhpcmk.supabase.co wss://jixmwjplysaqlyzhpcmk.supabase.co https://api.dicebear.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    setHttpEquivTag('Content-Security-Policy', csp);

    // Additional security headers
    setMetaTag('referrer', 'strict-origin-when-cross-origin');
    setHttpEquivTag('X-Content-Type-Options', 'nosniff');
    setHttpEquivTag('X-Frame-Options', 'DENY');
    setHttpEquivTag('X-XSS-Protection', '1; mode=block');
    setHttpEquivTag('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    setMetaTag('permissions-policy', 'camera=(), microphone=(), geolocation=(), payment=()');

    // Prevent MIME type sniffing
    setHttpEquivTag('X-Content-Type-Options', 'nosniff');

    // Add CSRF token meta tag
    const csrfToken = crypto.randomUUID();
    setMetaTag('csrf-token', csrfToken);
    
    // Store CSRF token for API requests
    sessionStorage.setItem('csrf-token', csrfToken);

  }, []);

  return null; // This component doesn't render anything
};

// Hook to get CSRF token for API requests
export const useCSRFToken = () => {
  const getCSRFToken = () => {
    return sessionStorage.getItem('csrf-token') || '';
  };

  return { getCSRFToken };
};