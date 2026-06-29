import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongoDB";

export default async function ShortUrlPage({ params }) {
  const { shorturl } = await params;

  // reserved words just in case
  if (['favicon.ico', 'robots.txt'].includes(shorturl)) {
      return null;
  }

  try {
    const client = await clientPromise;
    const db = client.db("bitlinks");
    const collection = db.collection("url");

    const doc = await collection.findOne({ shorturl });

    if (doc) {
      // Increment clicks (fire and forget - mostly, though awaiting is safer for serverless)
      try {
        await collection.updateOne(
            { shorturl },
            { $inc: { clicks: 1 } }
        );
      } catch (updateErr) {
        console.error("Failed to increment click count:", updateErr);
      }
      
      redirect(doc.url);
    }
  } catch (error) {
    // If redirect() was called, it throws a special Next.js error that we must re-throw
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Error resolving short URL:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-gray-100 grid-bg px-4">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-purple-500/20 max-w-md w-full text-center shadow-2xl relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl -z-10" />
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-neon-glow">Oops</h1>
          <h2 className="text-xl font-bold mt-4 text-white">Something Went Wrong</h2>
          <p className="mt-2 text-sm text-gray-400 leading-relaxed">
            We couldn&apos;t process your request. Please try again later.
          </p>
          <a 
            href="/" 
            className="mt-8 inline-block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-gray-100 grid-bg px-4">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-purple-500/20 max-w-md w-full text-center shadow-2xl relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl -z-10" />
        <h1 className="text-7xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-neon-glow">404</h1>
        <h2 className="text-xl font-bold mt-4 text-white">Short Link Not Found</h2>
        <p className="mt-2 text-sm text-gray-400 leading-relaxed">
          The link you are seeking has expired, been removed, or was never generated.
        </p>
        <a 
          href="/" 
          className="mt-8 inline-block w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}

