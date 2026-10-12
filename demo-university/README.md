# 🎓 Apex State University — School Management & Academic Registry

A standalone, full-stack **Student Information System (SIS) and Academic Registry** simulating a realistic university school portal with an embedded database, student records, courses, and an outbound background sync bridge to the **Vaasone Trust Network**.

---

## 🏛️ Architecture & Concept

A real university website or school management system:
1. **Never exposes blockchain or crypto details to academic staff**: Registrars, professors, and admissions officers work inside a familiar School Management System (managing students, rolls, classes, faculties, and degrees).
2. **Maintains its own sovereign database**: The university runs its own database (PostgreSQL, MySQL, SQLite, Oracle, or MongoDB).
3. **Connects via Outbound Background Sync**: When registrar staff register, graduate, or update student credentials, a lightweight background event handler pushes the cryptographic digest to Vaasone's Trust Gateway.

---

## 🗄️ Database & Data

- **Database Engine**: SQLite (via `better-sqlite3` in `data/university.sqlite`) with schema for students, settings, and audit logs.
- **Pre-seeded Records**: Seeded with **325+ realistic student records** across Computing, Engineering, Medicine, Law, Sciences, and Arts.
- **REST API**:
  - `GET /api/students` — Paginated student directory with search and filter.
  - `POST /api/students` — Register a new student.
  - `PUT /api/students/:id` — Update student records.
  - `DELETE /api/students/:id` — Archive / withdraw student record.
  - `GET /api/stats` — Academic session metrics and graduate breakdown.
  - `GET /api/settings` & `POST /api/settings` — External registry gateway configuration.

---

## 🚀 Running the University Portal

```bash
cd demo-university
node server.js
```

The portal runs on **`http://localhost:3001`**.

---

## ⚙️ External Gateway Integration

In the portal UI under **Settings**:
- **Gateway Endpoint**: `http://localhost:3000/api/v1/institutions/sync` (or your live Vaasone deployment URL)
- **Institution Slug**: `apex-university`
- **Automatic Sync**: Toggle on/off to silently dispatch records to the Vaasone trust gateway.

---

## ☁️ Deploying to Railway

You can deploy the Apex State University portal directly to [Railway](https://railway.app):

### Step 1: Push / Connect to Railway
1. In your Railway project, click **New Service** → **GitHub Repo** (select this repository).
2. Set the **Root Directory** to `demo-university`.

### Step 2: Configure Environment Variables
Add the following variables under the service's **Variables** tab:
| Variable | Value | Description |
|---|---|---|
| `PORT` | `3001` (or leave default, Railway assigns dynamically) | HTTP server port |
| `VAASONE_URL` | `https://your-vaasone-domain.com/api/v1/institutions/sync` | Live Vaasone trust gateway webhook endpoint |
| `INSTITUTION_SLUG` | `apex-university` | Organization identifier slug matching Vaasone |
| `INSTITUTION_NAME` | `Apex State University` | Display institution name |

### Step 3: (Recommended) Persistent Volume for SQLite
Under **Settings** → **Volumes**:
- Mount path: `/app/data`
- This ensures any added/edited student records persist across Railway restarts and redeployments!

### Step 4: Verify Deployment
Railway will build the Docker container using `Dockerfile` and start the server. You will be given a public URL (e.g. `https://apex-university-production.up.railway.app`).
Visit the URL to access the live University SIS portal!

