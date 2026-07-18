import clientPromise, { executeDbWithRetry } from "@/lib/mongoDB";
import { after, NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { shorturl } = await params;

  // Gracefully skip asset requests
  if (["favicon.ico", "robots.txt", "sitemap.xml"].includes(shorturl)) {
    return new Response(null, { status: 404 });
  }

  // Early parameter validation: Only query database if the slug is valid format (alphanumeric, dashes, underscores)
  const aliasRegex = /^[a-zA-Z0-9_-]+$/;
  if (!aliasRegex.test(shorturl)) {
    return new Response(getNotFoundHtml(), {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  const userAgent = request.headers.get("user-agent") || "";
  
  // 1. Detect if request is a browser prefetch (we skip counting prefetch requests)
  const isPrefetch = request.headers.get("purpose") === "prefetch" || 
                     request.headers.get("x-purpose") === "prefetch" || 
                     request.headers.get("x-moz") === "prefetch";

  // 2. Detect if request User-Agent matches common scraper bots, crawlers, or link previews
  const isBot = /bot|crawler|spider|crawling|fetcher|slack|whatsapp|facebook|twitter|telegram|preview|discord|ping/i.test(userAgent);

  const shouldCountClick = !isPrefetch && !isBot;

  try {
    const doc = await executeDbWithRetry(async (client) => {
      const db = client.db("bitlinks");
      const collection = db.collection("url");
      return await collection.findOne({ shorturl }, { projection: { url: 1 } });
    });

    if (doc) {
      if (shouldCountClick) {
        // Increment click count (analytics) in a non-blocking background task
        try {
          after(async () => {
            try {
              await executeDbWithRetry(async (client) => {
                const db = client.db("bitlinks");
                const collection = db.collection("url");
                await collection.updateOne(
                  { _id: doc._id },
                  { $inc: { clicks: 1 } }
                );
              });
            } catch (clickErr) {
              console.error("[GET /[shorturl]] [ERROR] Failed to increment click counter in background:", clickErr);
            }
          });
        } catch (afterErr) {
          // Fallback: If after() is not supported/configured, run synchronously
          try {
            await executeDbWithRetry(async (client) => {
              const db = client.db("bitlinks");
              const collection = db.collection("url");
              await collection.updateOne(
                { _id: doc._id },
                { $inc: { clicks: 1 } }
              );
            });
          } catch (clickErr) {
            console.error("[GET /[shorturl]] [ERROR] Failed to increment click counter synchronously:", clickErr);
          }
        }
      }

      // Perform HTTP 302 redirect
      return NextResponse.redirect(doc.url, 302);
    }
  } catch (error) {
    console.error("[GET /[shorturl]] [ERROR] Error in shorturl redirect route:", error);
    return new Response(getErrorHtml("Server Error", "An internal error occurred while resolving your link."), {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Gracefully handle missing link by returning a beautiful 404 page
  return new Response(getNotFoundHtml(), {
    status: 404,
    headers: { "Content-Type": "text/html" },
  });
}

function getNotFoundHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link Not Found - BitLinks</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #030014;
      color: #f3f4f6;
      padding: 1rem;
      overflow: hidden;
      position: relative;
    }
    .grid-bg {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.07) 1px, transparent 0);
      background-size: 24px 24px;
      z-index: -20;
    }
    .blob {
      position: absolute;
      border-radius: 9999px;
      filter: blur(90px);
      z-index: -10;
      opacity: 0.6;
    }
    .blob-purple {
      top: 20%;
      left: 20%;
      width: 20rem;
      height: 20rem;
      background-color: rgba(147, 51, 234, 0.06);
    }
    .blob-pink {
      bottom: 20%;
      right: 20%;
      width: 22rem;
      height: 22rem;
      background-color: rgba(219, 39, 119, 0.06);
    }
    .card {
      width: 100%;
      max-w: 28rem;
      background-color: rgba(10, 7, 27, 0.65);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 1.5rem;
      padding: 2.5rem;
      border: 1px solid rgba(168, 85, 247, 0.15);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      text-align: center;
      position: relative;
    }
    .icon-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 4rem;
      width: 4rem;
      background: linear-gradient(to top right, #9333ea, #db2777);
      border-radius: 1rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 10px 15px -3px rgba(168, 85, 247, 0.3);
    }
    .heading-404 {
      font-size: 4.5rem;
      font-weight: 900;
      background: linear-gradient(to right, #c084fc, #f472b6);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.35));
      line-height: 1;
    }
    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 1rem;
      color: #ffffff;
    }
    p {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #9ca3af;
      line-height: 1.625;
    }
    .button-container {
      margin-top: 2rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      background: linear-gradient(to right, #9333ea, #db2777);
      color: #ffffff;
      font-weight: 700;
      padding: 0.875rem 1.5rem;
      border-radius: 0.75rem;
      text-decoration: none;
      box-shadow: 0 10px 15px -3px rgba(147, 51, 234, 0.2);
      transition: all 0.2s ease-in-out;
    }
    .btn:hover {
      transform: scale(1.03);
      filter: brightness(1.1);
    }
    .icon {
      height: 1rem;
      width: 1rem;
      fill: none;
      stroke: currentColor;
    }
  </style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="blob blob-purple"></div>
  <div class="blob blob-pink"></div>

  <div class="card">
    <div class="icon-container">
      <svg class="icon" style="height:2rem; width:2rem;" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
      </svg>
    </div>

    <h1 class="heading-404">404</h1>
    <h2>Short Link Not Found</h2>
    <p>The link you followed has expired, been removed, or was never generated.</p>

    <div class="button-container">
      <a href="/" class="btn">
        <svg class="icon" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
        </svg>
        Return Home
      </a>
    </div>
  </div>
</body>
</html>`;
}

function getErrorHtml(title, description) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - BitLinks</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #030014;
      color: #f3f4f6;
      padding: 1rem;
      overflow: hidden;
      position: relative;
    }
    .grid-bg {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.07) 1px, transparent 0);
      background-size: 24px 24px;
      z-index: -20;
    }
    .card {
      width: 100%;
      max-w: 28rem;
      background-color: rgba(10, 7, 27, 0.65);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-radius: 1.5rem;
      padding: 2.5rem;
      border: 1px solid rgba(168, 85, 247, 0.15);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      text-align: center;
      position: relative;
    }
    h1 {
      font-size: 2.25rem;
      font-weight: 900;
      background: linear-gradient(to right, #f87171, #f43f5e);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      line-height: 1.2;
    }
    p {
      margin-top: 1rem;
      font-size: 0.875rem;
      color: #9ca3af;
      line-height: 1.625;
    }
    .button-container {
      margin-top: 2rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      background: linear-gradient(to right, #9333ea, #db2777);
      color: #ffffff;
      font-weight: 700;
      padding: 0.875rem 1.5rem;
      border-radius: 0.75rem;
      text-decoration: none;
      box-shadow: 0 10px 15px -3px rgba(147, 51, 234, 0.2);
      transition: all 0.2s ease-in-out;
    }
    .btn:hover {
      transform: scale(1.03);
      filter: brightness(1.1);
    }
  </style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="card">
    <h1>${title}</h1>
    <p>${description}</p>
    <div class="button-container">
      <a href="/" class="btn">Return Home</a>
    </div>
  </div>
</body>
</html>`;
}
