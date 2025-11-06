# Deploy guide — Prescripto Full Stack

This document lists recommended next steps to deploy the project so each front-end dashboard (patient, admin, pharmacist, doctor) can be hosted separately (Vercel) and the backend on Render (or similar). It also lists the environment variables you must set so the `Choose Role` page (added to the main frontend) can redirect users to the correct live dashboard.

## Overview
- Backend: deploy the `backend/` folder (Node/Express) to Render (free tier) or another host.
- Frontends: deploy each folder separately to Vercel (or Netlify). Each frontend should have its own VITE_BACKEND_URL pointing to the backend.
- Main frontend (this repo `frontend/`) now contains `/choose-role` which reads these Vite env vars and redirects users to the corresponding deployed dashboard.

## Environment variables (summary)
- For backend (Render) — set these in Render > Environment:
  - `MONGODB_URI` (your mongo connection string)
  - `JWT_SECRET` (any secure secret)
  - `STRIPE_SECRET_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (if used)
  - `CLOUDINARY_*` (if used)

- For each frontend (Vercel / local `.env`), set:
  - `VITE_BACKEND_URL` = https://your-backend-url (Render domain or other)
  - `VITE_ADMIN_URL` = https://your-admin-site.vercel.app (only for main frontend where you want redirects)
  - `VITE_DOCTOR_URL` = https://your-doctor-site.vercel.app
  - `VITE_PHARMACIST_URL` = https://your-pharmacist-site.vercel.app
  - `VITE_FRONTEND_URL` = https://your-patient-site.vercel.app (optional)

Important: Vite-exposed variables must be prefixed with `VITE_` to be available in client code.

## Backend (Render) — quick steps
1. Create a new Web Service on Render and connect your repo.
2. Set the service root to `backend/`.
3. Build & Start commands:
   - Build: (no build needed for plain node) leave empty or `npm install` in Start command if desired
   - Start: `node server.js` (or `npm start` if `package.json` has a start script)
4. Add the environment variables (see list above).
5. Deploy. Note the public URL (e.g. `https://prescripto-backend.onrender.com`) — use this as `VITE_BACKEND_URL` for frontends.

## Frontends (Vercel) — quick steps
Repeat the following for each frontend folder (`frontend/`, `admin/`, `pharmacist/`, `doctor/` if present):

1. Import the repo to Vercel and in Project settings set the Root Directory to the folder path (e.g. `frontend`, `admin`, `pharmacist`).
2. In Vercel > Project Settings > Environment Variables add:
   - `VITE_BACKEND_URL` = `https://prescripto-backend.onrender.com` (your Render URL)
   - For the *main frontend* (the one with role chooser) also add:
     - `VITE_ADMIN_URL` = https://your-admin-site.vercel.app
     - `VITE_DOCTOR_URL` = https://your-doctor-site.vercel.app
     - `VITE_PHARMACIST_URL` = https://your-pharmacist-site.vercel.app
     - `VITE_FRONTEND_URL` = https://your-patient-site.vercel.app (optional)
3. Deploy the project.

Notes:
- Vercel will automatically run `npm install` and `npm run build` for typical React/Vite apps. If your project requires a custom build command, set it in Vercel.

## Local testing
1. In each frontend folder create a `.env.local` (or use `.env`) with the example values (see `.env.example` files in repo). Example for `frontend`:
```
VITE_BACKEND_URL=http://localhost:4000
VITE_ADMIN_URL=http://localhost:5174
VITE_DOCTOR_URL=http://localhost:5175
VITE_PHARMACIST_URL=http://localhost:5176
```
2. Start backend locally:
```powershell
cd backend
npm install
node server.js
```
3. Start frontends locally in their folders:
```powershell
cd frontend
npm install
npm run dev
```

4. Visit `http://localhost:5173/choose-role` (or your local frontend port). Clicking role buttons should redirect to the configured URLs. If you didn't configure role URLs, the patient button falls back to `/login` in the main app.

## CORS and security
- Backend currently uses `app.use(cors())` (open to all origins). That will work for Vercel domains. If you restrict CORS in production, add your Vercel domains to the allow list.
- Keep JWT_SECRET and other secrets private — only set them in the host's environment settings (Render / Vercel env variables) — never commit them.

## Verification checklist after deploy
1. Backend: `GET /` should return `API Working` on the Render URL.
2. Main frontend: open deployed main site and click `Create account` -> `Choose role` -> click `Pharmacist` (or any role). You should be redirected to the deployed dashboard site.
3. On each dashboard, verify login calls to the backend succeed (inspect network console). Each dashboard must have `VITE_BACKEND_URL` pointing at the backend.

## If you want me to add more
- I can add `.env.example` files for every frontend (I will add examples now). I can also add a short `scripts/deploy.sh` example for CLI deployments or create a small `DEPLOYMENT.md` customized per your hosting provider.

---
If you'd like, I can also create a single README section in the repo root that includes the final production URLs after you tell me the Vercel/Render links and I will insert them into the main frontend `.env` or a small `deployed.json` file for quick reference.
