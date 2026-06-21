const fs = require('fs');
const https = require('https');
const path = require('path');
const { URL } = require('url');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const SITE_URL = (process.env.SITE_URL || 'https://serplore.com').replace(/\/+$/, '');
const VISITOR_INDEX_FILE = path.join(DATA_DIR, 'visitor-index.json');
const GEO_TIMEOUT_MS = 1200;
const HUMAN_NOTIFICATION_THRESHOLD = 60;

fs.mkdirSync(DATA_DIR, { recursive: true });

const leadRateLimit = new Map();
const visitorIndex = loadVisitorIndex();
let hasWarnedMissingDiscordConfig = false;

function nowIso() {
  return new Date().toISOString();
}

function nowLa() {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour12: false,
  });
}

function appendJsonl(fileName, entry) {
  const filePath = path.join(DATA_DIR, fileName);
  fs.appendFile(filePath, `${JSON.stringify(entry)}\n`, (err) => {
    if (err) console.error(`Failed writing ${fileName}:`, err.message);
  });
}

function loadVisitorIndex() {
  if (!fs.existsSync(VISITOR_INDEX_FILE)) return new Map();

  try {
    const raw = JSON.parse(fs.readFileSync(VISITOR_INDEX_FILE, 'utf8'));
    return new Map(Object.entries(raw));
  } catch (err) {
    console.error('Failed reading visitor index:', err.message);
    return new Map();
  }
}

function saveVisitorIndex() {
  const payload = JSON.stringify(Object.fromEntries(visitorIndex), null, 2);
  const tempFile = `${VISITOR_INDEX_FILE}.tmp`;
  try {
    fs.writeFileSync(tempFile, payload);
    fs.renameSync(tempFile, VISITOR_INDEX_FILE);
  } catch (err) {
    console.error('Failed writing visitor index:', err.message);
  }
}

function normalizePayload(body) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return typeof body === 'object' ? body : {};
}

function getHeader(req, name) {
  return req.headers[name.toLowerCase()] || '';
}

function getClientIp(req) {
  const forwarded = getHeader(req, 'x-forwarded-for');
  const candidate = forwarded ? forwarded.split(',')[0].trim() : '';
  return (
    candidate ||
    getHeader(req, 'x-real-ip') ||
    req.socket.remoteAddress ||
    'unknown'
  ).replace(/^::ffff:/, '');
}

function requestContext(req) {
  const requestUrl = new URL(req.originalUrl || req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const ip = getClientIp(req);
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    timestamp: nowIso(),
    time_la: nowLa(),
    ip,
    method: req.method,
    path: requestUrl.pathname,
    query: requestUrl.searchParams.toString(),
    request_url: `${req.headers.host || ''}${requestUrl.pathname}${requestUrl.search || ''}`,
    address: `${req.headers.host || ''}${requestUrl.pathname}${requestUrl.search || ''}`,
    referrer: getHeader(req, 'referer'),
    user_agent: getHeader(req, 'user-agent'),
    accept_language: getHeader(req, 'accept-language'),
    forwarded_for: getHeader(req, 'x-forwarded-for'),
    host: req.headers.host || '',
  };
}

function escapeDiscord(value, maxLength = 900) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

