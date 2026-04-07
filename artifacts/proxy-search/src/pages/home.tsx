import { SearchBar } from "@/components/search-bar";
import { Link } from "wouter";
import { SiYoutube, SiReddit, SiInstagram, SiX, SiTiktok, SiSpotify, SiRoblox, SiDiscord, SiTwitch, SiNetflix } from "react-icons/si";
import { Globe } from "lucide-react";

const QUICK_LINKS = [
  { name: "YouTube", url: "https://www.youtube.com", icon: SiYoutube, color: "#FF0000" },
  { name: "Reddit", url: "https://www.reddit.com", icon: SiReddit, color: "#FF4500" },
  { name: "Instagram", url: "https://www.instagram.com", icon: SiInstagram, color: "#E1306C" },
  { name: "X / Twitter", url: "https://x.com", icon: SiX, color: "#000000" },
  { name: "TikTok", url: "https://www.tiktok.com", icon: SiTiktok, color: "#010101" },
  { name: "Spotify", url: "https://open.spotify.com", icon: SiSpotify, color: "#1DB954" },
  { name: "Roblox", url: "https://www.roblox.com", icon: SiRoblox, color: "#E8272A" },
  { name: "Discord", url: "https://discord.com", icon: SiDiscord, color: "#5865F2" },
  { name: "Twitch", url: "https://www.twitch.tv", icon: SiTwitch, color: "#9146FF" },
  { name: "Netflix", url: "https://www.netflix.com", icon: SiNetflix, color: "#E50914" },
  { name: "Daydream", url: "https://daydreamx.pro", icon: Globe, color: "#7C3AED" },
  { name: "Top Eagle", url: "https://topeaglerservers.com/dashboard/my-servers", icon: Globe, color: "#D97706" },
];

const suggestions = [
  "Latest technology news",
  "How to build a search engine",
  "React Query tutorial",
  "Tailwind CSS tricks",
];

export default function Home() {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col relative overflow-hidden bg-background">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl mix-blend-multiply"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl mix-blend-multiply"></div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 w-full max-w-4xl mx-auto z-10 -mt-10">
        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <div className="mb-8 text-center">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-primary font-display flex items-center justify-center gap-3">
              <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white -rotate-3">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
              FreeSearch
            </h1>
            <p className="mt-3 text-base text-muted-foreground">Unrestricted access. Clean results.</p>
          </div>

          <div className="w-full max-w-2xl">
            <SearchBar autoFocus size="lg" />
          </div>

          {/* Quick Access Sites */}
          <div className="mt-10 w-full max-w-2xl">
            <p className="text-xs font-semibold text-muted-foreground/60 mb-3 uppercase tracking-wider text-center">Quick Access</p>
            <div className="grid grid-cols-6 gap-2">
              {QUICK_LINKS.map((site) => {
                const Icon = site.icon;
                const proxyUrl = `/api/proxy?url=${encodeURIComponent(site.url)}`;
                return (
                  <a
                    key={site.name}
                    href={proxyUrl}
                    data-testid={`quick-link-${site.name.toLowerCase().replace(/[\s/]/g, "-")}`}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/60 border border-border/40 hover:bg-white hover:border-border hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${site.color}20` }}
                    >
                      <Icon style={{ color: site.color }} className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors text-center leading-tight">
                      {site.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Suggestions */}
          <div className="mt-6 flex flex-col items-center">
            <p className="text-xs font-medium text-muted-foreground/60 mb-3 uppercase tracking-wider">Try searching for</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((suggestion) => (
                <Link key={suggestion} href={`/search?q=${encodeURIComponent(suggestion)}`}>
                  <div className="px-3 py-1.5 rounded-full bg-white/60 border border-border/50 text-xs text-muted-foreground hover:bg-white hover:text-primary hover:border-primary/30 transition-all cursor-pointer shadow-sm">
                    {suggestion}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="py-5 text-center text-xs text-muted-foreground z-10">
        <p>Built with privacy and access in mind.</p>
      </footer>
    </div>
  );
}
