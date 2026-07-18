import clientPromise from "@/lib/mongoDB";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    let token;
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("token");
    } catch (cookieErr) {
      console.error("Failed to retrieve cookies in GET /api/user/urls:", cookieErr.message);
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Internal server error reading cookies",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Unauthorized",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    let userId;
    try {
      const decoded = jwt.verify(
        token.value,
        process.env.JWT_SECRET || "default_secret_key"
      );
      userId = decoded.userId;
    } catch (err) {
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Invalid token",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    let client;
    try {
      client = await clientPromise;
    } catch (dbErr) {
      console.error("Database connection failure in GET /api/user/urls:", dbErr);
      return new Response(
        JSON.stringify({
          success: false,
          error: true,
          message: "Failed to connect to the database",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = client.db("bitlinks");
    const collection = db.collection("url");

    const urls = await collection
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    const appUrl = process.env.APP_URL || "https://bitlinks.io";
    const normalizedAppUrl = appUrl.endsWith("/") ? appUrl.slice(0, -1) : appUrl;
    const formattedUrls = urls.map((item) => ({
      ...item,
      fullShortUrl: `${normalizedAppUrl}/${item.shorturl}`,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        error: false,
        urls: formattedUrls,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in GET /api/user/urls:", error);
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
