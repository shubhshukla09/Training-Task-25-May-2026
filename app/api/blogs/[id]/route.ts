import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { ai } from "@/lib/ai";
import { z } from "zod";

const updateBlogSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/).optional(),
  content: z.string().min(10).optional(),
  summary: z.string().optional(),
  featuredImage: z.string().optional(),
  categoryId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  published: z.boolean().optional(),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Smart lookup: Match by id OR slug
    const post = await db.post.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        author: { select: { name: true, image: true, title: true, bio: true } },
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
        _count: {
          select: { likes: true, bookmarks: true },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Dynamic views counter increment on GET
    // Run asynchronously to speed up response load time
    db.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    }).catch(err => console.error("❌ Views increment failed:", err));

    return NextResponse.json(post);
  } catch (err) {
    console.error("❌ Blog GET Single API Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    // 1. Session verification & RBAC check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const author = session.user as any;
    if (author.role !== "ADMIN" && author.role !== "EDITOR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Find the original post
    const post = await db.post.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // 2. Validate inputs
    const body = await req.json();
    const result = updateBlogSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = result.data;
    const updateData: any = { ...data };

    // Check slug conflicts if changed
    if (data.slug && data.slug !== post.slug) {
      const existingSlug = await db.post.findUnique({
        where: { slug: data.slug },
      });
      if (existingSlug) {
        return NextResponse.json(
          { errors: { slug: ["A post with this URL slug already exists"] } },
          { status: 400 }
        );
      }
    }

    // 3. Recalculate properties if content changed
    if (data.content && data.content !== post.content) {
      // Reading Time
      const wordCount = data.content.split(/\s+/).filter(Boolean).length;
      updateData.readingTime = Math.max(1, Math.round(wordCount / 200));

      // Summary
      if (!data.summary) {
        updateData.summary = await ai.generateSummary(data.content);
      }

      // Embeddings
      console.log("🤖 Content changed. Regenerating semantic vector embeddings...");
      const embeddingArray = await ai.generateEmbedding(data.content);
      updateData.embedding = JSON.stringify(embeddingArray);
    }

    // Manage tags connection
    if (data.tagIds) {
      // Disconnect all previous tags and connect new ones
      // Prisma implicit many-to-many handles this elegantly using set
      updateData.tags = {
        set: data.tagIds.map((tid) => ({ id: tid })),
      };
      delete updateData.tagIds;
    }

    // Set publishedAt if transitioning to published
    if (data.published && !post.published) {
      updateData.publishedAt = new Date();
    }

    // 4. Update in database
    const updatedPost = await db.post.update({
      where: { id: post.id },
      data: updateData,
    });

    // 5. Log activity
    await db.activity.create({
      data: {
        description: `Blog post '${updatedPost.title}' was updated by ${author.name}.`,
        type: "BLOG_CREATED", // Grouped as general post operations
      },
    });

    return NextResponse.json(updatedPost);
  } catch (err) {
    console.error("❌ Blog PUT API Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // 1. Session verification & RBAC check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const author = session.user as any;
    if (author.role !== "ADMIN" && author.role !== "EDITOR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const post = await db.post.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // 2. Delete from database (Prisma handles relations cascade deletion cleanly)
    await db.post.delete({
      where: { id: post.id },
    });

    // 3. Log activity
    await db.activity.create({
      data: {
        description: `Blog post '${post.title}' was deleted by ${author.name}.`,
        type: "BLOG_CREATED",
      },
    });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("❌ Blog DELETE API Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
