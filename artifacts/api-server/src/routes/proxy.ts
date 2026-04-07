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
      },
      redirect: "follow",
    });

    const contentType = upstreamRes.headers.get("content-type") ?? "";

    res.removeHeader("x-frame-options");
    res.removeHeader("content-security-policy");

    const safeHeaders = ["content-type", "content-length", "cache-control", "expires", "last-modified", "etag"];
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
    res.status(502).json({ error: "Failed to fetch the requested URL" });
  }
});

export default router;
