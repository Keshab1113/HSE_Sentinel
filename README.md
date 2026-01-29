# 🛡️ ASES

**Advanced Safety and Efficiency Systems**

**AI-Powered Predictive HSE Intelligence Platform**

> *Predict. Prevent. Protect.*

---

## 📌 Overview

**ASES (Advanced Safety and Efficiency Systems)** is a **next-generation AI-driven Health, Safety & Environment (HSE) intelligence platform** designed to **predict risks before incidents occur**, not just record them after the fact.

Unlike traditional HSE systems that focus on static reporting and compliance checklists, **ASES combines AI reasoning, predictive analytics, behavioral insights, and real-time monitoring** to proactively prevent injuries, environmental damage, asset failures, and financial losses.

The platform is built for **enterprise-scale, multi-site organizations**, with **strict role-based access**, **leading & lagging indicator intelligence**, **predictive alerts**, and **executive-ready decision support**.

---

## 🎯 Key Objectives

* 🔮 Predict HSE risks *before* incidents happen
* 🧠 Convert raw data (documents, audio, video, images, links) into actionable intelligence
* 📊 Track **Leading & Lagging Indicators** continuously
* 🚨 Generate **AI-driven predictive alerts** with confidence levels
* 🏢 Provide **role-based dashboards** for every organizational level
* 📑 Enable **ISO 45001 & OSHA-aligned compliance reporting**
* 🧍‍♂️ Embed **behavioral safety, leadership engagement, and safety culture**

---

## 🧩 Core Capabilities

### 🧠 AI Intelligence Engine

* Multi-modal AI analysis (documents, audio, video, images, URLs)
* Context-aware incident understanding
* Automatic **Leading vs Lagging indicator classification**
* Risk scoring (0–10) with confidence
* Vector-based learning for pattern recognition & recurrence detection

---

### 🔮 Predictive Risk & Early Warning System

* Risk detection using:

  * Leading indicator degradation
  * Repeating incident patterns
  * Overdue corrective actions & SLA breaches
  * AI trend inference & similarity search
* AI-generated preventive recommendations
* Confidence-based alert levels: **Low → Medium → High → Critical**

---

### 📊 Analytics, Heatmaps & Safety Scoring

* Leading vs Lagging indicator trends
* Predictive risk heatmaps (site / team / activity based)
* Dynamic **Safety Score (0–100)** per site, team, or operation
* Executive-friendly KPIs backed by auditable evidence

---

### 🔔 Automated Notifications & Escalation

* Automated Email alerts
* WhatsApp-ready architecture (Twilio / Meta API)
* SLA-based escalation workflows
* Acknowledgement & closure tracking

---

## 🏗️ Complete HSE Coverage (Enterprise-Grade)

### 🧍 Incident & Action Management

* Multi-format incident reporting
* AI classification & severity detection
* Auto-generated corrective actions
* Evidence upload & AI-assisted verification

---

### 🎓 Training & Competency Management

* Training master & assignments
* Competency assessments
* Expiry & compliance tracking
* AI-driven training gap detection

---

### 🕵️ Audits & Inspections

* Configurable inspection templates
* Mobile-friendly checklists
* Automated scoring
* Findings linked to corrective actions
* Repeat-failure & trend analysis

---

### ⚠️ JSA & Risk Assessment

* Full Job Safety Analysis lifecycle
* Hazard identification & risk matrix
* Control measures (engineering / administrative / PPE)
* Approval workflows
* Mandatory employee acknowledgement
* AI-assisted hazard & control recommendations

---

### 🛠️ Equipment & Maintenance Safety

* Equipment registry & safety-critical tagging
* Preventive maintenance schedules
* Maintenance compliance tracking
* Unsafe condition & failure logging
* Predictive maintenance intelligence hooks

---

### 🚗 Vehicle Safety Management

* Vehicle & driver registry
* Trip logging & transport risk tracking
* Vehicle incidents & near misses
* Driver risk profiling
* Predictive transport safety alerts

---

### 🧑‍⚕️ Workers’ Compensation Management

* Injury-linked compensation claims
* Medical, wage & rehabilitation cost tracking
* Lost workdays & return-to-work monitoring
* Executive cost & exposure intelligence
* Claim risk escalation prediction

