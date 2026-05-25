import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // 1. Session verification & RBAC check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Admin access only" }, { status: 403 });
    }

    // 2. Aggregate statistics in parallel
    const [
      totalBlogs,
      totalDrafts,
      totalViewsObj,
      totalSubscribers,
      recentActivities,
      chartDataRaw,
    ] = await Promise.all([
      db.post.count({ where: { published: true } }),
      db.post.count({ where: { published: false } }),
      db.post.aggregate({
        _sum: { views: true },
      }),
      db.newsletterSubscriber.count({ where: { active: true } }),
      db.activity.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      db.analytics.findMany({
        orderBy: { date: "asc" },
        take: 7,
      }),
    ]);

    const totalViews = totalViewsObj._sum.views || 0;

    // 3. Format chart series
    const chartData = chartDataRaw.map((record) => ({
      date: new Date(record.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      views: record.pageViews,
      visitors: record.uniqueVisitors,
    }));

    return NextResponse.json({
      metrics: {
        totalBlogs,
        totalDrafts,
        totalViews,
        totalSubscribers,
      },
      activities: recentActivities,
      chartData,
    });
  } catch (err) {
    console.error("❌ Analytics GET API Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
