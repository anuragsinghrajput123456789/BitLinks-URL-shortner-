import clientPromise, { executeDbWithRetry } from "@/lib/mongoDB";
import { cookies } from "next/headers";
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

    const { url, shorturl } = body;

    // 2. Validate existence and type of destination URL
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Missing URL or URL is not a string",
        },
        { status: 400 }
      );
    }
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "URL cannot be empty",
        },
        { status: 400 }
      );
    }

    // Enforce URL length constraint (standard limit to avoid DB overflow or buffer exploits)
    if (trimmedUrl.length > 2048) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "URL is too long. Maximum allowed length is 2048 characters.",
        },
        { status: 400 }
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
        return NextResponse.json(
          {
            success: false,
            error: true,
            message: "Unsupported URL protocol. Only http:// and https:// are supported.",
          },
          { status: 400 }
        );
      }
      const hostname = parsedUrl.hostname;
      if (!hostname || (hostname !== "localhost" && !hostname.includes("."))) {
        return NextResponse.json(
          {
            success: false,
            error: true,
            message: "Invalid URL hostname. Must be a valid domain or localhost.",
          },
          { status: 400 }
        );
      }
    } catch (_) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Invalid URL. Please enter a valid HTTP/HTTPS URL.",
        },
        { status: 400 }
      );
    }

    // 4. Validate custom alias if provided
    let trimmedShorturl = "";
    const isCustomAlias = shorturl !== undefined && shorturl !== null && shorturl !== "";
    if (isCustomAlias) {
      if (typeof shorturl !== "string") {
        return NextResponse.json(
          {
            success: false,
            error: true,
            message: "Short URL alias must be a string",
          },
          { status: 400 }
        );
      }
      trimmedShorturl = shorturl.trim();
      if (!trimmedShorturl) {
        return NextResponse.json(
          {
            success: false,
            error: true,
            message: "Short URL alias cannot be empty",
          },
          { status: 400 }
        );
      }

      // Add alias length constraint
      if (trimmedShorturl.length > 30) {
        return NextResponse.json(
          {
            success: false,
            error: true,
            message: "Custom alias is too long. Maximum allowed length is 30 characters.",
          },
          { status: 400 }
        );
      }

      // Blacklist reserved words to protect app paths
      const reservedSlugs = [
        "login", "signup", "dashboard", "about", "contact",
        "api", "shorten", "admin", "settings", "favicon.ico",
        "robots.txt", "sitemap.xml", "not-found", "logout"
      ];
      if (reservedSlugs.includes(trimmedShorturl.toLowerCase())) {
        return NextResponse.json(
          {
            success: false,
            error: true,
            message: "This custom alias is a reserved system path and cannot be used.",
          },
          { status: 400 }
        );
      }

      // Check format (only alphanumeric, dashes, and underscores)
      const aliasRegex = /^[a-zA-Z0-9_-]+$/;
      if (!aliasRegex.test(trimmedShorturl)) {
        return NextResponse.json(
          {
            success: false,
            error: true,
            message: "Custom alias can only contain letters, numbers, hyphens, and underscores.",
          },
          { status: 400 }
        );
      }
    }

    // Check for User Authentication
    let userId = null;
    let token;
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("token");
    } catch (cookieErr) {
      console.warn("[POST /api/generate] [WARN] Failed to retrieve cookies:", cookieErr.message);
    }

    if (token) {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error("[POST /api/generate] [CRITICAL] process.env.JWT_SECRET is missing.");
        return NextResponse.json(
          {
            success: false,
            error: true,
            message: "Server configuration issue. Authentication verification is unavailable.",
          },
          { status: 500 }
        );
      }
      try {
        const decoded = jwt.verify(token.value, secret);
        userId = decoded.userId;
      } catch (err) {
        // Token invalid, treat as anonymous
        console.info("[POST /api/generate] [INFO] Invalid token during URL generation:", err.message);
      }
    }

    let finalSlug = trimmedShorturl;
    let success = false;

    if (isCustomAlias) {
      // First, check if custom alias is already taken
      let existing = null;
      try {
        existing = await executeDbWithRetry(async (client) => {
          const db = client.db("bitlinks");
          const collection = db.collection("url");
          return await collection.findOne({ shorturl: trimmedShorturl }, { projection: { _id: 1 } });
        });
      } catch (dbErr) {
        console.error("[POST /api/generate] [ERROR] Database connection failure:", dbErr);
        return NextResponse.json(
          {
            success: false,
            error: true,
            message: "Failed to connect to the database. Please try again later.",
          },
          { status: 503 }
        );
      }

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: true,
            message: "Short URL already exists!",
          },
          { status: 409 }
        );
      }

      // Try inserting the custom alias
      try {
        await executeDbWithRetry(async (client) => {
          const db = client.db("bitlinks");
          const collection = db.collection("url");
          await collection.insertOne({
            url: finalUrl,
            shorturl: trimmedShorturl,
            userId,
            clicks: 0,
            createdAt: new Date(),
          });
        });
        success = true;
      } catch (insertErr) {
        if (insertErr.code === 11000) {
          return NextResponse.json(
            {
              success: false,
              error: true,
              message: "Short URL already exists!",
            },
            { status: 409 }
          );
        }
        console.error("[POST /api/generate] [ERROR] Database custom alias insert failure:", insertErr);
        return NextResponse.json(
          {
            success: false,
            error: true,
            message: "Failed to connect to the database. Please try again later.",
          },
          { status: 503 }
        );
      }
    } else {
      // Server-side secure random slug generation with collision retry loop
      const maxRetries = 5;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        finalSlug = generateRandomSlug(6);

        try {
          const res = await executeDbWithRetry(async (client) => {
            const db = client.db("bitlinks");
            const collection = db.collection("url");
            const existing = await collection.findOne({ shorturl: finalSlug }, { projection: { _id: 1 } });
            if (existing) {
              return { collision: true };
            }
            await collection.insertOne({
              url: finalUrl,
              shorturl: finalSlug,
              userId,
              clicks: 0,
              createdAt: new Date(),
            });
            return { collision: false };
          }, 2, 200);

          if (res.collision) {
            continue;
          }
          success = true;
          break;
        } catch (insertErr) {
          if (insertErr.code === 11000) {
            continue;
          }
          console.error(`[POST /api/generate] [ERROR] Random slug generation query failure on attempt ${attempt}:`, insertErr);
        }
      }

      if (!success) {
        console.error("[POST /api/generate] [ERROR] Failed to generate a non-colliding slug after max attempts.");
        return NextResponse.json(
          {
            success: false,
            error: true,
            message: "Unable to generate a unique short link. Please try again.",
          },
          { status: 503 }
        );
      }
    }

    const appUrl = process.env.APP_URL || "https://bitlinks.io";
    const normalizedAppUrl = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
    const fullShortUrl = `${normalizedAppUrl}/${finalSlug}`;

    return NextResponse.json(
      {
        success: true,
        error: false,
        message: "URL generated successfully!",
        shortUrl: fullShortUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/generate] [ERROR] Unexpected generation failure:", error);
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

function generateRandomSlug(length = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

