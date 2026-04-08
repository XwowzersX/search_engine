import { Router, type IRouter } from "express";

const router: IRouter = Router();

function toAbsolute(url: string, base: string): string {
  if (url.startsWith("//")) return "https:" + url;
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

function rewriteUrl(url: string, base: string, proxyBase: string): string {
  if (
    url.startsWith("javascript:") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:") ||
    url.startsWith("data:") ||
    url.startsWith("#")
  ) {
    return url;
  }
  const absolute = toAbsolute(url, base);
  return `${proxyBase}${encodeURIComponent(absolute)}`;
}

function buildInjectedScript(baseUrl: string, proxyBase: string): string {
  return `<script>
(function() {
  var BASE = ${JSON.stringify(baseUrl)};
  var PROXY = ${JSON.stringify(proxyBase)};

  function toAbs(url) {
    if (!url) return url;
    if (url.startsWith('javascript:') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('data:') || url.startsWith('#')) return null;
    if (url.startsWith('//')) return 'https:' + url;
    try { return new URL(url, BASE).href; } catch(e) { return null; }
  }

  function shouldProxy(url) {
    if (!url) return false;
    if (url.startsWith(PROXY) || url.startsWith('/api/proxy')) return false;
    var abs = toAbs(url);
    if (!abs) return false;
    return abs.startsWith('http');
  }

  function proxied(url) {
    var abs = toAbs(url);
    if (!abs) return url;
    return PROXY + encodeURIComponent(abs);
  }

  // Intercept anchor clicks
  document.addEventListener('click', function(e) {
    var el = e.target;
    while (el && el.tagName !== 'A') el = el.parentElement;
    if (!el) return;
    var href = el.getAttribute('href');
    if (!href || !shouldProxy(href)) return;
    e.preventDefault();
    e.stopPropagation();
    window.location.href = proxied(href);
  }, true);

  // Intercept window.open — stay in same tab
  var _winOpen = window.open;
  window.open = function(url) {
    if (url && shouldProxy(String(url))) {
      window.location.href = proxied(String(url));
      return null;
    }
    return _winOpen.apply(this, arguments);
  };

  // Intercept fetch — rewrite ALL URLs (relative and absolute) to go through proxy
  var _fetch = window.fetch;
  window.fetch = function(input, init) {
    try {
      var url = typeof input === 'string' ? input
              : (input instanceof Request ? input.url : null);
      if (url && shouldProxy(url)) {
        var p = proxied(url);
        input = typeof input === 'string' ? p
              : new Request(p, { method: input.method, headers: input.headers, body: input.body, mode: 'cors', credentials: 'omit' });
      }
    } catch(e) {}
    return _fetch.call(window, input, init);
  };

  // Intercept XMLHttpRequest
  var _xhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    try {
      if (url && shouldProxy(String(url))) {
        arguments[1] = proxied(String(url));
      }
    } catch(e) {}
    return _xhrOpen.apply(this, arguments);
  };
})();
</script>`;
}

function rewriteHtml(html: string, baseUrl: string, proxyBase: string): string {
  html = html.replace(/<base[^>]*>/gi, "");

  html = html.replace(
    /(<[a-z][a-z0-9]*\b[^>]*?\s)(href=)(["'])([^"']*)\3/gi,
    (_match, prefix, attr, quote, url) => {
      return `${prefix}${attr}${quote}${rewriteUrl(url, baseUrl, proxyBase)}${quote}`;
    }
  );

  html = html.replace(
    /(<(?:img|script|source|audio|video|track|embed)\b[^>]*?\s)(src=)(["'])([^"']*)\3/gi,
    (_match, prefix, attr, quote, url) => {
      if (url.startsWith("data:")) return _match;
      return `${prefix}${attr}${quote}${rewriteUrl(url, baseUrl, proxyBase)}${quote}`;
    }
  );

  html = html.replace(
    /(<link\b[^>]*?\s)(href=)(["'])([^"']*)\3/gi,
    (_match, prefix, attr, quote, url) => {
      return `${prefix}${attr}${quote}${rewriteUrl(url, baseUrl, proxyBase)}${quote}`;
    }
  );

  html = html.replace(
    /(<form\b[^>]*?\s)(action=)(["'])([^"']*)\3/gi,
    (_match, prefix, attr, quote, url) => {
      return `${prefix}${attr}${quote}${rewriteUrl(url, baseUrl, proxyBase)}${quote}`;
    }
  );

  html = html.replace(
    /(url\()(["']?)([^"')]+)\2(\))/gi,
    (_match, before, quote, url, after) => {
      if (url.startsWith("data:")) return _match;
      return `${before}${quote}${rewriteUrl(url, baseUrl, proxyBase)}${quote}${after}`;
    }
  );

  // Inject script as early as possible — right after <head> opening tag
  const injected = buildInjectedScript(baseUrl, proxyBase);
  if (/<head[^>]*>/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, `<head$1>${injected}`);
  } else if (html.includes("</head>")) {
    html = html.replace("</head>", `${injected}</head>`);
  } else {
    html = injected + html;
  }

  return html;
}

function rewriteCss(css: string, baseUrl: string, proxyBase: string): string {
  return css.replace(
    /(url\()(["']?)([^"')]+)\2(\))/gi,
    (_match, before, quote, url, after) => {
      if (url.startsWith("data:")) return _match;
      return `${before}${quote}${rewriteUrl(url, baseUrl, proxyBase)}${quote}${after}`;
    }
  );
}

router.get("/proxy", async (req, res): Promise<void> => {
  const urlParam = req.query["url"];
  if (!urlParam || typeof urlParam !== "string") {
    res.status(400).json({ error: "url query parameter is required" });
    return;
  }

  let targetUrl: string;
  try {
    const parsed = new URL(urlParam);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      res.status(400).json({ error: "Only http/https URLs are supported" });
      return;
    }
    targetUrl = parsed.href;
  } catch {
    res.status(400).json({ error: "Invalid URL" });
    return;
  }

  const proxyBase = "/api/proxy?url=";

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": targetUrl,
      },
      redirect: "follow",
    });

    const contentType = upstreamRes.headers.get("content-type") ?? "";

    res.removeHeader("x-frame-options");
    res.removeHeader("content-security-policy");

    const safeHeaders = ["content-type", "cache-control", "expires", "last-modified", "etag"];
    for (const header of safeHeaders) {
      const val = upstreamRes.headers.get(header);
      if (val) res.setHeader(header, val);
    }

    if (contentType.includes("text/html")) {
      const html = await upstreamRes.text();
      const rewritten = rewriteHtml(html, targetUrl, proxyBase);
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.removeHeader("content-length");
      res.send(rewritten);
    } else if (contentType.includes("text/css")) {
      const css = await upstreamRes.text();
      const rewritten = rewriteCss(css, targetUrl, proxyBase);
      res.setHeader("content-type", contentType);
      res.removeHeader("content-length");
      res.send(rewritten);
    } else {
      const buffer = await upstreamRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    }
  } catch (err) {
    req.log.error({ err, targetUrl }, "Proxy fetch failed");
    const errMsg = err instanceof Error ? err.message : String(err);
    const isTimeout = errMsg.includes("Timeout") || errMsg.includes("timeout");
    const isNotFound = errMsg.includes("ENOTFOUND") || errMsg.includes("getaddrinfo");
    const reason = isNotFound
      ? "The website address could not be found. It may not exist or the URL might be wrong."
      : isTimeout
      ? "The website took too long to respond. It may be down or blocking the proxy."
      : "The website could not be reached. It may be blocking proxies or is temporarily unavailable.";
    res.status(502).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Could not load page</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f2f8; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: white; border-radius: 16px; padding: 40px 36px; max-width: 460px; width: 100%; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .icon { width: 56px; height: 56px; background: #fef2f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 26px; }
    h1 { font-size: 20px; font-weight: 700; color: #1e1e2e; margin-bottom: 10px; }
    p { font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 8px; }
    .url { font-size: 12px; color: #9ca3af; word-break: break-all; background: #f9fafb; border-radius: 8px; padding: 8px 12px; margin: 16px 0; }
    .btn { display: inline-block; margin-top: 20px; padding: 10px 24px; background: #4285f4; color: white; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; }
    .btn:hover { background: #3367d6; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">&#x26A0;&#xFE0F;</div>
    <h1>Could not load this page</h1>
    <p>${reason}</p>
    <div class="url">${targetUrl}</div>
    <a class="btn" href="/">Go back</a>
  </div>
</body>
</html>`);
  }
});

export default router;
