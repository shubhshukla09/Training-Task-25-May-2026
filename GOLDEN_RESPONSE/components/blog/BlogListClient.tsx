"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import BlogCard from "@/components/blog/BlogCard";
import { PaginationControls } from "@/components/blog/PaginationControls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { paginatePosts, searchAndFilterPosts } from "@/lib/blog";
import { BlogPost, CategoryStat } from "@/types/blog";

interface BlogListClientProps {
  posts: BlogPost[];
  categories: CategoryStat[];
  tags: string[];
}

export function BlogListClient({ posts, categories, tags }: BlogListClientProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebounce(query, 250);

  const filteredPosts = useMemo(
    () =>
      searchAndFilterPosts({
        posts,
        query: debouncedQuery,
        category: activeCategory,
        tag: activeTag,
      }),
    [posts, debouncedQuery, activeCategory, activeTag],
  );

  const { pagePosts, totalPages } = useMemo(() => paginatePosts(filteredPosts, page), [filteredPosts, page]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, activeCategory, activeTag]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 rounded-2xl border border-border/70 bg-card/70 p-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search blog posts..."
            className="pl-9"
            aria-label="Search blog posts"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setQuery("");
            setActiveCategory("");
            setActiveTag("");
          }}
        >
          Reset filters
        </Button>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">Categories</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("")}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              activeCategory === ""
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                activeCategory === category.name
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border/70 text-muted-foreground hover:text-foreground"
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button key={tag} onClick={() => setActiveTag((currentTag) => (currentTag === tag ? "" : tag))}>
              <Badge variant={activeTag === tag ? "default" : "secondary"}>{tag}</Badge>
            </button>
          ))}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
          No posts matched your filters.
        </div>
      ) : (
        <>
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            {pagePosts.map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </motion.div>
          <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

