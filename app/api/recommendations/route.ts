import { NextResponse } from "next/server";
import { ai } from "@/lib/ai";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId") || "";
    const limit = parseInt(searchParams.get("limit") || "3", 10);

    if (!postId) {
      return NextResponse.json({ message: "Missing postId parameter" }, { status: 400 });
    }

    const recommendations = await ai.getRecommendations(postId, limit);

    return NextResponse.json(recommendations);
  } catch (err) {
    console.error("❌ Recommendations GET API Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
