# Deploying BitLinks to Vercel

This guide provides step-by-step instructions on how to deploy the BitLinks URL Shortener application to **Vercel** with a **MongoDB Atlas** database.

---

## Prerequisites

Before starting, make sure you have:
1. A **GitHub** account with this project pushed to a repository.
2. A **Vercel** account (you can sign up using GitHub).
3. A **MongoDB Atlas** account (free tier works perfectly).

---

## Step 1: Set up MongoDB Atlas (Database)

Since Vercel uses dynamic IP addresses, you need to configure your MongoDB cluster to allow external requests:

1. **Log in** to your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2. Create or select a cluster.
3. Go to **Network Access** under Security in the left sidebar:
   - Click **Add IP Address**.
   - Select **Allow Access From Anywhere** (IP: `0.0.0.0/0`). This is required because Vercel serverless functions do not have static IP addresses.
   - Click **Confirm**.
4. Go to **Database Access**:
   - Create a database user. Remember the **username** and **password**.
5. Go to **Database** (clusters overview):
   - Click **Connect** on your cluster.
   - Select **Drivers** (usually Node.js).
   - Copy the connection string. It should look like this:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<username>` and `<password>` with your database user credentials.

---

## Step 2: Import Project in Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository (`BitLinks-URL-shortner-`).
4. Keep the framework preset as **Next.js** and build settings as default.

---

## Step 3: Configure Environment Variables in Vercel

Under the **Environment Variables** section of your Vercel project configuration, add the following variables:

| Key | Value | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string (configured in Step 1). |
| `JWT_SECRET` | *[Your custom random string]* | A strong random string (e.g. `3a7f8c09d5...`) used to encrypt user auth sessions. |
| `APP_URL` | `https://your-app-domain.vercel.app` | Your actual deployed Vercel domain name (used for generating absolute short links). |
| `VITE_API_URL` | `https://your-app-domain.vercel.app` | Set this to match your `APP_URL` for full frontend compatibility. |

> [!TIP]
> You can temporarily set `APP_URL` and `VITE_API_URL` to Vercel's generated preview URL (e.g., `https://your-project.vercel.app`) during deployment, then update them to your final production domain once Vercel assigns it.

---

## Step 4: Deploy!

1. Click **Deploy**.
2. Vercel will build the project and deploy it.
3. Once the build finishes successfully, you will get a live site preview URL!

---

## Troubleshooting & FAQ

### 1. Connection timed out or server error 500
- **Cause**: MongoDB Atlas network access is blocking Vercel.
- **Fix**: Double check that IP `0.0.0.0/0` is added to your MongoDB Atlas **Network Access** list and is active.

### 2. Login or Sign-up fails
- **Cause**: Missing or incorrect `JWT_SECRET` or database username/password.
- **Fix**: Check Vercel project settings -> **Environment Variables** and ensure `JWT_SECRET` is defined and `MONGODB_URI` is correctly formatted.

### 3. Generated URLs point to the wrong hostname
- **Cause**: `APP_URL` environment variable is not updated.
- **Fix**: Update the `APP_URL` in Vercel Environment Variables settings to your custom domain or production Vercel URL and trigger a redeployment.
