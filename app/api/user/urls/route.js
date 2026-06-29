import clientPromise from "@/lib/mongoDB";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

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

    const client = await clientPromise;
    const db = client.db("bitlinks");
    const collection = db.collection("url");

    const urls = await collection
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    return new Response(
      JSON.stringify({
        success: true,
        error: false,
        urls,
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
