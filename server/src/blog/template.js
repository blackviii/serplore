// Server-side HTML template for blog/service/industry pages (SEO optimized)

const SITE_URL = 'https://serplore.com';
const SITE_NAME = 'Serplore';
const BRAND_COLOR = '#FF4500';
const BRAND_COLOR_HOVER = '#DB3A00';
const BRAND_COLOR_RGB = '255,69,0';
const LOGO_ICON_SVG = '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="64" height="64" rx="14" fill="currentColor"/><path fill="#fff" fill-rule="evenodd" clip-rule="evenodd" d="M16 48V16h19c7.2 0 12.4 4.7 12.4 11.3 0 5.1-3.1 9-7.9 10.4L48 48H36.2l-7.5-10H26v10H16Zm10-18.5h8.4c2.5 0 4.2-1.5 4.2-3.7S36.9 22 34.4 22H26v7.5Z"/></svg>';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const TRACKING_SCRIPT = `<script>
(function () {
  var visitorKey = 'serplore_visitor_id';
  var sessionKey = 'serplore_session_id';
  var trackedKey = 'serplore_session_tracked';

  function makeId(prefix) {
    return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12);
  }

  function getStored(storage, key) {
    try { return storage.getItem(key); } catch (err) { return ''; }
  }

  function setStored(storage, key, value) {
    try { storage.setItem(key, value); } catch (err) {}
  }

  function getVisitorId() {
    var id = getStored(window.localStorage, visitorKey);
    if (!id) {
      id = makeId('spv');
      setStored(window.localStorage, visitorKey, id);
    }
    return id;
  }

  function getSessionId() {
    var id = getStored(window.sessionStorage, sessionKey);
    if (!id) {
      id = makeId('sps');
      setStored(window.sessionStorage, sessionKey, id);
    }
    return id;
  }

  function param(name) {
    return new URLSearchParams(window.location.search).get(name) || null;
  }

  if (getStored(window.sessionStorage, trackedKey)) return;

  var payload = {
    visitor_id: getVisitorId(),
    session_id: getSessionId(),
    page_path: window.location.pathname,
    page_url: window.location.href,
    referrer: document.referrer || null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
    language: navigator.language || null,
    screen_width: window.screen ? window.screen.width : null,
    screen_height: window.screen ? window.screen.height : null,
    viewport_width: window.innerWidth || null,
    viewport_height: window.innerHeight || null,
    utm_source: param('utm_source'),
    utm_medium: param('utm_medium'),
    utm_campaign: param('utm_campaign'),
    utm_content: param('utm_content'),
    utm_term: param('utm_term')
  };
  var body = JSON.stringify(payload);
  var blob = new Blob([body], { type: 'application/json' });
  var queued = false;

  if (navigator.sendBeacon) {
    queued = navigator.sendBeacon('/api/track/visit', blob);
  }
  if (!queued) {
    fetch('/api/track/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
      keepalive: true
    }).catch(function () {});
  }
  setStored(window.sessionStorage, trackedKey, '1');
})();
</script>`;

