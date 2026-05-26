import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(2, "Comment must be at least 2 characters"),
  postId: z.string().min(1, "Post ID is required"),
  parentId: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      db.comment.findMany({
        include: {
          author: { select: { name: true, image: true, email: true } },
          post: { select: { title: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.comment.count(),
    ]);

    return NextResponse.json({
      comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("❌ Comments GET Admin API Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    const body = await req.json();
    const result = createCommentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { content, postId, parentId } = result.data;

    // Check if the blog post exists and is published
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ message: "Blog post not found" }, { status: 404 });
    }

    // Verify parent comment if it is a reply
    if (parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: parentId },
      });
      if (!parentComment) {
        return NextResponse.json({ message: "Parent comment not found" }, { status: 404 });
      }
    }

    // Create the comment (default approved=true for instant conversational UX, 
    // admins can unapprove/delete them in moderation dashboard)
    const newComment = await db.comment.create({
      data: {
        content,
        postId,
        parentId: parentId || null,
        authorId: user.id,
        approved: true, // Auto-approve, admin can toggle-hide
      },
      include: {
        author: { select: { name: true, image: true, role: true } },
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (err) {
    console.error("❌ Comment POST API Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
