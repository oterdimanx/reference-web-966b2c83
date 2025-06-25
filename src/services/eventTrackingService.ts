
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
  
  // Debouncing variables
  var eventQueue = [];
  var pendingEvents = new Map();
  var debounceTimeout = null;
  var DEBOUNCE_DELAY = 300; // 300ms debounce
  var BATCH_SIZE = 10;
  
  function createEventKey(eventData) {
    // Create a unique key for similar events to prevent duplicates
    if (eventData.event_type === 'click') {
      return eventData.event_type + '_' + (eventData.element_id || '') + '_' + (eventData.element_tag || '') + '_' + eventData.url;
    }
    return eventData.event_type + '_' + eventData.url;
  }
  
  function sendQueuedEvents() {
    if (eventQueue.length === 0) return;
    
    var eventsToSend = eventQueue.splice(0, BATCH_SIZE);
    
    // Send events individually (could be batched on server-side in future)
    eventsToSend.forEach(function(eventData) {
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
    });
    
    // If there are more events, schedule another batch
    if (eventQueue.length > 0) {
      debounceTimeout = setTimeout(sendQueuedEvents, 100);
    } else {
      debounceTimeout = null;
    }
  }
  
  function trackEvent(eventData) {
    var eventKey = createEventKey(eventData);
    var now = Date.now();
    
    // Check if we recently sent the same event (debounce)
    var lastSent = pendingEvents.get(eventKey);
    if (lastSent && (now - lastSent) < DEBOUNCE_DELAY) {
      return; // Skip duplicate event
    }
    
    // Add to queue
    eventQueue.push(eventData);
    pendingEvents.set(eventKey, now);
    
    // Clean up old entries from pendingEvents (prevent memory leaks)
    if (pendingEvents.size > 100) {
      var oldestAllowed = now - DEBOUNCE_DELAY * 2;
      for (var [key, timestamp] of pendingEvents.entries()) {
        if (timestamp < oldestAllowed) {
          pendingEvents.delete(key);
        }
      }
    }
    
    // Schedule batch send
    if (!debounceTimeout) {
      debounceTimeout = setTimeout(sendQueuedEvents, DEBOUNCE_DELAY);
    }
  }
  
  // Track pageview immediately (no debouncing needed for pageviews)
  trackEvent({ event_type: 'pageview' });
  
  // Track clicks with debouncing
  var lastClickTime = 0;
  var CLICK_THROTTLE = 100; // Minimum 100ms between any clicks
  
  document.addEventListener('click', function(e) {
    var now = Date.now();
    if (now - lastClickTime < CLICK_THROTTLE) {
      return; // Ignore rapid clicks
    }
    lastClickTime = now;
    
    trackEvent({
      event_type: 'click',
      element_tag: e.target.tagName,
      element_id: e.target.id || null,
      element_classes: e.target.className || null,
      click_x: e.clientX,
      click_y: e.clientY
    });
  });
  
  // Send any remaining events when page is about to unload
  window.addEventListener('beforeunload', function() {
    if (eventQueue.length > 0) {
      // Use sendBeacon for reliable delivery during page unload
      var eventsToSend = eventQueue.splice(0);
      eventsToSend.forEach(function(eventData) {
        var payload = JSON.stringify({
          session_id: sessionId,
          website_id: '${websiteId}',
          url: window.location.href,
          screen_resolution: window.screen.width + 'x' + window.screen.height,
          client_timestamp: new Date().toISOString(),
          ...eventData
        });
        
        if (navigator.sendBeacon) {
          navigator.sendBeacon(apiUrl, payload);
        }
      });
    }
  });
})();
`.trim();
};
