import { db } from "@/lib/db";
import { ai } from "@/lib/ai";
import MarkdownReader from "@/components/blog/MarkdownReader";
import CommentsSection from "@/components/blog/CommentsSection";
import ReadingBar from "@/components/blog/ReadingBar";
import ScrollReveal from "@/components/transitions/ScrollReveal";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, Eye, ChevronLeft, BookOpen, User, FolderHeart, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate a URL-safe DOM element ID for headings
 */
function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-");
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  // Await the params promise (Next.js 15 app router specification)
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // 1. Fetch main blog details along with approved comments
  const post = await db.post.findFirst({
    where: { slug, published: true },
    include: {
      author: { select: { name: true, image: true, role: true, bio: true, title: true } },
      category: { select: { name: true, slug: true } },
      tags: { select: { name: true, slug: true } },
      comments: {
        where: { approved: true, parentId: null },
        include: {
          author: { select: { name: true, image: true, role: true } },
          replies: {
            where: { approved: true },
            include: {
              author: { select: { name: true, image: true, role: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // 2. Fetch AI Recommendations in parallel using vector cosine similarity
  const relatedPosts = await ai.getRecommendations(post.id, 3);

  // 3. Increment page view count asynchronously
  db.post.update({
    where: { id: post.id },
    data: { views: { increment: 1 } },
  }).catch((err) => console.error("❌ Views increment failed:", err));

  // 4. Parse markdown headings dynamically to construct the Table of Contents (TOC)
  const lines = post.content.split("\n");
  const headings: { text: string; id: string; depth: number }[] = [];
  
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      const text = trimmed.replace("## ", "").replace(/[#*`_]/g, "");
      headings.push({ text, id: slugifyHeading(text), depth: 2 });
    } else if (trimmed.startsWith("### ")) {
      const text = trimmed.replace("### ", "").replace(/[#*`_]/g, "");
      headings.push({ text, id: slugifyHeading(text), depth: 3 });
    }
  });

  // Parse custom styled headings in post content for TOC matching anchors
  let parsedContent = post.content;
  headings.forEach((h) => {
    const prefix = h.depth === 2 ? "## " : "### ";
    const target = prefix + h.text;
    const replacement = `<a id="${h.id}"></a>\n\n${prefix}${h.text}`;
    parsedContent = parsedContent.replace(target, replacement);
  });

  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Draft";

  return (
    <div className="w-full relative pb-24">
      {/* Scroll indicator bar */}
      <ReadingBar />

      {/* Cinematic overlay glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />

      {/* Back button and category */}
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <Link
          href="/blogs"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-zinc-400 hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Articles</span>
        </Link>
      </div>

      {/* 5. HEADER DETAILS */}
      <header className="max-w-4xl mx-auto px-6 mb-12">
        <span className="px-3.5 py-1 rounded-full text-xs font-bold border border-white/10 bg-zinc-950/80 text-cyan-400 backdrop-blur-md mb-4 inline-block">
          {post.category.name}
        </span>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight font-outfit">
          {post.title}
        </h1>

        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/5 pb-8">
          <div className="flex items-center space-x-3.5">
            <img
              src={post.author.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60"}
              alt={post.author.name || ""}
              className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
            <div>
              <p className="text-sm font-bold text-white">{post.author.name}</p>
              <p className="text-xs text-zinc-500">{post.author.title || "Editor"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-zinc-400">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{publishedDate}</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readingTime} min read</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{post.views} views</span>
            </span>
          </div>
        </div>
      </header>

      {/* Featured Hero Banner Image */}
      <div className="max-w-5xl mx-auto px-6 mb-16">
        <div className="aspect-[21/9] w-full rounded-3xl overflow-hidden border border-white/10 shadow-glass-lg relative">
          <img
            src={post.featuredImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200"}
            alt={post.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 to-transparent" />
        </div>
      </div>

      {/* 6. MAIN BODY CONTENT SPLIT GRID */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Floating Table of Contents Sidebar */}
        <aside className="lg:col-span-3 hidden lg:block">
          {headings.length > 0 && (
            <div className="sticky top-28 p-5 rounded-2xl border border-white/10 bg-zinc-950/40 backdrop-blur-xl">
              <div className="flex items-center space-x-2 mb-4 border-b border-white/5 pb-2.5">
                <BookOpen className="w-4.5 h-4.5 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">On this page</h4>
              </div>
              <ul className="flex flex-col space-y-3">
                {headings.map((h, i) => (
                  <li
                    key={i}
                    className={`text-xs ${
                      h.depth === 3 ? "pl-3.5 border-l border-white/5" : "font-semibold"
                    }`}
                  >
                    <a
                      href={`#${h.id}`}
                      className="text-zinc-400 hover:text-cyan-400 transition-colors block py-0.5 leading-normal"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Dynamic Markdown Prose Render */}
        <main className="lg:col-span-6 flex flex-col">
          <ScrollReveal>
            <MarkdownReader content={parsedContent} />
          </ScrollReveal>

          {/* Integrated Comments Thread */}
          <CommentsSection postId={post.id} initialComments={post.comments as any} />
        </main>

        {/* Right Column: Author Bio widget */}
        <aside className="lg:col-span-3 flex flex-col space-y-8">
          <div className="p-6 rounded-2xl border border-white/10 bg-zinc-950/40 backdrop-blur-xl text-center flex flex-col items-center">
            <img
              src={post.author.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
              alt={post.author.name || ""}
              className="w-16 h-16 rounded-full object-cover border border-white/10 mb-4"
            />
            <h4 className="text-sm font-bold text-white mb-0.5">{post.author.name}</h4>
            <span className="text-[10px] uppercase font-bold text-cyan-400 mb-4 tracking-wider">
              {post.author.title || "Platform Writer"}
            </span>
            <p className="text-zinc-400 text-xs leading-relaxed">
              {post.author.bio || " Stoic writer exploring system layouts and scalable backends."}
            </p>
          </div>
        </aside>
      </div>

      {/* 7. AI PERSONALIZED RECOMMENDATIONS (Semantic Similarity related posts) */}
      {relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 mt-24 border-t border-white/5 pt-16">
          <div className="flex items-center space-x-2.5 mb-8">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-float" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
              AI Personalized Recommendations
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost, idx) => (
              <div
                key={relatedPost.id}
                className="group relative rounded-2xl p-5 border border-white/5 bg-zinc-950/40 hover:bg-zinc-900/40 hover:border-cyan-500/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[9px] uppercase font-bold text-cyan-400 mb-2.5 block">
                    {relatedPost.category.name}
                  </span>
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <h4 className="text-base font-bold text-zinc-100 group-hover:text-white line-clamp-2 leading-snug mb-2 transition-colors font-outfit">
                      {relatedPost.title}
                    </h4>
                  </Link>
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                    {relatedPost.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4 text-[10px] text-zinc-500">
                  <span>{relatedPost.readingTime} min read</span>
                  <Link
                    href={`/blog/${relatedPost.slug}`}
                    className="font-bold text-cyan-400 group-hover:text-white transition-colors"
                  >
                    Read Story →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