function postJson(url, payload, headers = {}) {
  return new Promise((resolve) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch (err) {
      resolve({ ok: false, error: err.message });
      return;
    }

    const data = JSON.stringify(payload);
    const req = https.request(
      {
        hostname: parsed.hostname,
        path: `${parsed.pathname}${parsed.search}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          'User-Agent': 'serplore-site/1.0',
          ...headers,
        },
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
          if (body.length > 2000) body = body.slice(0, 2000);
        });
        res.on('end', () => {
          const ok = res.statusCode >= 200 && res.statusCode < 300;
          resolve({ ok, statusCode: res.statusCode, body });
        });
      }
    );

    req.setTimeout(4000, () => req.destroy(new Error('Discord request timeout')));
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.write(data);
    req.end();
  });
}

function logDiscordDelivery(meta, delivery) {
  appendJsonl('notifications.jsonl', {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    timestamp: nowIso(),
    time_la: nowLa(),
    channel: 'discord',
    type: meta.type || 'message',
    event_id: meta.event_id || '',
    visitor_id: meta.visitor_id || '',
    ok: Boolean(delivery.ok),
    target: delivery.target || '',
    status_code: delivery.statusCode || null,
    error: delivery.error || '',
    response: delivery.ok ? '' : escapeDiscord(delivery.body || '', 700),
  });
}

async function sendDiscord(content, meta = {}) {
  if (process.env.DISCORD_WEBHOOK_URL) {
    const delivery = await postJson(process.env.DISCORD_WEBHOOK_URL, { content });
    delivery.target = 'DISCORD_WEBHOOK_URL';
    logDiscordDelivery(meta, delivery);
    if (delivery.ok) return true;
  }

  if (process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_CHANNEL_ID) {
    const delivery = await postJson(
      `https://discord.com/api/v10/channels/${encodeURIComponent(process.env.DISCORD_CHANNEL_ID)}/messages`,
      { content },
      { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` }
    );
    delivery.target = 'DISCORD_BOT_TOKEN + DISCORD_CHANNEL_ID';
    logDiscordDelivery(meta, delivery);
    return delivery.ok;
  }

  if (!hasWarnedMissingDiscordConfig) {
    console.warn('Discord delivery is not configured.');
    hasWarnedMissingDiscordConfig = true;
  }
  logDiscordDelivery(meta, { ok: false, error: 'Discord delivery is not configured.' });
  return false;
}

function isPublicIp(ip) {
  if (!ip || ip === 'unknown' || ip === '::1') return false;
  if (ip.startsWith('10.') || ip.startsWith('127.') || ip.startsWith('192.168.')) return false;
  const match172 = ip.match(/^172\.(\d+)\./);
  if (match172) {
    const second = Number(match172[1]);
    if (second >= 16 && second <= 31) return false;
  }
  return true;
}

function geoLookup(ip) {
  if (!isPublicIp(ip)) {
    return Promise.resolve({ summary: 'private/local IP', raw: null });
  }

  return new Promise((resolve) => {
    const req = https.get(`https://ipwho.is/${encodeURIComponent(ip)}`, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
        if (body.length > 8192) req.destroy(new Error('Geo response too large'));
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (!parsed.success) {
            resolve({ summary: 'unknown', raw: parsed });
            return;
          }
          const parts = [parsed.city, parsed.region, parsed.country].filter(Boolean);
          resolve({
            summary: parts.length ? parts.join(', ') : 'unknown',
            raw: {
              city: parsed.city,
              region: parsed.region,
              country: parsed.country,
              country_code: parsed.country_code,
              latitude: parsed.latitude,
              longitude: parsed.longitude,
              isp: parsed.connection?.isp,
            },
          });
        } catch {
          resolve({ summary: 'unknown', raw: null });
        }
      });
    });
    req.setTimeout(GEO_TIMEOUT_MS, () => req.destroy(new Error('Geo timeout')));
    req.on('error', () => resolve({ summary: 'unknown', raw: null }));
  });
}

function isLikelyBot(userAgent) {
  return /bot|crawler|spider|slurp|preview|healthcheck|internetmeasurement|dataprovider|headless|discordbot|facebookexternalhit|curl|wget|python|go-http-client|netapi|axios|node-fetch/i.test(userAgent || '');
}

function isSuspiciousPath(pathname) {
  return /wp-|xmlrpc|\.env|\.git|backup|\.sql|\.tar|\.zip|_next|_nuxt|composer|pip\.conf|admin|install\.php|wlwmanifest|actuator|credentials|\.ssh|kube|serverless|terraform|\.aws|\.azure|\.docker|\.npmrc|\.pypirc|config\.json|config\.js/i.test(pathname || '');
}

function isLikelyHostingProvider(isp) {
  return /amazon|google llc|microsoft|ovh|scaleway|digitalocean|hetzner|linode|vultr|egihosting|m247|datacamp|oracle|alibaba|tencent|huawei|cloudflare|leaseweb|choopa|sharktech/i.test(isp || '');
}

function isLikelyAutomatedVisit(entry) {
  return classifyVisitAudience(entry).human_probability < HUMAN_NOTIFICATION_THRESHOLD;
}

