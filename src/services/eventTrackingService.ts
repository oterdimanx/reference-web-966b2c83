
export interface TrackingEvent {
  session_id: string;
  event_type: 'click' | 'pageview';
  url: string;
  element_tag?: string;
  element_id?: string;
  element_classes?: string;
  click_x?: number;
  click_y?: number;
  screen_resolution?: string;
  client_timestamp: string;
  website_id?: string;
}

export class EventTrackingService {
  private static instance: EventTrackingService;
  private apiUrl: string;

  constructor() {
    this.apiUrl = 'https://jixmwjplysaqlyzhpcmk.supabase.co/functions/v1/track-event';
  }

  static getInstance(): EventTrackingService {
    if (!EventTrackingService.instance) {
      EventTrackingService.instance = new EventTrackingService();
    }
    return EventTrackingService.instance;
  }

  async trackEvent(event: TrackingEvent): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event,
          client_timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to track event:', response.status, response.statusText);
        return false;
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error tracking event:', error);
      return false;
    }
  }

  generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  getScreenResolution(): string {
    return `${window.screen.width}x${window.screen.height}`;
  }
}

// Helper function to create a tracking script for external websites
export const generateTrackingScript = (websiteId: string) => {
  return `
(function() {
  var sessionId = sessionStorage.getItem('tracking_session') || 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  sessionStorage.setItem('tracking_session', sessionId);
  
  var apiUrl = 'https://jixmwjplysaqlyzhpcmk.supabase.co/functions/v1/track-event';
  
  function trackEvent(eventData) {
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        website_id: '${websiteId}',
        url: window.location.href,
        screen_resolution: window.screen.width + 'x' + window.screen.height,
        client_timestamp: new Date().toISOString(),
        ...eventData
      })
    }).catch(function(e) { console.log('Tracking error:', e); });
  }
  
  // Track pageview
  trackEvent({ event_type: 'pageview' });
  
  // Track clicks
  document.addEventListener('click', function(e) {
    trackEvent({
      event_type: 'click',
      element_tag: e.target.tagName,
      element_id: e.target.id || null,
      element_classes: e.target.className || null,
      click_x: e.clientX,
      click_y: e.clientY
    });
  });
})();
`.trim();
};