function renderPage({ title, metaDescription, keywords, slug, content, type, publishedAt, updatedAt, canonicalPath, breadcrumbs }) {
  const canonical = `${SITE_URL}${canonicalPath}`;
  const ogImage = `${SITE_URL}/og-default.png`;
  const isArticle = type === 'blog' && Boolean(publishedAt);
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(metaDescription);
  const escapedKeywords = escapeHtml(keywords || '');
  const escapedCanonical = escapeHtml(canonical);
  const escapedOgImage = escapeHtml(ogImage);

  const schemaArticle = isArticle ? `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": ${JSON.stringify(title)},
      "description": ${JSON.stringify(metaDescription)},
      "datePublished": "${publishedAt}",
      "dateModified": "${updatedAt || publishedAt}",
      "author": {
        "@type": "Organization",
        "name": "Serplore",
        "url": "${SITE_URL}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Serplore",
        "url": "${SITE_URL}",
        "logo": {
          "@type": "ImageObject",
          "url": "${SITE_URL}/logo.svg"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "${canonical}"
      }
    }
    </script>` : '';

  const schemaService = type === 'service' ? `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": ${JSON.stringify(title)},
      "description": ${JSON.stringify(metaDescription)},
      "provider": {
        "@type": "Organization",
        "name": "Serplore",
        "url": "${SITE_URL}"
      },
      "url": "${canonical}"
    }
    </script>` : '';

  const schemaBreadcrumb = breadcrumbs ? `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        ${breadcrumbs.map((b, i) => `{
          "@type": "ListItem",
          "position": ${i + 1},
          "name": ${JSON.stringify(b.name)},
          "item": "${SITE_URL}${b.path}"
        }`).join(',\n        ')}
      ]
    }
    </script>` : '';

  const breadcrumbHtml = breadcrumbs ? `
    <nav aria-label="Breadcrumb" class="breadcrumb">
      ${breadcrumbs.map((b, i) => {
        if (i === breadcrumbs.length - 1) {
          return `<span>${b.name}</span>`;
        }
        return `<a href="${b.path}">${b.name}</a><span class="sep">/</span>`;
      }).join('')}
    </nav>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapedTitle} | ${SITE_NAME}</title>
  <meta name="description" content="${escapedDescription}">
  <meta name="keywords" content="${escapedKeywords}">
  <link rel="canonical" href="${escapedCanonical}">
  <meta property="og:title" content="${escapedTitle}">
  <meta property="og:description" content="${escapedDescription}">
  <meta property="og:url" content="${escapedCanonical}">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:type" content="${isArticle ? 'article' : 'website'}">
  <meta property="og:image" content="${escapedOgImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapedTitle}">
  <meta name="twitter:description" content="${escapedDescription}">
  <meta name="twitter:image" content="${escapedOgImage}">
  <meta name="robots" content="index, follow">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  ${schemaArticle}
  ${schemaService}
  ${schemaBreadcrumb}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; line-height: 1.7; background: #fff; }
    a { color: ${BRAND_COLOR}; text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* Header */
    .site-header { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid #e5e7eb; }
    .header-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between; }
    .logo-link { display: flex; align-items: center; gap: 8px; text-decoration: none; }
    .logo-icon { width: 28px; height: 28px; color: ${BRAND_COLOR}; display: flex; align-items: center; justify-content: center; }
    .logo-icon svg { display: block; width: 100%; height: 100%; }
    .logo-text { font-weight: 700; font-size: 14px; color: #111; }
    .header-nav { display: flex; gap: 24px; align-items: center; }
    .header-nav a { color: #666; font-size: 14px; font-weight: 500; }
    .header-nav a:hover { color: #111; text-decoration: none; }
    .cta-btn { display: inline-block; background: ${BRAND_COLOR}; color: #fff !important; font-size: 13px; font-weight: 600; padding: 8px 20px; border-radius: 8px; transition: background 0.2s; }
    .cta-btn:hover { background: ${BRAND_COLOR_HOVER}; text-decoration: none !important; }

    /* Breadcrumb */
    .breadcrumb { max-width: 800px; margin: 0 auto; padding: 16px 24px 0; font-size: 13px; color: #999; }
    .breadcrumb a { color: #999; }
    .breadcrumb a:hover { color: ${BRAND_COLOR}; }
    .breadcrumb .sep { margin: 0 6px; }

    /* Article */
    .article-container { max-width: 800px; margin: 0 auto; padding: 40px 24px 80px; }
    .article-container h1 { font-size: 2.2em; font-weight: 800; line-height: 1.3; margin-bottom: 16px; color: #111; }
    .article-meta { font-size: 14px; color: #999; margin-bottom: 32px; display: flex; gap: 16px; }
    .article-container h2 { font-size: 1.5em; font-weight: 700; margin-top: 48px; margin-bottom: 16px; color: #111; }
    .article-container h3 { font-size: 1.2em; font-weight: 600; margin-top: 32px; margin-bottom: 12px; color: #222; }
    .article-container p { margin-bottom: 20px; font-size: 17px; color: #333; }
    .article-container ul, .article-container ol { margin-bottom: 20px; padding-left: 24px; }
    .article-container li { margin-bottom: 8px; font-size: 17px; color: #333; }
    .article-container blockquote { border-left: 4px solid ${BRAND_COLOR}; padding: 16px 24px; margin: 24px 0; background: #fff3ef; border-radius: 0 8px 8px 0; }
    .article-container blockquote p { margin-bottom: 0; color: #555; font-style: italic; }
    .article-container strong { font-weight: 600; }
    .article-container table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    .article-container th, .article-container td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #eee; font-size: 15px; }
    .article-container th { background: #f9f9f9; font-weight: 600; color: #333; }

    /* CTA Box */
    .cta-box { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 32px; margin: 48px 0; text-align: center; }
    .cta-box h3 { font-size: 1.4em; margin-bottom: 12px; color: #111; margin-top: 0; }
    .cta-box p { color: #555; margin-bottom: 20px; }
    .cta-box .cta-btn { font-size: 16px; padding: 12px 32px; border-radius: 99px; }

    /* Blog List */
    .blog-list { max-width: 900px; margin: 0 auto; padding: 40px 24px 80px; }
    .blog-list h1 { font-size: 2.2em; font-weight: 800; margin-bottom: 8px; }
    .blog-list .subtitle { color: #666; font-size: 17px; margin-bottom: 40px; }
    .post-card { display: block; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 16px; transition: all 0.2s; text-decoration: none !important; }
    .post-card:hover { border-color: ${BRAND_COLOR}; box-shadow: 0 4px 20px rgba(${BRAND_COLOR_RGB},0.1); }
    .post-card .card-type { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .post-card .card-type.blog { color: #2563eb; }
    .post-card .card-type.service { color: #7c3aed; }
    .post-card .card-type.industry { color: #059669; }
    .post-card h2 { font-size: 1.2em; font-weight: 700; color: #111; margin-bottom: 8px; line-height: 1.4; }
    .post-card p { font-size: 15px; color: #666; margin-bottom: 12px; line-height: 1.6; }
    .post-card .card-meta { font-size: 13px; color: #999; }

    /* Footer */
    .site-footer { border-top: 1px solid #e5e7eb; padding: 40px 24px; text-align: center; color: #999; font-size: 13px; }
    .site-footer a { color: #999; margin: 0 12px; }
    .site-footer a:hover { color: ${BRAND_COLOR}; }

    /* Responsive */
    @media (max-width: 640px) {
      .article-container h1 { font-size: 1.7em; }
      .article-container h2 { font-size: 1.3em; }
      .article-container p, .article-container li { font-size: 16px; }
      .header-nav { gap: 12px; }
      .header-nav a.hide-mobile { display: none; }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="logo-link">
        <div class="logo-icon">
          ${LOGO_ICON_SVG}
        </div>
        <span class="logo-text">${SITE_NAME}</span>
      </a>
      <nav class="header-nav">
        <a href="/blog" class="hide-mobile">Blog</a>
        <a href="/#services" class="hide-mobile">Services</a>
        <a href="/#consultation" class="cta-btn">Book a Video Intro</a>
      </nav>
    </div>
  </header>

  ${breadcrumbHtml}

  ${content}

  <footer class="site-footer">
    <div>
      <a href="/">Home</a>
      <a href="/blog">Blog</a>
      <a href="/terms">Terms</a>
      <a href="/privacy">Privacy</a>
    </div>
    <p style="margin-top:16px">&copy; ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</p>
  </footer>
  ${TRACKING_SCRIPT}
</body>
</html>`;
}

