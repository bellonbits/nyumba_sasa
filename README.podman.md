# Nyumba Sasa — Podman Orchestration Guide

This guide details how to spin up, build, and run the entire **Nyumba Sasa** marketplace platform locally using **Podman** and **Podman Compose** (or Docker Compose running with a Podman socket). 

By leveraging Podman, you get a secure, **daemonless**, and **rootless** containerization stack running the Next.js frontend, FastAPI backend, and a PostgreSQL database.

---

## 🛠️ Prerequisites

Ensure you have Podman and Podman Compose installed:

### macOS (via Homebrew)
```bash
brew install podman podman-compose
podman machine init
podman machine start
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install -y podman podman-compose
```

---

## 🚀 Running the Stack

Our `docker-compose.yml` configures two core services:
1.  **`backend`**: FastAPI Python container listening on port `8000` (with auto-reloading Uvicorn mounts).
2.  **`postgres`**: PostgreSQL database container listening on host port `5433` (internal container port `5432`) for local sandbox operations.

The Next.js frontend is designed to be run directly on the host machine natively (using `npm run dev`), which provides maximum performance, absolute ease of local debugging, and instant hot-reloads.

### 1. Launch all background services (Backend & Postgres)
To spin up the containers in the foreground:
```bash
podman compose up
```

To run in the background (detached mode):
```bash
podman compose up -d
```

### 2. Force rebuild and start
If you modify package files, dependencies, or base Dockerfiles:
```bash
podman compose up --build
```

### 3. Stop the services
To safely shut down the container stack and networks:
```bash
podman compose down
```

To clear persisted database volumes as well:
```bash
podman compose down -v
```

---

## 🔒 Database Operations (Postgres)

You can easily interact with the containerized Postgres database to run queries, check schemas, or seed data.

### Connect to PostgreSQL Shell
```bash
podman exec -it nyumba_sasa_postgres psql -U postgres -d nyumbasasa
```

---

## ⚙️ Environment Overrides

You can easily override API urls, credentials, or Supabase tokens by defining them in a local `.env` file in the root directory. Podman Compose will automatically read and load these parameters into the containers:

```ini
# Example root .env configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-custom-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/nyumbasasa
```

---

## 💻 Running the Frontend Locally (Native Host)

Since the frontend service has been uncoupled from Podman, you run it directly on your local system for immediate feedback loops and full browser compatibility:

### 1. Install local dependencies
Ensure you are in the workspace root (`nyumba_sasa`) and install the Node packages:
```bash
npm install
```

### 2. Start the native Next.js Dev Server
To launch the Hot-Reloading Next.js development server locally (usually runs on `http://localhost:3000` or `http://localhost:3001` if port 3000 is occupied):
```bash
npm run dev
```

### 3. Build & Validate for Production
To perform a full static HTML export validation or verify that the native compile works flawlessly:
```bash
npm run build
```
