# NeuralPlayground Pro — Hackathon Edition (VIBETHON)

An interactive AIML learning playground with a **“Neural Cosmos”** UI: drifting particle neurons + glassmorphism + animated modules.

🌐 Live Demo

NeuralPlayground Live Website

## What it does

- **Auth (local-only)**: login/signup with `localStorage` (no backend)
- **Dashboard**: progress, XP, badges, quick navigation
- **Learning module**: Classification basics + spam example + decision boundary visual
- **Spam simulator**: email-by-email decisions + accuracy + “You vs Model” + streak
- **Hyperparameter game**: learning rate/epochs sliders + overfitting warning + Chart.js curves
- **Quiz**: 5 MCQs, one-at-a-time, score overlay + confetti
- **Coding playground**: Prism-highlighted “Python-like” editor + editable threshold + run history
- **Leaderboard (local)**: podium animation + table, ranked by **quizScore + simulatorAccuracy**
- **Achievements**: unlock popups (stored per user in localStorage)

## Tech

- React (Vite) + Tailwind CSS
- `react-router-dom` routing
- `localStorage` persistence (keys: `np_users`, `np_currentUser`)
- Three.js particle network background
- Framer Motion transitions + micro-interactions
- Chart.js graphs
- Prism syntax highlighting

## Run locally

```bash
npm install
npm run dev
```

## Notes (hackathon constraints)

- No real ML training: **all ML behavior is simulated in JavaScript**
- No backend: everything persists in `localStorage`

