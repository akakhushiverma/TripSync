import express from "express";
import nlp from "compromise";
import nlpDates from "compromise-dates";
import axios from "axios";

nlp.extend(nlpDates);

const router = express.Router();
const OPENWEATHER_API_KEY = "cf8d0432c78210144d0c02f2a9c12bc9";

/* =======================
   MAIN CHAT ROUTE
======================= */
router.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "Please type something 😊" });

  try {
    const doc = nlp(message.toLowerCase());

    if (isWeatherQuery(doc, message)) return handleWeather(doc, message, res);
    if (isDistanceQuery(doc, message)) return handleDistance(doc, message, res);
    if (isFlightQuery(doc, message)) return handleFlight(doc, message, res);
    if (isHotelQuery(doc, message)) return handleHotel(doc, message, res);
    if (isEventQuery(doc, message)) return handleEvents(doc, message, res);

    return res.json({
      reply:
        "🤖 I can help you with:\n" +
        "• Weather & Climate\n• Distance & Routes\n• Flights\n• Hotels\n• Events\n\n" +
        "Try asking:\n" +
        "Weather in Jaipur tomorrow\n" +
        "Distance between Delhi and Agra\n" +
        "Flights from Delhi to Mumbai on 2025-01-10"
    });
  } catch (err) {
    console.error("CHATBOT ERROR:", err);
    res.status(500).json({ reply: "Something went wrong 😕" });
  }
});

/* =======================
   INTENT DETECTORS
======================= */
const isWeatherQuery = (doc, message) =>
  doc.has("weather") ||
  doc.has("temperature") ||
  /rain|snow|sunny|forecast|hot|cold|climate/i.test(message);

const isDistanceQuery = (doc, message) =>
  doc.has("distance") || doc.has("route") || /how far/i.test(message);

const isFlightQuery = (doc, message) =>
  doc.has("flight") || doc.has("flights");

const isHotelQuery = (doc, message) =>
  doc.has("hotel") || doc.has("hotels") || doc.has("stay");

const isEventQuery = (doc, message) =>
  doc.has("event") ||
  /concerts?|festivals?|workshops?|exhibitions?/i.test(message);


/* =======================
   CITY EXTRACTION
======================= */
function extractCities(text) {
  const regex = /(?:from|between|is)\s+([a-zA-Z\s]+?)\s+(?:to|and|from)\s+([a-zA-Z\s]+)/i;
  const match = text.match(regex);
  if (match) return [match[1].trim(), match[2].trim()];

  const capitalWords = text.match(/\b[A-Z][a-z]+\b/g) || [];
  if (capitalWords.length >= 2) return capitalWords.slice(-2);

  return [];
}

/* =======================
   WEATHER HANDLER
======================= */
async function handleWeather(doc, message, res) {
  try {
    let city = doc.places().out("array")[0];
    if (!city) {
      const words = message.split(" ");
      city = words[words.length - 1];
    }

    // Detect if user wants forecast or current weather
    const isForecast = /tomorrow|forecast|week|days|5-day|7-day/i.test(message);

    let endpoint = isForecast
      ? "https://api.openweathermap.org/data/2.5/forecast"
      : "https://api.openweathermap.org/data/2.5/weather";

    const r = await axios.get(endpoint, {
      params: { q: city, units: "metric", appid: OPENWEATHER_API_KEY },
    });

    if (isForecast) {
      // Return the first forecast entry (closest to requested day)
      const forecastList = r.data.list;
      const firstForecast = forecastList[0];
      const desc = firstForecast.weather[0].description;
      const temp = firstForecast.main.temp;
      const date = firstForecast.dt_txt;

      res.json({
        reply: `🌦 Weather forecast in ${city} on ${date}:
🌡 Temperature: ${temp}°C
☁️ Condition: ${desc}`,
      });
    } else {
      // Current weather
      const w = r.data;
      res.json({
        reply: `🌦 Current weather in ${city}:
🌡 Temperature: ${w.main.temp}°C
☁️ Condition: ${w.weather[0].description}
💧 Humidity: ${w.main.humidity}%
💨 Wind: ${w.wind.speed} m/s`,
      });
    }
  } catch (err) {
    console.error("WEATHER ERROR:", err.response?.data || err.message);
    res.json({ reply: "Couldn't fetch weather 😕" });
  }
}

