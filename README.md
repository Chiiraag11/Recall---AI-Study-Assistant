# 🧠 Recall — AI Study Assistant

> Turn any topic or notes into an interactive study experience with
> AI-powered flashcards, quizzes, concepts, checklists, and progress tracking.

<p align="center">

**Live Demo:** YOUR_DEPLOYED_APP_LINK

**Demo Video:** YOUR_VIDEO_LINK

</p>

---

<p align="center">
<img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white">
<img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white">
<img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white">
<img src="https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google&logoColor=white">
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧠 **AI Study Kit** | Generate structured study material from any topic or notes |
| 🃏 **Flashcards** | Interactive cards with flip, navigation and review |
| 📝 **Quiz** | MCQs with instant feedback, explanations and scoring |
| 🔁 **Retry** | Retry incorrectly answered questions |
| 📚 **Concepts** | Quick review of important concepts |
| ✅ **Checklist** | Track study completion |
| 📊 **Progress** | Visual progress tracking and completion states |
| ✨ **AI Refinement** | Modify and improve an existing study kit |
| 💾 **Sessions** | Save and reopen previous study sessions |
| 🌙 **Responsive UI** | Dark mode, keyboard controls and mobile support |

---

## 📸 Screenshots

<table>
<tr>
<td><img src="screenshots/overview.png" alt="Overview"></td>
<td><img src="screenshots/flashcards.png" alt="Flashcards"></td>
</tr>
<tr>
<td><img src="screenshots/quiz.png" alt="Quiz"></td>
<td><img src="screenshots/progress.png" alt="Progress"></td>
</tr>
</table>

---

## 🧠 How It Works

```text
Notes / Topic
      ↓
  Gemini AI
      ↓
Structured Study Kit
      ↓
Validation
      ↓
┌──────────┬──────────┬──────────┐
│Flashcards│   Quiz   │ Concepts │
└──────────┴──────────┴──────────┘
      ↓
Checklist + Progress + Review
```

AI responses are validated on the server before reaching the UI,
with retry/repair handling for invalid responses.

---

## 🛠 Tech Stack

**Frontend:** React, Vite, CSS  
**Backend:** Node.js, Express  
**AI:** Gemini API  
**Validation:** Zod  
**Streaming:** Server-Sent Events (SSE)  
**Persistence:** localStorage  
**Testing:** Vitest

---

## ⭐ Key Engineering Highlights

- Structured AI output with server-side validation
- AI response repair/retry handling
- Streaming study-kit generation
- User-friendly API error states
- Persistent study sessions
- Responsive component-based React architecture
- Gemini API key kept server-side

---

## 🚀 Run Locally

```bash
git clone https://github.com/Chiiraag11/Recall---AI-Study-Assistant.git
cd Recall---AI-Study-Assistant
npm install
```

Create `server/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

---

## 👨‍💻 Developer

**Chirag Prasad**

[GitHub](https://github.com/Chiiraag11)