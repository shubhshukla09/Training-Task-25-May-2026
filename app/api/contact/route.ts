import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { email } from "@/lib/email";
import { rateLimiter } from "@/lib/cache";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(req: Request) {
  try {
    // 1. Rate Limit: Max 3 messages per minute per IP
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateCheck = await rateLimiter.limit(ip, 3, 60);

    if (!rateCheck.success) {
      return NextResponse.json(
        { message: "Too many contact submissions. Please try again in a minute." },
        { status: 429 }
      );
    }

    // 2. Validate inputs
    const body = await req.json();
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email: senderEmail, message } = result.data;

    // 3. Dispatch transactional contact email
    await email.sendContactFormNotification(name, senderEmail, message);

    // 4. Log system activity
    await db.activity.create({
      data: {
        description: `New contact submission received from '${name}' (${senderEmail}).`,
        type: "COMMENT_MODERATED", // Grouped under admin review feeds
      },
    });

    return NextResponse.json({ message: "Your message has been sent successfully!" });
  } catch (err) {
    console.error("❌ Contact API Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
