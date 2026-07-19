<p align="center">
  <img src="public/logo.png" alt="BitLinks Logo" width="150" />
</p>

<h1 align="center">🔗 BitLinks</h1>
<p align="center"><strong>Premium URL Shortener Ecosystem</strong></p>

<p align="center">
  <img src="public/banner.png" alt="BitLinks Banner" width="100%" style="border-radius: 12px;" />
</p>

BitLinks is a futuristic, highly performant, and secure URL Shortener application built with Next.js 15, MongoDB, and Tailwind CSS. It is designed for digital creators, developers, and marketing professionals who need clean, quick, and trackable links.

---


## 🚀 Key Features

- **⚡ Lightning-Fast Redirects**: Under 10ms server redirections powered by optimized MongoDB queries.
- **📊 Real-time Click Analytics**: Track link usage, click statistics, geolocations, and hit timestamps.
- **🎨 Rich Glassmorphism Design**: Sleek aesthetic, premium gradients, floating neon blobs, and dark modes.
- **🔒 Enterprise Security**: Secure cookie-based JWT user authentication and password hashing.
- **📱 Fully Responsive**: Seamlessly optimized layouts for mobile, tablet, and desktop viewports.
- **🖼️ Instant QR Codes**: Downloadable custom QR codes generated for every shortened URL.

---

## 🛠️ Architecture & Flow Diagram

The application is structured into clear layers separating the client interface, API handlers, authentication controls, and data storage.

```mermaid
graph TD
    %% User/Client Layer
    subgraph Client [Client UI - Next.js App]
        User([User Browser]) --> Home[Home Page / Instant Form]
        User --> Dashboard[Creator Dashboard]
        User --> Shorten[Shortener Panel & QR Codes]
        User --> Auth[Login / Signup Pages]
    end

    %% Routing/Redirection Layer
    subgraph Redirect [Redirection Engine]
        SlugRedirect["/[shorturl] Redirect Route"]
    end

    %% API Layer
    subgraph API [Next.js API Backend]
        GenAPI["POST /api/generate (URL Generation)"]
        UserAPI["GET /api/user/urls (User History)"]
        LoginAPI["POST /api/auth/login (Authentication)"]
        SignupAPI["POST /api/auth/signup (User Creation)"]
    end

    %% Database & Auth Layer
    subgraph Storage [Database & Middleware]
        MongoConn[(MongoDB Connection)]
        JWTCookies["JWT Cookie (HttpOnly)"]
    end

    %% Connections
    Home --> GenAPI
    Shorten --> GenAPI
    Dashboard --> UserAPI
    Auth --> LoginAPI
    Auth --> SignupAPI
    SlugRedirect --> MongoConn
    
    GenAPI --> MongoConn
    UserAPI --> MongoConn
    LoginAPI --> MongoConn
    SignupAPI --> MongoConn
    
    LoginAPI --> JWTCookies
    GenAPI -.-> JWTCookies
    UserAPI -.-> JWTCookies
```

---

## 📂 Folder Structure

The repository is modular and structured according to Next.js App Router conventions:

```text
URL-shortner/
├── app/                        # Next.js App Router root
│   ├── [shorturl]/             # Redirect handler route (/[shorturl])
│   │   └── route.js            # GET: Server-side HTTP redirect & 404 handler
│   ├── about/                  # About page component
│   │   └── page.js
│   ├── api/                    # API Endpoints
│   │   ├── auth/
│   │   │   ├── login/          # POST: User auth & session cookie
│   │   │   │   └── route.js
│   │   │   └── signup/         # POST: Account registration
│   │   │       └── route.js
│   │   ├── generate/           # POST: Create shortened links
│   │   │   └── route.js
│   │   └── user/
│   │       └── urls/           # GET: Retrieve user-created links
│   │           └── route.js
│   ├── components/             # Reusable UI layout elements
│   │   ├── Footer.js
│   │   ├── Navbar.js
│   │   ├── PageWrapper.js      # Unified layout page wrapper
│   │   └── ToastContainer.js   # Framer Motion animated Toast UI
│   ├── contact/                # Contact and support form
│   │   └── page.js
│   ├── dashboard/              # Creator analytics panel
│   │   └── page.js
│   ├── shorten/                # Main shortening interface & QR generation
│   │   └── page.js
│   ├── signup/                 # Registration interface
│   │   └── page.js
│   ├── globals.css             # Main styling & Glassmorphism themes
│   ├── layout.js               # Global Root Layout
│   ├── not-found.js            # Custom fallback 404 page
│   └── page.js                 # Landing & Instant shortening widget
├── docs/                       # Comprehensive project docs & case studies
│   ├── API_FLOW.md
│   ├── ARCHITECTURE.md
│   ├── CASE_STUDY.md
│   └── PROJECT_DEEP_DIVE.md
├── lib/
│   ├── mongoDB.js              # MongoDB Client Promise client
│   └── toastState.js           # Publish-subscribe state for toast alerts
├── public/                     # Static media & asset files
├── .env.local                  # Local environment configuration
├── eslint.config.mjs           # ESLint configuration
├── jsconfig.json               # JavaScript path aliases resolution
├── next.config.mjs             # Next.js configuration rules
├── package.json                # Project script registry & dependencies
└── postcss.config.mjs          # Tailwind CSS PostCSS configuration
```


