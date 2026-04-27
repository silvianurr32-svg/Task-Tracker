# TaskTracker

Task management app where you **must upload tracker** before marking a task complete.

## Color Palette
- Background `#fef6e4` · Headline `#001858` · Paragraph `#172c66`
- Button `#f582ae` · Sky `#8bd3dd` · Skin `#f3d2c1`

---

## Setup & Run (Local)

### Prerequisites
- Node.js 18+
- npm

---

### 1. Backend

```bash
cd backend
npm install
node server.js
# Running on http://localhost:3001
```

### 2. Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

### 3. Open
Visit **http://localhost:5173** → Register → start adding tasks.

---

## Project Structure

```
taskproof/
├── backend/
│   ├── server.js        # Express + session auth + multer
│   ├── database.js      # SQLite schema (auto-creates taskproof.db)
│   ├── package.json
│   └── uploads/         # Proof images stored here (auto-created)
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── api.js
        ├── index.css
        ├── hooks/
        │   └── useAuth.jsx
        ├── components/
        │   ├── Toast.jsx
        │   ├── StatusBadge.jsx
        │   ├── ProofUpload.jsx   ← drag & drop
        │   └── TaskModal.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            └── Dashboard.jsx
```

---

## Task Workflow

```
pending → in_progress → awaiting_proof → completed
                              ↑
                     (upload screenshot here)
```

"Mark Complete" button is **disabled** until proof image is uploaded.

---

## API Endpoints

| Method | Path                    | Description         |
|--------|-------------------------|---------------------|
| POST   | /api/auth/register      | Create account      |
| POST   | /api/auth/login         | Sign in             |
| POST   | /api/auth/logout        | Sign out            |
| GET    | /api/auth/me            | Current user        |
| GET    | /api/tasks              | List tasks          |
| POST   | /api/tasks              | Create task         |
| PUT    | /api/tasks/:id          | Update task/status  |
| DELETE | /api/tasks/:id          | Delete task         |
| POST   | /api/tasks/:id/proof    | Upload proof image  |
