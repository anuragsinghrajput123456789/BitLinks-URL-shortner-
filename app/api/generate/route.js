import clientPromise from "@/lib/mongoDB";
import { cookies } from "next/headers";
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

    const { url, shorturl } = body;

    // 2. Validate existence
    if (!url || typeof url !== "string" || !shorturl || typeof shorturl !== "string") {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Missing URL or short URL alias, or inputs are not strings",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const trimmedUrl = url.trim();
    const trimmedShorturl = shorturl.trim();

    if (!trimmedUrl || !trimmedShorturl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "URL and short URL alias cannot be empty strings",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Automatically prepend https:// if it has no protocol
    let finalUrl = trimmedUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }

    // 3. Validate URL format and protocol (prevent javascript: XSS schemes)
    try {
      const parsedUrl = new URL(finalUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        return new Response(
          JSON.stringify({
            success: false,
            error: true,
            message: "Unsupported URL protocol. Only http:// and https:// are supported.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      const hostname = parsedUrl.hostname;
      if (!hostname || (hostname !== "localhost" && !hostname.includes("."))) {
        return new Response(
          JSON.stringify({
            success: false,
            error: true,
            message: "Invalid URL hostname. Must be a valid domain or localhost.",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (_) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Invalid URL. Please enter a valid HTTP/HTTPS URL.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Validate custom short URL alias characters (only alphanumeric, dashes, and underscores)
    const aliasRegex = /^[a-zA-Z0-9_-]+$/;
    if (!aliasRegex.test(trimmedShorturl)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Custom alias can only contain letters, numbers, hyphens, and underscores.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Connect to DB
    let client;
    try {
      client = await clientPromise;
    } catch (dbErr) {
      console.error("Database connection failure in POST /api/generate:", dbErr);
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Failed to connect to the database. Please try again later.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = client.db("bitlinks");
    const collection = db.collection("url");

    // Check if short URL already exists
    const existing = await collection.findOne({ shorturl: trimmedShorturl });
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
    let token;
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("token");
    } catch (cookieErr) {
      console.warn("Failed to retrieve cookies:", cookieErr.message);
    }

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
      url: finalUrl,
      shorturl: trimmedShorturl,
      userId,
      clicks: 0,
      createdAt: new Date(),
    });

    const appUrl = process.env.APP_URL || "https://bitlinks.io";
    const normalizedAppUrl = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
    const fullShortUrl = `${normalizedAppUrl}/${trimmedShorturl}`;

    return new Response(
      JSON.stringify({
        success: true,
        error: false,
        message: "URL generated successfully!",
        shortUrl: fullShortUrl,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in POST /api/generate:", error);
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
