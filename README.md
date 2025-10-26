# 🔗 BitLinks – URL Shortener

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-13.5-black?logo=next.js)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-blue?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0-green?logo=mongodb)](https://www.mongodb.com/)

---

## 🚀 Live Demo

🌐 [Visit BitLinks](https://bitlinks-yourdemo.netlify.app)  

---

## 🧩 About

**BitLinks** is a **modern, fast, and beautiful URL shortener** built with **Next.js**, **MongoDB**, and **TailwindCSS**.  
Generate short, shareable URLs instantly with a sleek UI and smooth animations. Perfect for creators, developers, and businesses.

---

## ✨ Features

- 🎯 **Shorten URLs easily** — Generate short links for any long URL.  
- ✏️ **Custom short aliases** — Choose your own short keyword.  
- 📋 **Copy & share instantly** — Click to copy or open in a new tab.  
- 📊 **Analytics-ready** — Prepare for future tracking & stats.  
- 💻 **Responsive design** — Works on desktop, tablet, and mobile.  
- ⚡ **Fast & smooth** — Built with Next.js for optimal performance.  
- 🌈 **Beautiful UI & animations** — TailwindCSS + Framer Motion powered.  
- ❌ **Error handling** — Prevents duplicate short URLs and invalid inputs.

---

## 🛠 Tech Stack

| Frontend       | Backend         | Database       | Animations      |
|----------------|----------------|----------------|----------------|
| Next.js 13+    | Node.js         | MongoDB Atlas  | Framer Motion  |
| React 18       | API Routes      | Mongoose       | TailwindCSS    |
| TailwindCSS    |                 |                |                |

---
bitlinks/
│
├── app/
│ ├── api/
│ │ └── generate/route.js # API endpoint for generating short URLs
│ ├── page.js # Main frontend UI
│ └── layout.js # Global layout
│
├── lib/
│ └── mongoDB.js # MongoDB connection helper
│
├── public/ # Static assets
├── styles/ # Tailwind and global styles
└── package.json


---

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/anuragsinghrajput123456789/BitLinks-URL-shortner-.git
cd BitLinks-URL-shortner-

# Install dependencies
npm install

# Add environment variables
# Create .env.local file
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_HOST=http://localhost:3000

# Run locally
npm run dev

🧠 How It Works

Enter a long URL and a preferred short keyword.

The API checks if the short alias already exists in MongoDB.

If unique, it stores { shorturl, original_url } in the database.

Frontend displays the new short link which redirects to the original URL.

🔮 Future Enhancements

👤 Add user authentication (Google/GitHub login).

📊 Track clicks, location, and device analytics.

🎲 Automatic random short link generation.

🌙 Dark mode toggle.

📱 QR code generation for each short URL.

📸 UI Preview

🧑‍💻 Author

Anurag Singh

GitHub: @anuragsinghrajput123456789

LinkedIn: Anurag Singh

📝 License

This project is licensed under the MIT License.


---

If you want, I can also make a **“fancy GitHub-style README with GIFs and animated badges”** version that looks very **interactive and visually modern** — perfect for portfolio projects.  

Do you want me to do that next?

## 📁 Project Structure

