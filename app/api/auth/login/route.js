import clientPromise from "@/lib/mongoDB";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Email and password are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = await clientPromise;
    const db = client.db("bitlinks");
    const collection = db.collection("users");

    // Find user
    const user = await collection.findOne({ email });
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
    const isMatch = await bcrypt.compare(password, user.password);
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
