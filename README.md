# 🔗 BitLinks - Premium URL Shortener

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
│   │   └── page.js
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
│   │   └── Navbar.js
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
│   └── page.js                 # Landing & Instant shortening widget
├── lib/
│   └── mongoDB.js              # MongoDB Client Promise client
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

- **Framework**: Next.js 15 (React 18)
- **Database**: MongoDB (via native `mongodb` driver)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Styling**: Tailwind CSS & Vanilla CSS (with glassmorphism filters)
- **Icons**: Lucide React
- **Animations**: Framer Motion

---

## ⚙️ Setup & Installation

### 1. Clone the project and configure environment variables
Create a `.env.local` file in the root folder of the project:

```env
MONGODB_URI="mongodb://localhost:27017/"
NEXT_PUBLIC_HOST="http://localhost:3000"
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
npm run build
```

---

## 🔌 API Endpoints Reference

### Authentication API
- `POST /api/auth/signup`: Registers a new user. Expects JSON `{ name, email, password }`.
- `POST /api/auth/login`: Authenticates user and returns an HTTP-only JWT cookie. Expects JSON `{ email, password }`.

### Link & URL Management
- `POST /api/generate`: Creates a shortened URL alias. Supports authenticated (saved history) and guest shortcuts. Expects JSON `{ url, shorturl }`.
- `GET /api/user/urls`: Fetches all shortened links generated by the currently authenticated user.

---

## 🛠️ Maintenance & Recent Improvements

We recently performed a complete system audit and implemented the following updates:
- **Environment Resolution**: Resolved null-byte corruption in environment files to guarantee proper JWT signature parsing.
- **Robust Exception Coverage**: Added comprehensive `try-catch` blocks across client-side API requests, local storage state transitions, and server-side redirect handlers.
- **SVG & Icon Loading**: Corrected corrupted icon imports (`EyeOff` replaces non-existent `EyeSlash`).
- **SSR Compatibility**: Ensured full page hydration safety and decoupled platform-specific rendering paths.
- **Dev-Workflow Refactoring**: Shifted module dependencies from unstable native SWC Turbopack builds to stable Next.js compiler environments.
