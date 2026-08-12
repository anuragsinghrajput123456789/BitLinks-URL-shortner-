# BitLinks - Vercel Deployment Guide

This comprehensive guide provides step-by-step instructions on deploying the **BitLinks URL Shortener** application to **Vercel** with a **MongoDB Atlas** database.

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: Configure MongoDB Atlas (Database)](#step-1-configure-mongodb-atlas-database)
3. [Step 2: Deploy to Vercel (Dashboard Method - Recommended)](#step-2-deploy-to-vercel-dashboard-method---recommended)
4. [Step 3: Deploy via Vercel CLI (Alternative Method)](#step-3-deploy-via-vercel-cli-alternative-method)
5. [Step 4: Environment Variables Setup](#step-4-environment-variables-setup)
6. [Step 5: Verify Deployment](#step-5-verify-deployment)
7. [🛠️ Troubleshooting & FAQ](#%EF%B8%8F-troubleshooting--faq)

---

## 1. Prerequisites

Before starting, ensure you have:
- A **GitHub** account with this repository pushed (`BitLinks-URL-shortner-`).
- A **Vercel** account ([sign up at vercel.com](https://vercel.com/signup) using GitHub).
- A **MongoDB Atlas** account ([sign up at mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)).

---

## Step 1: Configure MongoDB Atlas (Database)

Since Vercel uses serverless functions with dynamic IP addresses, you must configure your MongoDB cluster to allow connection requests:

1. **Log in** to your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2. Under **Security** in the left sidebar, click **Network Access**:
   - Click **Add IP Address**.
   - Click **Allow Access From Anywhere** (`0.0.0.0/0`).
   - Click **Confirm**.
3. Under **Security**, click **Database Access**:
   - Click **Add New Database User**.
   - Create a username and strong password. Select **Read and write to any database**.
   - Save the user credentials.
4. Under **Deployment**, click **Database**:
   - Click **Connect** on your cluster.
   - Select **Drivers** (Node.js).
   - Copy the connection string. It will look like this:
     ```env
     mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/bitlinks?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your actual MongoDB user credentials.

---

## Step 2: Deploy to Vercel (Dashboard Method - Recommended)

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`BitLinks-URL-shortner-`).
4. Framework Preset will be automatically detected as **Next.js**.
5. Expand the **Environment Variables** section and add the following keys:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/bitlinks?retryWrites=true&w=majority` | MongoDB connection string |
| `JWT_SECRET` | `3f8a9b1c7d2e4f6a5b8c9d0e1f2a3b4c` | Secret key for JWT auth tokens |
| `APP_URL` | `https://your-app.vercel.app` | Base URL of your deployed app |
| `VITE_API_URL` | `https://your-app.vercel.app` | Matching API URL for frontend |

6. Click **Deploy**. Vercel will run `npm run build` and launch your project!

---

## Step 3: Deploy via Vercel CLI (Alternative Method)

If you prefer deploying from your terminal:

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Log in to Vercel:
   ```bash
   vercel login
   ```
3. Deploy to preview environment:
   ```bash
   vercel
   ```
4. Deploy to production environment:
   ```bash
   vercel --prod
   ```

---

## Step 4: Environment Variables Setup

You can manage environment variables directly in the Vercel Dashboard:
- Go to **Project Settings** -> **Environment Variables**.
- Add or update values for **Production**, **Preview**, and **Development**.
- Trigger a redeploy (**Deployments** tab -> click `...` on latest commit -> **Redeploy**) whenever you change environment variables.

---

## Step 5: Verify Deployment

Once Vercel completes the build:
1. Open your live Vercel URL (e.g. `https://your-project.vercel.app`).
2. Test creating an account (`/signup`) and logging in (`/login`).
3. Test creating a shortened link on `/shorten` or `/dashboard`.
4. Test clicking the shortened link to ensure automatic 302 redirection works.

---

## 🛠️ Troubleshooting & FAQ

### 1. Database Connection Timeout (500 Server Error)
- **Cause**: MongoDB Atlas Network Access is blocking Vercel serverless IPs.
- **Fix**: Go to MongoDB Atlas -> Network Access -> ensure `0.0.0.0/0` is added and active.

### 2. Invalid or Missing Token Error on Login
- **Cause**: `JWT_SECRET` environment variable is not defined on Vercel.
- **Fix**: Go to Vercel -> Project Settings -> Environment Variables, add `JWT_SECRET`, and redeploy.

### 3. Generated Short Links point to localhost:3000
- **Cause**: `APP_URL` environment variable is still set to `http://localhost:3000`.
- **Fix**: Set `APP_URL` in Vercel settings to `https://your-app.vercel.app` and redeploy.

### 4. Build fails with ESLint or linting errors
- **Fix**: The project's `next.config.mjs` has `eslint.ignoreDuringBuilds: true` configured to prevent ESLint flat config serialization issues in Vercel build runners.
