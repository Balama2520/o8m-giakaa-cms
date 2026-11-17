# Prioritised Engineering Action Plan & Remediation Roadmap — o8m Giakaa CMS

**Framework:** MoSCoW / Severity-Prioritized Technical Roadmap  
**Target:** Production-Hardening & Recruiter-Ready Transformation  
**Date:** November 16, 2026  

---

## 🚨 P0: Critical Security & Data-Integrity Risks (Must Fix Immediately)

### P0-1: Fix Fatal Missing Imports in `BlogDetail.jsx`
* **Issue:** `useState` and `useEffect` are not imported from React, causing a fatal runtime `ReferenceError` on `/blog/:slug`.
* **Business / Engineering Impact:** Total failure of the blog reader experience; white-screen crash for any visitor or recruiter viewing an article.
* **Evidence:** `frontend/src/pages/BlogDetail.jsx` (Lines 1-12); ESLint error `'useState' is not defined`.
* **Recommended Change:** Update line 1 to `import React, { useState, useEffect } from 'react';`.
* **Estimated Effort:** 10 minutes.
* **Dependencies:** None.
* **Acceptance Criteria:** `npm --prefix frontend run lint` passes without errors on `BlogDetail.jsx`; navigating to `/blog/:slug` renders article content without console exceptions.

---

### P0-2: Implement Vercel SPA Routing Configuration (`vercel.json`)
* **Issue:** Vercel returns HTTP 404 on any direct refresh or navigation to nested client routes (`/blogs`, `/admin`, `/blog/:slug`).
* **Business / Engineering Impact:** Recruiter or user sharing a blog URL receives a broken 404 page.
* **Evidence:** Live HTTP probe of `https://o8m-giakaa-cms.vercel.app/blogs` returns `404 NOT_FOUND`.
* **Recommended Change:** Add `frontend/vercel.json` with rewrite rule `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}`.
* **Estimated Effort:** 15 minutes.
* **Dependencies:** None.
* **Acceptance Criteria:** Direct browser refreshes of `https://o8m-giakaa-cms.vercel.app/blogs` and `/admin` return HTTP 200 and render the React application.

---

### P0-3: Implement Authentication on Administrative APIs & Dashboard
* **Issue:** Administrative CRUD endpoints and the `/admin` view are completely unprotected.
* **Business / Engineering Impact:** Critical data vulnerability; any anonymous user or automated bot can overwrite or delete all content.
* **Evidence:** `backend/routes/heroRoutes.js`, `backend/routes/blogRoutes.js`, `frontend/src/App.jsx` (Line 22).
* **Recommended Change:**
  1. Add JWT or session-based authentication middleware (`protect`) in backend.
  2. Protect mutating routes (`POST`, `PUT`, `DELETE`).
  3. Wrap frontend `/admin` route in a `<ProtectedRoute>` component with a login view.
* **Estimated Effort:** 4 hours.
* **Dependencies:** None.
* **Acceptance Criteria:** Unauthenticated requests to `POST/PUT/DELETE /api/blogs` or `/api/hero` return HTTP 401 Unauthorized; `/admin` redirects unauthenticated users to `/login`.

---

### P0-4: Restore Production Database Connectivity on Render
* **Issue:** Supabase PostgreSQL project is unresolvable (`ENOTFOUND`), and MongoDB connection buffers out after 10,000 ms.
* **Business / Engineering Impact:** Complete operational failure in production; live API endpoints return HTTP 400 and 500 errors.
* **Evidence:** Live HTTP probe of `https://o8m-giakaa-cms.onrender.com/api/hero` and `/api/blogs`.
* **Recommended Change:**
  1. Provision a persistent PostgreSQL database on Neon or unpause Supabase project `tkombxcbkwydtlvknarn`.
  2. Update `backend/config/postgres.js` to parse `DATABASE_URL`.
  3. Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access.
  4. Update Render dashboard environment variables.
* **Estimated Effort:** 1 hour.
* **Dependencies:** Cloud provider access.
* **Acceptance Criteria:** `curl https://o8m-giakaa-cms.onrender.com/api/hero` and `/api/blogs` return HTTP 200 with JSON payloads.

---

## ⚠️ P1: Core Functional & Security Deficiencies (High Priority)

### P1-1: Fix Mongoose Pre-Save Sanitization & Slug Update Bypass on `PUT`
* **Issue:** `PUT /api/blogs/:id` uses `findByIdAndUpdate`, which bypasses Mongoose `pre('save')` hooks. XSS payloads are not sanitized and slugs do not update when titles change.
* **Business / Engineering Impact:** Stored XSS vulnerability in database; stale SEO URLs.
* **Evidence:** `backend/routes/blogRoutes.js` (Lines 53-56), `backend/models/Blog.js` (Lines 45-59).
* **Recommended Change:** Refactor route to retrieve document via `findById`, assign updated fields, and call `.save()`.
* **Estimated Effort:** 30 minutes.
* **Dependencies:** None.
* **Acceptance Criteria:** Updating a blog post with a `<script>` tag strips the script prior to database persistence; updating a title regenerates the slug.

---

