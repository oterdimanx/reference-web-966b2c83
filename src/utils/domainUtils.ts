/**
 * Sanitizes a domain by removing protocols, www prefix, trailing slashes,
 * converting to lowercase, and trimming whitespace.
 * 
 * @param domain - The domain string to sanitize
 * @returns The sanitized domain string
 */
export const sanitizeDomain = (domain: string): string => {
  // Remove protocol, www, and normalize
  return domain.toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .trim();
};

/**
 * Validates if a domain has a proper format
 * 
 * @param domain - The domain string to validate
 * @returns True if the domain is valid, false otherwise
 */
export const validateDomainFormat = (domain: string): boolean => {
  // Remove protocol and www prefix for validation
  const cleanDomain = sanitizeDomain(domain);

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