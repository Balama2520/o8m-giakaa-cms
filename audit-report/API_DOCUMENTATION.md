# API Specification & Technical Documentation — o8m Giakaa CMS

**Base URL (Local):** `http://localhost:5000/api`  
**Base URL (Production):** `https://o8m-giakaa-cms.onrender.com/api`  
**Content-Type:** `application/json` (except `/api/sitemap` which returns `application/xml`)  
**Global Authentication:** None (All endpoints are completely unauthenticated)

---

## 1. Hero Slide Endpoints (PostgreSQL via Sequelize)

### 1.1 `GET /api/hero`
* **Purpose:** Retrieve all hero slides ordered by display priority.
* **Controller/Handler:** `backend/routes/heroRoutes.js` (lines 7-16)
* **Database:** PostgreSQL (`hero_slides` table)
* **Authentication:** None
* **Query Parameters:** None supported
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "title": "Empowering Enterprise",
        "description": "AI-first consulting firm delivering high-impact solutions.",
        "mediaUrl": "https://example.com/banner.jpg",
        "ctaText": "Learn More",
        "ctaLink": "https://example.com/services",
        "displayOrder": 1,
        "isActive": true,
        "createdAt": "2026-02-10T06:00:00.000Z",
        "updatedAt": "2026-02-10T06:00:00.000Z"
      }
    ]
  }
  ```
* **Error Response (400 Bad Request):**
  ```json
  {
    "success": false,
    "error": "Database connection error message"
  }
  ```
* **Architectural Findings & Flaws:**
  - **Inactive Slide Leakage:** The Sequelize query executes `HeroSlide.findAll({ order: [['display_order', 'ASC']] })` with no `where: { isActive: true }`. Inactive slides are returned in the response and filtered only on the client.
  - **Status Code Defect:** Throws HTTP 400 (Bad Request) instead of HTTP 500 when database connectivity fails.

---

### 1.2 `POST /api/hero`
* **Purpose:** Create a new hero slide.
* **Controller/Handler:** `backend/routes/heroRoutes.js` (lines 20-27)
* **Database:** PostgreSQL (`hero_slides` table)
* **Authentication:** None (Public write access)
* **Request Body:**
  ```json
  {
    "title": "Required slide title (Max 200 chars)",
    "description": "Optional slide description text",
    "mediaUrl": "https://example.com/image.jpg",
    "ctaText": "Explore Now",
    "ctaLink": "https://example.com/link",
    "displayOrder": 2,
    "isActive": true
  }
  ```
* **Validation:** Relies on Sequelize schema validation (`title` cannot be null). No route-level sanitization or URL validation.
* **Success Response (201 Created):** Returns `{ "success": true, "data": { ...createdRecord } }`.
* **Error Response (400 Bad Request):** Returns `{ "success": false, "error": "notNull Violation: HeroSlide.title cannot be null" }`.

---

### 1.3 `PUT /api/hero/:id`
* **Purpose:** Update an existing hero slide by ID.
* **Controller/Handler:** `backend/routes/heroRoutes.js` (lines 31-42)
* **Database:** PostgreSQL (`hero_slides` table)
* **Authentication:** None (Public write access)
* **URL Parameters:** `id` (Integer - Primary Key)
* **Success Response (200 OK):** Returns `{ "success": true, "data": { ...updatedRecord } }`.
* **Error Responses:**
  - `404 Not Found`: `{ "success": false, "error": "Slide not found" }`
  - `400 Bad Request`: Validation failure or database error.

---

### 1.4 `DELETE /api/hero/:id`
* **Purpose:** Permanently remove a hero slide.
* **Controller/Handler:** `backend/routes/heroRoutes.js` (lines 46-57)
* **Database:** PostgreSQL (`hero_slides` table)
* **Authentication:** None (Public delete access)
* **URL Parameters:** `id` (Integer)
* **Success Response (200 OK):** `{ "success": true, "data": {} }`.
* **Error Responses:** `404 Not Found` if record does not exist; `400 Bad Request` on failure.

---

## 2. Blog Endpoints (MongoDB via Mongoose)

### 2.1 `GET /api/blogs`
* **Purpose:** List blog posts with optional status filtering.
* **Controller/Handler:** `backend/routes/blogRoutes.js` (lines 7-16)
* **Database:** MongoDB (`blogs` collection)
* **Authentication:** None
* **Query Parameters:**
  - `status` (Optional): `'published'` or `'draft'`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "67a998b3c3e218206d2524a1",
        "title": "Scaling Enterprise AI Architectures",
        "slug": "scaling-enterprise-ai-architectures",
        "content": "<p>Content body sanitized on creation...</p>",
        "metaTitle": "Scaling Enterprise AI",
        "metaDescription": "In-depth guide to enterprise AI scalability.",
        "featuredImage": "https://example.com/ai.jpg",
        "status": "published",
        "createdAt": "2026-02-10T06:15:00.000Z",
        "updatedAt": "2026-02-10T06:15:00.000Z"
      }
    ]
  }
  ```
