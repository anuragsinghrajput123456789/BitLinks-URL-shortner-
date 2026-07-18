import clientPromise, { executeDbWithRetry } from "@/lib/mongoDB";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // 1. Try to parse JSON body
    let body;
    try {
      body = await request.json();
    } catch (parseErr) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Malformed or invalid JSON payload",
        },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // 2. Validate input existence and types
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Email and password are required and must be strings",
        },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password; // Do not trim password to preserve user choice

    if (!trimmedEmail || !trimmedPassword) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Email and password cannot be empty",
        },
        { status: 400 }
      );
    }

    // 3. Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Invalid email address format",
        },
        { status: 400 }
      );
    }

    // 4. Connect to database and retrieve user
    let user;
    try {
      user = await executeDbWithRetry(async (client) => {
        const db = client.db("bitlinks");
        const collection = db.collection("users");
        return await collection.findOne(
          { email: trimmedEmail },
          { projection: { name: 1, email: 1, password: 1 } }
        );
      });
    } catch (dbErr) {
      console.error("[POST /api/auth/login] [ERROR] Database connection/query failure:", dbErr);
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Database server connection issue. Please try again later.",
        },
        { status: 503 }
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("[POST /api/auth/login] [CRITICAL] process.env.JWT_SECRET is missing.");
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Internal server configuration error",
        },
        { status: 500 }
      );
    }

    // Generate Token
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      secret,
      { expiresIn: "7d" }
    );

    // Set Cookie
    const response = NextResponse.json(
      {
        success: true,
        error: false,
        message: "Login successful",
        user: { name: user.name, email: user.email },
      },
      { status: 200 }
    );

    // Secure cookie settings (HttpOnly, SameSite=Strict, Secure in production)
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = [
      `token=${token}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Strict",
      `Max-Age=${7 * 24 * 60 * 60}`,
    ];
    if (isProd) {
      cookieOptions.push("Secure");
    }
    response.headers.set("Set-Cookie", cookieOptions.join("; "));

    return response;
  } catch (error) {
    console.error("[POST /api/auth/login] [ERROR] Unexpected login failure:", error);
    return NextResponse.json(
      {
        success: false,
        error: true,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

