# 🚀 AuraBlog - Cinematic AI-Powered Blogging Platform

Welcome to **AuraBlog**, an enterprise-grade, cinematic technical publication engine built from scratch with modern Next.js 15, React 19, and Tailwind CSS. 

AuraBlog features a **Self-Healing Core architecture** engineered to run flawlessly out of the box with zero configuration—automatically utilizing robust local process fallbacks for PostgreSQL, Redis caching, Cloudinary storage, and OpenAI, making offline testing completely frictionless!

---

## 🌟 Core Feature Catalog

* **Immersive Cinematic Dark UI**: Implements glassmorphism panel backplates (`backdrop-filter`), glowing radial gradients, customized scrolling paths, and fluid staggered entries.
* **GPU-Optimized Spring Transitions**: Leverages Framer Motion to animate transformations on GPU-accelerated attributes (`opacity`, `scale`, `translate3d`), guaranteeing a steady 60fps across mobile and desktop viewports.
* **Dual-Mode Database Architecture (SQLite / PostgreSQL)**: Configured using Prisma ORM. Runs on a zero-config local SQLite file (`dev.db`) by default, with single-line swaps in the schema and env to scale to PostgreSQL.
* **Local Topical AI & Cosine Recommendations**: Fetches and ranks related stories using high-dimensional cosine similarity vectors. If an `OPENAI_API_KEY` is missing, it runs a server-side TF-IDF topical vector calculator, ensuring recommendation systems are 100% functional offline!
* **Split-Pane Markdown Editor**: Built-in side-by-side editing panel featuring cursor caret injections (Bold, Italic, Code, Links) and dynamic HTML rendering.
* **Custom React Scroll Hook Progress**: Track reading progress through a glowing color-fade header line.
* **Unified Admin Control Dashboard**: Features aggregated views count, draft toggle controls, comments moderation approvals, active subscriber catalogs, system activity logs, and beautiful animated **SVG page-view graphs** with hover tooltips.
* **Hardened Security & Rate Limiting**: Encased behind JWT NextAuth callbacks, strict Zod form schemas, input string sanitization, and sliding window request limits.

---

## 🛠 Local Setup Instructions

AuraBlog is pre-configured to build and execute immediately:

### 1. Initialize the Environment Configuration
Create a `.env` file in the project root folder (you can copy from the pre-supplied `.env.example`):
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="super-secure-nextauth-secret-key-123456"
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Install Packages & Node Modules
Install the dependencies using the legacy peer deps flag (resolving React 19 release candidate peer indicators):
```bash
npm install --legacy-peer-deps
```

### 3. Initialize Database & Generate Client
Apply the schema directly and compile the Prisma client:
```bash
npx prisma db push
```

### 4. Seed the Database
Populate your tables with categories, tags, hashed user accounts, comments, and analytics:
```bash
node prisma/seed.js
```

### 5. Launch the Development Server
Launch the development build on localhost:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔑 Administrative Sign-In Credentials

To access the Dashboard Console `/admin` and write or edit articles, sign in using the seeded credentials:

* **Administrator Email**: `admin@example.com`
* **Password**: `admin123`

---

## 📁 Scalable Project Directory Architecture

```
/app
  ├── (public)              # Public pages (Home, Blogs feed, Categories, Search, About, Contact)
  ├── (auth)                # Sign-in and Sign-up authentication pages
  ├── (dashboard)           # Admin moderation and analytics control panels
  ├── api                   # Route Handlers (Auth registers, Comments, Newsletters, SVG analytics)
  └── layout.tsx            # Metadata SEO anchors and Navbar/Footer mounts

/components
  ├── ui/                   # Global atomic UI controls
  ├── blog/                 # Card containers, Markdown reader, Split-Pane Editor
  ├── dashboard/            # Custom animated SVG graphs and metrics
  ├── layout/               # Cinematic Header/Footer shells
  └── transitions/          # Framer Motion entrance spring wraps

/lib
  ├── db.ts                 # Database client wrapper
  ├── cache.ts              # In-memory TTL caches and sliding window rate limits
  ├── ai.ts                 # Cosine similarity recommendation vectors
  ├── storage.ts            # Local public directory file writes
  └── email.ts              # Transactional mailers with dev terminal logs
```

---

## 📦 RESTful API Documentation Guide

All endpoints return structured JSON and enforce strict status codes:

### 1. Authentication
* `POST /api/auth/register`: Signs up new users. Auto-bootstraps the first user as `ADMIN`.
* `POST /api/auth/signin`: NextAuth credentials pipeline wrapper.

### 2. Technical Publications
* `GET /api/blogs`: Retrieves published blogs. Supports search term parameters (`q`), category filters, and draft lists (restricted to ADMIN/EDITOR).
* `POST /api/blogs`: Saves a new blog post. Recalculates reading time and generates semantic embeddings.
* `GET /api/blogs/[id]`: Renders single blog fields, page view indicators, and nested comment threads.
* `PUT /api/blogs/[id]`: Modifies blog fields and regenerates embeddings if content changed.
* `DELETE /api/blogs/[id]`: Deletes a post and cascades relations.

### 3. Discussions
* `POST /api/comments`: Posts a new comment or reply (parentId links).
* `PUT /api/comments/[id]`: Toggles comment moderation approvals.
* `DELETE /api/comments/[id]`: Deletes comment entries.

### 4. Newsletter
* `POST /api/newsletter`: registers active subscribers. Enforces sliding window rate limits.
* `GET /api/newsletter`: Lists all subscribers.