---

### 👔 Management Engagement

* Safety walks & toolbox talks
* Management safety observations
* Leadership engagement scoring
* Behavior-based corrective actions
* ISO 45001 Clause 5 leadership evidence

---

### 🧠 Employee Safety Culture

* Safety suggestions & feedback
* Near-miss quality scoring (AI-assisted)
* Safety committee participation tracking
* Safety culture score & trends
* Engagement heatmaps & predictive insights

---

### 🧑‍💼 Executive AI Summaries

* Natural language executive summaries
* Risk posture & trend insights
* Cost & loss visibility
* 30-day forward-looking risk outlook
* Board-level, decision-ready intelligence

---

## 👥 User Roles & Access Control

| Role            | Capabilities                                          |
| --------------- | ----------------------------------------------------- |
| **super_admin** | Global access, AI configuration, enterprise analytics |
| **group_admin** | Organization & site oversight, approvals, analytics   |
| **team_admin**  | Task management, inspections, JSA, team safety        |
| **employee**    | Incident reporting, task execution, participation     |

> 🔐 All permissions are enforced **backend-first** for security and auditability.

---

## 🏗️ System Architecture

```
Frontend (React + Tailwind + shadcn)
  └─ Role-based UI rendering only

Backend (Node.js + Express)
  ├─ Auth & RBAC
  ├─ Incident & Evidence Ingestion
  ├─ AI Orchestration Layer
  ├─ Predictive Risk Engine
  ├─ Task, SLA & Escalation Engine
  ├─ Compliance & Reporting Engine
  └─ Analytics APIs

Data Layer
  ├─ MySQL (System of Record)
  └─ Vector DB (AI Memory & Pattern Learning)
```

---

## 📁 Asset Storage (Important)

All uploaded assets are stored **exclusively on FTP**, including:

* Documents (PDF, Word, Excel)
* Images
* Audio & video recordings
* Inspection evidence
* JSA & audit attachments

Assets are uploaded using a dedicated FTP streaming utility and stored as **secure URLs**, ensuring:

* Scalability for large files
* Separation of application & storage
* Audit-friendly evidence handling

---

## 🧠 AI Stack

| Purpose                   | Technology                     |
| ------------------------- | ------------------------------ |
| Text & content extraction | **Mistral**                    |
| Reasoning & prediction    | **DeepSeek / Grok**            |
| Pattern memory            | **Vector Database**            |
| Alerts & summaries        | **LLM-based prompt pipelines** |

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* MySQL
* JWT Authentication
* Multer (streaming uploads)
* Nodemailer (notifications)

### Frontend

* React (Vite)
* Tailwind CSS
* shadcn/ui
* Chart.js / Recharts
* Dark / Light theme support

---

## 🚀 Getting Started (Local Setup)

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=ases_system
JWT_SECRET=your_secret_key

FTP_HOST=...
FTP_USER=...
FTP_PASS=...
FTP_PORT=...
FTP_SECURE=...
FTP_REMOTE_DIR=...
FTP_BASE_URL=...
```

---

## 📈 Roadmap

* [x] AI-based HSE classification
* [x] Predictive risk alerts
* [x] Role-based dashboards
* [x] Safety scoring engine
* [x] Training, Audits, JSA
* [x] Equipment, Vehicle & Workers’ Compensation
* [x] Management engagement & safety culture
* [ ] Mobile-first employee app
* [ ] Regulator auto-submission
* [ ] Self-learning risk thresholds
* [ ] Cloud deployment (AWS / GCP)

---

## 🧪 Industry Use Cases

* Oil & Gas
* Construction
* Manufacturing
* Infrastructure
* Logistics & Transport
* Energy & Utilities

---

## 📄 License

MIT License
Enterprise licensing options can be added as required.

---

## 🤝 Contributions

Contributions, ideas, and improvements are welcome.
Please open an issue or submit a pull request.

---

## 📬 Contact

**Project:** ASES (Advanced Safety and Efficiency Systems)
**Purpose:** Predictive HSE Intelligence
**Status:** Enterprise-ready / Active Development

---

### 🏁 Final Note

> **ASES doesn’t just manage safety — it predicts, prevents, and proves it.**

---
