import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { storage } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    // 1. Session verification & RBAC check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN" && user.role !== "EDITOR") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 2. Extract multi-part form file
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No image file provided" }, { status: 400 });
    }

    // Convert file to array buffer and write into standard Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Upload file via storage service
    const fileUrl = await storage.uploadImage(buffer, file.name);

    return NextResponse.json({ url: fileUrl }, { status: 201 });
  } catch (err: any) {
    console.error("❌ Image Upload API Error:", err);
    return NextResponse.json(
      { message: err.message || "Internal server error during upload" },
      { status: 500 }
    );
  }
}
