import Link from "next/link";
import { db } from "@/lib/db";
import BlogCard from "@/components/blog/BlogCard";
import ScrollReveal from "@/components/transitions/ScrollReveal";
import { Sparkles, TrendingUp, Grid, Mail, ArrowRight, Zap, Eye, ChevronRight } from "lucide-react";

export const revalidate = 60; // Revalidate page every 60 seconds (Static ISR)

export default async function HomePage() {
  // Query all database data in parallel for optimal load performance
  const [latestPosts, trendingPosts, categories] = await Promise.all([
    db.post.findMany({
      where: { published: true },
      include: {
        author: { select: { name: true, image: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 6,
    }),
    db.post.findMany({
      where: { published: true },
      include: {
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
      orderBy: { views: "desc" },
      take: 4,
    }),
    db.category.findMany({
      include: {
        _count: { select: { posts: true } },
      },
      take: 6,
    }),
  ]);

  const featuredPost = latestPosts[0];
  const regularPosts = latestPosts.slice(1);

  return (
    <div className="w-full relative pb-20">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-6 pt-12 pb-20">
        {/* Animated background parallax glow orbs */}
        <div className="absolute top-1/10 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] animate-pulse-slow pointer-events-none" />
        <div className="absolute bottom-1/10 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] animate-pulse-slow pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
          {/* Accent Badge */}
          <ScrollReveal delay={0.1}>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-xs font-semibold mb-6 shadow-glow-cyan animate-float">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SaaS-Grade AI-Powered Content Engine</span>
            </div>
          </ScrollReveal>

          {/* Animated Headline */}
          <ScrollReveal delay={0.2}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] font-outfit">
              Explore the Frontiers of <br />
              <span className="gradient-text-cyan-violet text-glow-cyan">Modern Systems & AI</span>
            </h1>
          </ScrollReveal>

          {/* Description */}
          <ScrollReveal delay={0.3}>
            <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl leading-relaxed mb-8">
              A cinematic technical publication sandbox delivering mathematical vector recommendations, custom glassmorphism design frameworks, and database caching.
            </p>
          </ScrollReveal>

          {/* CTAs */}
          <ScrollReveal delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/blogs"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-glow-cyan transition-all flex items-center justify-center space-x-2"
              >
                <span>Read Articles</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-sm transition-all flex items-center justify-center"
              >
                Learn Architecture
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. FEATURED ARTICLE SPOTLIGHT */}
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <ScrollReveal>
            <div className="flex items-center space-x-2.5 mb-6">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">Spotlight Article</h2>
            </div>

            <Link
              href={`/blog/${featuredPost.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 rounded-3xl glass-panel glass-panel-hover overflow-hidden"
            >
              {/* Image Frame */}
              <div className="col-span-1 lg:col-span-7 aspect-[16/10] lg:aspect-auto w-full rounded-2xl overflow-hidden border border-white/5 relative">
                <img
                  src={featuredPost.featuredImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000"}
                  alt={featuredPost.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent" />
              </div>

              {/* Text Meta */}
              <div className="col-span-1 lg:col-span-5 flex flex-col justify-between py-2">
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border border-white/10 bg-zinc-900 text-cyan-400 mb-4 inline-block">
                    {featuredPost.category.name}
                  </span>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-cyan-300 transition-colors leading-tight mb-4 font-outfit">
                    {featuredPost.title}
                  </h3>

                  <p className="text-zinc-400 text-base leading-relaxed mb-6">
                    {featuredPost.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={featuredPost.author.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"}
                      alt={featuredPost.author.name || ""}
                      className="w-9 h-9 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-200">{featuredPost.author.name}</p>
                      <p className="text-[10px] text-zinc-500">
                        {new Date(featuredPost.publishedAt || "").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center space-x-1.5 text-sm font-bold text-cyan-400 group-hover:text-white transition-all">
                    <span>Read Spotlight</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          </ScrollReveal>
        </section>
      )}

      {/* 3. DOUBLE-COLUMN FEED & SIDEBAR GRID */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Latest Blogs List Feed */}
        <div className="lg:col-span-8 flex flex-col space-y-8">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-white/5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Latest Publications</h2>
          </div>

          {regularPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {regularPosts.map((post, idx) => (
                <BlogCard key={post.id} post={post} index={idx} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 glass-panel rounded-2xl italic">
              No further blog publications found in the database.
            </div>
          )}
        </div>

        {/* Right Column: Interactive Sidebar Widgets */}
        <div className="lg:col-span-4 flex flex-col space-y-10">
          {/* Trending Posts Panel */}
          <div className="flex flex-col p-6 rounded-2xl border border-white/10 bg-zinc-950/40">
            <div className="flex items-center space-x-2 mb-6 border-b border-white/5 pb-3">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Trending Stories</h3>
            </div>

            <div className="flex flex-col space-y-4">
              {trendingPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex items-start space-x-4 py-2 border-b border-white/5 last:border-b-0 last:pb-0"
                >
                  <span className="text-2xl font-extrabold text-zinc-700 group-hover:text-cyan-400 transition-colors font-outfit">
                    0{index + 1}
                  </span>
                  <div className="flex-grow">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">
                      {post.category.name}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white line-clamp-2 leading-snug mb-1 transition-colors">
                      {post.title}
                    </h4>
                    <span className="flex items-center space-x-1 text-[10px] text-zinc-500">
                      <Eye className="w-3 h-3" />
                      <span>{post.views} views</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Categories Grid Panel */}
          <div className="flex flex-col p-6 rounded-2xl border border-white/10 bg-zinc-950/40">
            <div className="flex items-center space-x-2 mb-6 border-b border-white/5 pb-3">
              <Grid className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Categories</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blogs?category=${cat.slug}`}
                  className="p-3 rounded-xl border border-white/5 bg-white/5 hover:border-cyan-500/30 hover:bg-white/10 text-center transition-all flex flex-col items-center justify-center gap-1 group"
                >
                  <span className="text-xs font-bold text-zinc-200 group-hover:text-cyan-300 transition-colors">
                    {cat.name.split(" ")[0]}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {cat._count.posts} articles
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. NEWSLETTER HIGHLIGHT CTA */}
      <section className="max-w-7xl mx-auto px-6 mt-24">
        <ScrollReveal>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#09090b]/80 via-zinc-950/80 to-zinc-900/50 p-8 sm:p-12 relative overflow-hidden shadow-glass-lg flex flex-col md:flex-row items-center justify-between gap-8 z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-violet-600/5 opacity-50" />
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

            <div className="relative max-w-lg">
              <div className="inline-flex p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 font-outfit">
                Subscribe to Weekly System Briefings
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Stay updated with deep technical guides, system architectures, and cinematic UI developments curated straight from our AI systems.
              </p>
            </div>

            <div className="relative w-full md:w-auto shrink-0 flex flex-col space-y-3">
              <Link
                href="/newsletter"
                className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-bold text-sm shadow-glow-cyan text-center flex items-center justify-center space-x-2"
              >
                <span>Access Newsletter Portal</span>
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
