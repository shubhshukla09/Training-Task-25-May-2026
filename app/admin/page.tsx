import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import DashboardConsole from "@/components/dashboard/DashboardConsole";
import ScrollReveal from "@/components/transitions/ScrollReveal";
import PageTransition from "@/components/transitions/PageTransition";
import Link from "next/link";
import { Lock, ArrowLeft, ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // 1. Session verification & RBAC check on server
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  const user = session.user as any;
  const isAuthorized = user.role === "ADMIN" || user.role === "EDITOR";

  if (!isAuthorized) {
    // Render an absolute gorgeous 403 Forbidden Card
    return (
      <PageTransition>
        <div className="relative min-h-screen flex items-center justify-center px-6 py-24">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-red-500/5 blur-3xl pointer-events-none" />

          <ScrollReveal>
            <div className="w-full max-w-md p-8 rounded-2xl glass-panel relative z-10 text-center flex flex-col items-center">
              <div className="inline-flex p-3.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-5 animate-bounce">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2 font-outfit">
                Access Denied
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                Your account ({user.email}) does not hold administrative or editor credentials. Please contact the platform architect to elevate your privileges.
              </p>
              
              <Link
                href="/"
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold transition-all focus:outline-none"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Home</span>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </PageTransition>
    );
  }

  // 2. Fetch all initial dashboard records in parallel
  const [
    posts,
    categories,
    tags,
    comments,
    subscribers,
    activities,
    analyticsRaw,
  ] = await Promise.all([
    db.post.findMany({
      include: {
        category: { select: { name: true } },
        tags: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany(),
    db.tag.findMany(),
    db.comment.findMany({
      include: {
        author: { select: { name: true, image: true, email: true } },
        post: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    }),
    db.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.analytics.findMany({
      orderBy: { date: "asc" },
      take: 7,
    }),
  ]);

  // 3. Compute metric aggregations
  const totalBlogs = posts.filter((p) => p.published).length;
  const totalDrafts = posts.filter((p) => !p.published).length;
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
  const totalSubscribers = subscribers.filter((s) => s.active).length;

  const metrics = {
    totalBlogs,
    totalDrafts,
    totalViews,
    totalSubscribers,
  };

  // 4. Format chart data series
  const chartData = analyticsRaw.map((record) => ({
    date: new Date(record.date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    views: record.pageViews,
    visitors: record.uniqueVisitors,
  }));

  const initialData = {
    metrics,
    posts,
    categories,
    tags,
    comments,
    subscribers,
    activities,
    chartData,
  };

  return (
    <PageTransition>
      <div className="w-full min-h-screen relative pb-16">
        {/* Glow Filters */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />
        
        {/* Dashboard hydrated client console component */}
        <DashboardConsole initialData={initialData} />
      </div>
    </PageTransition>
  );
}
