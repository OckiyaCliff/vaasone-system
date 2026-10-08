# 🏛️ Apex State University — Academic Registry & SIS Demo

This project simulates a **real-world university Student Information System (SIS)** and Academic Registry. It demonstrates the **Reverse Integration Architecture** of the Vaasone Trust Network.

---

## 💡 The Problem & Architecture Shift

### The Old Way (Manual / Import-Based)
Traditionally, platforms expected universities to export CSV/Excel spreadsheets, log into a third-party website, and manually upload files. In production, this model fails:
- Universities have established registry software (e.g., Banner, Oracle PeopleSoft, PowerSchool, or custom database portals).
- Staff forget or make mistakes during periodic manual imports.
- Revocations and disciplinary actions take days or weeks to synchronize.

### The New Reverse Architecture (Direct Outbound Connector)
With the Vaasone Reverse Integration Architecture:
1. **The University keeps its own database.**
2. When the University Registrar takes any action in their internal system:
   - **Adds a Graduate** ➔ Calls Vaasone `action: 'issue'`, hashes canonical data, and anchors on the **Stellar Blockchain**.
   - **Revokes a Certificate** ➔ Calls Vaasone `action: 'revoke'`, immediately broadcasting an on-chain revocation.
   - **Updates a Record** (e.g. classification or degree correction) ➔ Calls Vaasone `action: 'update'`, issuing a new cryptographically anchored version.
   - **One-Click Batch Sync** ➔ Reconciles the university registry with the Vaasone Trust Layer.
3. **Employers and public verifiers** can instantly verify certificates on the Vaasone search portal with zero manual intervention by the university IT team.

---

## 🚀 Quick Start (Running Locally)

### Prerequisites
- Node.js v18+ (v20+ recommended)
- The main Vaasone system running on `http://localhost:3000` (optional, but needed for live blockchain anchoring)

### Run the Server
From the project root:
```bash
# Option 1: Using npm script from repository root
npm run demo:university

# Option 2: Running directly from the demo-university directory
cd demo-university
node server.js
```

The portal will start on **`http://localhost:3001`**.

---

## 🧪 Testing the Live Integration Flow

1. Open the **Apex State University Portal** at `http://localhost:3001`.
2. Observe the **Bridge Status**: You should see `🟢 Connected to Vaasone Gateway` (with live ping latency).
3. **Register a New Graduate**:
   - Click **"Register Graduate"**.
   - Enter candidate details (e.g. `Matric: APEX/2022/CS/0099`, Name: `Babatunde Fashola`, Programme: `B.Sc. Computer Science`, First Class Honours).
   - Ensure **"Automatically Anchor on Stellar Blockchain"** is checked.
   - Click **"Save to Registry"**.
   - Within seconds, you receive a **Stellar Blockchain Transaction Hash** and a Vaasone Certificate ID (e.g. `VAAS-APEX-UNIV-2026-0099`).
4. **Verify on Vaasone Search Portal**:
   - Go to `http://localhost:3000`.
   - On the search engine, switch to **"Employer & University Search"**.
   - Select **Apex State University** (`✓ Accredited`).
   - Select Year **2026** and enter Matric No `APEX/2022/CS/0099`.
   - Click **Verify Certificate** ➔ The certificate displays with **Cryptographically Verified** status and Stellar ledger proof!
5. **Test On-Chain Revocation**:
   - Return to `http://localhost:3001`.
   - Click **"Revoke"** on the graduate record.
   - Select the official reason (e.g. `Academic malpractice / Examination misconduct`) and confirm.
   - Now verify that student again on `http://localhost:3000` ➔ The status changes instantly to **"Officially Revoked Certificate"** with audit proof!

---

## 🌐 Deploying to VPS / Cloud (DigitalOcean, AWS, Railway, Render)

The server has **zero external dependencies** (`package.json` only requires standard Node.js runtime).

### 1. Environment Variables
| Variable | Description | Default |
|---|---|---|
| `PORT` | Listening port | `3001` |
| `VAASONE_URL` | Outbound Vaasone sync API endpoint | `http://localhost:3000/api/v1/institutions/sync` |
| `INSTITUTION_SLUG` | University identifier slug | `apex-university` |
| `INSTITUTION_NAME` | University display name | `Apex State University` |

### 2. Run with PM2 (Production Process Manager)
```bash
npm install -g pm2
pm2 start server.js --name "apex-university-sis"
pm2 save
pm2 startup
```

### 3. Docker Deployment
Create a `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
ENV PORT=3001
EXPOSE 3001
CMD ["node", "server.js"]
```
Build and run:
```bash
docker build -t apex-university-sis .
docker run -p 3001:3001 -e VAASONE_URL="https://your-vaasone-domain.com/api/v1/institutions/sync" apex-university-sis
```

---

## 📡 API Specification for University Developers

Any institutional SIS can integrate using the following HTTP specifications:

### Gateway Handshake
```http
GET /api/v1/institutions/sync
Host: vaasone.com
x-institution-slug: apex-university
```

### Single Issuance
```http
POST /api/v1/institutions/sync
Host: vaasone.com
Content-Type: application/json
x-institution-slug: apex-university

{
  "action": "issue",
  "record": {
    "student_reference": "APEX/2021/CS/0042",
    "recipient_name": "Tunde Bakare",
    "recipient_email": "tunde.bakare@apex.edu.ng",
    "programme": "B.Sc. Computer Science",
    "classification": "First Class Honours",
    "graduation_date": "2024-07-20",
    "certificate_number": "APEX-2024-0042",
    "credential_type": "degree"
  }
}
```

### Single Revocation
```http
POST /api/v1/institutions/sync
Host: vaasone.com
Content-Type: application/json
x-institution-slug: apex-university

{
  "action": "revoke",
  "certificate_id": "VAAS-APEX-UNIV-2024-0042",
  "reason": "Disciplinary expulsion by University Senate"
}
```

### Batch Sync / Reconciliation
```http
POST /api/v1/institutions/sync
Host: vaasone.com
Content-Type: application/json
x-institution-slug: apex-university

{
  "action": "batch_sync",
  "records": [ ... ]
}
```
