import { db } from "@/lib/db";
import ScrollReveal from "@/components/transitions/ScrollReveal";
import Link from "next/link";
import { FolderHeart, ChevronRight, Zap, Layers, Network, Server } from "lucide-react";

export const revalidate = 60; // 60s cache revalidation

export default async function CategoriesPage() {
  // Fetch categories with post counts and top 2 recent posts
  const categories = await db.category.findMany({
    include: {
      posts: {
        where: { published: true },
        select: { title: true, slug: true, publishedAt: true },
        orderBy: { publishedAt: "desc" },
        take: 2,
      },
      _count: {
        select: { posts: { where: { published: true } } },
      },
    },
  });

  // Assign matching icons to specific categories dynamically to elevate premium visual design
  const icons = [
    <Layers className="w-6 h-6 text-cyan-400" />,
    <Zap className="w-6 h-6 text-violet-400" />,
    <Network className="w-6 h-6 text-emerald-400" />,
    <Server className="w-6 h-6 text-amber-500" />,
  ];

  return (
    <div className="w-full min-h-screen px-6 pb-24">
      {/* Glow Backdrops */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto pt-10">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex p-3 rounded-2xl bg-zinc-900 border border-white/10 text-cyan-400 mb-4">
              <FolderHeart className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 font-outfit">
              Content Categories
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
              Deconstruct the AuraBlog codebase by subscribing to specific architectural topics.
            </p>
          </div>
        </ScrollReveal>

        {/* Categories Showcase Grid */}
        <ScrollReveal delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className="group relative rounded-3xl p-6 sm:p-8 glass-panel glass-panel-hover flex flex-col justify-between"
              >
                {/* Accent border highlight glow on group-hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-violet-600/0 to-cyan-400/0 group-hover:from-cyan-500/5 group-hover:to-violet-600/5 transition-all duration-500 rounded-3xl" />

                <div>
                  {/* Title and Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:border-cyan-500/20 transition-colors">
                      {icons[idx % icons.length]}
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">
                      {cat._count.posts} Technical Posts
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors font-outfit">
                    {cat.name}
                  </h2>

                  <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                    {cat.description || "In-depth research publications regarding modern system frameworks."}
                  </p>
                </div>

                {/* Sub-lists of recent posts in category */}
                <div className="border-t border-white/5 pt-5">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-500 mb-3.5 block">
                    Recent in category
                  </span>
                  
                  {cat.posts.length > 0 ? (
                    <div className="flex flex-col space-y-3 mb-6">
                      {cat.posts.map((post) => (
                        <Link
                          key={post.slug}
                          href={`/blog/${post.slug}`}
                          className="flex items-center justify-between text-xs text-zinc-400 hover:text-white transition-colors"
                        >
                          <span className="truncate pr-4 leading-normal">{post.title}</span>
                          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-zinc-600" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-600 italic mb-6">No published articles yet</p>
                  )}

                  <Link
                    href={`/blogs?category=${cat.slug}`}
                    className="w-full py-2.5 rounded-xl border border-white/5 bg-white/5 hover:border-cyan-500/40 text-center text-xs font-bold text-white transition-all flex items-center justify-center space-x-1.5"
                  >
                    <span>View Category Feed</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
