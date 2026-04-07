import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useLocation } from "wouter";

interface SearchBarProps {
  initialValue?: string;
  autoFocus?: boolean;
  size?: "lg" | "md";
}

export function SearchBar({ initialValue = "", autoFocus = false, size = "md" }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [, setLocation] = useLocation();

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const clearSearch = () => {
    setQuery("");
  };

  const isLg = size === "lg";

  return (
    <form onSubmit={handleSubmit} className="relative w-full group">
      <div className={`absolute inset-y-0 left-0 flex items-center ${isLg ? 'pl-5' : 'pl-4'} pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors duration-200`}>
        <Search className={`${isLg ? 'h-6 w-6' : 'h-5 w-5'}`} />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Search the web freely..."
        className={`w-full bg-white shadow-sm border border-transparent rounded-full outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground/70 ${
          isLg ? 'py-4 pl-14 pr-12 text-lg' : 'py-2.5 pl-11 pr-10 text-base'
        }`}
      />
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className={`absolute inset-y-0 right-0 flex items-center justify-center ${isLg ? 'pr-5 w-12' : 'pr-4 w-10'} text-muted-foreground hover:text-foreground transition-colors`}
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </form>
  );
}
