import express from "express";
import nlp from "compromise";
import nlpDates from "compromise-dates";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
nlp.extend(nlpDates);

const router = express.Router();
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

/* =======================
   MAIN CHAT ROUTE
======================= */
router.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "Please type something 😊" });

  try {
    const lower = message.toLowerCase().trim();

    // --- BASIC CHITCHAT (check first, before NLP) ---
    const chitchatReply = handleChitchat(lower);
    if (chitchatReply) return res.json({ reply: chitchatReply });

    // Use original message for NLP (compromise needs capitalization for places)
    const doc = nlp(message);

    if (isTripPlanQuery(doc, lower)) return handleTripPlan(doc, message, res);
    if (isCompareQuery(doc, lower)) return handleCompare(doc, message, res);
    if (isFlightQuery(doc, lower)) return handleFlight(doc, message, res);
    if (isHotelQuery(doc, lower)) return handleHotel(doc, message, res);
    if (isEventQuery(doc, lower)) return handleEvents(doc, message, res);
    if (isDistanceQuery(doc, lower)) return handleDistance(doc, message, res);
    if (isWeatherQuery(doc, lower)) return handleWeather(doc, message, res);

    return res.json({
      reply:
        "🤖 I can help you with:\n" +
        "• Plan a trip: \"Plan my trip to Goa\"\n" +
        "• Compare: \"Compare Goa and Pondicherry\"\n" +
        "• Weather & Climate\n• Distance & Routes\n• Flights\n• Hotels\n• Events\n\n" +
        "Try asking:\n" +
        "Plan my trip to Jaipur\n" +
        "Compare Delhi and Mumbai\n" +
        "Weather in Jaipur tomorrow\n" +
        "Distance between Delhi and Agra"
    });
  } catch (err) {
    console.error("CHATBOT ERROR:", err);
    res.status(500).json({ reply: "Something went wrong 😕" });
  }
});

