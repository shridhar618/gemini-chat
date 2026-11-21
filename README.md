# 🌟 Lumina — AI Chat powered by Google Gemini

![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white) ![Flask](https://img.shields.io/badge/Flask-000000?logo=flask&logoColor=white) ![Google Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?logo=googlegemini&logoColor=white)

A production-quality AI chatbot with React + Vite frontend and Flask backend,
featuring real-time streaming responses, multi-conversation history, and a
premium dark UI.

---

## ✨ Features

- **Streaming responses** — Real-time SSE streaming via Flask → Gemini API
- **Context-aware** — Full conversation history sent with every message
- **Multi-chat** — Create, rename, delete, and switch between chats
- **Persistent** — Chat history saved to localStorage (survives page refresh)
- **Markdown** — Full GFM support: tables, code blocks, bold, italic, lists
- **Syntax highlighting** — 100+ languages with custom Catppuccin-inspired theme
- **Copy buttons** — Per-message and per-code-block copy
- **Responsive** — Collapsible sidebar, mobile-first layout
- **Dark theme** — "Obsidian Luxe" — deep navy with electric azure accents
- **Error handling** — Graceful API error display in UI

---

## 📁 Project Structure

```
gemini-chat/
├── backend/
│   ├── app.py                  # Flask app + CORS
│   ├── requirements.txt
│   ├── .env.example
│   ├── routes/
│   │   └── chat.py             # /api/chat and /api/chat/stream endpoints
│   └── services/
│       └── gemini_service.py   # Gemini API wrapper (streaming + standard)
│
└── frontend/
    ├── index.html
    ├── vite.config.js          # Dev server + /api proxy to Flask
    ├── tailwind.config.js      # Custom design tokens
    ├── package.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css           # Global styles, markdown, animations
        ├── context/
        │   └── ChatContext.jsx # Full state: chats, streaming, localStorage
        ├── pages/
        │   └── ChatPage.jsx    # Layout: sidebar + chat area
        └── components/
            ├── Sidebar.jsx     # Chat list, rename, delete, new chat
            ├── ChatWindow.jsx  # Message list + welcome screen
            ├── MessageBubble.jsx # User/bot bubbles with markdown
            ├── TypingIndicator.jsx
            └── InputBox.jsx    # Auto-resize input, char count
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- A Google Gemini API key → https://makersuite.google.com/app/apikey

---

### 1. Backend Setup

```bash
# Navigate to backend
cd gemini-chat/backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env and add your Gemini API key:
# GEMINI_API_KEY=your_key_here
# Use a Google API key, not an OAuth access token. A valid key typically starts with "AIza".

# Start the server
python app.py
```

Backend runs on **http://localhost:5000**

If port `5000` is already in use, set a different port in `backend/.env` (e.g. `PORT=5001`).

---

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend
cd gemini-chat/frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs on **http://localhost:5173**

> The Vite dev server proxies all `/api/*` requests to `http://localhost:5000`,
> so no CORS configuration is needed during development.

If you changed the backend port, copy `frontend/.env.example` → `frontend/.env` and set:
```env
VITE_BACKEND_URL=http://localhost:5001
```

---

## ⚙️ Environment Variables

| Variable           | Required | Default              | Description                          |
|--------------------|----------|----------------------|--------------------------------------|
| `GEMINI_API_KEY`   | ✅ Yes   | —                    | Your Google Gemini API key           |
| `GEMINI_MODEL`     | No       | `gemini-1.5-flash`   | Model name to use                    |
| `GEMINI_TEMPERATURE` | No     | `0.7`                | Response creativity (0.0–1.0)        |
| `PORT`             | No       | `5000`               | Flask server port                    |
| `FLASK_DEBUG`      | No       | `true`               | Enable Flask debug mode              |

Available models:
- `gemini-1.5-flash` — Fast, efficient (recommended)
- `gemini-1.5-pro`   — Higher quality, slower
- `gemini-pro`       — Legacy stable model

---

## 🏗️ API Endpoints

### `GET /api/health`
Health check.

### `POST /api/chat`
Standard (non-streaming) chat.

**Request:**
```json
{
  "message": "Explain recursion",
  "history": [
    { "role": "user",      "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}
```

**Response:**
```json
{ "response": "Recursion is a technique where..." }
```

### `POST /api/chat/stream`
Streaming chat via Server-Sent Events.

**Request:** Same as `/api/chat`

**Response stream (text/event-stream):**
```
data: {"chunk": "Recursion ", "done": false}
data: {"chunk": "is a ", "done": false}
data: {"chunk": "technique...", "done": false}
data: {"chunk": "", "done": true}
```

---

## 🛠️ Production Deployment

### Backend (Gunicorn)
```bash
cd backend
gunicorn -w 2 -b 0.0.0.0:5000 app:app
```

> Note: For SSE streaming with multiple workers, use `-w 1` or configure
> a sticky-session load balancer.

### Frontend (Build)
```bash
cd frontend
npm run build
# Serves from dist/ — deploy to Vercel, Netlify, or any static host
```

Update the API base URL in `vite.config.js` proxy or set `VITE_API_URL` for production.

---

## 🎨 Customization

### Changing the AI model
Edit `backend/.env`:
```env
GEMINI_MODEL=gemini-1.5-pro
```

### Changing colors / theme
Edit `frontend/tailwind.config.js` — the `colors` section defines the full palette.
Edit `frontend/src/index.css` for animation and markdown styles.

### Changing the system prompt
Edit `backend/services/gemini_service.py` → `system_instruction` in `__init__`.

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `GEMINI_API_KEY not set` | Add the key to `backend/.env` |
| `502 Gemini API error` | Check your API key is valid and has quota |
| Frontend shows "Server error" | Ensure Flask is running on port 5000 |
| Streaming not working | Make sure you're using `python app.py` (not gunicorn with >1 worker) |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` inside the venv |

---

## 📄 License

MIT — free to use, modify, and distribute.
