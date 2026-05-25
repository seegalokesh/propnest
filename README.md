# 🏠 PropNest — Real Estate Property Management System

> A full-stack, production-ready real estate platform built with React, Node.js, Express, and SQLite.

---

## ✨ Features

- **Multi-role access**: Admin, Agent, Seller, Buyer — each with tailored dashboards
- **Property listings** with image gallery, filters (city, type, price, status), and pagination
- **Site visit booking** with date/time selection and duplicate prevention
- **Buyer inquiries** with agent response workflow
- **Favorites** — save and revisit properties
- **Side-by-side property comparison** (up to 3 properties)
- **Multi-step property listing form** for sellers
- **Agent dashboard** — leads, visits, assigned properties, closed sales
- **Admin dashboard** — KPI cards, Recharts revenue bar chart, top agents table, full CRUD
- **Sales recording** with automatic 2% commission calculation
- **JWT-based authentication** with role-based route protection
- **Indian Rupee formatting** (₹ 45,00,000 / ₹ 4.50 Cr)

---

## 🔧 Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, Vite, React Router v6, Recharts, Lucide |
| Backend    | Node.js, Express 4, express-validator, JWT      |
| Database   | SQLite via better-sqlite3 (WAL mode, FK enabled)|
| Auth       | bcryptjs, jsonwebtoken                          |
| Styling    | Pure CSS variables — dark luxury theme          |

---

## 📦 Prerequisites

- Node.js 18+ and npm
- Git

---

## 🚀 Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-username/propnest.git
cd propnest

# 2. Backend setup
cd backend
cp .env.example .env          # fill in JWT_SECRET
npm install
npm run seed                  # creates DB + seeds demo data
npm run dev                   # starts on http://localhost:5000

# 3. Frontend setup (new terminal)
cd ../frontend
cp .env.example .env          # set VITE_API_URL
npm install
npm run dev                   # starts on http://localhost:5173
```

---

## 🔐 Demo Credentials

| Role   | Email              | Password   |
|--------|--------------------|------------|
| Admin  | admin@demo.com     | Admin@123  |
| Agent  | agent@demo.com     | Agent@123  |
| Seller | seller@demo.com    | Seller@123 |
| Buyer  | buyer@demo.com     | Buyer@123  |

> **Quick Login**: The login page has one-click demo buttons for all four roles.

---

## 🌐 Environment Variables

### Backend (`backend/.env`)

| Variable         | Default                            | Description                   |
|------------------|------------------------------------|-------------------------------|
| `PORT`           | `5000`                             | Server port                   |
| `JWT_SECRET`     | *(required)*                       | Secret for JWT signing        |
| `JWT_EXPIRES_IN` | `7d`                               | Token expiry                  |
| `DB_PATH`        | `./propnest.db`                    | SQLite database file path     |
| `FRONTEND_URL`   | `http://localhost:5173`            | CORS allowed origin           |

### Frontend (`frontend/.env`)

| Variable        | Default                   | Description          |
|-----------------|---------------------------|----------------------|
| `VITE_API_URL`  | `http://localhost:5000`   | Backend API base URL |

---

## 📡 API Endpoints Summary

| Method | Endpoint                        | Auth             | Description                          |
|--------|---------------------------------|------------------|--------------------------------------|
| POST   | /api/auth/register              | —                | Register new user                    |
| POST   | /api/auth/login                 | —                | Login, returns JWT                   |
| GET    | /api/auth/me                    | Bearer token     | Get current user                     |
| GET    | /api/properties                 | —                | List all (filter: location,type,price)|
| GET    | /api/properties/:id             | —                | Property detail with images          |
| POST   | /api/properties                 | seller/admin     | Create listing                       |
| PUT    | /api/properties/:id/status      | agent/admin      | Update status                        |
| DELETE | /api/properties/:id             | seller/admin     | Delete listing                       |
| POST   | /api/site-visits                | buyer            | Book visit (dupe check)              |
| GET    | /api/site-visits                | auth             | Role-filtered list                   |
| PUT    | /api/site-visits/:id/status     | agent/admin      | Update visit status                  |
| POST   | /api/inquiries                  | buyer            | Submit inquiry                       |
| GET    | /api/inquiries                  | auth             | Role-filtered inquiries              |
| PUT    | /api/inquiries/:id/status       | agent/admin      | Respond/close inquiry                |
| GET    | /api/agents                     | —                | List all agents                      |
| GET    | /api/agents/:id/leads           | auth             | Agent leads (inquiries + visits)     |
| POST   | /api/sales                      | admin/agent      | Record sale (auto 2% commission)     |
| GET    | /api/sales                      | admin/agent      | List sales                           |
| POST   | /api/favorites/:propertyId      | buyer            | Toggle favorite                      |
| GET    | /api/favorites                  | buyer            | List favorites                       |
| GET    | /api/dashboard/admin            | admin            | Full admin stats                     |
| GET    | /api/dashboard/agent            | agent            | Agent-specific stats                 |

---

## 🗂 Project Structure

```
propnest/
├── backend/
│   ├── db/
│   │   ├── database.js        # SQLite connection (WAL, FK ON)
│   │   ├── migrations.js      # CREATE TABLE statements (10 tables)
│   │   └── seed.js            # Demo data seeder
│   ├── middleware/
│   │   ├── auth.js            # JWT verify + requireRole()
│   │   └── errorHandler.js    # Global error handler
│   ├── routes/
│   │   ├── auth.js
│   │   ├── properties.js
│   │   ├── siteVisits.js
│   │   ├── inquiries.js
│   │   ├── agents.js
│   │   ├── sales.js
│   │   ├── dashboard.js
│   │   └── favorites.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/index.js            # Axios instance + all API calls
    │   ├── context/AuthContext.jsx # Auth state, login/logout helpers
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── PropertyCard.jsx
    │   │   ├── FilterBar.jsx
    │   │   ├── ImageGallery.jsx
    │   │   ├── Modal.jsx
    │   │   ├── StatusBadge.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── EmptyState.jsx
    │   │   └── PrivateRoute.jsx
    │   └── pages/
    │       ├── PropertyList.jsx
    │       ├── PropertyDetail.jsx
    │       ├── Login.jsx
    │       ├── Register.jsx
    │       ├── BookVisit.jsx
    │       ├── Favorites.jsx
    │       ├── Compare.jsx
    │       ├── PostProperty.jsx
    │       ├── AgentDashboard.jsx
    │       ├── AdminDashboard.jsx
    │       └── InquiryManagement.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ☁️ Deployment

### Backend → Render

1. Push backend folder to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Add environment variables in Render dashboard
6. Set `DB_PATH=/var/data/propnest.db` and attach a **Persistent Disk** at `/var/data`

### Frontend → Vercel

1. Push frontend folder to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set `VITE_API_URL` to your Render backend URL
4. `vercel.json` already handles SPA routing rewrites

---

## 📸 Screenshots

> *(Add screenshots here after deployment)*

---

## 📄 License

MIT — free to use, modify and distribute.
