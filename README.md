# o8m Giakaa CMS
### Full-Stack Content Management System with Polyglot Persistence & Hardened Security Architecture

**Built for o8m Labs** · **Technical Prototype & Engineering Demonstration**

[![Continuous Integration](https://github.com/Balama2520/o8m-giakaa-cms/actions/workflows/ci.yml/badge.svg)](https://github.com/Balama2520/o8m-giakaa-cms/actions/workflows/ci.yml)
[![Live Application](https://img.shields.io/badge/Live%20Application-Visit-blue?style=for-the-badge)](https://o8m-giakaa-cms.vercel.app/)
[![Repository](https://img.shields.io/badge/GitHub-Source%20Code-black?style=for-the-badge&logo=github)](https://github.com/Balama2520/o8m-giakaa-cms)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**o8m Giakaa CMS** is a full-stack content management system built for o8m Labs to demonstrate enterprise-grade modular architecture, polyglot persistence (relational + document databases), authenticated editorial workflows, and SEO-aware publishing.

The platform combines **React 19, Vite, Tailwind CSS v4, Node.js, Express 5, PostgreSQL (Sequelize), and MongoDB (Mongoose)** to manage two distinct content domains:
1. **Hero Slider Management:** High-integrity, ordered relational slide configurations.
2. **Blog Article CMS:** Document-oriented, rich-text editorial publishing with SEO metadata.

---

## 1. Project Overview

### The Engineering Challenge
Content-driven websites require high developer velocity without sacrificing data integrity or security. Different data domains exhibit distinct access patterns:
* **Layout configurations** (such as homepage hero sliders) require deterministic priority ordering, active/inactive toggles, and strict relational constraints.
* **Editorial articles** require flexible, rich-text document structures, dynamic slug generation, extensible SEO metadata, and draft/published state management.

### The Architectural Solution
Giakaa CMS models each domain in its natural persistence paradigm rather than forcing relational data into document stores or vice-versa:

| Capability | Implementation Layer | Primary Technology |
|---|---|---|
| **Hero Slider Management** | Relational Persistence | PostgreSQL + Sequelize ORM |
| **Blog & Article Management** | Document Store | MongoDB Atlas + Mongoose ODM |
| **Authentication & RBAC** | Stateless Token Auth | JWT + bcryptjs + Rate Limiting |
| **Administrative Dashboard** | Protected Client Portal | React 19 + ReactQuill + Tailwind CSS v4 |
| **Content Sanitization** | Dual-Layer Neutralization | DOMPurify (Client) + sanitize-html (Backend) |
| **SEO & Sitemap** | Dynamic Server Discovery | React Helmet Async + /sitemap.xml Generator |
| **Deployment & SPA Routing** | Static Edge + PaaS Engine | Vercel (Frontend Rewrites) + Render (Node.js API) |

---

## 2. System Architecture

The application implements a decoupled, secure client-server architecture with segregated public and administrative API boundaries:

```mermaid
flowchart TD
    subgraph Client [Frontend - React 19 + Vite]
        Visitor[Public Visitor] --> PublicViews[LandingPage & BlogListing & BlogDetail]
        AdminUser[Admin Editor] --> AdminLoginView[AdminLogin Component]
        AdminLoginView -->|Bearer JWT| AdminView[Protected AdminPanel]
    end

    subgraph Edge [Edge & Routing Layer]
        VercelCDN[Vercel Edge Rewrites]
        Robots[robots.txt]
        SitemapRoute[/sitemap.xml & /api/sitemap]
    end

    subgraph API [Express 5 Application Engine]
        PublicRouter[Public Routes /api/hero & /api/blogs]
        AuthRouter[Auth Routes /api/auth/login]
        AdminRouter[Admin Routes /api/admin/* - requireAuth]
        HelmetMiddleware[Helmet Security Headers]
        RateLimiter[Rate Limiting Middleware]
    end

    subgraph Storage [Polyglot Persistence Layer]
        AdminRouter -->|Sequelize ORM| PostgresDB[(PostgreSQL - hero_slides)]
        AdminRouter -->|Mongoose ODM| MongoDB[(MongoDB - blogs & admin_users)]
        PublicRouter --> PostgresDB
        PublicRouter --> MongoDB
        SitemapRoute --> MongoDB
    end

    Visitor --> VercelCDN
    AdminUser --> VercelCDN
    PublicViews --> PublicRouter
    AdminView --> AdminRouter
```

### Technology Stack
* **Frontend:** React 19, React Router v7, Vite 7, Tailwind CSS v4, Lucide React, ReactQuill, React Helmet Async, DOMPurify.
* **Backend:** Node.js (v20+), Express 5, Sequelize 6, Mongoose 9, bcryptjs, jsonwebtoken, express-rate-limit, helmet, sanitize-html, slugify.
* **Persistence:** PostgreSQL (ACID relational engine) + MongoDB (BSON document engine).
* **Testing:** Node.js native test runner (`node:test`), Supertest, Vitest, Testing Library React, jsdom.
* **CI/CD:** GitHub Actions automated lint, test, and build pipelines.

---

## 3. Polyglot Database Architecture: Rationale & Trade-offs

### A. PostgreSQL — Hero Slider Management
* **Table:** `hero_slides`
* **Model:** [backend/models/HeroSlide.js](backend/models/HeroSlide.js)
* **Rationale:** Layout sliders require strict numerical ordering (`display_order`), boolean visibility flags (`is_active`), character-bounded headlines, and transactional integrity.
* **Configuration:** Supports both connection strings (`DATABASE_URL` with SSL for hosted cloud providers like Supabase/Neon/Render) and individual parameter fallbacks. Automatic schema sync is restricted to non-production environments to protect production data.

### B. MongoDB — Blog Article Management
* **Collections:** `blogs`, `adminusers`
* **Models:** [backend/models/Blog.js](backend/models/Blog.js), [backend/models/AdminUser.js](backend/models/AdminUser.js)
* **Rationale:** Editorial articles feature variable-length rich text, nested SEO metadata (`metaTitle`, `metaDescription`), and workflow states (`draft`, `published`). Document indexing on `{ slug: 1 }` and `{ status: 1 }` ensures fast query evaluation.
* **Sanitization & Slugs:** Model lifecycle hooks automatically sanitize HTML via `sanitize-html` and generate strict URL slugs via `slugify` during both creation and updates.

### Architectural Trade-off Analysis
* **Why not a unified database?** For an enterprise prototype, dual-database architecture demonstrates polyglot persistence and isolation of concerns. 
* **Production Reality:** Operating two distinct database connection pools and cloud providers for small workloads introduces operational complexity. For production consolidation, storing blog articles with `JSONB` columns in PostgreSQL would achieve identical document flexibility while halving infrastructure overhead.

---

## 4. API Specification & Public/Admin Separation

The system enforces strict segregation between public read APIs and authenticated administrative APIs:

### Public Endpoints (Unauthenticated)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/hero` | Retrieves **active slides only** (`isActive: true`), sorted by display priority. |
| `GET` | `/api/blogs` | Retrieves **published articles only** (`status: 'published'`). Drafts are never exposed. |
| `GET` | `/api/blogs/:slug` | Retrieves a single **published article** by its slug. Drafts return 404. |
| `GET` | `/health` / `/api/health` | System health check verifying PostgreSQL and MongoDB connectivity. |
| `GET` | `/sitemap.xml` | Dynamic XML sitemap listing published articles and core canonical URLs. |

### Administrative Endpoints (Protected by JWT Auth)
All `/api/admin/*` routes require header `Authorization: Bearer <token>`.
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticates administrator; rate-limited (max 10 attempts/15 min). |
| `GET` | `/api/auth/me` | Returns authenticated user profile. |
| `GET` | `/api/admin/hero` | Retrieves all slides (both active and inactive) for editorial review. |
| `POST` | `/api/admin/hero` | Creates a hero slide with allowlist validation and URL protocol checks. |
| `PUT` | `/api/admin/hero/:id` | Updates slide details, priority ordering, or active status. |
| `DELETE` | `/api/admin/hero/:id` | Permanently deletes a hero slide. |
| `GET` | `/api/admin/blogs` | Retrieves all articles (both published and drafts). |
| `POST` | `/api/admin/blogs` | Creates article; sanitizes HTML and generates slug. |
| `PUT` | `/api/admin/blogs/:id` | Updates article; executes sanitization and updates slug. |
| `DELETE` | `/api/admin/blogs/:id` | Permanently deletes an article. |

---

## 5. Security Controls & Hardening

1. **Authentication & Authorization:**
   * Passwords hashed using `bcryptjs` with 10 salt rounds.
   * Stateless, signed JSON Web Tokens (JWT) with configured expiration (`JWT_EXPIRES_IN`).
   * Password hashes are automatically stripped from JSON outputs via schema `toJSON` overrides.
   * Mutating routes on `/api/hero` and `/api/blogs` reject unauthenticated requests with HTTP 401.
2. **Safe Admin Provisioning:**
   * Public administrative registration is intentionally disabled.
   * Admins are provisioned via secure CLI script (`npm run provision-admin`) or environment seeding.
3. **Dual-Layer XSS Neutralization:**
   * **Backend:** All rich-text inputs are sanitized on creation and update using `sanitize-html`, stripping `<script>`, inline event handlers (`onload`, `onerror`), and unauthorized tags.
   * **Frontend:** Rich-text content rendered via `DOMPurify.sanitize()` before DOM injection.
4. **Injection & URL Protocol Defenses:**
   * **URL Validation:** All external media and CTA links are inspected with `isSafeUrl()`, strictly rejecting dangerous schemes (`javascript:`, `data:`, `vbscript:`).
   * **NoSQL Operator Injection:** Query parameters are sanitized and allowlisted; raw query objects are never passed directly to MongoDB.
   * **Allowlist Filtering:** Discards unlisted attributes (`role`, `isAdmin`, `__v`) before database operations.
5. **Transport & Header Security:**
   * Helmet middleware active across all routes (`X-Content-Type-Options: nosniff`, DNS prefetch controls).
   * CORS restricted to configured origins (`CORS_ORIGIN`).
   * Payload size strictly bounded to 1 MB.
   * Error handling suppresses internal database traces and infrastructure names in production.

---

## 6. Local Development Setup

### Prerequisites
* **Node.js:** v20.x or higher
* **PostgreSQL:** Local instance on port 5432 or hosted connection URI
* **MongoDB:** Local MongoDB or MongoDB Atlas URI

### 1. Clone & Install
```bash
git clone https://github.com/Balama2520/o8m-giakaa-cms.git
cd o8m-giakaa-cms
```

### 2. Configure Backend
```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env` with your database credentials and secret key:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_key_at_least_32_chars
CORS_ORIGIN=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/giakaa_cms
DATABASE_URL=postgresql://postgres:password@localhost:5432/giakaa_cms
```

### 3. Provision the Initial Administrator
Run the safe provisioning CLI script:
```bash
npm run provision-admin admin admin@giakaa.com YourSecurePassword123!
```

### 4. Start Backend Server
```bash
npm start
# Server listens on http://localhost:5000
```

### 5. Configure & Start Frontend
In a new terminal:
```bash
cd frontend
npm install --legacy-peer-deps
cp .env.example .env
npm run dev
# Vite client runs on http://localhost:5173
```

Navigate to `http://localhost:5173/admin` and log in with your provisioned credentials.

---

## 7. Testing & Quality Assurance

The codebase features an automated test suite across backend and frontend tiers:

### Run Backend Tests (Node Test Runner + Supertest)
```bash
cd backend
npm test
```
*Executes 26 unit and integration tests covering JWT auth, route guards, public/admin isolation, XSS sanitization, slugification, health checks, and URL validation.*

### Run Frontend Tests (Vitest + React Testing Library)
```bash
cd frontend
npm test
```
*Executes 6 component and utility tests covering authentication state, token expiration, password visibility toggles, and form validation.*

### Run Frontend Linter & Build Verification
```bash
cd frontend
npm run lint
npm run build
```
*Confirms 0 ESLint errors and verifies route-level code splitting (all bundle chunks < 260 kB).*

---

## 8. Deployment Architecture

### Frontend: Vercel
* Deploy the `frontend/` directory to Vercel.
* [frontend/vercel.json](frontend/vercel.json) configures single-page application rewrites (`/(.*) -> /index.html`), preventing 404 errors on deep routes (`/blogs`, `/admin`).
* `/sitemap.xml` requests are automatically routed to the dynamic backend sitemap.

### Backend: Render / Railway / PaaS
* Deploy the `backend/` directory as a Node.js Web Service.
* Configure environment variables: `DATABASE_URL`, `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV=production`.
* The server performs a dependency check on startup and exposes `/health` for uptime monitoring and zero-downtime rolling deploys.

---

## 9. Known Limitations & Architectural Notes

1. **Client-Side Rendering (CSR) SEO:** While dynamic `<Helmet>` tags and an automated `/sitemap.xml` are active, social scrapers (such as Twitter Cards or WhatsApp preview bots) that do not execute client-side JavaScript receive an empty HTML shell. For production enterprise deployments, migrating to Next.js App Router for Server-Side Rendering (SSR) is recommended.
2. **Media Storage:** Hero slides and blog articles currently accept direct image URLs. Integrating AWS S3 or Cloudinary with pre-signed upload URLs would streamline binary asset management.
3. **Database Maintenance:** Hosted free-tier databases (e.g. Supabase) pause after periods of inactivity. Ensure production databases utilize non-ephemeral instances.

---

## 10. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Author:** Bala Maneesh Ayanala  
*Developed for o8m Labs as a Full-Stack Technical Prototype.*
