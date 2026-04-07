import { Router, type IRouter } from "express";
import { SearchQueryParams, SearchResponse } from "@workspace/api-zod";

const router: IRouter = Router();

interface DDGTopic {
  FirstURL?: string;
  Text?: string;
  Icon?: { URL?: string };
  Name?: string;
  Topics?: DDGTopic[];
}

interface DDGResult {
  FirstURL?: string;
  Text?: string;
  Icon?: { URL?: string };
}

interface DDGResponse {
  Abstract: string;
  AbstractText: string;
  AbstractSource: string;
  AbstractURL: string;
  Heading: string;
  Results: DDGResult[];
  RelatedTopics: DDGTopic[];
  Type: string;
}

function toAbsolute(url: string, base: string): string {
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function parseTopic(topic: DDGTopic): Array<{ title: string; url: string; description: string; displayUrl: string; favicon: string | null }> {
  if (topic.Topics) {
    return topic.Topics.flatMap(parseTopic);
  }
  if (!topic.FirstURL || !topic.Text) return [];
  const parts = topic.Text.split(" - ");
  const title = parts[0] ?? topic.Text;
  const description = parts.slice(1).join(" - ") || topic.Text;
  const domain = extractDomain(topic.FirstURL);
  const favicon = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null;
  return [{
    title,
    url: topic.FirstURL,
    description,
    displayUrl: domain,
    favicon,
  }];
}

router.get("/search", async (req, res): Promise<void> => {
  const parsed = SearchQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { q } = parsed.data;

  const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1&t=proxy_search`;

  let ddgData: DDGResponse;
  try {
    const response = await fetch(ddgUrl, {
      headers: { "Accept": "application/json" },
    });
    ddgData = (await response.json()) as DDGResponse;
  } catch (err) {
    req.log.error({ err }, "DDG fetch failed");
    res.status(500).json({ error: "Search service unavailable" });
    return;
  }

  const results: Array<{ title: string; url: string; description: string; displayUrl: string; favicon: string | null }> = [];

  for (const r of ddgData.Results ?? []) {
    if (!r.FirstURL || !r.Text) continue;
    const domain = extractDomain(r.FirstURL);
    results.push({
      title: r.Text,
      url: r.FirstURL,
      description: r.Text,
      displayUrl: domain,
      favicon: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null,
    });
  }

  for (const topic of ddgData.RelatedTopics ?? []) {
    const parsed = parseTopic(topic);
    results.push(...parsed);
    if (results.length >= 15) break;
  }

  let instantAnswer: string | null = null;
  let instantTitle: string | null = null;
  let instantUrl: string | null = null;

  if (ddgData.AbstractText) {
    instantAnswer = ddgData.AbstractText;
    instantTitle = ddgData.Heading || null;
    instantUrl = ddgData.AbstractURL || null;
  }

  const response = SearchResponse.parse({
    query: q,
    results: results.slice(0, 15),
    instantAnswer,
    instantTitle,
    instantUrl,
  });

  res.json(response);
});

export default router;
