import { useState, useRef } from "react";
import { useLocation } from "wouter";

const GOOGLE_APPS = [
  { name: "Search", url: "https://www.google.com", emoji: "🔍" },
  { name: "Images", url: "https://images.google.com", emoji: "🖼️" },
  { name: "Maps", url: "https://maps.google.com", emoji: "🗺️" },
  { name: "YouTube", url: "https://www.youtube.com", emoji: "▶️" },
  { name: "Gmail", url: "https://mail.google.com", emoji: "✉️" },
  { name: "Drive", url: "https://drive.google.com", emoji: "📁" },
  { name: "Docs", url: "https://docs.google.com", emoji: "📝" },
  { name: "Sheets", url: "https://sheets.google.com", emoji: "📊" },
  { name: "Slides", url: "https://slides.google.com", emoji: "📑" },
  { name: "Calendar", url: "https://calendar.google.com", emoji: "📅" },
  { name: "Meet", url: "https://meet.google.com", emoji: "📹" },
  { name: "Classroom", url: "https://classroom.google.com", emoji: "🎓" },
  { name: "Translate", url: "https://translate.google.com", emoji: "🌐" },
  { name: "News", url: "https://news.google.com", emoji: "📰" },
  { name: "Photos", url: "https://photos.google.com", emoji: "📸" },
  { name: "Shopping", url: "https://shopping.google.com", emoji: "🛒" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleLucky() {
    if (query.trim()) {
      const url = `/api/proxy?url=${encodeURIComponent(`https://www.google.com/search?q=${encodeURIComponent(query.trim())}&btnI=1`)}`;
      window.location.href = url;
    }
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#fff", display: "flex", flexDirection: "column", fontFamily: "arial,sans-serif" }}>

      {/* Top nav */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", padding: "14px 24px", gap: "16px" }}>
        <a href={`/api/proxy?url=${encodeURIComponent("https://mail.google.com")}`} style={{ fontSize: "13px", color: "#202124", textDecoration: "none" }}>Gmail</a>
        <a href={`/api/proxy?url=${encodeURIComponent("https://images.google.com")}`} style={{ fontSize: "13px", color: "#202124", textDecoration: "none" }}>Images</a>

        {/* Apps grid icon */}
        <div
          style={{ width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}
          title="Google apps"
        >
          <svg focusable="false" viewBox="0 0 24 24" width="24" height="24" fill="#5f6368">
            <path d="M6,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM6,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM16,6c0,1.1 0.9,2 2,2s2,-0.9 2,-2 -0.9,-2 -2,-2 -2,0.9 -2,2zM12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,14c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM18,20c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2z"></path>
          </svg>
        </div>

        {/* Profile avatar */}
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#4285f4", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
          G
        </div>
      </div>

      {/* Center content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: "100px" }}>

        {/* Google logo */}
        <div style={{ marginBottom: "28px" }}>
          <span style={{ fontSize: "72px", fontWeight: 700, letterSpacing: "-2px", fontFamily: "Product Sans,arial,sans-serif" }}>
            <span style={{ color: "#4285f4" }}>G</span>
            <span style={{ color: "#ea4335" }}>o</span>
            <span style={{ color: "#fbbc05" }}>o</span>
            <span style={{ color: "#4285f4" }}>g</span>
            <span style={{ color: "#34a853" }}>l</span>
            <span style={{ color: "#ea4335" }}>e</span>
          </span>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} style={{ width: "100%", maxWidth: "584px", padding: "0 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1px solid #dfe1e5",
              borderRadius: "24px",
              padding: "10px 14px",
              boxShadow: "none",
              transition: "box-shadow 0.2s",
              background: "#fff",
              gap: "10px",
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 1px 6px rgba(32,33,36,.28)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            onFocusCapture={e => (e.currentTarget.style.boxShadow = "0 1px 6px rgba(32,33,36,.28)")}
            onBlurCapture={e => (e.currentTarget.style.boxShadow = "none")}
          >
            <svg focusable="false" height="20" viewBox="0 0 24 24" width="20" fill="#9aa0a6">
              <path d="M20.49,19l-5.73-5.73C15.53,12.2,16,10.91,16,9.5C16,5.91,13.09,3,9.5,3S3,5.91,3,9.5C3,13.09,5.91,16,9.5,16 c1.41,0,2.7-0.47,3.77-1.24L19,20.49L20.49,19z M5,9.5C5,7.01,7.01,5,9.5,5S14,7.01,14,9.5S11.99,14,9.5,14S5,11.99,5,9.5z"></path>
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "16px",
                color: "#202124",
                background: "transparent",
              }}
            />
            {query && (
              <svg onClick={() => setQuery("")} style={{ cursor: "pointer" }} focusable="false" height="20" viewBox="0 0 24 24" width="20" fill="#70757a">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
              </svg>
            )}
            <svg focusable="false" height="24" viewBox="0 0 24 24" width="24" style={{ cursor: "pointer" }} fill="#4285f4">
              <path d="M12 15c1.66 0 3-1.31 3-2.97v-7.02c0-1.66-1.34-3.01-3-3.01s-3 1.34-3 3.01v7.02c0 1.66 1.34 2.97 3 2.97z"></path>
              <path d="M11 18.08h2v3.92h-2z"></path>
              <path d="M7.05 16.87c-1.27-1.33-2.05-2.83-2.05-5.87h2c0 3 .98 4.48 2.45 5.87L7.05 16.87z"></path>
              <path d="M16.95 16.87l-1.4-1.4C16.99 14.02 17 13.53 17 13h2c0 3.04-.78 4.54-2.05 5.87z"></path>
            </svg>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "24px" }}>
            <button
              type="submit"
              style={{
                padding: "0 16px",
                height: "36px",
                background: "#f8f9fa",
                border: "1px solid #f8f9fa",
                borderRadius: "4px",
                fontSize: "14px",
                color: "#3c4043",
                cursor: "pointer",
                fontFamily: "arial,sans-serif",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#f1f3f4";
                e.currentTarget.style.borderColor = "#dadce0";
                e.currentTarget.style.boxShadow = "0 1px 1px rgba(0,0,0,.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#f8f9fa";
                e.currentTarget.style.borderColor = "#f8f9fa";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Google Search
            </button>
            <button
              type="button"
              onClick={handleLucky}
              style={{
                padding: "0 16px",
                height: "36px",
                background: "#f8f9fa",
                border: "1px solid #f8f9fa",
                borderRadius: "4px",
                fontSize: "14px",
                color: "#3c4043",
                cursor: "pointer",
                fontFamily: "arial,sans-serif",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#f1f3f4";
                e.currentTarget.style.borderColor = "#dadce0";
                e.currentTarget.style.boxShadow = "0 1px 1px rgba(0,0,0,.1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "#f8f9fa";
                e.currentTarget.style.borderColor = "#f8f9fa";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              I'm Feeling Lucky
            </button>
          </div>
        </form>

        {/* Google apps grid */}
        <div style={{ marginTop: "40px", width: "100%", maxWidth: "620px", padding: "0 20px" }}>
          <p style={{ textAlign: "center", fontSize: "12px", color: "#70757a", marginBottom: "16px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
            Google Services
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "8px" }}>
            {GOOGLE_APPS.map(app => (
              <a
                key={app.name}
                href={`/api/proxy?url=${encodeURIComponent(app.url)}`}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "10px 4px", borderRadius: "12px", textDecoration: "none", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f1f3f4")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: "22px" }}>{app.emoji}</span>
                <span style={{ fontSize: "11px", color: "#202124", textAlign: "center", lineHeight: "1.3" }}>{app.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #e8eaed" }}>
        <div style={{ background: "#f2f2f2", padding: "12px 24px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
          <span style={{ fontSize: "13px", color: "#70757a" }}>United States</span>
          <div style={{ display: "flex", gap: "24px" }}>
            <span style={{ fontSize: "13px", color: "#70757a", cursor: "pointer" }}>Advertising</span>
            <span style={{ fontSize: "13px", color: "#70757a", cursor: "pointer" }}>Business</span>
            <span style={{ fontSize: "13px", color: "#70757a", cursor: "pointer" }}>How Search works</span>
          </div>
          <div style={{ display: "flex", gap: "24px" }}>
            <span style={{ fontSize: "13px", color: "#70757a", cursor: "pointer" }}>Privacy</span>
            <span style={{ fontSize: "13px", color: "#70757a", cursor: "pointer" }}>Terms</span>
            <span style={{ fontSize: "13px", color: "#70757a", cursor: "pointer" }}>Settings</span>
          </div>
        </div>
      </div>
    </div>
  );
}