/* =======================
   CHITCHAT HANDLER
======================= */
function handleChitchat(msg) {
  // Greetings
  if (/^(hi|hello|hey|hola|namaste|howdy|sup|yo)\b/.test(msg)) {
    return "Hey there! 👋 I'm Trekky, your travel buddy. Ask me about weather, flights, hotels, events, or say \"Plan my trip to Goa\" ✈️";
  }

  // How are you
  if (/how are you|how('s| is) it going|what's up|wassup/.test(msg)) {
    return "I'm doing great, thanks! 🌟 Ready to help you plan your next adventure. Where are you thinking of going?";
  }

  // Who are you / what can you do
  if (/who are you|what are you|what can you do|what do you do|your name/.test(msg)) {
    return "I'm Trekky 🤖✨ — your AI travel assistant!\n\nI can help with:\n• 🗺️ Plan trips\n• ⚖️ Compare destinations\n• 🌦️ Weather forecasts\n• ✈️ Flight searches\n• 🏨 Hotel recommendations\n• 🎉 Local events\n• 📏 Distance & routes";
  }

  // Thank you
  if (/thank|thanks|thx|ty|thank you/.test(msg)) {
    return "You're welcome! 😊 Happy to help. Let me know if you need anything else for your trip!";
  }

  // Bye
  if (/^(bye|goodbye|see you|later|cya|tata)\b/.test(msg)) {
    return "Bon voyage! 🌍✈️ Have an amazing trip. Come back anytime you need help!";
  }

  // Help
  if (/^(help|help me|i need help|assist)\b/.test(msg)) {
    return "Sure! Here's what I can do:\n\n• \"Plan my trip to Goa\" — Get overview\n• \"Compare Mumbai and Delhi\" — Side by side\n• \"Weather in Jaipur\" — Forecast\n• \"Flights from Delhi to Mumbai on 2026-08-01\"\n• \"Hotels in Goa\"\n• \"Events in Mumbai\"\n• \"Distance between Delhi and Agra\"";
  }

  // Best place / recommend
  if (/best place|where should i go|recommend|suggest/.test(msg)) {
    return "Here are some popular picks! 🌟\n\n🏖️ Beach: Goa, Maldives\n🏔️ Mountains: Manali, Switzerland\n🏛️ Heritage: Jaipur, Rome\n🌆 City: Dubai, Paris\n🧘 Peaceful: Kerala, Bali\n\nTell me a city and I'll fetch weather, events & more!";
  }

  // Budget / cheap
  if (/budget|cheap|affordable|low cost/.test(msg)) {
    return "💰 Budget travel tips:\n\n• Book flights 2-3 months early\n• Travel off-season for cheaper hotels\n• Use the Compare feature to find cheaper destinations\n• Check events — free festivals are great!\n\nTry: \"Compare Goa and Pondicherry\" to see which is cheaper!";
  }

  // Safety
  if (/safe|safety|dangerous|crime/.test(msg)) {
    return "🛡️ For safety info, I recommend checking your government's travel advisory for your destination. In general:\n\n• Keep copies of documents\n• Share your itinerary with family\n• Register with your embassy\n• Stay aware of local customs\n\nWant me to check weather or events for a specific city?";
  }

  // Visa / passport
  if (/visa|passport|documents|travel documents/.test(msg)) {
    return "📄 For visa & passport queries, please check your country's official immigration website. I can help with:\n\n• Weather for your destination\n• Flight options\n• Hotels & events\n\nTry: \"Plan my trip to Paris\" !";
  }

  // Fun / joke
  if (/joke|funny|make me laugh|bored/.test(msg)) {
    return "😄 Here's one:\n\nWhy don't mountains ever get cold?\n...Because they wear snow caps! 🏔️❄️\n\nNow, ready to plan a trip? Ask me anything!";
  }

  // No match — return null to fall through to intent detection
  return null;
}

/* =======================
   INTENT DETECTORS
======================= */
const isTripPlanQuery = (doc, lower) =>
  /plan.*(trip|travel|visit)|trip to|visit to|going to/i.test(lower);

const isCompareQuery = (doc, lower) =>
  /compare|vs|versus|better.*(between|than)/i.test(lower);

const isWeatherQuery = (doc, lower) =>
  /\bweather\b/i.test(lower) ||
  /\btemperature\b/i.test(lower) ||
  /\b(rain|snow|sunny|forecast|cold|climate)\b/i.test(lower);

const isDistanceQuery = (doc, lower) =>
  /\bdistance\b/i.test(lower) || /\broute\b/i.test(lower) || /how far/i.test(lower);

const isFlightQuery = (doc, lower) =>
  /\bflights?\b/i.test(lower);

const isHotelQuery = (doc, lower) =>
  /\bhotels?\b/i.test(lower) || /\bstay\b/i.test(lower) || /\baccommodation\b/i.test(lower);

const isEventQuery = (doc, lower) =>
  /\bevents?\b/i.test(lower) ||
  /concerts?|festivals?|workshops?|exhibitions?|things to do/i.test(lower);


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
  if (places.length < 2) places = extractCities(message);

  // Extract date - try multiple patterns
  let date = null;
  
  // Try YYYY-MM-DD format first
  const dateMatch = message.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    date = dateMatch[1];
  } else {
    // Try compromise dates
    const nlpDate = doc.dates().out("array")[0];
    if (nlpDate) date = nlpDate;
  }

  // If no date found, use tomorrow
  if (!date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7); // default to 7 days from now
    date = tomorrow.toISOString().split("T")[0];
  }

  if (places.length < 2) {
    return res.json({ reply: "Please mention two cities. Example: Flights from Delhi to Mumbai on 2026-08-01" });
  }

  const [from, to] = places;

  try {
    const r = await axios.get("http://localhost:3000/api/flights", {
      params: { from, to, out_date: date },
    });
    if (!r.data.flights || !r.data.flights.length)
      return res.json({ reply: `No flights found from ${from} to ${to} on ${date} 😕` });

    const top3 = r.data.flights.slice(0, 3).map((f, i) =>
      `${i + 1}. ${f.airline} (${f.flight_number})\n   🕐 ${f.departure_time} → ${f.arrival_time}\n   💰 ₹${f.price}`
    ).join("\n\n");

    res.json({
      reply: `✈️ Flights from ${from} to ${to} on ${date}:\n\n${top3}\n\n💡 Use the Planner to add flights to your itinerary!`
    });
  } catch (err) {
    console.error("FLIGHT ERROR:", err.message);
    res.json({ reply: "Couldn't fetch flights 😕 Make sure cities are valid." });
  }
}

/* =======================
   HOTEL HANDLER
======================= */
async function handleHotel(doc, message, res) {
  let city = doc.places().out("array")[0];
  if (!city) {
    const match = message.match(/hotels?\s+in\s+([a-zA-Z\s]+)/i);
    city = match ? match[1].trim() : message.split(" ").pop();
  }

  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 3);

    const check_in = tomorrow.toISOString().split("T")[0];
    const check_out = dayAfter.toISOString().split("T")[0];

    const r = await axios.get("http://localhost:3000/api/hotels", {
      params: { city, check_in, check_out }
    });

    const hotels = r.data.hotels || [];
    if (!hotels.length) {
      return res.json({ reply: `No hotels found in ${city} 😕` });
    }

    const top3 = hotels.slice(0, 3).map((h, i) => 
      `${i + 1}. ${h.name}\n   ⭐ ${h.rating || "N/A"} | 💰 ₹${h.price || "N/A"}/night`
    ).join("\n\n");

    res.json({
      reply: `🏨 Top Hotels in ${city}:\n\n${top3}\n\n💡 Use the Planner to book one into your itinerary!`
    });
  } catch (err) {
    console.error("HOTEL CHAT ERROR:", err.message);
    res.json({ reply: `🏨 Hotels in ${city} — use the Planner page to search with your exact dates for best results!` });
  }
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