### P1-2: Enforce Database-Level Active & Published Filters on Public APIs
* **Issue:** `GET /api/hero` returns inactive slides; `GET /api/blogs` and `GET /api/blogs/:slug` return unpublished draft articles.
* **Business / Engineering Impact:** Leakage of internal draft content and decommissioned banners to public users.
* **Evidence:** `backend/routes/heroRoutes.js` (Lines 9-11), `backend/routes/blogRoutes.js` (Lines 10-25).
* **Recommended Change:**
  1. Add `where: { isActive: true }` to `HeroSlide.findAll()`.
  2. Enforce `{ status: 'published' }` on public blog queries.
  3. Restrict drafts to authenticated administrative queries.
* **Estimated Effort:** 30 minutes.
* **Dependencies:** None.
* **Acceptance Criteria:** Public GET requests return only active hero slides and published blog posts.

---

### P1-3: Correct API HTTP Status Codes & Implement Centralized Error Handling
* **Issue:** Database crashes and timeouts return HTTP 400 (Bad Request) and leak raw tenant names.
* **Business / Engineering Impact:** Inaccurate REST semantics; sensitive infrastructure disclosure.
* **Evidence:** Probing live Render API returns `400` with Supabase project ID.
* **Recommended Change:** Implement Express error-handling middleware. Return HTTP 500 for internal errors and sanitize messages in production.
* **Estimated Effort:** 45 minutes.
* **Dependencies:** None.
* **Acceptance Criteria:** Database errors return HTTP 500 with a generic `"Internal Server Error"` message in production.

---

## 🛠 P2: Reliability, Testing & Maintainability (Medium Priority)

### P2-1: Establish Automated Test Suite (Vitest + Supertest)
* **Issue:** 0% test coverage; no automated test runner configured.
* **Business / Engineering Impact:** Inability to detect regressions; low recruiter credibility.
* **Evidence:** `backend/package.json` `"test"` script exits with error; 0 test files in repository.
* **Recommended Change:** Install Vitest and Supertest; implement test suites covering Hero CRUD, Blog CRUD, XSS sanitization, and status filtering.
* **Estimated Effort:** 3 hours.
* **Dependencies:** None.
* **Acceptance Criteria:** `npm test` executes and passes all test suites.

---

### P2-2: Resolve Linter Errors & Hoisting Warnings
* **Issue:** ESLint fails on `AdminPanel.jsx` (`fetchData` accessed before declaration, unused `err` variable).
* **Business / Engineering Impact:** Code quality violations; potential React hook bugs.
* **Evidence:** `npm --prefix frontend run lint` output.
* **Recommended Change:** Move `fetchData` definition above `useEffect` or wrap with `useCallback`; remove unused error variable.
* **Estimated Effort:** 20 minutes.
* **Dependencies:** None.
* **Acceptance Criteria:** `npm run lint` completes with 0 errors and 0 warnings.

---

### P2-3: Add Server Health Check & Graceful Shutdown
* **Issue:** No `/health` endpoint for uptime monitoring; server terminates abruptly on process signals.
* **Business / Engineering Impact:** Cloud platforms cannot determine container health; in-flight requests severed during redeployment.
* **Evidence:** `backend/server.js`.
* **Recommended Change:** Add `GET /health` checking database ping status; handle `SIGTERM` to close database pools gracefully.
* **Estimated Effort:** 45 minutes.
* **Dependencies:** None.
* **Acceptance Criteria:** `GET /health` returns `{ status: "ok", postgres: "connected", mongodb: "connected" }`.

---

## 🚀 P3: Performance & SEO Optimization (Low Priority)

### P3-1: Implement Route-Level Code Splitting
* **Issue:** Frontend production JS chunk is 584.8 kB (exceeds Vite recommended budget).
* **Evidence:** `vite build` terminal output.
* **Recommended Change:** Use `React.lazy()` and `Suspense` in `App.jsx` to load `AdminPanel` and `BlogDetail` on demand.
* **Estimated Effort:** 30 minutes.
* **Acceptance Criteria:** Initial bundle size reduced below 300 kB.

---

### P3-2: Standardize XML Sitemap & Add `robots.txt`
* **Issue:** Sitemap is served at `/api/sitemap` rather than `/sitemap.xml`; no `robots.txt` exists.
* **Evidence:** `backend/routes/sitemapRoutes.js`, `frontend/public/`.
* **Recommended Change:** Add `frontend/public/robots.txt` referencing `Sitemap: https://o8m-giakaa-cms.onrender.com/api/sitemap` (or configure a rewrite).
* **Estimated Effort:** 20 minutes.
* **Acceptance Criteria:** Navigating to `/robots.txt` displays valid sitemap reference.

---

## 💡 P4: Product Enhancements & Nice-to-Haves

* **P4-1: Cloud Object Storage (S3 / Cloudinary):** Replace manual image URL input fields with direct image binary uploads.
* **P4-2: Drag-and-Drop Slide Reordering:** Implement `@hello-pangea/dnd` for visual slide reordering in `AdminPanel.jsx`.
* **P4-3: Live Blog Preview Mode:** Allow editors to view formatted draft articles within the production website theme before publishing.
* **P4-4: Unified Database Migration:** Migrate `HeroSlide` and `Blog` into a single PostgreSQL database using Prisma ORM.
