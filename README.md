# 📚 LearnFlow — Full-Stack Learning Management System

> A modern, production-ready LMS built with the MERN Stack (MongoDB, Express, React, Node.js) featuring YouTube-powered video lessons, JWT authentication, role-based access, and real-time progress tracking.

![LearnFlow LMS](https://img.shields.io/badge/Stack-MERN-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Version](https://img.shields.io/badge/version-1.0.0-purple)

---

## ✨ Features

- 🎥 **YouTube Video Integration** — No local video storage, uses YouTube iframe embeds
- 🔐 **JWT Authentication** — Secure login/signup with token-based auth
- 👥 **Role-Based Access** — Student, Instructor, and Admin roles
- 📊 **Progress Tracking** — Per-lesson completion tracking with % progress bars
- 🔖 **Resume Learning** — Automatically resumes from last watched lesson
- 🔍 **Course Search & Filter** — Search by title, filter by category and level
- 📱 **Fully Responsive** — Works on mobile, tablet, and desktop
- 🌙 **Dark Theme** — Premium edtech UI inspired by Coursera/Udemy
- ⚙️ **Instructor Portal** — Create courses, manage lessons with YouTube IDs
- 🌱 **Seed Data** — Pre-loaded with 4 courses, 16 lessons, and 4 test accounts

---

## 🏗️ Project Structure

```
lms-project/
│
├── client/                      # React + Vite Frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js           # Axios HTTP client
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── CourseCard.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── SidebarLessons.jsx
│   │   │   └── ProgressBar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state management
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Courses.jsx
│   │   │   ├── CourseDetails.jsx
│   │   │   ├── LearningPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── InstructorPortal.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                      # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── lessonController.js
│   │   └── progressController.js
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT protect + authorize
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Lesson.js
│   │   └── Progress.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── lessonRoutes.js
│   │   └── progressRoutes.js
│   ├── server.js
│   ├── seed.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Optional: YouTube Data API v3 key

### 1. Clone / Navigate to the project

```bash
cd lms-project
```

### 2. Set up the Backend

```bash
cd server
npm install
```

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/lms
JWT_SECRET=lms_secret_key
YOUTUBE_KEY=YOUR_YOUTUBE_API_KEY
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> 💡 **Port conflict?** If you get `EADDRINUSE`, change `PORT` in `/server/.env` to any free port (e.g. `3001`, `8080`) and restart.

### 3. Seed the Database

```bash
cd server
npm run seed
```

This creates:
- 4 courses (JavaScript, React, Node.js, Python)
- 16 lessons with real YouTube video IDs
- 4 test accounts (see below)

### 4. Start the Backend

```bash
npm run dev
```

Server runs at `http://localhost:3000`

### 5. Set up the Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 🔐 Test Accounts

| Role       | Email              | Password     |
|------------|--------------------|--------------|
| Student    | alex@lms.com       | student123   |
| Instructor | sarah@lms.com      | password123  |
| Instructor | michael@lms.com    | password123  |
| Admin      | admin@lms.com      | admin123     |

> 💡 You can also use the **Quick Demo Login** buttons on the login page!

---

## 🌐 API Endpoints

### Authentication
| Method | Endpoint               | Access  | Description          |
|--------|------------------------|---------|----------------------|
| POST   | `/api/auth/signup`     | Public  | Register new user    |
| POST   | `/api/auth/login`      | Public  | Login                |
| GET    | `/api/auth/me`         | Private | Get current user     |

### Courses
| Method | Endpoint                     | Access              | Description         |
|--------|------------------------------|---------------------|---------------------|
| GET    | `/api/courses`               | Public              | Get all courses     |
| GET    | `/api/courses/:id`           | Public              | Get single course   |
| POST   | `/api/courses`               | Instructor/Admin    | Create course       |
| PUT    | `/api/courses/:id`           | Instructor/Admin    | Update course       |
| DELETE | `/api/courses/:id`           | Instructor/Admin    | Delete course       |
| POST   | `/api/courses/:id/enroll`    | Private             | Enroll in course    |

### Lessons
| Method | Endpoint                     | Access              | Description         |
|--------|------------------------------|---------------------|---------------------|
| GET    | `/api/lessons/:courseId`     | Public              | Get course lessons  |
| GET    | `/api/lessons/single/:id`    | Public              | Get single lesson   |
| POST   | `/api/lessons`               | Instructor/Admin    | Create lesson       |
| PUT    | `/api/lessons/:id`           | Instructor/Admin    | Update lesson       |
| DELETE | `/api/lessons/:id`           | Instructor/Admin    | Delete lesson       |

### Progress
| Method | Endpoint                        | Access  | Description             |
|--------|---------------------------------|---------|-------------------------|
| POST   | `/api/progress/update`          | Private | Mark lesson complete    |
| GET    | `/api/progress/:userId`         | Private | Get user progress       |
| GET    | `/api/progress/last/:courseId`  | Private | Get last watched lesson |
| GET    | `/api/progress/stats/me`        | Private | Get learning stats      |

---

## 🎥 YouTube Video Integration

The LMS stores only the **YouTube video ID** (11 characters) in the database.

**How it works:**
1. Instructor pastes a YouTube URL or video ID in the lesson form
2. The backend extracts the 11-character video ID
3. The lesson stores the ID in MongoDB
4. The frontend embeds the video via: `https://www.youtube.com/embed/{videoId}`

**Example video IDs used in seed data:**
- `K5KVEU3aaeQ`
- `hlGoQC332VM`
- `D1eL1EnxXXQ`
- `SyVMma1IkXM`

---

## 🎨 UI Highlights

| Feature               | Implementation                                |
|-----------------------|-----------------------------------------------|
| Dark theme            | Custom Tailwind palette in `tailwind.config.js` |
| Glassmorphism Navbar  | `backdrop-blur-md` with `bg-white/5`          |
| Hover animations      | CSS transitions + `group-hover` utilities     |
| Progress bars         | Gradient animated bars with dynamic colors   |
| Skeleton loaders      | `animate-pulse` on loading states            |
| Smooth page entries   | `animate-fade-in` / `animate-slide-up`        |

---

## ⚙️ Environment Variables

### Server `.env`

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/lms
JWT_SECRET=lms_secret_key
YOUTUBE_KEY=YOUR_YOUTUBE_API_KEY   # Optional: enables YouTube metadata fetch
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Note:** The YouTube API key is optional. Without it, video titles and thumbnails from YouTube API won't auto-populate, but the iframe embeds still work perfectly.

> **Port conflict (`EADDRINUSE`)?** Change `PORT` in `/server/.env` to any free port and restart. The server prints a helpful message if the port is taken.

---

## 🏭 Production Deployment

### Backend (Render / Railway)
1. Set all `.env` variables in the hosting platform's dashboard
2. Set `NODE_ENV=production`
3. Run command: `npm start`

### Frontend (Vercel / Netlify)
1. Update `vite.config.js` proxy or set `VITE_API_URL` environment variable
2. In `api.js`, change `baseURL` to your production API URL
3. Add `vercel.json` for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## 🛠️ Tech Stack

| Layer       | Technology                           |
|-------------|--------------------------------------|
| Frontend    | React 18, Vite, TailwindCSS          |
| Backend     | Node.js, Express.js                  |
| Database    | MongoDB Atlas + Mongoose             |
| Auth        | JWT + bcryptjs                       |
| HTTP Client | Axios                                |
| Video       | YouTube iframe embed + Data API v3   |
| Routing     | React Router v6                      |

---

*Built with ❤️ as a full-stack MERN LMS project*