/* =======================
   TRIP PLAN HANDLER
======================= */
async function handleTripPlan(doc, message, res) {
  let city = doc.places().out("array")[0];
  if (!city) {
    // Try to extract from "trip to X" pattern
    const match = message.match(/(?:trip|travel|visit|going)\s+to\s+([a-zA-Z\s]+)/i);
    city = match ? match[1].trim() : null;
  }

  if (!city) {
    return res.json({ reply: "Which city do you want to visit? Try: Plan my trip to Goa" });
  }

  try {
    // Fetch weather (optional — won't crash if fails)
    let weatherInfo = "";
    try {
      const weatherRes = await axios.get("https://api.openweathermap.org/data/2.5/forecast", {
        params: { q: city, units: "metric", appid: OPENWEATHER_API_KEY }
      });
      const forecast = weatherRes.data.list?.[0];
      const temp = forecast ? `${Math.round(forecast.main.temp)}°C` : "N/A";
      const condition = forecast ? forecast.weather[0].description : "N/A";
      weatherInfo = `🌦️ Weather: ${temp}, ${condition}\n`;
    } catch {
      weatherInfo = "🌦️ Weather: Currently unavailable\n";
    }

    // Fetch events (optional)
    const today = new Date().toISOString().split("T")[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const endDate = nextMonth.toISOString().split("T")[0];

    let eventInfo = "";
    try {
      const eventsRes = await axios.get("http://localhost:3000/api/events", {
        params: { city, start_date: today, end_date: endDate }
      });
      const events = eventsRes.data.events || [];
      eventInfo = events.length > 0
        ? `\n🎉 ${events.length} events found! Top:\n${events.slice(0, 3).map(e => `• ${e.title}`).join("\n")}`
        : "\n🎉 No major events found for the next month.";
    } catch {
      eventInfo = "";
    }

    res.json({
      reply: `🗺️ Trip Plan for ${city}:\n\n` +
        `${weatherInfo}` +
        `${eventInfo}\n\n` +
        `💡 To create a full itinerary with flights & hotels, use the Planner page!\n` +
        `Just click "Planner" in the navigation bar.`
    });
  } catch (err) {
    res.json({ reply: `I couldn't fetch details for ${city} 😕 Please check the city name.` });
  }
}

/* =======================
   COMPARE HANDLER
======================= */
async function handleCompare(doc, message, res) {
  // Extract two cities from "compare X and Y" or "X vs Y"
  let cities = [];
  const compareMatch = message.match(/compare\s+([a-zA-Z\s]+?)\s+(?:and|vs|versus|with)\s+([a-zA-Z\s]+)/i);
  if (compareMatch) {
    cities = [compareMatch[1].trim(), compareMatch[2].trim()];
  } else {
    const vsMatch = message.match(/([a-zA-Z]+)\s+(?:vs|versus)\s+([a-zA-Z]+)/i);
    if (vsMatch) cities = [vsMatch[1].trim(), vsMatch[2].trim()];
  }

  if (cities.length < 2) {
    return res.json({ reply: "Please ask like: Compare Goa and Pondicherry" });
  }

  const [cityA, cityB] = cities;

  try {
    const [weatherA, weatherB] = await Promise.all([
      axios.get("https://api.openweathermap.org/data/2.5/forecast", {
        params: { q: cityA, units: "metric", appid: OPENWEATHER_API_KEY }
      }).catch(() => null),
      axios.get("https://api.openweathermap.org/data/2.5/forecast", {
        params: { q: cityB, units: "metric", appid: OPENWEATHER_API_KEY }
      }).catch(() => null)
    ]);

    const tempA = weatherA?.data?.list?.[0]?.main?.temp;
    const tempB = weatherB?.data?.list?.[0]?.main?.temp;

    let reply = `⚖️ Comparing ${cityA} vs ${cityB}:\n\n`;
    reply += `🌡️ ${cityA}: ${tempA ? Math.round(tempA) + "°C" : "N/A"}\n`;
    reply += `🌡️ ${cityB}: ${tempB ? Math.round(tempB) + "°C" : "N/A"}\n\n`;
    reply += `For a full comparison with hotels, events & prices, visit the Compare page!`;

    res.json({ reply });
  } catch {
    res.json({ reply: "Couldn't compare those cities 😕" });
  }
}

export default router;
