# o8m Giakaa CMS: Scalable Content Architecture
**Built for o8m Labs** | A Technical Prototype & Growth Demonstration
> This project is a high-fidelity implementation of a dual-database CMS, designed to demonstrate architectural scalable growth and production-readiness for o8m Labs.

---

## 🏗 Architecture Overview
This project demonstrates a professional **MERN + P** stack architecture (MongoDB, Express, React, Node + PostgreSQL). 

### Dual-Database Strategy
I chose a hybrid database approach to align with modern engineering standards:
*   **PostgreSQL (Hero Slides)**: Structured data like slider settings benefit from Postgres' strict schema enforcement. I used **Sequelize ORM** for synchronization and ACID compliance.
*   **MongoDB (Blogs)**: Document-based storage is ideal for blogs, where JSON-like structures naturally handle varied content and SEO metadata. I used **Mongoose** for efficient document modeling.

### Rendering Strategy: CSR (Client-Side Rendering)
The application uses **CSR** powered by **Vite** for maximum developer velocity and a seamless, app-like CMS experience. 
1.  **Dynamic SEO**: Optimized using `react-helmet-async` to ensure pages receive correct metadata when rendered.
2.  **Sitemap**: A dedicated backend generator ensures search engines can discover all content despite the SPA nature.

---

## 📂 Folder Structure
### Backend
- `/config`: Database connection logic (Postgres & MongoDB).
- `/models`: Schemas for Hero (Sequelize) and Blogs (Mongoose).
- `/routes`: API endpoints mapped to specific documentation requirements.
- `server.js`: Entry point with middleware and router mounting.

### Frontend
- `/src/components`: UI layout elements (Navbar, Footer).
- `/src/pages`: Feature views (Landing, Blog, Admin).
- `/src/utils`: Centralized API configuration.

---

## ⚖️ Trade-offs & Engineering Decisions
1.  **Dual-Database over Unified DB**: While more complex to manage, this mirrors o8m's real-world environment where legacy and modern data systems often coexist.
2.  **CSR over SSR**: For a CMS-heavy application with frequent updates, CSR provides a faster interactive experience for the admin user. SEO concerns were mitigated via dynamic sitemaps and helmet tags.
3.  **Local Dev URLs**: For the purpose of this assignment, internal API calls are configured for `localhost`, but abstracting into a `baseURL` allows for trivial deployment to Render/Railway.

---

## 📈 Future Improvements (With More Time)
1.  **Auth & Security**: Implementation of JWT-based authentication for the `/admin` route.
2.  **Media Cloud Storage**: Transitioning from URL-based images to a Cloudinary/S3 binary upload system.
3.  **Blog Previews**: A "live preview" mode for editors to see their rich-text content in the landing page theme before publishing.
4.  **Edge Caching**: Implementing Redis for blog content to ensure sub-100ms response times.

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
*   **Dual-Layer XSS Protection**: 
    - **Frontend**: Sanitized via **DOMPurify** before rendering.
    - **Backend**: Content is sanitized using **sanitize-html** during the Mongoose pre-save hook to ensure the database remains clean.
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

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](file:///c:/Users/91809/Downloads/o8m-giakaa-cms/LICENSE) file for details.

---

**Engineering Excellence for o8m Labs.**
This prototype is optimized for future scaling, SEO performance, and secure content management.