* **Architectural Findings & Flaws:**
  - **Draft Leakage:** When requested without `?status=published`, `Blog.find({})` returns all posts, exposing internal drafts to the public.
  - **No Pagination:** Loads entire collection into memory; susceptible to DoS under large datasets.
  - **NoSQL Injection:** `req.query.status` is passed directly to the query object `{ status: req.query.status }`. If an object payload like `?status[$ne]=null` is passed, it executes unvalidated MongoDB operators.

---

### 2.2 `GET /api/blogs/:slug`
* **Purpose:** Retrieve a single blog post by its URL-friendly slug.
* **Controller/Handler:** `backend/routes/blogRoutes.js` (lines 20-30)
* **Database:** MongoDB (`blogs` collection)
* **Authentication:** None
* **URL Parameters:** `slug` (String)
* **Success Response (200 OK):** Returns `{ "success": true, "data": { ...blogDocument } }`.
* **Error Responses:**
  - `404 Not Found`: `{ "success": false, "error": "Blog not found" }`
  - `400 Bad Request`: Database failure.
* **Architectural Findings:** Does not check `status === 'published'`. Draft blogs can be accessed directly if their slug is known or guessed.

---

### 2.3 `POST /api/blogs`
* **Purpose:** Create a new blog post.
* **Controller/Handler:** `backend/routes/blogRoutes.js` (lines 34-41)
* **Database:** MongoDB (`blogs` collection)
* **Authentication:** None (Public write access)
* **Request Body:**
  ```json
  {
    "title": "My Post Title (Required, unique, max 100 chars)",
    "content": "HTML rich text content (Required)",
    "metaTitle": "SEO title (Max 60 chars)",
    "metaDescription": "SEO meta description (Max 160 chars)",
    "featuredImage": "https://example.com/image.jpg",
    "status": "draft"
  }
  ```
* **Validation & Hooks:**
  - Mongoose validates `title` and `content`.
  - `pre('save')` generates `slug` from `title` via `slugify`.
  - `pre('save')` sanitizes `content` via `sanitize-html`.
* **Success Response (201 Created):** `{ "success": true, "data": { ...createdBlog } }`.

---

### 2.4 `PUT /api/blogs/:id`
* **Purpose:** Update an existing blog post by its MongoDB ObjectId.
* **Controller/Handler:** `backend/routes/blogRoutes.js` (lines 45-62)
* **Database:** MongoDB (`blogs` collection)
* **Authentication:** None (Public write access)
* **URL Parameters:** `id` (24-character hexadecimal MongoDB ObjectId)
* **Request Body:** Any subset of blog fields.
* **CRITICAL VULNERABILITY & FLAW:**
  ```javascript
  // blogRoutes.js line 53
  blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
  });
  ```
  - `findByIdAndUpdate` **does not trigger Mongoose `pre('save')` hooks**.
  - **XSS Sanitization Bypass:** Any script payload submitted in `content` is persisted directly into the database without sanitization.
  - **Slug Staleness:** Updating the `title` fails to regenerate the `slug`.

---

### 2.5 `DELETE /api/blogs/:id`
* **Purpose:** Permanently delete a blog post.
* **Controller/Handler:** `backend/routes/blogRoutes.js` (lines 66-77)
* **Database:** MongoDB (`blogs` collection)
* **Authentication:** None (Public delete access)
* **URL Parameters:** `id` (MongoDB ObjectId)
* **Success Response (200 OK):** `{ "success": true, "data": {} }`.
* **Error Responses:** `404 Not Found` if not found; `400 Bad Request` on failure.

---

## 3. SEO & Discovery Endpoints

### 3.1 `GET /api/sitemap`
* **Purpose:** Dynamically generate an XML sitemap of all published blog posts and core routes.
* **Controller/Handler:** `backend/routes/sitemapRoutes.js` (lines 7-39)
* **Database:** MongoDB (`blogs` collection)
* **Response Content-Type:** `application/xml`
* **Success Response (200 OK):**
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://o8m-giakaa-cms.vercel.app</loc>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>https://o8m-giakaa-cms.vercel.app/blogs</loc>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>
    <url>
      <loc>https://o8m-giakaa-cms.vercel.app/blog/scaling-enterprise-ai</loc>
      <lastmod>2026-02-10</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>
  </urlset>
  ```
* **Architectural Findings & Flaws:**
  - **Non-Standard URI:** Search crawlers query `/sitemap.xml` at domain root, not `/api/sitemap`.
  - **Missing Environment Documentation:** Reads `process.env.VITE_SITE_URL` on the backend, which is undocumented in `backend/.env.example`.
