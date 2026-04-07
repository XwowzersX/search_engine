import { useLocation } from "wouter";
import { Link } from "wouter";
import { SearchBar } from "@/components/search-bar";
import { useSearch, getSearchQueryKey } from "@workspace/api-client-react";
import { Globe, ArrowRight } from "lucide-react";

export default function Search() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const q = searchParams.get("q") || "";

  const { data, isLoading, error } = useSearch(
    { q },
    { 
      query: { 
        enabled: !!q, 
        queryKey: getSearchQueryKey({ q }) 
      } 
    }
  );

  const getProxyUrl = (url: string) => {
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-border/40 py-4 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-6">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm group-hover:rotate-6 transition-transform">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
              <span className="font-display font-bold text-xl hidden sm:block text-foreground">FreeSearch</span>
            </div>
          </Link>
          <div className="flex-1 max-w-2xl">
            <SearchBar initialValue={q} size="md" />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {!q ? (
          <div className="text-center py-20 text-muted-foreground">
            Enter a search query to get started.
          </div>
        ) : isLoading ? (
          <div className="max-w-2xl space-y-8">
            <div className="h-5 w-48 bg-muted rounded animate-pulse" />
            
            {/* Instant answer skeleton */}
            <div className="bg-white rounded-xl p-6 border border-border shadow-sm space-y-4">
              <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                <div className="h-4 w-4/6 bg-muted rounded animate-pulse" />
              </div>
            </div>

            {/* Results skeleton */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-6 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
                  <div className="h-4 w-64 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-6 w-3/4 bg-muted rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-xl max-w-2xl">
            <h3 className="font-bold text-lg mb-2">Search Error</h3>
            <p>We encountered an error while searching. Please try again later.</p>
          </div>
        ) : data ? (
          <div className="max-w-2xl">
            <p className="text-sm text-muted-foreground mb-8">
              Found {data.results.length} results for <span className="font-medium text-foreground">"{data.query}"</span>
            </p>

            {data.instantAnswer && (
              <div className="mb-10 bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 rounded-2xl p-6 sm:p-8 shadow-sm">
                {data.instantTitle && (
                  <h2 className="text-2xl font-display font-semibold mb-3 text-foreground">
                    {data.instantTitle}
                  </h2>
                )}
                <p className="text-foreground/90 leading-relaxed mb-4">
                  {data.instantAnswer}
                </p>
                {data.instantUrl && (
                  <a 
                    href={getProxyUrl(data.instantUrl)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    Read more on Wikipedia
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}

            <div className="space-y-10">
              {data.results.map((result, idx) => (
                <article key={idx} className="group">
                  <a href={getProxyUrl(result.url)} className="block">
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center overflow-hidden border border-border/50 shrink-0">
                        {result.favicon ? (
                          <img src={result.favicon} alt="" className="w-4 h-4 object-contain" />
                        ) : (
                          <Globe className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground font-medium truncate max-w-[280px] sm:max-w-md">
                          {result.displayUrl}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl font-medium text-primary group-hover:underline decoration-primary/50 underline-offset-2 mb-2 leading-snug">
                      {result.title}
                    </h3>
                  </a>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed line-clamp-2">
                    {result.description}
                  </p>
                </article>
              ))}
            </div>

            {data.results.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Your search - "{q}" - did not match any documents.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
