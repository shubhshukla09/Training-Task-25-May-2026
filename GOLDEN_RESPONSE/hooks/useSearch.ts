import { useState, useEffect } from "react";

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  summary: string;
  featuredImage: string | null;
  publishedAt: string | null;
  views: number;
  readingTime: number;
  author: {
    name: string | null;
    image: string | null;
  };
  category: {
    name: string;
    slug: string;
  };
}

export interface SearchHookOptions {
  initialCategory?: string;
  initialTag?: string;
  debounceMs?: number;
}

export function useSearch(options: SearchHookOptions = {}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(options.initialCategory || "");
  const [tag, setTag] = useState(options.initialTag || "");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, options.debounceMs || 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query, options.debounceMs]);

  // Fetch search results and suggestions when parameters change
  useEffect(() => {
    let active = true;

    async function fetchSearchResults() {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (debouncedQuery) params.append("q", debouncedQuery);
        if (category) params.append("category", category);
        if (tag) params.append("tag", tag);

        const response = await fetch(`/api/search?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await response.json();
        if (active) {
          setResults(data.results || []);
          setSuggestions(data.suggestions || []);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "An error occurred");
          setResults([]);
          setSuggestions([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    fetchSearchResults();

    return () => {
      active = false;
    };
  }, [debouncedQuery, category, tag]);

  return {
    query,
    setQuery,
    category,
    setCategory,
    tag,
    setTag,
    results,
    suggestions,
    isLoading,
    error,
  };
}
