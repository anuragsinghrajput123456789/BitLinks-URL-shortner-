import clientPromise from "@/lib/mongoDB";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    // 1. Try to parse JSON body
    let body;
    try {
      body = await request.json();
    } catch (parseErr) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Malformed or invalid JSON payload",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { email, password } = body;

    // 2. Validate input existence and types
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Email and password are required and must be strings",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password; // Do not trim password to preserve user choice

    if (!trimmedEmail || !trimmedPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Email and password cannot be empty",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Invalid email address format",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Connect to database
    let client;
    try {
      client = await clientPromise;
    } catch (dbErr) {
      console.error("Database connection failure in POST /api/auth/login:", dbErr);
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Database server connection issue. Please try again later.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = client.db("bitlinks");
    const collection = db.collection("users");

    // Find user
    const user = await collection.findOne({ email: trimmedEmail });
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Invalid credentials",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check password
    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    if (!isMatch) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Invalid credentials",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate Token
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET || "default_secret_key", // Fallback for dev
      { expiresIn: "7d" }
    );

    // Set Cookie
    const response = new Response(
      JSON.stringify({
        success: true,
        error: false,
        message: "Login successful",
        user: { name: user.name, email: user.email },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

    // Secure cookie settings should be used in production
    response.headers.set(
      "Set-Cookie",
      `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${
        7 * 24 * 60 * 60
      }`
    );

    return response;
  } catch (error) {
    console.error("Error in Login:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: true,
        message: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
