import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { ai } from "@/lib/ai";
import { z } from "zod";

const createBlogSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must be alphanumeric with hyphens only"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  summary: z.string().optional(),
  featuredImage: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  tagIds: z.array(z.string()).optional(),
  published: z.boolean().optional().default(false),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const categorySlug = searchParams.get("category") || "";
    const tagSlug = searchParams.get("tag") || "";
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const status = searchParams.get("status") || "published"; // "published", "draft", "all"

    const session = await getServerSession(authOptions);
    const userRole = session?.user ? (session.user as any).role : null;
    const isAdminOrEditor = userRole === "ADMIN" || userRole === "EDITOR";

    const skip = (page - 1) * limit;

    // Build database query filters
    const where: any = {};

    // Enforce role checks on draft retrieval
    if (status === "draft") {
      if (!isAdminOrEditor) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
      where.published = false;
    } else if (status === "all") {
      if (!isAdminOrEditor) {
        where.published = true;
      }
      // Admins/Editors see both published and drafts
    } else {
      where.published = true;
    }

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

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          author: { select: { name: true, image: true, title: true } },
          category: { select: { name: true, slug: true } },
          tags: { select: { name: true, slug: true } },
        },
        orderBy: { publishedAt: "desc" },
        skip,
        take: limit,
      }),
      db.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("❌ Blogs GET API Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Session verification & RBAC check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const author = session.user as any;
    if (author.role !== "ADMIN" && author.role !== "EDITOR") {
      return NextResponse.json({ message: "Forbidden: Insufficient privileges" }, { status: 403 });
    }

    // 2. Validate input fields
    const body = await req.json();
    const result = createBlogSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check slug collision
    const existingPost = await db.post.findUnique({
      where: { slug: data.slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { errors: { slug: ["A blog post with this URL slug already exists"] } },
        { status: 400 }
      );
    }

    // 3. Compute reading time (Avg 200 words per minute)
    const wordCount = data.content.split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    // 4. Generate AI summaries if blank
    let summary = data.summary;
    if (!summary) {
      summary = await ai.generateSummary(data.content);
    }

    // 5. Generate semantic vectors
    console.log("🤖 Generating semantic vector embeddings for blog post...");
    const embeddingArray = await ai.generateEmbedding(data.content);
    const embedding = JSON.stringify(embeddingArray);

    // 6. Connect tags
    const tagConnect = data.tagIds ? data.tagIds.map((id) => ({ id })) : [];

    // 7. Write to database
    const newPost = await db.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        summary: summary || "",
        featuredImage: data.featuredImage || "https://images.unsplash.com/photo-1546074177-ffedd79d494d?w=1200&h=630&fit=crop",
        published: data.published,
        publishedAt: data.published ? new Date() : null,
        readingTime,
        embedding,
        authorId: author.id,
        categoryId: data.categoryId,
        tags: { connect: tagConnect },
      },
    });

    // 8. Log activity
    await db.activity.create({
      data: {
        description: `Blog post '${newPost.title}' was created by ${author.name}.`,
        type: "BLOG_CREATED",
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (err) {
    console.error("❌ Blogs POST API Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
