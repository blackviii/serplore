/**
 * Visitor tracking script
 * - Sends once per session
 * - Uses sendBeacon for non-blocking delivery
 * - Persists visitor_id in localStorage
 */

const VISITOR_ID_KEY = 'serplore_visitor_id';
const SESSION_ID_KEY = 'serplore_session_id';
const SESSION_KEY = 'serplore_session_tracked';

function generateId(prefix) {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 12);
  return `${prefix}_${ts}_${rand}`;
}

function getOrCreateVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = generateId('spv');
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return generateId('spv');
  }
}

function getOrCreateSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = generateId('sps');
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return generateId('sps');
  }
}

function getUtmParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || null,
    utm_medium: params.get('utm_medium') || null,
    utm_campaign: params.get('utm_campaign') || null,
    utm_content: params.get('utm_content') || null,
    utm_term: params.get('utm_term') || null,
  };
}

export function getTrackingContext() {
  return {
    visitor_id: getOrCreateVisitorId(),
    session_id: getOrCreateSessionId(),
    page_path: window.location.pathname,
    page_url: window.location.href,
    referrer: document.referrer || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    language: navigator.language || null,
    screen_width: window.screen ? window.screen.width : null,
    screen_height: window.screen ? window.screen.height : null,
    viewport_width: window.innerWidth || null,
    viewport_height: window.innerHeight || null,
    ...getUtmParams(),
  };
}

export function trackVisit() {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return;
  } catch {
    // Continue sending if sessionStorage is unavailable.
  }

  const data = getTrackingContext();

  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/track/visit', blob);
  } else {
    fetch('/api/track/visit', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
    }).catch(() => {});
  }

  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    // ignore
  }
}
