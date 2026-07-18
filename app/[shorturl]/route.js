import clientPromise, { executeDbWithRetry } from "@/lib/mongoDB";
import { after } from "next/server";

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
      return Response.redirect(doc.url, 302);
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
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .grid-bg {
      background-image: radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.07) 1px, transparent 0);
      background-size: 24px 24px;
    }
  </style>
</head>
<body class="min-h-screen flex items-center justify-center bg-slate-950 text-gray-100 grid-bg px-4">
  <!-- Ambient glow backdrops -->
  <div class="absolute top-[20%] left-[20%] w-[20rem] h-[20rem] bg-purple-600/5 rounded-full blur-3xl -z-10"></div>
  <div class="absolute bottom-[20%] right-[20%] w-[22rem] h-[22rem] bg-pink-600/5 rounded-full blur-3xl -z-10"></div>

  <div class="w-full max-w-md bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-purple-500/20 shadow-2xl text-center relative">
    <div class="flex justify-center mb-6">
      <div class="h-16 w-16 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
        <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
        </svg>
      </div>
    </div>

    <h1 class="text-7xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(168,85,247,0.35)]">
      404
    </h1>
    <h2 class="text-2xl font-bold mt-4 text-white">Short Link Not Found</h2>
    <p class="mt-2 text-sm text-gray-400 leading-relaxed">
      The link you followed has expired, been removed, or was never generated.
    </p>

    <div class="mt-8">
      <a href="/" class="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-105">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
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
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .grid-bg {
      background-image: radial-gradient(circle at 1px 1px, rgba(168, 85, 247, 0.07) 1px, transparent 0);
      background-size: 24px 24px;
    }
  </style>
</head>
<body class="min-h-screen flex items-center justify-center bg-slate-950 text-gray-100 grid-bg px-4">
  <div class="w-full max-w-md bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-purple-500/20 shadow-2xl text-center relative">
    <h1 class="text-4xl font-black bg-gradient-to-r from-red-400 to-rose-450 bg-clip-text text-transparent">${title}</h1>
    <p class="mt-4 text-sm text-gray-400 leading-relaxed">${description}</p>
    <div class="mt-8">
      <a href="/" class="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-105">
        Return Home
      </a>
    </div>
  </div>
</body>
</html>`;
}
