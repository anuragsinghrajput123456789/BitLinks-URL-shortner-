import clientPromise, { executeDbWithRetry } from "@/lib/mongoDB";
import bcrypt from "bcryptjs";
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

    const { name, email, password } = body;

    // 2. Validate input existence and types
    if (
      !name || typeof name !== "string" ||
      !email || typeof email !== "string" ||
      !password || typeof password !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Name, email, and password are required and must be strings",
        },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password; // Do not trim password to preserve user whitespace choice

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Fields cannot be empty or contain only whitespace",
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

    // 4. Password strength validation
    if (trimmedPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    // 5. Connect to database and process signup
    let userExists = false;
    try {
      userExists = await executeDbWithRetry(async (client) => {
        const db = client.db("bitlinks");
        const collection = db.collection("users");
        // Check if user already exists (use projection to load only _id)
        const existingUser = await collection.findOne({ email: trimmedEmail }, { projection: { _id: 1 } });
        return !!existingUser;
      });
    } catch (dbErr) {
      console.error("[POST /api/auth/signup] [ERROR] Database query failure:", dbErr);
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Database server connection issue. Please try again later.",
        },
        { status: 503 }
      );
    }

    if (userExists) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "User with this email already exists",
        },
        { status: 409 }
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

    try {
      await executeDbWithRetry(async (client) => {
        const db = client.db("bitlinks");
        const collection = db.collection("users");
        await collection.insertOne(newUser);
      });
    } catch (insertErr) {
      // 11000 is the MongoDB error code for unique index write violations (race condition safety)
      if (insertErr.code === 11000) {
        return NextResponse.json(
          {
            success: false,
            error: true,
            message: "User with this email already exists",
          },
          { status: 409 }
        );
      }
      console.error("[POST /api/auth/signup] [ERROR] Database insert failure:", insertErr);
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Database server connection issue. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        error: false,
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/auth/signup] [ERROR] Unexpected signup failure:", error);
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

