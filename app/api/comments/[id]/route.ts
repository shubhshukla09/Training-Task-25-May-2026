import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { z } from "zod";

const moderationSchema = z.object({
  approved: z.boolean(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // 1. Session verification & RBAC check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 });
    }

    // 2. Validate input
    const body = await req.json();
    const result = moderationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ errors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const { approved } = result.data;

    // Find the comment
    const comment = await db.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json({ message: "Comment not found" }, { status: 404 });
    }

    // 3. Update approval status
    const updatedComment = await db.comment.update({
      where: { id },
      data: { approved },
    });

    // Log moderation activity
    await db.activity.create({
      data: {
        description: `Comment by user ID ${comment.authorId} was ${approved ? "approved" : "hidden"} by ${user.name}.`,
        type: "COMMENT_MODERATED",
      },
    });

    return NextResponse.json(updatedComment);
  } catch (err) {
    console.error("❌ Comment PUT Moderation Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // 1. Session verification
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;

    // Find the comment
    const comment = await db.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json({ message: "Comment not found" }, { status: 404 });
    }

    // 2. Security Check: Only ADMIN or the original author can delete a comment
    const isAuthor = comment.authorId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ message: "Forbidden: Unauthorized deletion" }, { status: 403 });
    }

    // 3. Delete comment (cascades replies automatically via Prisma relations)
    await db.comment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("❌ Comment DELETE Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
