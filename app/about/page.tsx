import ScrollReveal from "@/components/transitions/ScrollReveal";
import PageTransition from "@/components/transitions/PageTransition";
import { Sparkles, Layers, ShieldCheck, Zap, Cpu, Terminal } from "lucide-react";

export const metadata = {
  title: "Architecture & Frameworks",
  description: "Learn about the high-performance technical stack powering AuraBlog.",
};

export default function AboutPage() {
  const stackItems = [
    {
      icon: <Layers className="w-5 h-5 text-cyan-400" />,
      title: "Next.js 15 & React 19",
      desc: "Bootstrapped with Next.js App Router, using Server Actions, dynamic ISR compiling, and React 19 rendering compiler paradigms.",
    },
    {
      icon: <Cpu className="w-5 h-5 text-violet-400" />,
      title: "Mathematical Vector Recommendations",
      desc: "Driven by a custom TF-IDF keyword vectorizer and Cosine Similarity math on the server, ensuring semantic related posts operate 100% offline.",
    },
    {
      icon: <Zap className="w-5 h-5 text-emerald-400" />,
      title: "Resilient Dual Caching",
      desc: "Combines distributed Upstash Redis caching with high-performance process-level in-memory cache Maps with active TTL purging fallbacks.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-amber-500" />,
      title: "Hardened Security Filters",
      desc: "API endpoints are locked behind JWT NextAuth checks, Zod request body schemas, input string sanitization, and sliding window rate limits.",
    },
  ];

  return (
    <PageTransition>
      <div className="w-full min-h-screen px-6 pb-24">
        {/* Glow circles */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto pt-10">
          {/* Header */}
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="inline-flex p-3 rounded-2xl bg-zinc-900 border border-white/10 text-cyan-400 mb-4 animate-float">
                <Terminal className="w-6 h-6" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 font-outfit">
                Architecture Roadmap
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Explore the technical systems, core fallbacks, and design philosophies driving AuraBlog.
              </p>
            </div>
          </ScrollReveal>

          {/* Core Vision Description */}
          <ScrollReveal delay={0.15}>
            <div className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-zinc-950/40 backdrop-blur-xl mb-12">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
                <Sparkles className="w-4.5 h-4.5 text-cyan-400" />
                <span>Engineered for Resiliency</span>
              </h3>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-4">
                AuraBlog was designed from the ground up as a **zero-downtime, self-healing SaaS application**. While it integrates seamlessly with enterprise-grade cloud systems in production (PostgreSQL, Upstash Redis, Cloudinary, OpenAI, and Resend), it features fully operational local in-memory and mathematical fallbacks.
              </p>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                This means you can pull the codebase, run a clean `npm install && npm run dev`, and experience complete functionality—including semantic recommendations, featured image uploads, and caching—offline, with zero initial configuration.
              </p>
            </div>
          </ScrollReveal>

          {/* Technical Stack Grid */}
          <ScrollReveal delay={0.25}>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider mb-6 border-b border-white/5 pb-2">
              Core Technical Stack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stackItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-white/5 bg-zinc-950/20 hover:border-white/15 transition-all flex flex-col space-y-3"
                >
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 w-fit">
                    {item.icon}
                  </div>
                  <h4 className="text-sm font-bold text-zinc-100">{item.title}</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </PageTransition>
  );
}