---

## ⚡ Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Database**: MongoDB (via native `mongodb` driver)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Styling**: Tailwind CSS v4 & Vanilla CSS (with glassmorphism filters)
- **Icons**: Lucide React
- **Animations**: Framer Motion

---

## ⚙️ Setup & Installation

### 1. Clone the project and configure environment variables
Create a `.env.local` file in the root folder of the project:

```env
MONGODB_URI="mongodb://localhost:27017/"
APP_URL="http://localhost:3000"
JWT_SECRET=your_super_secret_key_here
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 4. Build for Production
To create an optimized production build:
```bash
# On Unix-like environments:
npm run build

# On Windows environments (to avoid NODE_ENV conflict errors in static workers):
cmd /c "set NODE_ENV=production&& npm run build"
```

---

## 🔌 API Endpoints Reference

### Authentication API
- `POST /api/auth/signup`: Registers a new user. Expects JSON `{ name, email, password }`. *Rate limited to 3 req/min.*
- `POST /api/auth/login`: Authenticates user and returns an HTTP-only JWT cookie. Expects JSON `{ email, password }`. *Rate limited to 5 req/min.*

### Link & URL Management
- `POST /api/generate`: Creates a shortened URL alias. Supports authenticated (saved history) and guest shortcuts. Expects JSON `{ url, shorturl }`. *Rate limited to 30 req/min. Custom alias max length: 30 chars.*
- `GET /api/user/urls`: Fetches all shortened links generated by the currently authenticated user. *Rate limited to 60 req/min.*

---

## 🛠️ Maintenance & Recent Improvements

We recently performed a complete system audit and implemented the following updates:
- **⚡ Next.js 15 Redirection Optimization**: Redid dynamic redirection (`/[shorturl]`) using Next.js 15's stable `after()` API to perform non-blocking asynchronous click updates in the background, keeping redirects under 15ms.
- **🛡️ Early Route Guards**: Added alphanumeric regex verification (`/^[a-zA-Z0-9_-]+$/`) to path parameters. Invalid paths short-circuit instantly with a 404 block without querying the database, preventing DB scan attacks.
- **🔌 Resilient Database Client**: Refactored [mongoDB.js](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/URL-shortner/lib/mongoDB.js) to use a Thenable wrapper that resets connection promise caches on rejection, preventing permanent connection lockouts. Added linear backoff retries (`executeDbWithRetry`) for reliable DB operations.
- **🔒 Production Hardening**: Updated [next.config.mjs](file:///c:/Users/91836/Downloads/Mern-Ai-Projects/URL-shortner/next.config.mjs) with production security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and HSTS. Added `htmlFor` and `id` properties to client forms for web accessibility compliance.
- **🍞 Event-Based Toast Alerts**: Created a centralized pub-sub state store (`lib/toastState.js`) and matching UI container (`app/components/ToastContainer.js`) powered by Framer Motion to decouple notifications from standard React Context.
- **📂 Developer Documentation**: Outlined the core system architecture, data diagrams, API flows, and case studies inside the `docs/` folder to guide developers.
- **🎨 Premium Glowing Favicon**: Designed and updated a customized futuristic glowing neon favicon using standard static asset serving under `public/` directory, resolving Next.js dynamic metadata `500` errors.
- **↔️ Minimizable Sidebar**: Added a collapsible dashboard sidebar supporting smooth framer-motion/Tailwind transitions (collapsing to `w-20`), accessible tooltips for all links, and local storage state persistence.
- **📱 Local Testing QR Code Fallbacks**: Implemented dynamic localhost-aware QR code rendering. If the app runs on `localhost`, the generated QR code encodes the target destination URL directly to allow local scanner redirection checks. In production, it correctly encodes the trackable short link.
- **📊 Opaque Modal Overlays**: Fixed transparency overlapping issues on the CRUD configure drawer and QR Share modal overlays by correcting invalid Tailwind CSS classes.

---

## 👤 Author

- **Anurag Singh** — Lead Developer & Creator of BitLinks.



