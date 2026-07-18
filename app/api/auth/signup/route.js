import clientPromise from "@/lib/mongoDB";
import bcrypt from "bcryptjs";

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

    const { name, email, password } = body;

    // 2. Validate input existence and types
    if (
      !name || typeof name !== "string" ||
      !email || typeof email !== "string" ||
      !password || typeof password !== "string"
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Name, email, and password are required and must be strings",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password; // Do not trim password to preserve user whitespace choice

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Fields cannot be empty or contain only whitespace",
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

    // 4. Password strength validation
    if (trimmedPassword.length < 6) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Password must be at least 6 characters long",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Connect to database
    let client;
    try {
      client = await clientPromise;
    } catch (dbErr) {
      console.error("Database connection failure in POST /api/auth/signup:", dbErr);
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

    // Check if user already exists
    const existingUser = await collection.findOne({ email: trimmedEmail });
    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "User with this email already exists",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

    // Create user
    const newUser = {
      name: trimmedName,
      email: trimmedEmail,
      password: hashedPassword,
      createdAt: new Date(),
    };

    await collection.insertOne(newUser);

    return new Response(
      JSON.stringify({
        success: true,
        error: false,
        message: "User registered successfully",
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in Signup:", error);
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
