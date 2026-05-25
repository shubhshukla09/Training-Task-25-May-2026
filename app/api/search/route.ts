import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Hardcoded hot trending search terms for premium SaaS autocomplete suggestions
const TRENDING_KEYWORDS = [
  "Next.js 15",
  "React 19 Compiler",
  "Glassmorphism Design Playbook",
  "Vector Embeddings Recommendation",
  "Distributed Redis Caching",
  "SaaS Hardened APIs",
  "Tailwind CSS Dark Mode",
  "Stoic Philosophy in Code"
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const categorySlug = searchParams.get("category") || "";
    const tagSlug = searchParams.get("tag") || "";
    
    // Build DB filters
    const where: any = {
      published: true,
    };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (tagSlug) {
      where.tags = { some: { slug: tagSlug } };
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { summary: { contains: q } },
        { content: { contains: q } },
      ];
    }

    // Query matches from database
    const results = await db.post.findMany({
      where,
      include: {
        author: { select: { name: true, image: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { publishedAt: "desc" },
      take: 10,
    });

    // Generate dynamic autocomplete search suggestions matching the typed query prefix
    const suggestions = q
      ? TRENDING_KEYWORDS.filter((term) =>
          term.toLowerCase().includes(q.toLowerCase())
        )
      : TRENDING_KEYWORDS.slice(0, 4);

    return NextResponse.json({
      results,
      suggestions,
      trending: TRENDING_KEYWORDS,
    });
  } catch (err) {
    console.error("❌ Search API Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
