# HireReady — AI-Powered Interview Preparation Platform

> *"From Practice to Placement"* — The Fifth Bit Hackathon 2026

[![Live Web App](https://img.shields.io/badge/🌐_Live_App-hire--ready--ehmg.onrender.com-brightgreen?style=for-the-badge&logo=render)](https://hire-ready-ehmg.onrender.com)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/aditya25bce11333-byte/HIRE-READY/tree/main)

### 🚀 Live Web App URL
👉 **[https://hire-ready-ehmg.onrender.com](https://hire-ready-ehmg.onrender.com)** *(Click to launch live app on any device!)*

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

## 🌐 Instant Access & Deployment

- **Live Production URL**: [https://hire-ready-ehmg.onrender.com](https://hire-ready-ehmg.onrender.com)
- **Source Code**: [GitHub Repository](https://github.com/aditya25bce11333-byte/HIRE-READY/tree/main)

### Local Setup (Optional)
```bash
git clone https://github.com/aditya25bce11333-byte/HIRE-READY.git
cd HIRE-READY
npm install
npm start
```
The application will run locally at **http://localhost:5000**.

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

