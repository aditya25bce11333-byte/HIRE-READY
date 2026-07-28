# HireReady — AI-Powered Interview Preparation Platform

> *"From Practice to Placement"* — The Fifth Bit Hackathon 2026

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render-brightgreen?style=for-the-badge&logo=render)](https://github.com/aditya25bce11333-byte/HIRE-READY/tree/main)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/aditya25bce11333-byte/HIRE-READY/tree/main)

---

## 🌟 Overview

**HireReady** is an end-to-end, AI-powered mock interview platform designed to prepare job seekers for technical and HR interviews. It simulates real-life interview scenarios with role-based tracks, adaptive questions, real-time code reviews, pressure mode, anti-cheat detection, and comprehensive performance analytics.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3 (Custom CSS Variables System), Vanilla JavaScript |
| **Backend** | Node.js + Express.js (REST API) |
| **Database** | MongoDB + Mongoose *(with In-Memory Fallback Engine for Instant Demos)* |
| **AI Engine** | Google Gemini API (gemini-1.5-flash) |
| **Auth & Security** | JWT Authentication, bcryptjs, Helmet, Rate Limiting, CORS |

---

## 📁 Project Structure

```
HIRE-READY/
├── package.json             # Root zero-config deployment manifest
├── README.md                # Project documentation
├── backend/
│   ├── models/              # User and Session data models
│   ├── routes/              # Auth, Users, Interview, Evaluation, Leaderboard, Resources
│   ├── middleware/          # Auth protect middleware
│   ├── utils/               # MemoryStore fallback engine
│   ├── package.json
│   └── server.js            # Express application server
└── frontend/
    ├── css/                 # Design system (Dark + Light mode)
    ├── js/                  # API client, Auth manager, Theme toggle, Toast system
    ├── pages/               # Dashboard, Practice, Evaluation, Leaderboard, Resources, Settings
    └── index.html           # Landing page
```

---

## 🚀 Instant Quickstart & Local Setup

### Prerequisites
- Node.js 18+

### 1. Clone the repository
```bash
git clone https://github.com/aditya25bce11333-byte/HIRE-READY.git
cd HIRE-READY
```

### 2. Install & Run
```bash
npm install
npm start
```
The application will boot at **http://localhost:5000**.

---

## ✨ Features Implemented

### 🎯 Core Interview Simulation
- **Role-Based Interview Tracks**: SDE, Data Scientist, DevOps, Product Manager
- **Round Types**: Technical & HR Rounds with STAR method evaluations
- **Adaptive AI Follow-Ups**: Context-aware follow-up question engine
- **Pressure Mode**: Simulates real-time stress with interruptions and strict time pressure
- **Coding Editor & AI Code Review**: Monaco-style editor with automated code evaluation
- **Anti-Cheat Detection**: Monitors tab switches, window blur events, and copy-paste attempts

### 📊 Analytics & Gamification
- **Instant AI Feedback**: Scores technical accuracy, communication, and confidence
- **Filler Word Detection**: Analyzes speech/text for unnecessary filler words (`um`, `uh`, `basically`, etc.)
- **Personalized Improvement Roadmap**: Custom recommended learning steps after each session
- **Global Leaderboard**: Role-filtered user rankings and point system
- **Daily Streak System**: Tracks continuous practice days

---

## 👥 Team — The Fifth Bit

- Khyati Singh (`25BCE11336`)
- Aayushi (`25BCE10206`)
- Aditya Singh (`25BCE1133`)
- Sayan Mondal (`25BAI11532`)
- Yashraj (`25BAI11556`)

---

## 🔗 Repository & Live Deployment

- **GitHub Repository**: [github.com/aditya25bce11333-byte/HIRE-READY](https://github.com/aditya25bce11333-byte/HIRE-READY/tree/main)