/* =======================
   DISTANCE HANDLER
======================= */
async function handleDistance(doc, message, res) {
  let places = doc.places().out("array");
  if (places.length < 2) places = extractCities(message);

  if (places.length < 2)
    return res.json({ reply: "Please ask like: Distance between Delhi and Agra" });

  const [from, to] = places;

  try {
    const r = await axios.get("http://localhost:3000/api/route", {
      params: { start: from, end: to },
    });
    if (!r.data || !r.data.distance)
      return res.json({ reply: `Couldn't find route from ${from} to ${to} 😕` });

    res.json({
      reply: `🛣 Distance from ${from} to ${to}\n📏 ${r.data.distance}\n⏱ ${r.data.duration}`,
    });
  } catch (err) {
    console.error("DISTANCE ERROR:", err.message);
    res.json({ reply: "Couldn't fetch distance 😕" });
  }
}

/* =======================
   FLIGHT HANDLER
======================= */
async function handleFlight(doc, message, res) {
  let places = doc.places().out("array");
  const date = doc.dates().out("array")[0];
  if (places.length < 2) places = extractCities(message);

  if (places.length < 2 || !date)
    return res.json({ reply: "Ask like: Flights from Delhi to Mumbai on 2025-01-10" });

  const [from, to] = places;

  try {
    const r = await axios.get("http://localhost:3000/api/flights", {
      params: { from, to, out_date: date },
    });
    if (!r.data.flights || !r.data.flights.length)
      return res.json({ reply: "No flights found 😕" });

    const f = r.data.flights[0];
    res.json({
      reply: `✈️ Flight Found\n🛫 ${from} → ${to}\n⏰ Departure: ${f.departure_time}\n💰 Price: ₹${f.price}`,
    });
  } catch (err) {
    console.error("FLIGHT ERROR:", err.message);
    res.json({ reply: "Couldn't fetch flights 😕" });
  }
}

/* =======================
   HOTEL HANDLER
======================= */
async function handleHotel(doc, message, res) {
  let city = doc.places().out("array")[0];
  if (!city) city = message.split(" ").pop();

  res.json({
    reply: `🏨 Showing hotels in ${city}. Please open the Hotels section for full details.`,
  });
}

/* =======================
   EVENTS HANDLER
======================= */async function handleEvents(doc, message, res) {
  let city = doc.places().out("array")[0];
  if (!city) {
    const capitalWords = message.match(/\b[A-Z][a-z]+\b/g);
    city = capitalWords ? capitalWords[0] : "Mumbai";
  }

  const eventTypeMatch = message.match(/concerts?|festivals?|workshops?|exhibitions?/i);
  const eventType = eventTypeMatch ? eventTypeMatch[0] : "";

  try {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    const start_date = today.toISOString().split("T")[0];
    const end_date = nextMonth.toISOString().split("T")[0];

    const r = await axios.get("http://localhost:3000/api/events", {
      params: { city, start_date, end_date }
    });

    const events = r.data.events || [];
    if (!events.length) {
      return res.json({ reply: `No ${eventType || "events"} found in ${city} 😕` });
    }

    // Take top 5 events
    const reply = events.slice(0, 5)
      .map(e => `• ${e.title} on ${e.date} at ${e.venue || e.address}`)
      .join("\n");

    res.json({
      reply: `🎉 Upcoming ${eventType || "events"} in ${city}:\n${reply}`
    });

  } catch (err) {
    console.error("EVENTS ERROR:", err.message);
    res.json({ reply: "Couldn't fetch events 😕" });
  }
}



export default router;
