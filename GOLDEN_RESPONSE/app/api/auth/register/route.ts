import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate inputs
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;
    const lowerEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: lowerEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "A user with this email address already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Count existing users to decide the default role (bootstrap pattern)
    const userCount = await db.user.count();
    const role = userCount === 0 ? "ADMIN" : "USER";

    // Create new user in the database
    const newUser = await db.user.create({
      data: {
        name,
        email: lowerEmail,
        password: hashedPassword,
        role,
        image: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?w=150&h=150&fit=crop&crop=face`,
      },
    });

    return NextResponse.json(
      { message: "Registration successful", user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Registration API Error:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
