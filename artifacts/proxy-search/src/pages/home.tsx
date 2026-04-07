import { SearchBar } from "@/components/search-bar";
import { Link } from "wouter";

export default function Home() {
  const suggestions = [
    "Latest technology news",
    "How to build a search engine",
    "React Query tutorial",
    "Tailwind CSS tricks"
  ];

  return (
    <div className="min-h-[100dvh] w-full flex flex-col relative overflow-hidden bg-background">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl mix-blend-multiply"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl mix-blend-multiply"></div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 w-full max-w-3xl mx-auto z-10 -mt-20">
        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <div className="mb-10 text-center">
            <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-primary font-display flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white -rotate-3">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
              FreeSearch
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">Unrestricted access. Clean results.</p>
          </div>

          <div className="w-full max-w-2xl">
            <SearchBar autoFocus size="lg" />
          </div>

          <div className="mt-12 flex flex-col items-center">
            <p className="text-sm font-medium text-muted-foreground/60 mb-4 uppercase tracking-wider">Try searching for</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <Link key={suggestion} href={`/search?q=${encodeURIComponent(suggestion)}`}>
                  <div className="px-4 py-2 rounded-full bg-white/60 border border-border/50 text-sm text-muted-foreground hover:bg-white hover:text-primary hover:border-primary/30 transition-all cursor-pointer shadow-sm">
                    {suggestion}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground z-10">
        <p>Built with privacy and access in mind.</p>
      </footer>
    </div>
  );
}
