import { Router, type IRouter } from "express";
import { SearchQueryParams, SearchResponse } from "@workspace/api-zod";
import { parse } from "node-html-parser";

const router: IRouter = Router();

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…");
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, ""));
}

// Resolve DDG redirect URLs (e.g. /l/?uddg=...) to the real URL
function resolveUrl(href: string): string | null {
  if (!href) return null;
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith("/l/") || href.includes("uddg=")) {
    try {
      const params = new URLSearchParams(href.split("?")[1] ?? "");
      const uddg = params.get("uddg");
      if (uddg) return decodeURIComponent(uddg);
    } catch {
      return null;
    }
  }
  return null;
}

router.get("/search", async (req, res): Promise<void> => {
  const parsed = SearchQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { q } = parsed.data;

  const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}&kl=us-en`;

  let html: string;
  try {
    const response = await fetch(ddgUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });
    html = await response.text();
  } catch (err) {
    req.log.error({ err }, "DDG fetch failed");
    res.status(500).json({ error: "Search service unavailable" });
    return;
  }

  const root = parse(html);

  const results: Array<{
    title: string;
    url: string;
    description: string;
    displayUrl: string;
    favicon: string | null;
  }> = [];

  // Parse web results
  const resultNodes = root.querySelectorAll(".result.results_links");
  for (const node of resultNodes) {
    const titleEl = node.querySelector(".result__title .result__a, .result__a");
    const snippetEl = node.querySelector(".result__snippet");
    const urlEl = node.querySelector(".result__url");

    if (!titleEl) continue;

    const title = stripTags(titleEl.innerHTML);
    if (!title) continue;

    const rawHref = titleEl.getAttribute("href") ?? "";
    const url = resolveUrl(rawHref);
    if (!url) continue;

    const description = snippetEl ? stripTags(snippetEl.innerHTML) : "";
    const displayDomain = urlEl ? stripTags(urlEl.innerHTML).trim() : extractDomain(url);
    const domain = extractDomain(url);
    const favicon = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null;

    results.push({ title, url, description, displayUrl: displayDomain || domain, favicon });
    if (results.length >= 15) break;
  }

  // Instant answer from abstract box
  let instantAnswer: string | null = null;
  let instantTitle: string | null = null;
  let instantUrl: string | null = null;

  const abstractEl = root.querySelector(".zci__body, #zero_click_abstract, .abstract");
  const headingEl = root.querySelector(".zci__heading, #zero_click_header");
  const abstractLinkEl = root.querySelector(".zci__body a, #zero_click_abstract a");
  if (abstractEl) {
    const text = stripTags(abstractEl.innerHTML).trim();
    if (text) {
      instantAnswer = text;
      instantTitle = headingEl ? stripTags(headingEl.innerHTML).trim() : null;
      instantUrl = abstractLinkEl ? (abstractLinkEl.getAttribute("href") ?? null) : null;
    }
  }

  const responseBody = SearchResponse.parse({
    query: q,
    results,
    instantAnswer,
    instantTitle,
    instantUrl,
  });

  res.json(responseBody);
});

export default router;
