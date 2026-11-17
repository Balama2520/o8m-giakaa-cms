# Deployment, Hosting, and Live Infrastructure Audit — o8m Giakaa CMS

**Production Frontend:** [https://o8m-giakaa-cms.vercel.app/](https://o8m-giakaa-cms.vercel.app/)  
**Production Backend:** [https://o8m-giakaa-cms.onrender.com/api](https://o8m-giakaa-cms.onrender.com/api)  
**Hosting Providers:** Vercel (Frontend SPA) + Render (Node.js Web Service) + Supabase (PostgreSQL) + MongoDB Atlas (NoSQL)  
**Date of Audit:** November 16, 2026  
**Auditor:** DevOps & Site Reliability Engineer  

---

## 1. Live Deployment Matrix

| Component | Target URL | Expected Response | Actual Live HTTP Response | Evidence / Output | Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **Frontend Root** | `https://o8m-giakaa-cms.vercel.app/` | HTTP 200 (Home SPA) | **200 OK** | Serves HTML shell; falls back to static content | **DEGRADED** |
| **Frontend Route** | `https://o8m-giakaa-cms.vercel.app/blogs` | HTTP 200 (Blog Catalog) | **404 NOT_FOUND** | `The page could not be found NOT_FOUND` | **DOWN** |
| **Frontend Route** | `https://o8m-giakaa-cms.vercel.app/admin` | HTTP 200 (Admin CMS) | **404 NOT_FOUND** | `The page could not be found NOT_FOUND` | **DOWN** |
| **Backend Root** | `https://o8m-giakaa-cms.onrender.com/` | API Status / Health | **404 Cannot GET /** | Express default 404 HTML | **DOWN** |
| **Backend Hero API**| `https://o8m-giakaa-cms.onrender.com/api/hero` | HTTP 200 (Slide list) | **400 Bad Request** | `{"success":false,"error":"(ENOTFOUND) tenant/user postgres.tkombxcbkwydtlvknarn not found"}` | **BROKEN** |
| **Backend Blog API**| `https://o8m-giakaa-cms.onrender.com/api/blogs` | HTTP 200 (Blog list) | **400 Bad Request** | `{"success":false,"error":"Operation blogs.find() buffering timed out after 10000ms"}` | **BROKEN** |
| **Backend Sitemap** | `https://o8m-giakaa-cms.onrender.com/api/sitemap` | HTTP 200 (XML) | **500 Server Error** | Times out waiting on MongoDB connection | **BROKEN** |

---

## 2. Infrastructure Failure Diagnosis

### 2.1 Failure 1: Missing SPA Rewrites on Vercel (Deep Link 404s)
* **Observed Symptom:** Navigating directly to `https://o8m-giakaa-cms.vercel.app/blogs` or refreshing the `/admin` page returns a raw Vercel 404 error page.
* **Root Cause:**
  - Vercel functions as a static file server for frontends unless configured with routing rewrites.
  - When a user requests `/blogs`, Vercel searches the deployment bundle for a static file named `blogs` or `blogs.html`.
  - Because no `vercel.json` file exists in the repository, Vercel fails to route client requests back to `index.html`.
* **Remediation:**
  Create `frontend/vercel.json` with the standard single-page application rewrite rule:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```

---

### 2.2 Failure 2: Supabase PostgreSQL Project Deletion / Pausing
* **Observed Symptom:**
  Probing `GET https://o8m-giakaa-cms.onrender.com/api/hero` returns:
  ```json
  {
    "success": false,
    "error": "(ENOTFOUND) tenant/user postgres.tkombxcbkwydtlvknarn not found"
  }
  ```
* **Root Cause:**
  - The PostgreSQL database host configured on Render is `db.tkombxcbkwydtlvknarn.supabase.co`.
  - Supabase automatically pauses free-tier database projects after 7 consecutive days of inactivity.
  - When paused, Supabase removes the project's dedicated DNS record. Any DNS query for `db.tkombxcbkwydtlvknarn.supabase.co` results in `ENOTFOUND` (Host Not Found).
* **Remediation:**
  1. Log into Supabase dashboard and unpause project `tkombxcbkwydtlvknarn`, or provision a fresh PostgreSQL instance on Neon or Render.
  2. Update environment variables in the Render dashboard with the new database host, user, and password.

---

### 2.3 Failure 3: MongoDB Atlas Query Buffering Timeout
* **Observed Symptom:**
  Probing `GET https://o8m-giakaa-cms.onrender.com/api/blogs` stalls for exactly 10 seconds before returning:
  ```json
  {
    "success": false,
    "error": "Operation `blogs.find()` buffering timed out after 10000ms"
  }
  ```
* **Root Cause:**
  - In Mongoose, if `mongoose.connect()` fails during server boot, Mongoose enters a buffering state where queries are held in memory awaiting reconnection.
  - Render's outbound IP addresses are dynamically assigned. If MongoDB Atlas has not enabled "Allow Access from Anywhere" (`0.0.0.0/0`), Atlas drops all incoming TCP connection packets from Render.
  - After 10,000 ms, Mongoose exhausts its buffer timeout and throws an exception.
* **Remediation:**
  1. Access the MongoDB Atlas Network Access dashboard.
  2. Ensure IP Access List includes `0.0.0.0/0` (Allow access from anywhere).
  3. Verify database user credentials in `MONGO_URI`.

---

## 3. Environment Variable Inconsistencies

| Variable Name | Documented in `.env.example` | Code Location | Production Host | Issue / Discrepancy |
| :--- | :---: | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | Not parsed in `postgres.js` | Render | `.env.example` advertises `DATABASE_URL`, but backend code only parses individual `POSTGRES_*` variables. |
| `VITE_API_URL` | **No** | `frontend/src/utils/api.js` | Vercel | Essential frontend configuration missing from documentation. |
| `VITE_SITE_URL` | **No** | `backend/routes/sitemapRoutes.js`<br>`frontend/src/pages/BlogDetail.jsx` | Render / Vercel | Backend reads a `VITE_` prefixed variable; missing from all templates. |
| `NODE_ENV` | **Yes** | `backend/server.js` | Render | Server logs environment, but error handlers do not check `NODE_ENV` to suppress stack traces. |

---

## 4. Step-by-Step Restoration Plan

1. **Step 1: Fix Frontend Edge Routing**  
   Add `frontend/vercel.json` containing SPA rewrites so that `/blogs`, `/blog/:slug`, and `/admin` can be refreshed without 404 errors.
2. **Step 2: Restore PostgreSQL Service**  
   Create a persistent PostgreSQL database on Neon or unpause Supabase project `tkombxcbkwydtlvknarn`. Update `backend/config/postgres.js` to support `DATABASE_URL`.
3. **Step 3: Whitelist MongoDB Atlas Network Egress**  
   Add `0.0.0.0/0` to MongoDB Atlas IP Access list.
4. **Step 4: Update Render Environment Variables**  
   Configure `DATABASE_URL` and `MONGO_URI` in Render service dashboard.
5. **Step 5: Implement Backend Health Check**  
   Mount `GET /health` in `server.js` returning database connectivity status for both PostgreSQL and MongoDB to enable zero-downtime deployment health checks.
