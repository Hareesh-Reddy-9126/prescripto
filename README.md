🏥 Hospital Management System (MERN Stack)

### 🚀 Overview
The **Hospital Management System** is a full-stack web application built using the **MERN stack (MongoDB, Express, React, Node.js)**.  
It helps manage hospital operations efficiently by providing **role-based dashboards** for Patients, Doctors, Pharmacists, and Admins — all connected to a single backend API.

---

### 🌐 Live Demo Links
| Module | Live URL |
|---------|-----------|
| 🧍‍♂️ Main Frontend (Login + Patient) | [https://hospital-main.vercel.app](https://hospital-main.vercel.app) |
| 👨‍⚕️ Admin & Doctor Dashboard | [https://hospital-admin.vercel.app](https://hospital-admin.vercel.app) |
| 💊 Pharmacist Dashboard | [https://hospital-pharma.vercel.app](https://hospital-pharma.vercel.app) |
| ⚙️ Backend API (Render) | [https://hospital-api.onrender.com](https://hospital-api.onrender.com) |

---

### 🧩 Features
- 🔐 **Role-Based Authentication** (Patient, Doctor, Pharmacist, Admin)
- 🧾 **JWT-Based Secure Login System**
- 💊 **Pharmacist Dashboard** for managing prescriptions and stock
- 👨‍⚕️ **Doctor Dashboard** for managing appointments and reports
- 👨‍💼 **Admin Dashboard** for monitoring hospital operations
- 🧍‍♂️ **Patient Dashboard** for booking and tracking appointments
- ☁️ **MongoDB Atlas** for database
- 🌩️ **Cloudinary** for file/image uploads
- ⚙️ **Backend hosted on Render**
- 🌐 **Frontends deployed on Vercel**

---

### 🧠 Project Structure
```

project/
├── backend/          → Node.js + Express + MongoDB + JWT + Cloudinary
├── frontend/         → Main app (login, signup, patient dashboard)
├── admin/            → Admin + Doctor dashboard
├── pharmacist/       → Pharmacist dashboard

````

---

### 🧰 Tech Stack
**Frontend:** React (Vite)  
**Backend:** Node.js, Express.js  
**Database:** MongoDB Atlas  
**Authentication:** JWT, bcrypt  
**Cloud Storage:** Cloudinary  
**Deployment:** Render (backend) + Vercel (frontends)

---

### ⚙️ Environment Variables
#### Backend (.env)
```bash
CURRENCY=INR
JWT_SECRET=greatstack
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=greatstack123
MONGODB_URI=mongodb+srv://hareeshreddy:hareeshreddy@cluster0.hvmiymd.mongodb.net
MONGODB_DB_NAME=prescripto
CLOUDINARY_NAME=dl4vykg6c
CLOUDINARY_API_KEY=876265813819426
CLOUDINARY_SECRET_KEY=zbGRnPwSwvEaDHz-J_TkbUovINg
````

#### Frontends (.env)

```bash
VITE_API_URL=https://hospital-api.onrender.com
```

---

### 🧾 Deployment Summary

| Platform          | Usage     | Description                        |
| ----------------- | --------- | ---------------------------------- |
| **Render**        | Backend   | Express + MongoDB API              |
| **Vercel**        | Frontends | React-based dashboards             |
| **MongoDB Atlas** | Database  | Patient, Doctor, and Hospital Data |
| **Cloudinary**    | Storage   | Upload and manage images securely  |

---

### 🧑‍💻 How to Run Locally

```bash
# Clone the repo
git clone https://github.com/<your-username>/<repo-name>.git
cd project

# Run Backend
cd backend
npm install
npm start

# Run Frontend (or Admin/Pharmacist)
cd ../frontend
npm install
npm run dev
```

---

### 🧠 Login Roles

| Role           | Email                                         | Password      |
| -------------- | --------------------------------------------- | ------------- |
| **Admin**      | [admin@example.com](mailto:admin@example.com) | greatstack123 |
| **Doctor**     | (create via signup)                           | —             |
| **Pharmacist** | (create via signup)                           | —             |
| **Patient**    | (create via signup)                           | —             |

---

### 🧑‍🎓 Developed By

**Hareesh Reddy**
🎓 B.Tech – CSE, KL University
💻 Passionate about Web Development, MERN Stack, and Cloud Deployments
📬 *"Learning by building real-world projects!"*

---

### ⭐ Support

If you like this project, consider starring ⭐ the repo on GitHub — it helps others find it too!

---

### 🛡️ License

This project is open-source under the **MIT License**.
