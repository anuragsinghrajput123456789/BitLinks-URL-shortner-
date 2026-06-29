import clientPromise from "@/lib/mongoDB";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const body = await request.json();
    const { url, shorturl } = body;

    if (!url || !shorturl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Missing URL or short URL",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = await clientPromise;
    const db = client.db("bitlinks");
    const collection = db.collection("url");

    // Check if short URL already exists
    const existing = await collection.findOne({ shorturl });
    if (existing) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Short URL already exists!",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check for User Authentication
    let userId = null;
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (token) {
      try {
        const decoded = jwt.verify(
          token.value,
          process.env.JWT_SECRET || "default_secret_key"
        );
        userId = decoded.userId;
      } catch (err) {
        // Token invalid, treat as anonymous
        console.log("Invalid token during URL generation:", err.message);
      }
    }

    // Insert the new document
    await collection.insertOne({
      url,
      shorturl,
      userId, // Store userId if authenticated
      clicks: 0, // Initialize analytics
      createdAt: new Date(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        error: false,
        message: "URL generated successfully!",
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in POST /api:", error);
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
