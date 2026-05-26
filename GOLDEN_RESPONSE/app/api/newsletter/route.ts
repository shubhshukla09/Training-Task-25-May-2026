import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { rateLimiter } from "@/lib/cache";
import { email } from "@/lib/email";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function GET(req: Request) {
  try {
    // 1. Session verification & RBAC check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Fetch active subscribers
    const subscribers = await db.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(subscribers);
  } catch (err) {
    console.error("❌ Newsletter GET API Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting based on request IP
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateCheck = await rateLimiter.limit(ip, 5, 60); // Max 5 requests per minute per IP
    
    if (!rateCheck.success) {
      return NextResponse.json(
        { message: "Too many subscription requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    // 2. Validate input email
    const body = await req.json();
    const result = subscribeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const targetEmail = result.data.email.toLowerCase();

    // 3. Check if already subscribed
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email: targetEmail },
    });

    if (existing) {
      if (existing.active) {
        return NextResponse.json(
          { message: "This email address is already subscribed!" },
          { status: 400 }
        );
      } else {
        // Re-activate subscription
        await db.newsletterSubscriber.update({
          where: { email: targetEmail },
          data: { active: true },
        });
        
        await email.sendNewsletterEmail(
          targetEmail,
          "🚀 Welcome Back! Newsletter Re-activated",
          "<p>Your subscription to the AI Blogging Platform weekly briefings has been successfully re-activated. Welcome back to the future of content!</p>"
        );

        return NextResponse.json({ message: "Subscription re-activated successfully!" });
      }
    }

    // 4. Save subscriber in database
    await db.newsletterSubscriber.create({
      data: {
        email: targetEmail,
        active: true,
      },
    });

    // 5. Send elegant welcome email
    await email.sendNewsletterEmail(
      targetEmail,
      "✨ Welcome to the AI Blogging Platform Newsletter",
      `
        <p>Thank you for subscribing to our premium technical publication briefings.</p>
        <p>Every week, our editorial systems digest trending algorithms, architectural patterns, and cinematic UI developments to keep you at the cutting edge of modern full-stack systems engineering.</p>
        <p>Get ready for deep knowledge directly in your inbox.</p>
      `
    );

    // 6. Log database activity
    await db.activity.create({
      data: {
        description: `New email subscription registered from '${targetEmail}'.`,
        type: "NEWSLETTER_SUBSCRIBE",
      },
    });

    return NextResponse.json(
      { message: "Successfully subscribed to our newsletter!" },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Newsletter POST API Error:", err);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
