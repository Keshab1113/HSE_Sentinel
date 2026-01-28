# 🛡️ HSE Sentinel

**AI-Powered Predictive HSE Intelligence Platform**

> *Predict. Prevent. Protect.*

---

## 📌 Overview

**HSE Sentinel** is an **AI-driven Health, Safety & Environment (HSE) intelligence platform** designed to **predict risks before incidents occur**.
Unlike traditional HSE systems that focus on reporting past incidents, HSE Sentinel combines **AI reasoning, predictive analytics, and real-time monitoring** to proactively prevent injuries, environmental damage, and compliance failures.

The platform supports **multi-level organizations**, **role-based access**, **leading & lagging indicators**, **predictive alerts**, and **executive-ready insights**.

---

## 🎯 Key Objectives

* 🔮 Predict HSE risks before incidents happen
* 🧠 Convert raw data (documents, audio, video, images) into actionable intelligence
* 📊 Track **Leading & Lagging Indicators** in real time
* 🚨 Generate **predictive alerts** with AI confidence
* 🏢 Provide **role-based dashboards** for all organizational levels
* 📑 Enable ISO / OSHA aligned compliance reporting

---

## 🧩 Core Features

### 🧠 AI Intelligence

* Multi-modal AI analysis (documents, audio, video, images, links)
* Context-aware incident understanding
* Leading vs Lagging indicator classification
* Risk scoring (0–10) with confidence
* Vector-based learning for pattern detection

---

### 🔮 Predictive Risk Alerts

* Early warning system using:

  * Leading indicator degradation
  * Repeating incident patterns
  * Overdue corrective actions
  * AI trend inference
* AI-generated preventive recommendations
* Confidence-based alert levels (Low → Critical)

---

### 🔔 Automated Notifications

* Email alerts for predictive risks
* WhatsApp-ready architecture (Twilio / Meta API)
* Role-based alert delivery
* Acknowledgement tracking

---

### 📊 Analytics & Visualization

* Leading vs Lagging indicator trends
* Predictive risk heatmaps (team / site based)
* Safety performance analytics
* Chart-ready APIs (React-friendly)

---

### 🛡️ Safety Scoring System

* Dynamic **Safety Score (0–100)** per team/site
* Combines:

  * Lagging incidents
  * Leading activities
  * Open high-risk tasks
* Simple KPI for management & executives

---

### 📂 Evidence & Verification

* Evidence upload for task closure
* AI-assisted evidence verification
* Auditable task lifecycle
* Compliance-ready documentation

---

### 📑 Compliance Reporting

* ISO 45001 aligned reports
* OSHA-style summaries
* Auto-generated evidence packs
* Downloadable executive reports

---

### 🧑‍💼 Executive AI Summaries

* Natural language summaries for leadership
* Risk posture overview
* Key concerns & trends
* 30-day forward-looking outlook

---

## 👥 User Roles & Access Control

| Role            | Capabilities                                                        |
| --------------- | ------------------------------------------------------------------- |
| **super_admin** | Full system access, global analytics, compliance & AI configuration |
| **group_admin** | Organization-level management, team oversight                       |
| **team_admin**  | Task assignment, incident tracking, team safety                     |
| **employee**    | Incident reporting, task execution, evidence upload                 |

> 🔐 All permissions are enforced **backend-first**.

---

## 🏗️ System Architecture

```
Frontend (React + Tailwind)
  └─ Role-based UI rendering only

Backend (Node.js + Express)
  ├─ Auth & RBAC
  ├─ Upload & Ingestion Engine
  ├─ Mistral Text Extraction
  ├─ DeepSeek / Grok AI Reasoning
  ├─ Predictive Risk Engine
  ├─ Notification Engine
  ├─ Compliance Engine
  └─ Analytics API

Database
  ├─ MySQL (system of record)
  └─ Vector DB (AI memory)
```

---

## 🧠 AI Stack

| Purpose                | Technology               |
| ---------------------- | ------------------------ |
| Text extraction        | **Mistral**              |
| Reasoning & prediction | **DeepSeek / Grok**      |
| Pattern memory         | **Vector DB**            |
| Alerts & summaries     | **LLM-based AI prompts** |

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* MySQL
* JWT Authentication
* Multer (file uploads)
* Nodemailer (email alerts)

### Frontend

* React (Vite)
* Tailwind CSS
* Chart.js / Recharts
* Dark / Light Theme Toggle

### AI & Intelligence

* Mistral API
* DeepSeek / Grok API
* Vector embeddings

---

## 🚀 Getting Started (Local Setup)

### 1️⃣ Backend

```bash
cd hse-backend
npm install
npm run dev
```

### 2️⃣ Frontend

```bash
cd hse-frontend
npm install
npm run dev
```

### 3️⃣ Environment Variables

Create `.env` in backend:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=hse_system
JWT_SECRET=your_secret_key

ALERT_EMAIL=your_email@gmail.com
ALERT_EMAIL_PASS=your_app_password
```

---

## 📈 Roadmap

* [x] AI-based HSE classification
* [x] Predictive risk alerts
* [x] Role-based dashboards
* [x] Safety scoring engine
* [x] Executive AI summaries
* [ ] Mobile-first employee app
* [ ] Regulator auto-submission
* [ ] Self-learning risk thresholds
* [ ] Cloud deployment (AWS/GCP)

---

## 🧪 Use Cases

* Oil & Gas
* Construction
* Manufacturing
* Infrastructure
* Logistics
* Energy & Utilities

---

## 📄 License

This project is licensed under the **MIT License**.
Enterprise licensing options can be added as needed.

---

## 🤝 Contribution

Contributions, ideas, and improvements are welcome.
Please open an issue or submit a pull request.

---

## 📬 Contact

**Project Name:** HSE Sentinel
**Purpose:** Predictive HSE Intelligence
**Status:** Active Development
