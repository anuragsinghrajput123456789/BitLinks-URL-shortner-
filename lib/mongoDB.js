// https://www.codewithharry.com/blogpost/%60how-to-integrate-mongodb-into-your-nextjs-apps%60/
// lib/mongodb.js

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,       // Max connection limit per serverless container
  minPoolSize: 1,        // Maintain at least one active connection
  maxIdleTimeMS: 30000,  // Clean up idle connections after 30s
  connectTimeoutMS: 5000,// Abort early if server is offline
  socketTimeoutMS: 30000,// Socket timeout for active operations
};

let client;


if (!process.env.MONGODB_URI) {
  throw new Error("Add Mongo URI to .env.local");
}

async function initIndexes(connectedClient) {
  try {
    const db = connectedClient.db("bitlinks");

    // 1. Ensure unique index on users.email
    await db.collection("users").createIndex(
      { email: 1 },
      { unique: true, name: "unique_user_email" }
    );

    // 2. Ensure unique index on url.shorturl
    await db.collection("url").createIndex(
      { shorturl: 1 },
      { unique: true, name: "unique_shorturl_alias" }
    );

    // 3. Ensure compound index on url.userId and url.createdAt for dashboard list sorting
    await db.collection("url").createIndex(
      { userId: 1, createdAt: -1 },
      { name: "user_id_created_at_sort" }
    );

    console.info("[DB SETUP] Database indexes verified/created successfully.");
  } catch (err) {
    console.error("Failed to initialize database indexes:", err);
  }
}

let clientPromiseInstance = null;

function createClientPromise() {
  const client = new MongoClient(uri, options);
  return client.connect()
    .then(async (connectedClient) => {
      await initIndexes(connectedClient);
      return connectedClient;
    })
    .catch((err) => {
      // Reset the promise on failure so subsequent calls can retry connecting
      if (process.env.NODE_ENV === "development") {
        delete global._mongoClientPromise;
      } else {
        clientPromiseInstance = null;
      }
      throw err;
    });
}

const clientPromise = {
  then(onFulfilled, onRejected) {
    let promise;
    if (process.env.NODE_ENV === "development") {
      if (!global._mongoClientPromise) {
        global._mongoClientPromise = createClientPromise();
      }
      promise = global._mongoClientPromise;
    } else {
      if (!clientPromiseInstance) {
        clientPromiseInstance = createClientPromise();
      }
      promise = clientPromiseInstance;
    }
    return promise.then(onFulfilled, onRejected);
  },
  catch(onRejected) {
    return this.then(null, onRejected);
  }
};

export async function executeDbWithRetry(operation, maxRetries = 3, delayMs = 500) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await clientPromise;
      return await operation(client);
    } catch (err) {
      lastError = err;
      console.warn(`[DB RETRY] Database operation failed (attempt ${attempt}/${maxRetries}):`, err.message);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  throw lastError;
}

export default clientPromise;

