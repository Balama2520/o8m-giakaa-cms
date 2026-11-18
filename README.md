# o8m Giakaa CMS — Polyglot Persistence Headless CMS

**An enterprise-grade technical demonstration prototype built for o8m Labs, featuring dual-database architecture (PostgreSQL + MongoDB), hardened security guards, and automated SEO publishing workflows.**

[![CI Workflow](https://github.com/Balama2520/o8m-giakaa-cms/actions/workflows/ci.yml/badge.svg)](https://github.com/Balama2520/o8m-giakaa-cms/actions/workflows/ci.yml)
[![Live Demonstration](https://img.shields.io/badge/Live_Demo-Vercel-blue?style=for-the-badge)](https://o8m-giakaa-cms.vercel.app/)
[![Repository](https://img.shields.io/badge/GitHub-Source-black?style=for-the-badge&logo=github)](https://github.com/Balama2520/o8m-giakaa-cms)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 1. Project Background & Engineering Rationale

Modern content-driven web platforms deal with two radically different data domains:
1. **Layout & Navigation Structures (Hero Sliders, Menus):** These require strict relational integrity, deterministic sequence ordering, foreign-key relations, and instantaneous transactional state flips (active/inactive).
2. **Editorial Content (Articles, Longform Posts):** These require schema flexibility, deep nesting of rich-text JSON/Markdown blocks, dynamic tagging, revision tracking, and polymorphic SEO/OpenGraph metadata.

Forcing both workloads into a single database often compromises performance—either by forcing relational schemas into document stores without transactional safety, or by forcing evolving editorial documents into complex, joined relational tables.

**o8m Giakaa CMS** was designed as an engineering prototype for **o8m Labs** to demonstrate a clean **polyglot persistence architecture** for a single-organization, multi-editor publishing platform:
* **PostgreSQL (via Sequelize):** Manages `HeroSlide` layout configurations, deterministic priority ordering (`display_order`), and active presentation states.
* **MongoDB (via Mongoose):** Manages `AdminUser` credentials and editorial `Blog` articles, rich-text revisions, tag arrays, unique slug indexes, and SEO metadata.

---

## 2. System Architecture

```mermaid
graph TD
    Client["Editorial Dashboard<br/>(React 19 + Vite + Tailwind CSS v4)"]
    
    subgraph API_Layer["Express 5 / Node.js Backend"]
        Middleware["Security & Auth Middleware<br/>(Helmet, CORS, Rate Limiting, JWT)"]
        Sanitizer["XSS Sanitization & Slug Engine"]
        HeroController["Hero Layout Controller<br/>(/api/hero, /api/admin/hero)"]
        BlogController["Blog Editorial Controller<br/>(/api/blogs, /api/admin/blogs)"]
        SEOEngine["Dynamic Sitemap Engine<br/>(/sitemap.xml, /api/sitemap)"]
    end

    subgraph Data_Layer["Polyglot Storage Services"]
        PG[("PostgreSQL (Sequelize)<br/>HeroSlide: display_order, isActive")]
        Mongo[("MongoDB (Mongoose)<br/>AdminUser: auth credentials<br/>Blog: articles, rich-text, SEO")]
    end

    Client -->|HTTPS / REST| Middleware
    Middleware --> Sanitizer
    Sanitizer --> HeroController
    Sanitizer --> BlogController
    HeroController --> PG
    BlogController --> Mongo
    SEOEngine --> Mongo
```

---

## 3. Technology Stack Breakdown

| Layer | Technology | Key Implementation Role |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide React | Single-page administrative dashboard, responsive layout, drag-and-drop slide reordering, live Markdown preview, OpenGraph card preview. |
| **Backend API** | Node.js (LTS), Express 5 | Modular controller-service architecture, RESTful endpoints, transactional error handling, async middleware. |
| **Relational Storage** | PostgreSQL, Sequelize ORM | Relational model (`HeroSlide`), deterministic sequence ordering (`display_order`), active state filtering. |
| **Document Storage** | MongoDB, Mongoose ODM | Documents (`AdminUser`, `Blog`), unique slug generation, tag relationships, revision tracking, polymorphic SEO metadata. |
| **Security & Auth** | JWT, Bcrypt, Helmet, Express-Rate-Limit, sanitize-html | Bearer token authorization, password hashing (12 salt rounds), strict HTTP headers, request throttling, server-side XSS sanitization, safe URL scheme validation. |
| **Media Handling** | Validated external & CDN URLs | Zero-dependency media hosting using `isSafeUrl` protocol inspection (S3/Cloudinary object storage planned for V2). |
| **SEO & Publishing** | XML Builder, OpenGraph Generators | Real-time `sitemap.xml` dynamic aggregation, canonical tag resolution. |
| **CI / CD** | GitHub Actions, Docker, Vercel | Automated linting, test suites, Docker containerization, cloud edge deployment. |

---

## 4. Architectural Highlights & Engineering Decisions

### Why Polyglot Persistence?
- **Zero-Join Layout Fetching:** Homepage hero slides and priorities are retrieved from PostgreSQL with sub-10ms indexed queries:
  ```sql
  SELECT * FROM "HeroSlides" WHERE "isActive" = true ORDER BY "display_order" ASC LIMIT 5;
  ```
- **Document-Level Atomicity for Editorial Workflows:** Blog posts with author metadata, tag arrays, rich content, and custom OpenGraph images are read and updated in MongoDB as a single atomic document without multi-table relational joins.
- **Clear Consistency Boundaries:** PostgreSQL handles relational transactional order; MongoDB handles content-heavy editorial entities. Auth sessions verify `AdminUser` against MongoDB.

### Single-Organization, Multi-Editor Architecture
- Designed specifically for single-tenant organization operations with multi-editor collaboration and administrative role separation.

### Hardened Security Architecture
- **Strict Content Sanitization:** All incoming editorial HTML and Markdown input is sanitized via `sanitize-html` to strip script injections, malicious `iframe` embeds, and invalid URI schemes before persistence.
- **Fail-Safe Rate Limiting & URL Validation:** Global rate limiting protects API routes against DDoS and brute-force attacks. `isSafeUrl` strictly filters `javascript:`, `data:`, and invalid schemes.

---

## 5. Key API Endpoints

### Authentication & Admin Session
- `POST /api/auth/login` — Authenticate editor and issue signed JWT.
- `GET /api/auth/me` — Verify bearer session state.

### Relational Hero Slider (PostgreSQL)
- `GET /api/hero` — Fetch ordered, active slides for homepage rendering.
- `POST /api/hero` — Create a new slide configuration (authenticated admin).
- `PUT /api/hero/:id` — Update slide configuration, order, or active status (authenticated admin).
- `DELETE /api/hero/:id` — Remove slide (authenticated admin).

### Document Editorial Engine (MongoDB)
- `GET /api/blogs` — Retrieve published articles feed.
- `GET /api/blogs/:slug` — Retrieve single published article by unique slug.
- `POST /api/admin/blogs` — Create draft or published article with auto-slugification and sanitization.
- `PUT /api/admin/blogs/:id` — Update article content, status, and SEO metadata.
- `DELETE /api/admin/blogs/:id` — Delete article by ID.

### Discovery & SEO
- `GET /sitemap.xml` (or `/api/sitemap`) — Dynamically aggregates published article slugs and core pages into a valid XML sitemap.

---

## 6. Local Setup & Installation

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- MongoDB 6+
- Docker (optional)

### 1. Repository Setup
```bash
git clone https://github.com/Balama2520/o8m-giakaa-cms.git
cd o8m-giakaa-cms
```

### 2. Backend Configuration
```bash
cd backend
npm install
cp .env.example .env
```

Configure `backend/.env`:
```ini
PORT=5000
NODE_ENV=development
POSTGRES_URI=postgresql://postgres:password@localhost:5432/giakaa_cms
MONGO_URI=mongodb://localhost:27017/giakaa_cms
JWT_SECRET=your_secure_random_jwt_secret_key
CORS_ORIGIN=http://localhost:5173
```

Run database migrations & seeders:
```bash
npm run db:migrate
npm run db:seed
```

Start the API server:
```bash
npm run dev
```

### 3. Frontend Configuration
```bash
cd ../frontend
npm install
cp .env.example .env
```

Configure `frontend/.env`:
```ini
VITE_API_URL=http://localhost:5000/api
```

Start the Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173` to access the editorial CMS dashboard.

---

## 7. Testing & Quality Verification

```bash
# Run unit & integration tests across controllers
npm test --prefix backend

# Run linting and code style verification
npm run lint --prefix frontend
npm run lint --prefix backend
```

---

## 8. Development Status & Scope

* **Status:** Functional engineering prototype and technical demonstration developed for o8m Labs.
* **Intended Use:** Demonstration of polyglot database design patterns, clean architecture separation, and enterprise editorial publishing pipelines.

---

## 9. Author & License

- **Architect & Developer:** Bala Maneesh Ayanala ([@Balama2520](https://github.com/Balama2520))
- **Portfolio:** [abms-portfolio.netlify.app](https://abms-portfolio.netlify.app)
- **License:** Released under the [MIT License](LICENSE).
