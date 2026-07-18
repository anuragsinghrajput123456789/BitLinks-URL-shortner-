import clientPromise, { executeDbWithRetry } from "@/lib/mongoDB";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    let token;
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("token");
    } catch (cookieErr) {
      console.error("[GET /api/user/urls] [ERROR] Failed to retrieve cookies:", cookieErr.message);
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Internal server error reading cookies",
        },
        { status: 500 }
      );
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("[GET /api/user/urls] [CRITICAL] process.env.JWT_SECRET is missing.");
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Internal server configuration error",
        },
        { status: 500 }
      );
    }

    let userId;
    try {
      const decoded = jwt.verify(
        token.value,
        secret
      );
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Invalid token",
        },
        { status: 401 }
      );
    }

    let urls;
    try {
      urls = await executeDbWithRetry(async (client) => {
        const db = client.db("bitlinks");
        const collection = db.collection("url");
        return await collection
          .find({ userId: userId })
          .sort({ createdAt: -1 })
          .toArray();
      });
    } catch (dbErr) {
      console.error("[GET /api/user/urls] [ERROR] Database fetch failure:", dbErr);
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Failed to connect to the database",
        },
        { status: 503 }
      );
    }

    const appUrl = process.env.APP_URL || "https://bitlinks.io";
    const normalizedAppUrl = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
    const formattedUrls = urls.map((item) => ({
      ...item,
      fullShortUrl: `${normalizedAppUrl}/${item.shorturl}`,
    }));

    return NextResponse.json(
      {
        success: true,
        error: false,
        urls: formattedUrls,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/user/urls] [ERROR] Unexpected query failure:", error);
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

