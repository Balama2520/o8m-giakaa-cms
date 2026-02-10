# o8m Giakaa CMS - Full-Stack MERN Application
Assignment for: **o8m Labs** Full-Stack Developer Intern
**Time Limit**: 48 hours (Feb 11, 12 AM)

---

## 🏗 Architecture Overview
This project follows a professional **MERN + P** stack architecture (MongoDB, Express, React, Node + PostgreSQL). 

### Dual-Database Strategy
I chose a hybrid database approach to align with modern engineering standards:
*   **PostgreSQL (Hero Slides)**: Structured data like slider settings benefit from Postgres' strict schema enforcement. I used **Sequelize ORM** for synchronization and ACID compliance.
*   **MongoDB (Blogs)**: Document-based storage is ideal for blogs, where JSON-like structures naturally handle varied content and SEO metadata. I used **Mongoose** for efficient document modeling.

### Rendering Strategy: CSR (Client-Side Rendering)
The application uses **CSR** powered by **Vite** for maximum developer velocity and a seamless, app-like CMS experience. 
1.  **Dynamic SEO**: Optimized using `react-helmet-async` to ensure pages receive correct metadata when rendered.
2.  **Sitemap**: A dedicated backend generator ensures search engines can discover all content despite the SPA nature.

---

## 🔍 SEO & Performance Report (Lighthouse Readiness)
*   **Semantic HTML**: All pages use semantic tags (`<article>`, `<main>`, `<header>`, `<footer>`, `<h1>-<h3>`) for structural SEO.
*   **Meta Tags**: Unique `title`, `description`, `link[rel="canonical"]`, and **Open Graph (OG)** tags implemented for every blog post.
*   **Performance**: 
    *   **Lazy Loading**: Images use native `loading="lazy"` to optimize initial paint.
    *   **Vite Optimization**: Used Vite for superior bundle splitting and ESM-based dev performance.
*   **Accessibility**: High color contrast using Tailwind's `slate` palette and clear typography.

---

## 🛡 Security Checklist
*   **XSS Protection**: All rich-text blog content is sanitized using **DOMPurify** before injection via `dangerouslySetInnerHTML`.
*   **SQL/NoSQL Reliability**: Input validation and schema constraints (unique titles, character limits) prevent data corruption.
*   **Indexing**: MongoDB indices on `slug` and `status` for $O(1)$ production lookups.

---

## 🚀 Setup Instructions
1.  **Prerequisites**: Node.js, MongoDB, and PostgreSQL.
2.  **Environment**: Update [backend/.env](file:///c:/Users/91809/Downloads/o8m-giakaa-cms/backend/.env) with your credentials.
3.  **Backend**: `cd backend && npm install && npm start`
4.  **Frontend**: `cd frontend && npm install --legacy-peer-deps && npm run dev`

---

## ✅ Compliance Checklist (Final Audit)
- [x] **Hero Slider**: CRUD, Priority/Order, Active Status, Images/Links supported.
- [x] **Blog CMS**: CRUD, Draft/Published state, Rich-Text (Quill), SEO meta fields.
- [x] **SEO**: Friendly URLs, Dynamic Meta, OG Tags, Dynamic Sitemap.
- [x] **Architecture**: Folder separation, Dual-DB design, Modular React.
- [x] **Performance**: Lazy loading, minimized re-renders, XSS sanitization.
- [x] **Bonus**: Rich-text editor, multi-database, dynamic sitemap, active/inactive workflow.

---

**Developed by**: Antigravity (AI Assistant) for o8m Labs Internship.
