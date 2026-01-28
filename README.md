# 🛡️ HSE Sentinel

**AI-Powered Predictive HSE Intelligence Platform**

> *Predict. Prevent. Protect.*

---

## 📌 Overview

**HSE Sentinel** is a **next-generation AI-driven Health, Safety & Environment (HSE) intelligence platform** designed to **predict risks before incidents occur**, not just record them after the fact.

Unlike traditional HSE systems that focus on static reporting and compliance checklists, **HSE Sentinel combines AI reasoning, predictive analytics, behavioral insights, and real-time monitoring** to proactively prevent injuries, environmental damage, asset failures, and financial losses.

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

## 🧩 Core Capabilities (What Makes HSE Sentinel Different)

### 🧠 AI Intelligence Engine

* Multi-modal AI analysis (documents, audio, video, images, URLs)
* Context-aware incident understanding
* Automatic **Leading vs Lagging indicator classification**
* Risk scoring (0–10) with confidence
* Vector-based learning for pattern recognition & recurrence detection

---

### 🔮 Predictive Risk & Early Warning System

* Detects risk using:

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
* Executive-friendly KPIs backed by raw evidence

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
* **AI-driven training gap detection**

---

### 🕵️ Audits & Inspections

* Configurable inspection templates
* Mobile-friendly checklists
* Automated scoring
* Findings → corrective task linkage
* Audit trend & repeat-failure detection

---

### ⚠️ JSA & Risk Assessment

* Full Job Safety Analysis lifecycle
* Hazard identification & risk matrix
* Control measures (engineering / admin / PPE)
* Approval workflow
* Employee acknowledgement before work
* **AI-assisted hazard & control recommendations**

---

### 🛠️ Equipment & Maintenance Safety

* Equipment registry & safety-critical tagging
* Preventive maintenance schedules
* Maintenance compliance tracking
* Equipment failure & unsafe condition logging
* Predictive maintenance risk hooks

---

### 🚗 Vehicle Safety Management

* Vehicle & driver registry
* Trip logging & transport safety tracking
* Vehicle incidents & near misses
* Driver risk profiling
* Predictive transport risk alerts

---

### 🧑‍⚕️ Workers’ Compensation Management

* Injury-linked compensation claims
* Medical, wage & rehabilitation cost tracking
* Lost workdays & return-to-work monitoring
* Cost intelligence for executives
* Claim risk & escalation prediction

---

### 👔 Management Engagement (Leadership in Safety)

* Safety walks & toolbox talks
* Management safety observations
* Leadership engagement scoring
* Behavior-based corrective actions
* ISO 45001 Clause 5 compliance evidence

---

### 🧠 Employee Safety Culture

* Safety suggestions & feedback
* Near-miss quality scoring (AI-assisted)
* Safety committee participation
* Safety culture score & trends
* Engagement heatmaps & predictive insights

---

### 🧑‍💼 Executive AI Summaries

* Natural language safety summaries
* Risk posture overview
* Cost & loss visibility
* 30-day forward-looking safety outlook
* Board-level, decision-ready insights

---

## 👥 User Roles & Access Control

| Role            | Capabilities                                                 |
| --------------- | ------------------------------------------------------------ |
| **super_admin** | Global system access, AI configuration, enterprise analytics |
| **group_admin** | Organization & site-level oversight, approvals, analytics    |
| **team_admin**  | Task management, inspections, JSA, team safety               |
| **employee**    | Incident reporting, task execution, participation & feedback |

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
* Multer (file uploads)
* Nodemailer (alerts & notifications)

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
cd hse-backend
npm install
npm run dev
```

### Frontend

```bash
cd hse-frontend
npm install
npm run dev
```

### Environment Variables

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
* [x] Training, Audits, JSA
* [x] Equipment, Vehicle & Workers’ Comp
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

**Project:** HSE Sentinel
**Purpose:** Predictive HSE Intelligence
**Status:** Enterprise-ready / Active Development

---

### 🏁 Final Note

> **HSE Sentinel doesn’t just manage safety — it predicts, prevents, and proves it.**
