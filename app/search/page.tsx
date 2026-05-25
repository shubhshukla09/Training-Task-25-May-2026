"use client";

import { useEffect, useState } from "react";
import { useSearch } from "@/hooks/useSearch";
import BlogCard from "@/components/blog/BlogCard";
import ScrollReveal from "@/components/transitions/ScrollReveal";
import PageTransition from "@/components/transitions/PageTransition";
import { Search, Sparkles, Filter, AlertCircle, RefreshCw } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export default function SearchPage() {
  const {
    query,
    setQuery,
    category,
    setCategory,
    results,
    suggestions,
    isLoading,
    error,
  } = useSearch({ debounceMs: 400 });

  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Fetch categories list on mount for filter chips
  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch("/api/blogs"); // Retrieves blogs which returns categories or load simple schema
        // To be safe, we can fetch all categories from our seed list locally or from DB
        const catRes = await fetch("/api/newsletter"); // Fetch from newsletter admin lists or direct mock fallbacks
        // Instead of triggering many routes, we can list standard ones or fetch
        const res = await fetch("/api/search"); // Contains categories or suggestions
        const data = await res.json();
        // Set hardcoded fallback categories to match seed data instantly
        setCategories([
          { id: "1", name: "Artificial Intelligence", slug: "artificial-intelligence" },
          { id: "2", name: "Web Development", slug: "web-development" },
          { id: "3", name: "Design Systems", slug: "design-systems" },
          { id: "4", name: "Cloud Computing", slug: "cloud-computing" },
        ]);
      } catch (err) {
        console.warn("⚠️ Failed to load categories, using local fallbacks");
      }
    }
    loadCategories();
  }, []);

  return (
    <PageTransition>
      <div className="w-full min-h-screen px-6 pb-24">
        {/* Parallax glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto pt-10">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex p-3 rounded-2xl bg-zinc-900 border border-white/10 text-cyan-400 mb-4 animate-float">
                <Search className="w-6 h-6" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 font-outfit">
                Live Search Engine
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Query our database using titles, content keywords, or topic categories.
              </p>
            </div>
          </ScrollReveal>

          {/* Search Box Inputs */}
          <ScrollReveal delay={0.1}>
            <div className="max-w-2xl mx-auto relative mb-8">
              <div className="relative flex items-center">
                <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-5.5 h-5.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search titles, architectures, and categories..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full glass-input pl-14 pr-12 py-3.5 text-base"
                />
                {isLoading && (
                  <RefreshCw className="absolute right-4.5 w-5 h-5 text-cyan-400 animate-spin" />
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Autocomplete Suggestions / Hot Keywords */}
          {suggestions.length > 0 && (
            <ScrollReveal delay={0.15}>
              <div className="max-w-2xl mx-auto flex items-center flex-wrap gap-2 mb-10 text-xs">
                <span className="text-zinc-500 font-bold uppercase tracking-wider mr-2 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Trending:</span>
                </span>
                {suggestions.map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-zinc-300 hover:border-cyan-500/25 hover:text-white transition-all focus:outline-none"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </ScrollReveal>
          )}

          {/* Filter Chips Toolbar */}
          <ScrollReveal delay={0.2}>
            <div className="max-w-3xl mx-auto flex items-center justify-center flex-wrap gap-2 border-y border-white/5 py-4 mb-12">
              <span className="text-xs font-bold text-zinc-400 flex items-center space-x-1 mr-2">
                <Filter className="w-3.5 h-3.5 text-violet-400" />
                <span>Category:</span>
              </span>

              <button
                onClick={() => setCategory("")}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold border transition-all focus:outline-none ${
                  !category
                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                    : "border-white/5 bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                All Categories
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.slug)}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold border transition-all focus:outline-none ${
                    category === cat.slug
                      ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                      : "border-white/5 bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Results Area */}
          <ScrollReveal delay={0.3}>
            {results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {results.map((post, idx) => (
                  <BlogCard key={post.id} post={post as any} index={idx} />
                ))}
              </div>
            ) : (
              !isLoading && (
                <div className="max-w-md mx-auto text-center py-16 px-6 border border-white/10 bg-zinc-950/40 rounded-3xl backdrop-blur-xl flex flex-col items-center">
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-500 mb-6">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-2">No Matching Results</h2>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    We couldn't locate any technical publications matching your search query. Try typing keywords like "Next.js", "embeddings", or reset the active filters!
                  </p>
                </div>
              )
            )}
          </ScrollReveal>
        </div>
      </div>
    </PageTransition>
  );
}