function classifyVisitAudience(entry) {
  const ua = entry.user_agent || '';
  const timezone = entry.timezone || '';
  const language = entry.language || '';
  const pathName = entry.page_path || entry.path || '';
  const geoIsp = entry.geo?.isp || '';
  const screen = `${entry.screen_width || ''}x${entry.screen_height || ''}`;
  const viewport = `${entry.viewport_width || ''}x${entry.viewport_height || ''}`;
  const reasons = [];
  let score = 70;

  const addReason = (delta, reason) => {
    score += delta;
    reasons.push(`${reason} (${delta > 0 ? '+' : ''}${delta})`);
  };

  if (isLikelyBot(ua)) addReason(-85, 'bot-like user agent');
  if (isSuspiciousPath(pathName)) addReason(-75, 'scanner/suspicious path');
  if (entry.ip === 'unknown') addReason(-45, 'missing client IP');

  if (entry.visitor_id && entry.session_id) addReason(8, 'client visitor/session ids present');
  else addReason(-12, 'missing client visitor/session id');

  if (timezone && !/utc|etc\/unknown/i.test(timezone)) addReason(8, 'real browser timezone');
  if (language && !/posix/i.test(language)) addReason(6, 'browser language present');
  if (entry.screen_width && entry.screen_height && entry.viewport_width && entry.viewport_height) {
    addReason(8, `screen and viewport present ${screen}/${viewport}`);
  }
  if (entry.accept_language) addReason(4, 'accept-language header present');

  if (/utc|etc\/unknown/i.test(timezone) && /posix/i.test(language)) {
    addReason(-40, 'UTC/unknown timezone with POSIX language');
  }
  if (/utc|etc\/unknown/i.test(timezone) && /^(800x600|1280x720|1600x1200|1920x1080)$/.test(screen)) {
    addReason(-28, 'automation-like timezone and screen size');
  }
  if (/x11; linux/i.test(ua)) addReason(-12, 'Linux X11 browser fingerprint');
  if (isLikelyHostingProvider(geoIsp)) {
    addReason(-18, 'hosting-provider ISP');
    if (/utc|etc\/unknown/i.test(timezone) || /x11; linux/i.test(ua)) {
      addReason(-28, 'hosting-provider traffic with automation-like fingerprint');
    }
  }

  if (reasons.length === 0) reasons.push('limited browser evidence');

  const humanProbability = Math.max(0, Math.min(99, Math.round(score)));
  const isHumanLikely = humanProbability >= HUMAN_NOTIFICATION_THRESHOLD;

  return {
    human_probability: humanProbability,
    classification: isHumanLikely ? 'real_human_likely' : 'bot_or_automation_likely',
    visit_audience: isHumanLikely ? 'human_likely' : 'automated_or_hosted',
    reasons,
  };
}

