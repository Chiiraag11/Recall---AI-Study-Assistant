# Recall — AI Study Assistant

> Turn notes or any topic into an interactive study kit with AI-powered
> flashcards, quizzes, concepts, checklists, and progress tracking.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Gemini](https://img.shields.io/badge/AI-Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

## 🎥 Demo

**Demo Video:** [Watch Recall in action](YOUR_VIDEO_LINK)

**Live Demo:** [Open Recall](YOUR_DEPLOYED_APP_LINK)

---

## ✨ What is Recall?

Recall is an AI-powered active-learning application that transforms
raw notes or a topic into a complete, interactive study experience.

### Core Experience

- 🧠 **AI Study Kit Generation** — Turn notes/topics into structured study material
- 🃏 **Interactive Flashcards** — Flip, navigate, track and review cards
- 📝 **Smart Quizzes** — MCQs with instant feedback and explanations
- 🔁 **Retry Wrong Answers** — Retest only questions answered incorrectly
- 📚 **Concepts** — Quickly review important concepts from the material
- ✅ **Study Checklist** — Track completion of key learning goals
- 📊 **Progress Tracking** — Visual study progress with completion states
- ➡️ **Guided Study Flow** — Clear next steps throughout the experience
- 💾 **Saved Sessions** — Reopen previous study sessions
- ✨ **AI Refinement** — Ask AI to improve or modify an existing study kit
- 🌙 **Dark / Light Mode**
- ⌨️ **Keyboard Navigation**
- 📱 **Responsive Design**

---

## 🛠 Tech Stack

**Frontend**
- React
- Vite
- CSS
- Responsive component-based architecture

**Backend**
- Node.js
- Express
- Gemini API

**Data & State**
- localStorage for saved sessions
- Structured JSON state
- Zod validation

---

## 🧠 AI Engineering

Recall does not simply display raw AI text.

Gemini generates a **structured study kit**, which is validated on the
server before being rendered by the client.

### AI reliability pipeline

```text
User Input
    ↓
Gemini
    ↓
Structured JSON Schema
    ↓
Server Validation
    ↓
Repair / Retry if Invalid
    ↓
Validated Study Kit
    ↓
Interactive React UI