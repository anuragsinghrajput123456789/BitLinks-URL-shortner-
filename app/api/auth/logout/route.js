import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      {
        success: true,
        error: false,
        message: "Logged out successfully",
      },
      { status: 200 }
    );

    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = [
      "token=",
      "Path=/",
      "HttpOnly",
      "SameSite=Strict",
      "expires=Thu, 01 Jan 1970 00:00:00 GMT",
    ];
    if (isProd) {
      cookieOptions.push("Secure");
    }
    response.headers.set("Set-Cookie", cookieOptions.join("; "));

    return response;
  } catch (error) {
    console.error("[POST /api/auth/logout] [ERROR] Unexpected logout failure:", error);
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