function normalizeString(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function normalizeNullable(value, maxLength) {
  const text = normalizeString(value, maxLength);
  return text || '';
}

function getUtmPayload(payload) {
  return {
    utm_source: normalizeNullable(payload.utm_source, 120),
    utm_medium: normalizeNullable(payload.utm_medium, 120),
    utm_campaign: normalizeNullable(payload.utm_campaign, 180),
    utm_content: normalizeNullable(payload.utm_content, 180),
    utm_term: normalizeNullable(payload.utm_term, 180),
  };
}

function visitorKey(visitorId, ctx) {
  return visitorId || `${ctx.ip}|${ctx.user_agent}`.slice(0, 500);
}

function extractVisitorPayload(payload, ctx) {
  return {
    visitor_id: normalizeNullable(payload.visitor_id, 120),
    session_id: normalizeNullable(payload.session_id, 120),
    page_path: normalizeNullable(payload.page_path, 500) || ctx.path,
    page_url: normalizeNullable(payload.page_url, 1200),
    referrer: normalizeNullable(payload.referrer, 1200) || ctx.referrer,
    timezone: normalizeNullable(payload.timezone, 120),
    language: normalizeNullable(payload.language, 80),
    screen_width: Number.isFinite(Number(payload.screen_width)) ? Number(payload.screen_width) : null,
    screen_height: Number.isFinite(Number(payload.screen_height)) ? Number(payload.screen_height) : null,
    viewport_width: Number.isFinite(Number(payload.viewport_width)) ? Number(payload.viewport_width) : null,
    viewport_height: Number.isFinite(Number(payload.viewport_height)) ? Number(payload.viewport_height) : null,
    ...getUtmPayload(payload),
  };
}

function upsertVisitor(visitor, ctx) {
  const key = visitorKey(visitor.visitor_id, ctx);
  const existing = visitorIndex.get(key);
  const next = {
    visitor_id: visitor.visitor_id,
    first_seen: existing?.first_seen || ctx.timestamp,
    last_seen: ctx.timestamp,
    visit_count: (existing?.visit_count || 0) + 1,
    last_ip: ctx.ip,
    last_path: visitor.page_path || ctx.path,
    last_referrer: visitor.referrer || '',
    last_user_agent: ctx.user_agent,
  };

  visitorIndex.set(key, next);
  saveVisitorIndex();

  return {
    key,
    is_new_visitor: !existing,
    visit_count: next.visit_count,
    first_seen: next.first_seen,
  };
}

function markVisitorLead(visitor, ctx) {
  const key = visitorKey(visitor.visitor_id, ctx);
  const existing = visitorIndex.get(key);
  if (!existing) return;

  visitorIndex.set(key, {
    ...existing,
    last_lead_at: ctx.timestamp,
    lead_count: (existing.lead_count || 0) + 1,
  });
  saveVisitorIndex();
}

async function recordVisit(req, rawPayload) {
  const payload = normalizePayload(rawPayload);
  const ctx = requestContext(req);
  const visitor = extractVisitorPayload(payload, ctx);
  const indexState = upsertVisitor(visitor, ctx);
  const geo = await geoLookup(ctx.ip);
  const entry = {
    id: ctx.id,
    source: 'client',
    timestamp: ctx.timestamp,
    time_la: ctx.time_la,
    ip: ctx.ip,
    address: geo.summary,
    geo: geo.raw,
    host: ctx.host,
    method: ctx.method,
    user_agent: ctx.user_agent,
    accept_language: ctx.accept_language,
    forwarded_for: ctx.forwarded_for,
    is_new_visitor: indexState.is_new_visitor,
    visit_count: indexState.visit_count,
    first_seen: indexState.first_seen,
    ...visitor,
  };
  const audience = classifyVisitAudience(entry);
  entry.visit_audience = audience.visit_audience;
  entry.visit_classification = audience.classification;
  entry.human_probability = audience.human_probability;
  entry.classification_reasons = audience.reasons;
  entry.notification_suppressed = entry.human_probability < HUMAN_NOTIFICATION_THRESHOLD || !entry.is_new_visitor;
  entry.notification_suppression_reason = entry.notification_suppressed
    ? (entry.human_probability < HUMAN_NOTIFICATION_THRESHOLD ? 'bot_or_automation_likely' : 'repeat_visitor')
    : '';

  appendJsonl('visits.jsonl', entry);
  appendJsonl('events.jsonl', { type: 'visit', ...entry });

  if (entry.notification_suppressed) return entry;

  void sendDiscord(
    [
      'New Serplore visitor',
      `Real/bot judgment: ${entry.visit_classification === 'real_human_likely' ? 'likely real human' : 'likely bot/automation'}`,
      `Human likelihood: ${entry.human_probability}%`,
      `Signals: ${escapeDiscord(entry.classification_reasons.join('; '), 500)}`,
      `Time (LA): ${entry.time_la}`,
      `Visitor ID: ${entry.visitor_id || 'not provided'}`,
      `Session ID: ${entry.session_id || 'not provided'}`,
      `Visit count: ${entry.visit_count}`,
      `IP: ${entry.ip}`,
      `Address: ${entry.address}`,
      `URL: ${escapeDiscord(entry.page_url || `${SITE_URL}${entry.page_path}`, 500)}`,
      `Referrer: ${escapeDiscord(entry.referrer || 'direct', 300)}`,
      `UTM: ${[entry.utm_source, entry.utm_medium, entry.utm_campaign].filter(Boolean).join(' / ') || 'none'}`,
      `User Agent: ${escapeDiscord(entry.user_agent, 500)}`,
    ].join('\n'),
    { type: 'new_visitor', event_id: entry.id, visitor_id: entry.visitor_id }
  );

  return entry;
}

function validateLead(payload) {
  const email = normalizeString(payload.email, 180).toLowerCase();
  const company = normalizeString(payload.company, 180);
  const need = normalizeString(payload.need || payload.notes || payload.needs, 3000);
  const name = normalizeString(payload.name, 140);
  const phone = normalizeString(payload.phone, 80);

  const errors = [];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('A valid work email is required.');
  if (company.length < 2) errors.push('Company or website is required.');

  return {
    ok: errors.length === 0,
    errors,
    lead: { email, company, need, name, phone },
  };
}

function isLeadRateLimited(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const bucket = leadRateLimit.get(ip) || [];
  const recent = bucket.filter((stamp) => now - stamp < windowMs);
  recent.push(now);
  leadRateLimit.set(ip, recent);
  return recent.length > 6;
}

async function recordLead(req, rawPayload) {
  const payload = normalizePayload(rawPayload);
  const ctx = requestContext(req);

  if (isLeadRateLimited(ctx.ip)) {
    return { status: 429, body: { ok: false, error: 'Too many requests. Please try again later.' } };
  }

  if (payload.website) {
    appendJsonl('events.jsonl', {
      type: 'lead_honeypot',
      id: ctx.id,
      timestamp: ctx.timestamp,
      time_la: ctx.time_la,
      ip: ctx.ip,
      user_agent: ctx.user_agent,
      notification_suppressed: true,
    });
    return { status: 200, body: { ok: true } };
  }

  if (isLikelyBot(ctx.user_agent)) {
    appendJsonl('events.jsonl', {
      type: 'lead_bot_suppressed',
      id: ctx.id,
      timestamp: ctx.timestamp,
      time_la: ctx.time_la,
      ip: ctx.ip,
      user_agent: ctx.user_agent,
      notification_suppressed: true,
    });
    return { status: 200, body: { ok: true } };
  }

  const result = validateLead(payload);
  if (!result.ok) {
    return { status: 400, body: { ok: false, errors: result.errors } };
  }

  const geo = await geoLookup(ctx.ip);
  const visitor = extractVisitorPayload(payload, ctx);
  markVisitorLead(visitor, ctx);

  const entry = {
    id: ctx.id,
    type: 'lead_submission',
    timestamp: ctx.timestamp,
    time_la: ctx.time_la,
    ip: ctx.ip,
    address: geo.summary,
    geo: geo.raw,
    referrer: visitor.referrer || ctx.referrer,
    user_agent: ctx.user_agent,
    visitor,
    ...result.lead,
  };

  appendJsonl('leads.jsonl', entry);
  appendJsonl('tickets.jsonl', entry);
  appendJsonl('events.jsonl', { type: 'lead_submission', ...entry });

  void sendDiscord(
    [
      'High priority Serplore form submission',
      `Time (LA): ${entry.time_la}`,
      `Email: ${entry.email}`,
      `Company/website: ${entry.company}`,
      `Name: ${entry.name || 'not provided'}`,
      `Phone: ${entry.phone || 'not provided'}`,
      `Need: ${escapeDiscord(entry.need || 'not provided', 1200)}`,
      `Visitor ID: ${visitor.visitor_id || 'not provided'}`,
      `Session ID: ${visitor.session_id || 'not provided'}`,
      `Page: ${escapeDiscord(visitor.page_url || visitor.page_path || 'not provided', 500)}`,
      `IP: ${entry.ip}`,
      `Address: ${entry.address}`,
      `Referrer: ${escapeDiscord(entry.referrer || 'direct', 300)}`,
    ].join('\n'),
    { type: 'lead_submission', event_id: entry.id, visitor_id: visitor.visitor_id }
  );

  return {
    status: 200,
    body: { ok: true, message: 'Thanks. We will review your brand context and follow up shortly.' },
  };
}

module.exports = {
  nowIso,
  normalizePayload,
  recordLead,
  recordVisit,
};
