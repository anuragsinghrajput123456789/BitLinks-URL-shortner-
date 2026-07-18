import clientPromise, { executeDbWithRetry } from "@/lib/mongoDB";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

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
          .find({ userId: userId }, { projection: { url: 1, shorturl: 1, clicks: 1, createdAt: 1, description: 1, expiresAt: 1, tags: 1, isActive: 1 } })
          .sort({ createdAt: -1 })
          .limit(100)
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

export async function PUT(request) {
  try {
    let token;
    try {
      const cookieStore = await cookies();
      const tokenCookie = cookieStore.get("token");
      token = tokenCookie?.value;
    } catch (cookieErr) {
      console.error("[PUT /api/user/urls] [ERROR] Failed to retrieve cookies:", cookieErr.message);
      return NextResponse.json({ success: false, error: true, message: "Unauthorized" }, { status: 401 });
    }

    if (!token) {
      return NextResponse.json({ success: false, error: true, message: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    let userId;
    try {
      const decoded = jwt.verify(token, secret);
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ success: false, error: true, message: "Invalid token" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: true, message: "Malformed JSON payload" }, { status: 400 });
    }

    const { id, ids, url, shorturl, description, expiresAt, tags, isActive } = body;

    // Check if bulk action or single action
    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(idStr => {
        try {
          return new ObjectId(idStr);
        } catch(e) {
          return null;
        }
      }).filter(Boolean);

      if (objectIds.length === 0) {
        return NextResponse.json({ success: false, error: true, message: "No valid IDs provided" }, { status: 400 });
      }

      const updateFields = {};
      if (isActive !== undefined) updateFields.isActive = !!isActive;

      if (Object.keys(updateFields).length === 0) {
        return NextResponse.json({ success: false, error: true, message: "No fields to update" }, { status: 400 });
      }

      await executeDbWithRetry(async (client) => {
        const db = client.db("bitlinks");
        await db.collection("url").updateMany(
          { _id: { $in: objectIds }, userId: userId },
          { $set: updateFields }
        );
      });

      return NextResponse.json({ success: true, error: false, message: "URLs updated successfully" }, { status: 200 });
    } else {
      if (!id) {
        return NextResponse.json({ success: false, error: true, message: "Missing URL ID" }, { status: 400 });
      }

      let oid;
      try {
        oid = new ObjectId(id);
      } catch (e) {
        return NextResponse.json({ success: false, error: true, message: "Invalid URL ID format" }, { status: 400 });
      }

      const updateFields = {};
      if (url !== undefined) {
        if (!url || typeof url !== "string") {
          return NextResponse.json({ success: false, error: true, message: "Invalid URL" }, { status: 400 });
        }
        let finalUrl = url.trim();
        if (!/^https?:\/\//i.test(finalUrl)) {
          finalUrl = "https://" + finalUrl;
        }
        try {
          const parsed = new URL(finalUrl);
          if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return NextResponse.json({ success: false, error: true, message: "Unsupported URL protocol" }, { status: 400 });
          }
        } catch(_) {
          return NextResponse.json({ success: false, error: true, message: "Invalid URL format" }, { status: 400 });
        }
        updateFields.url = finalUrl;
      }

      if (shorturl !== undefined) {
        if (!shorturl || typeof shorturl !== "string") {
          return NextResponse.json({ success: false, error: true, message: "Invalid custom alias" }, { status: 400 });
        }
        const trimmedAlias = shorturl.trim();
        const aliasRegex = /^[a-zA-Z0-9_-]+$/;
        if (!aliasRegex.test(trimmedAlias) || trimmedAlias.length > 30) {
          return NextResponse.json({ success: false, error: true, message: "Invalid alias format or length" }, { status: 400 });
        }
        updateFields.shorturl = trimmedAlias;
      }

      if (description !== undefined) {
        updateFields.description = typeof description === "string" ? description.trim() : "";
      }

      if (expiresAt !== undefined) {
        if (expiresAt === null || expiresAt === "") {
          updateFields.expiresAt = null;
        } else {
          const parsedDate = new Date(expiresAt);
          if (!isNaN(parsedDate.getTime())) {
            updateFields.expiresAt = parsedDate;
          }
        }
      }

      if (tags !== undefined) {
        updateFields.tags = Array.isArray(tags) ? tags.map(t => typeof t === "string" ? t.trim() : "").filter(Boolean) : [];
      }

      if (isActive !== undefined) {
        updateFields.isActive = !!isActive;
      }

      try {
        const result = await executeDbWithRetry(async (client) => {
          const db = client.db("bitlinks");
          const collection = db.collection("url");
          
          if (updateFields.shorturl) {
            const existing = await collection.findOne(
              { shorturl: updateFields.shorturl, _id: { $ne: oid } },
              { projection: { _id: 1 } }
            );
            if (existing) {
              return { success: false, collision: true };
            }
          }

          const res = await collection.updateOne(
            { _id: oid, userId: userId },
            { $set: updateFields }
          );
          return { success: res.matchedCount > 0, collision: false };
        });

        if (result.collision) {
          return NextResponse.json({ success: false, error: true, message: "Custom alias already exists!" }, { status: 409 });
        }

        if (!result.success) {
          return NextResponse.json({ success: false, error: true, message: "URL not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ success: true, error: false, message: "URL updated successfully" }, { status: 200 });
      } catch (dbErr) {
        if (dbErr.code === 11000) {
          return NextResponse.json({ success: false, error: true, message: "Custom alias already exists!" }, { status: 409 });
        }
        throw dbErr;
      }
    }
  } catch (error) {
    console.error("[PUT /api/user/urls] [ERROR] Unexpected update failure:", error);
    return NextResponse.json({ success: false, error: true, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    let token;
    try {
      const cookieStore = await cookies();
      const tokenCookie = cookieStore.get("token");
      token = tokenCookie?.value;
    } catch (cookieErr) {
      console.error("[DELETE /api/user/urls] [ERROR] Failed to retrieve cookies:", cookieErr.message);
      return NextResponse.json({ success: false, error: true, message: "Unauthorized" }, { status: 401 });
    }

    if (!token) {
      return NextResponse.json({ success: false, error: true, message: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    let userId;
    try {
      const decoded = jwt.verify(token, secret);
      userId = decoded.userId;
    } catch (err) {
      return NextResponse.json({ success: false, error: true, message: "Invalid token" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: true, message: "Malformed JSON payload" }, { status: 400 });
    }

    const { id, ids } = body;

    if (ids && Array.isArray(ids)) {
      const objectIds = ids.map(idStr => {
        try {
          return new ObjectId(idStr);
        } catch(e) {
          return null;
        }
      }).filter(Boolean);

      if (objectIds.length === 0) {
        return NextResponse.json({ success: false, error: true, message: "No valid IDs provided" }, { status: 400 });
      }

      await executeDbWithRetry(async (client) => {
        const db = client.db("bitlinks");
        await db.collection("url").deleteMany({ _id: { $in: objectIds }, userId: userId });
      });

      return NextResponse.json({ success: true, error: false, message: "URLs deleted successfully" }, { status: 200 });
    } else {
      if (!id) {
        return NextResponse.json({ success: false, error: true, message: "Missing URL ID" }, { status: 400 });
      }

      let oid;
      try {
        oid = new ObjectId(id);
      } catch (e) {
        return NextResponse.json({ success: false, error: true, message: "Invalid URL ID format" }, { status: 400 });
      }

      const result = await executeDbWithRetry(async (client) => {
        const db = client.db("bitlinks");
        const res = await db.collection("url").deleteOne({ _id: oid, userId: userId });
        return res.deletedCount > 0;
      });

      if (!result) {
        return NextResponse.json({ success: false, error: true, message: "URL not found or unauthorized" }, { status: 404 });
      }

      return NextResponse.json({ success: true, error: false, message: "URL deleted successfully" }, { status: 200 });
    }
  } catch (error) {
    console.error("[DELETE /api/user/urls] [ERROR] Unexpected deletion failure:", error);
    return NextResponse.json({ success: false, error: true, message: "Internal server error" }, { status: 500 });
  }
}

