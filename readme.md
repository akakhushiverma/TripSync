# 🌍✈️ TripSync — Smart Agent-Based Travel Planning Platform

## 📝 Description

TripSync is a full-stack travel planning platform that uses an **agent-based architecture** to collaboratively generate personalized itineraries. Instead of switching between multiple apps, users plan an entire trip in one place — weather, routes, flights, hotels, events, and budgeting.

The platform features a **Multi-Agent Orchestrator** that coordinates 5 independent agents (Weather, Route, Flight, Hotel, Events) to work in parallel, and includes **Trekky 🤖** — a rule-based NLP chatbot built without any paid AI APIs.

---

## 🚀 Features

### Basic Features ✅
- **Web-based Dashboard** — Travel inspiration cards, search & filter
- **Weather Agent** — 5-day forecast for trip dates via OpenWeatherMap
- **Trip Summary Card** — Displays weather + flights + hotel + budget in a card
- **Budget Estimation** — Full cost breakdown (flights + hotel × nights = total)
- **Day-wise Itinerary** — Auto-generated (Day 1: Arrival, Day 2-N: Events/Sightseeing, Last Day: Departure)

### Intermediate Features ✅
- **Multi-Agent Orchestration** — All 5 agents run in parallel with live status UI
- **Event Recommendations** — Concerts, festivals, sports during trip dates
- **Smart Calendar Integration** — Google Calendar sync with automatic reminders (1hr popup + 1 day email)
- **Comparison Mode** — Compare two destinations side-by-side (weather, hotels, events, verdict)

### Advanced Features ✅
- **Orchestrator Endpoint** (`/api/orchestrate`) — MCP-style unified response from all agents
- **Budget Optimizer** — "💰 Best Value" badge on cheapest flights, "🏆 Best Deal" on best-rated affordable hotels

### Bonus Features
- **Forgot Password** — Email OTP verification via Nodemailer
- **AI Chatbot (Trekky)** — Rule-based NLP with 10+ intents, calls live APIs
- **Google OAuth** — Calendar event sync
- **Logout** — Session management

---

## 🤖 Chatbot — Trekky

Rule-based NLP chatbot built with `compromise` library. No paid AI APIs.

### Supported Queries:
| Intent | Example |
|--------|---------|
| Plan Trip | "Plan my trip to Goa" |
| Compare | "Compare Mumbai and Delhi" |
| Weather | "Weather in Jaipur" |
| Flights | "Flights from Delhi to Goa on 2026-08-01" |
| Hotels | "Hotels in Goa" |
| Events | "Events in Mumbai" |
| Distance | "Distance between Delhi and Agra" |
| Chitchat | "hi", "help", "tell me a joke", "best place to visit" |

---

## 🛠️ Tech Stack

### Frontend
- React 19 + Vite
- Tailwind CSS + Custom CSS
- React Router v6
- React Leaflet (maps)
- react-chatbot-kit
- Axios

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- JWT Authentication + bcrypt
- Nodemailer (email OTP)
- compromise (NLP)
- googleapis (Calendar)

### APIs Used
| API | Purpose |
|-----|---------|
| OpenWeatherMap | Weather forecasts |
| SerpAPI | Flights, Hotels, Events, Map Directions |
| OpenRouteService | Route calculation + Geocoding |
| Google Calendar API | Event sync with reminders |
| Gmail (Nodemailer) | Password reset OTP |

---

## 🔁 Process Flow

1. **Register/Login** — JWT auth with email OTP password reset
2. **Dashboard** — Browse travel inspiration, search destinations
3. **Trip Planner** — Enter source, destination, dates, budget
4. **Agent Orchestration** — 5 agents work in parallel with live status
5. **Individual Agents** — Pick flights, hotels, events for your trip
6. **Final Itinerary** — Day-wise plan + budget breakdown + weather + all bookings
7. **Google Calendar Sync** — Events auto-added with reminders
8. **Comparison Mode** — Compare destinations before deciding
9. **Chatbot** — Quick answers for weather, flights, hotels, events

---

## ⚙️ Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- API keys (SerpAPI, OpenWeatherMap, OpenRouteService)
- Gmail App Password (for email OTP)
- Google Cloud OAuth credentials (for Calendar)

### Backend
```bash
cd backend
npm install
# Create .env file (see .env.example)
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (.env)
```
PORT=3000
JWT_PASSWORD=your_secret

SERPAPI_KEY=your_key
OPENWEATHER_API_KEY=your_key
OPENROUTE_KEY=your_key

GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
```

---

## 📂 Project Structure

```
tripsync/
├── backend/
│   ├── server.js          # Main server (all routes)
│   ├── db.js              # MongoDB schemas
│   ├── routes/
│   │   └── chatbot.js     # Trekky NLP chatbot
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/         # All page components
│   │   ├── components/    # Nav, Chatbot, Carousel
│   │   ├── styles/        # CSS files
│   │   └── App.jsx        # Routes
│   └── package.json
└── readme.md
```

---

## 👤 Author

**Khushi Verma** — [@akakhushiverma](https://github.com/akakhushiverma)