function renderArticlePage(post) {
  const breadcrumbs = post.type === 'blog'
    ? [{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: post.title, path: post.canonicalPath }]
    : [{ name: 'Home', path: '/' }, { name: post.title, path: post.canonicalPath }];

  const metaLine = [];
  if (post.publishedAt) metaLine.push(`Published: ${new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
  if (post.readTime) metaLine.push(`${post.readTime} min read`);

  const articleContent = `
    <article class="article-container">
      <h1>${post.title}</h1>
      ${metaLine.length ? `<div class="article-meta">${metaLine.map(m => `<span>${m}</span>`).join('')}</div>` : ''}
      ${post.content}
      <div class="cta-box">
        <h3>Want Reddit to support search, demand, and reputation?</h3>
        <p>Book a video intro. We will review your Reddit footprint first, then recommend a managed organic Reddit SEO and reputation strategy.</p>
        <a href="/#consultation" class="cta-btn">Book a Video Intro</a>
      </div>
    </article>`;

  return renderPage({
    ...post,
    content: articleContent,
    breadcrumbs,
  });
}

function renderBlogListPage(posts) {
  const cards = posts.map(p => `
    <a href="${p.canonicalPath}" class="post-card">
      <div class="card-type ${p.type}">${p.type === 'blog' ? 'Blog' : p.type === 'service' ? 'Service' : 'Guide'}</div>
      <h2>${p.title}</h2>
      <p>${p.metaDescription}</p>
      <div class="card-meta">${p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</div>
    </a>
  `).join('');

  const content = `
    <div class="blog-list">
      <h1>Reddit Marketing Blog & Resources</h1>
      <p class="subtitle">Guides on organic Reddit SEO, community-native content, and online reputation management.</p>
      ${cards}
    </div>`;

  return renderPage({
    title: 'Reddit SEO Blog — Organic Reddit Strategy & Reputation',
    metaDescription: 'Learn how organic Reddit SEO, community-native content, and reputation management help brands create trusted discovery.',
    keywords: 'reddit seo, organic reddit marketing, reddit reputation management, reddit strategy',
    canonicalPath: '/blog',
    content,
    type: 'website',
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }],
  });
}

module.exports = { renderArticlePage, renderBlogListPage, SITE_URL };
