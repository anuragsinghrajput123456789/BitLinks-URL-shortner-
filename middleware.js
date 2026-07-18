import { NextResponse } from "next/server";

// Native Web Crypto JWT verification to run in Next.js Edge Runtime without Node.js dependencies
async function verifyJWT(token, secret) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Import HMAC SHA-256 secret key
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Verify signature
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signature = base64urlDecode(signatureB64);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      data
    );

    if (!isValid) return null;

    // Decode payload
    const payloadJson = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);

    // Verify token expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

function base64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  const raw = atob(str);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    arr[i] = raw.charCodeAt(i);
  }
  return arr;
}

// Edge-compatible in-memory storage for IP rate limiting
const ipMap = new Map();

// Rate limiting configurations: [maxRequests, windowMs]
const LIMITS = {
  "/api/auth/login": [5, 60000],   // 5 login attempts per minute
  "/api/auth/signup": [3, 60000],  // 3 signup attempts per minute
  "/api/generate": [30, 60000],    // 30 shortened URL generations per minute
  "/api/user/urls": [60, 60000],   // 60 requests per minute
};

function checkRateLimit(ip, pathname) {
  const rule = LIMITS[pathname];
  if (!rule) return true;

  const [limit, windowMs] = rule;
  const now = Date.now();
  const key = `${ip}:${pathname}`;

  if (!ipMap.has(key)) {
    ipMap.set(key, [now]);
    return true;
  }

  const timestamps = ipMap.get(key);
  const activeTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (activeTimestamps.length >= limit) {
    ipMap.set(key, activeTimestamps);
    return false;
  }

  activeTimestamps.push(now);
  ipMap.set(key, activeTimestamps);
  return true;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get client IP address securely
  const ip = request.headers.get("x-forwarded-for") || 
             request.headers.get("x-real-ip") || 
             "127.0.0.1";

  // 1. Enforce API Rate Limiting to prevent brute-force attacks and abuse
  if (
    pathname.startsWith("/api/auth/login") || 
    pathname.startsWith("/api/auth/signup") || 
    pathname.startsWith("/api/generate") ||
    pathname.startsWith("/api/user/urls")
  ) {
    const isAllowed = checkRateLimit(ip, pathname);
    if (!isAllowed) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: true,
          message: "Too many requests. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
  }

  const tokenCookie = request.cookies.get("token");
  const token = tokenCookie?.value;
  const secret = process.env.JWT_SECRET;

  // Fail-secure validation: crash cleanly on missing JWT_SECRET rather than fallback to an insecure default
  if (!secret) {
    console.error("CRITICAL CONFIGURATION ERROR: process.env.JWT_SECRET is missing.");
    if (pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: true,
          message: "Server configuration issue. Authentication is unavailable.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    // For visual routes, return generic internal server error
    return new NextResponse(
      "<h1>500 Internal Server Error</h1><p>Auth is currently disabled due to server misconfiguration.</p>",
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }

  const hasValidToken = token ? (await verifyJWT(token, secret) !== null) : false;

  // Protect /dashboard path: Redirect to login if user is not authenticated
  if (pathname.startsWith("/dashboard")) {
    if (!hasValidToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Prevent logged-in users from seeing /login and /signup pages
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (hasValidToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/api/auth/login",
    "/api/auth/signup",
    "/api/generate",
    "/api/user/urls"
  ],
};
