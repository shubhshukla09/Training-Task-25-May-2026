import { db } from "@/lib/db";
import BlogCard from "@/components/blog/BlogCard";
import ScrollReveal from "@/components/transitions/ScrollReveal";
import Link from "next/link";
import { Sparkles, Calendar, Tag, BookOpen, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface BlogsPageProps {
  searchParams: Promise<{ category?: string; tag?: string }>;
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
  // Await the searchParams promise (Next.js 15 App Router spec)
  const params = await searchParams;
  const activeCategorySlug = params.category || "";
  const activeTagSlug = params.tag || "";

  // 1. Fetch filter labels and all categories in parallel
  const [categories, activeCategory, activeTag] = await Promise.all([
    db.category.findMany({
      include: { _count: { select: { posts: true } } },
    }),
    activeCategorySlug
      ? db.category.findUnique({ where: { slug: activeCategorySlug } })
      : Promise.resolve(null),
    activeTagSlug
      ? db.tag.findUnique({ where: { slug: activeTagSlug } })
      : Promise.resolve(null),
  ]);

  // 2. Build DB filters
  const where: any = {
    published: true,
  };

  if (activeCategorySlug) {
    where.category = { slug: activeCategorySlug };
  }

  if (activeTagSlug) {
    where.tags = { some: { slug: activeTagSlug } };
  }

  // 3. Fetch matched articles
  const posts = await db.post.findMany({
    where,
    include: {
      author: { select: { name: true, image: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  // Decide page header title based on active filters
  let pageTitle = "All Publications";
  let pageSub = "Explore our repository of engineering blueprints and deep research dives.";

  if (activeCategory) {
    pageTitle = `${activeCategory.name}`;
    pageSub = activeCategory.description || `Read articles categorized under ${activeCategory.name}.`;
  } else if (activeTag) {
    pageTitle = `Tag: #${activeTag.name}`;
    pageSub = `Browse all technical publications tagged with #${activeTag.name}.`;
  }

  return (
    <div className="w-full min-h-screen px-6 pb-24">
      {/* Background glow orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto pt-10">
        {/* Dynamic SEO Title Header */}
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 font-outfit">
              {pageTitle}
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
              {pageSub}
            </p>
          </div>
        </ScrollReveal>

        {/* Categories Filtering Pill Bar */}
        <ScrollReveal delay={0.15}>
          <div className="flex items-center justify-center flex-wrap gap-2.5 mb-16 max-w-4xl mx-auto border-y border-white/5 py-4">
            <Link
              href="/blogs"
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                !activeCategorySlug && !activeTagSlug
                  ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                  : "border-white/5 bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              All Articles
            </Link>

            {categories.map((cat) => {
              const isSelected = activeCategorySlug === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/blogs?category=${cat.slug}`}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    isSelected
                      ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                      : "border-white/5 bg-white/5 text-zinc-400 hover:text-white"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Dynamic Grid Results */}
        <ScrollReveal delay={0.25}>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, idx) => (
                <BlogCard key={post.id} post={post} index={idx} />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="max-w-md mx-auto text-center py-16 px-6 border border-white/10 bg-zinc-950/40 rounded-3xl backdrop-blur-xl flex flex-col items-center">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-500 mb-6">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">No Articles Found</h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                We couldn't locate any published articles under this filter selection. Check back soon for fresh drafts being pushed to production.
              </p>
              <Link
                href="/blogs"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 text-white font-bold text-xs shadow-glow-cyan"
              >
                Clear Active Filters
              </Link>
            </div>
          )}
        </ScrollReveal>
      </div>
    </div>
  );
}
