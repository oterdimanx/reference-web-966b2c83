import { useEffect } from 'react';
import { usePageMetadata } from '@/hooks/usePageMetadata';

interface DynamicHeadProps {
  pageKey: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackKeywords?: string;
}

export const DynamicHead = ({ 
  pageKey, 
  fallbackTitle = 'SEO Rank Tracker',
  fallbackDescription = 'Track your website rankings and improve your SEO strategy.',
  fallbackKeywords = 'seo, rank tracker, keyword tracking'
}: DynamicHeadProps) => {
  const { data: metadata } = usePageMetadata(pageKey);

  useEffect(() => {
    // Update page title
    const title = metadata?.title || fallbackTitle;
    document.title = title;

    // Update meta tags
    const updateMetaTag = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.name = name;
        document.head.appendChild(element);
      }
      element.content = content;
    };

    const updatePropertyTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Basic meta tags
    updateMetaTag('description', metadata?.description || fallbackDescription);
    updateMetaTag('keywords', metadata?.keywords || fallbackKeywords);
    updateMetaTag('robots', metadata?.robots || 'index,follow');
    
    if (metadata?.author) {
      updateMetaTag('author', metadata.author);
    }

    // Open Graph tags
    updatePropertyTag('og:title', metadata?.og_title || metadata?.title || fallbackTitle);
    updatePropertyTag('og:description', metadata?.og_description || metadata?.description || fallbackDescription);
    updatePropertyTag('og:type', 'website');
    
    if (metadata?.og_image) {
      updatePropertyTag('og:image', metadata.og_image);
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', metadata?.twitter_title || metadata?.title || fallbackTitle);
    updateMetaTag('twitter:description', metadata?.twitter_description || metadata?.description || fallbackDescription);
    
    if (metadata?.twitter_image) {
      updateMetaTag('twitter:image', metadata.twitter_image);
    }

    // Canonical URL
    if (metadata?.canonical_url) {
      let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalElement) {
        canonicalElement = document.createElement('link');
        canonicalElement.rel = 'canonical';
        document.head.appendChild(canonicalElement);
      }
      canonicalElement.href = metadata.canonical_url;
    }

    // JSON-LD structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": metadata?.title || fallbackTitle,
      "description": metadata?.description || fallbackDescription,
      "url": window.location.href,
      ...(metadata?.author && { "author": { "@type": "Person", "name": metadata.author } })
    };

    let jsonLdElement = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!jsonLdElement) {
      jsonLdElement = document.createElement('script');
      jsonLdElement.type = 'application/ld+json';
      document.head.appendChild(jsonLdElement);
    }
    jsonLdElement.textContent = JSON.stringify(structuredData);

  }, [metadata, pageKey, fallbackTitle, fallbackDescription, fallbackKeywords]);

  return null; // This component doesn't render anything
};