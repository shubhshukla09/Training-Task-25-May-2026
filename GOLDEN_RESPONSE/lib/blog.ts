import blogData from "@/data/blogs.json";
import { BlogPost, CategoryStat, TocItem } from "@/types/blog";

export const POSTS_PER_PAGE = 6;
export const BLOG_POSTS = [...(blogData as BlogPost[])].sort(
  (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
);

export function getAllPosts(): BlogPost[] {
  return BLOG_POSTS;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getFeaturedPosts(limit = 3): BlogPost[] {
  return BLOG_POSTS.filter((post) => post.featured).slice(0, limit);
}

export function getTrendingPosts(limit = 5): BlogPost[] {
  return BLOG_POSTS.filter((post) => post.trending).slice(0, limit);
}

export function getCategoryStats(): CategoryStat[] {
  const counts = BLOG_POSTS.reduce<Record<string, number>>((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getAllTags(): string[] {
  return [...new Set(BLOG_POSTS.flatMap((post) => post.tags))].sort();
}

export function searchAndFilterPosts({
  posts,
  query,
  category,
  tag,
}: {
  posts: BlogPost[];
  query: string;
  category: string;
  tag: string;
}): BlogPost[] {
  const normalizedQuery = query.trim().toLowerCase();

  return posts.filter((post) => {
    const matchesQuery =
      !normalizedQuery ||
      [post.title, post.excerpt, post.content, post.author.name, ...post.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    const matchesCategory = !category || post.category === category;
    const matchesTag = !tag || post.tags.includes(tag);

    return matchesQuery && matchesCategory && matchesTag;
  });
}

export function paginatePosts(posts: BlogPost[], page: number, pageSize = POSTS_PER_PAGE) {
  const currentPage = Math.max(1, page);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  return {
    totalPages: Math.max(1, Math.ceil(posts.length / pageSize)),
    pagePosts: posts.slice(start, end),
  };
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const currentPost = getPostBySlug(slug);
  if (!currentPost) return [];

  return BLOG_POSTS.filter((post) => {
    if (post.slug === slug) return false;

    const sameCategory = post.category === currentPost.category;
    const hasCommonTag = post.tags.some((tag) => currentPost.tags.includes(tag));

    return sameCategory || hasCommonTag;
  }).slice(0, limit);
}

export function getTableOfContents(content: string): TocItem[] {
  const lines = content.split("\n");
  const items: TocItem[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      const text = line.replace(/^##\s+/, "").trim();
      items.push({ id: slugify(text), text, level: 2 });
      continue;
    }

    if (line.startsWith("### ")) {
      const text = line.replace(/^###\s+/, "").trim();
      items.push({ id: slugify(text), text, level: 3 });
    }
  }

  return items;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

