# 🌍✈️ TripSync  
### Smart, Agent-Based Travel Planning Platform

---

## 📝 Description

**TripSync** is a smart, full-stack travel planning platform that simplifies trip planning by bringing together all essential travel components — **weather, routes, flights, hotels, events, and budgeting** — into a single, seamless experience.

Instead of switching between multiple apps and tabs, users can plan an entire trip in one place. TripSync uses an **agent-based architecture**, where each agent (**Weather, Routes, Flights, Hotels, Events**) independently fetches and processes data, collaboratively generating a personalized itinerary.

The platform also includes an **AI-like chatbot — Trekky 🤖**, built using **rule-based NLP**, to answer basic travel queries — completely **free and API-efficient**.

---

## 🔁 Process Flow

### 1️⃣ User Signup / Login
- Secure authentication using **JWT**
- User data stored in **MongoDB**

### 2️⃣ Dashboard
- Displays random travel inspiration cards
- Access previously created itineraries

### 3️⃣ Trip Planner
User enters:
- Destination
- Start & End Date
- Budget

### 4️⃣ Agent-Based Itinerary Generation

Each agent works independently:

- 🟦 **Weather Agent** → Weather for selected dates  
- 🟩 **Route Agent** → Distance, duration & travel modes  
- 🟥 **Flight Agent** → Ongoing & return flights  
- 🟨 **Hotel Agent** → Available stays with pricing  
- 🟪 **Events Agent** → Local events during trip dates  

### 5️⃣ Itinerary Card Creation
- Selected details compiled into a single itinerary
- Stored securely under the user’s profile
- Users can create **multiple itineraries** for multiple trips

### 6️⃣ Chatbot Assistance (Trekky 🤖)
- Answers basic travel questions:
  - Weather queries
  - Distance between cities
  - Routes & events
  - Hotels & flights
- Implemented fully in backend (**no paid AI APIs**)

---

## 🚀 Features

- ✅ Secure Login & Signup  
- ✅ Personalized Trip Planner  
- ✅ Agent-Based Architecture  
- ✅ Weather, Routes, Flights, Hotels & Events  
- ✅ Google Maps & OpenRoute integration  
- ✅ Google Calendar event sync  
- ✅ Multiple itineraries per user  
- ✅ AI-like chatbot (Trekky 🤖)  
- ✅ MongoDB-based data persistence  

---

## 🤖 Chatbot – Trekky

**Trekky** is a lightweight, rule-based chatbot built **without any paid AI services**.

### 🧠 How Trekky Works
- Built using **Node.js + Express**
- Uses **compromise** & **compromise-dates** for NLP
- Detects user intent using keyword & pattern matching
- Calls existing backend APIs (weather, routes, events)
- Returns responses **inside the chatbot only** (no page redirects)

### 🗣 Example Queries
- *What will be the weather in Jaipur tomorrow?*
- *Distance between Delhi and Agra*
- *Show me events in Mumbai next month*

---

## 🛠️ Tech Stack

### 🔧 Frontend
- React.js  
- Tailwind CSS  
- react-chatbot-kit  

### ⚙️ Backend
- Node.js  
- Express.js  
- JWT Authentication  
- MongoDB (Mongoose)  

---

## 🗺️ APIs Used
- **OpenWeatherMap API** – Weather data  
- **SerpAPI** – Flights, hotels & events  
- **OpenRouteService API** – Routes & distance  
- **Google Maps API** – Maps & directions  
- **Google Calendar API** – Calendar event sync  

---

## 🧑‍💻 Installation & Setup

### 📦 Prerequisites
- Node.js & npm
- MongoDB (local or Atlas)
- API keys for required services
- Update Mongodb Url in backend/db.js
---

### ⚙️ Backend Setup

```bash
git clone https://github.com/your-username/TripSync.git
cd TripSync/backend
npm install
Create a .env file:
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_PASSWORD=your_jwt_secret

SERPAPI_KEY=your_serpapi_key
OPENWEATHER_API_KEY=your_openweather_key
OPENROUTE_KEY=your_openroute_key

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
Update Mongodb Url in backend/db.js
