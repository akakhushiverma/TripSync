import express from "express";
import cors from "cors";
import { getJson } from "serpapi";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios" 
import { ItenaryModel } from "./db.js";
import {UserModel} from "./db.js"; // note the .js extension
import { google } from "googleapis";

dotenv.config();
// ---------------- Express App ----------------
const app = express();
app.use(cors());
app.use(express.json());
const JWT_SECRET = process.env.JWT_PASSWORD;

app.use(express.json());
 const userMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authorization header missing"
    });
  }

  // Extract token
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  try {
    const decoded = jwt.verify(token,JWT_SECRET);

    // attach userId to request
    req.userId = decoded.id;

    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid or expired token"
    });
  }
};

app.post("/register", async (req, res) => {
  const { 
    username,
    email,
    password,
    firstname,
    lastname,
    gender,
    dob,
    nationality,
    city,
    state,
    phone_number
   } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ status: "Provide username, email, and password" });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) return res.status(400).json({ status: "Already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
    username,
      email,
      password: hashedPassword,
      firstname,
      lastname,
      gender,
      dob,            
      nationality,
      city,
      state,
      phone_number
    });

    res.json({ status: "Signup successful", userId: user._id });
  } catch (err) {
    res.status(500).json({ status: "Server error", error: err.message });
  }
});

// ---------------- SIGNIN ----------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ status: "Provide email and password" });

  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ status: "No records found!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ status: "Wrong password" });

    // Generate JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ status: "Success", token, userId: user._id });
  } catch (err) {
    res.status(500).json({ status: "Server error", error: err.message });
  }
});

// --- 1. AIRPORT MAPPING LOGIC ---
const AIRPORT_MAP = {
    "mumbai": "BOM", 
    "delhi": "DEL", 
    "jaipur": "JAI", 
    "bangalore": "BLR", 
    "bengaluru": "BLR", 
    "goa": "GOI",
    "pune": "PNQ", 
    "chennai": "MAA", 
    "kolkata": "CCU",
    "hyderabad": "HYD", 
    "ahmedabad": "AMD", 
    "lucknow": "LKO",
    "paris" :"CDG"

};

const getIataCode = (input) => {
    if (!input) return "";
    const cleanInput = input.trim().toLowerCase();
    // Return the code if found, otherwise return uppercase version of input
    return AIRPORT_MAP[cleanInput] || input.trim().toUpperCase();
};

// --- 2. EVENTS ROUTE ---

app.get('/api/events', async (req, res) => {
    const { city, start_date, end_date } = req.query;
    const formatDate = d => d.replaceAll("-", "");

    try {
        const response = await getJson({
            engine: "google_events",
            q: `Events in ${city}`,
            hl: "en",
            gl: "in",
            htichips: `date:custom,${formatDate(start_date)},${formatDate(end_date)}`,
            api_key: process.env.SERPAPI_KEY
        });

        const cleanEvents = (response.events_results || []).map(e => ({
            title: e.title || "",
            date: e.date?.start_date || "",
            time: e.date?.when || "",
            venue: e.venue?.name || "",
            address: e.address?.join(", ") || "",
            // UPDATE: Use e.image if available for higher resolution, fallback to thumbnail
            image: e.image || e.thumbnail || "", 
            ticket_link: e.link || ""
        }));

        res.json({ count: cleanEvents.length, events: cleanEvents });
    } catch (err) {
        res.status(500).json({ error: "Events search failed" });
    }
});
// --- 3. FLIGHTS ROUTE (With Auto-Conversion) ---
app.get('/api/flights', async (req, res) => {
    let { from, to, out_date } = req.query;

    if (!from || !to || !out_date) {
        return res.status(400).json({ 
            error: "Missing parameters", 
            message: "You must provide 'from', 'to', and 'out_date' (YYYY-MM-DD)" 
        });
    }

    const departure_id = getIataCode(from);
    const arrival_id = getIataCode(to);

    try {
        const response = await getJson({
            engine: "google_flights",
            departure_id: departure_id,
            arrival_id: arrival_id,
            outbound_date: out_date,
            currency: "INR",
            hl: "en",
            type: "2", // One way
            api_key: process.env.SERPAPI_KEY
        });

        const allFlights = response.best_flights || response.other_flights || [];

        // --- FLATTENING LOGIC ---
        // We take the SerpApi response and map it to your simple FlightSchema
        const simplifiedFlights = allFlights.map(f => {
            // Get the first and last leg for departure/arrival info
            const firstLeg = f.flights[0];
            const lastLeg = f.flights[f.flights.length - 1];

            return {
                airline: firstLeg.airline,
                airline_logo: firstLeg.airline_logo,
                flight_number: firstLeg.flight_number,
                
                departure_airport: firstLeg.departure_airport.name,
                departure_time: firstLeg.departure_airport.time,
                
                arrival_airport: lastLeg.arrival_airport.name,
                arrival_time: lastLeg.arrival_airport.time,
                
                duration: f.total_duration,
                price: f.price
            };
        });

        res.json({
            from: departure_id,
            to: arrival_id,
            count: simplifiedFlights.length,
            flights: simplifiedFlights
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Flight search failed", details: err.message });
    }
});
app.get('/api/hotels', async (req, res) => {
    const { city, check_in, check_out } = req.query;

    if (!city || !check_in || !check_out) {
        return res.status(400).json({ 
            error: "Missing parameters", 
            message: "Provide 'city', 'check_in' (YYYY-MM-DD), and 'check_out' (YYYY-MM-DD)" 
        });
    }

    try {
        const response = await getJson({
            engine: "google_hotels",
            q: `hotels in ${city}`,
            check_in_date: check_in,
            check_out_date: check_out,
            currency: "INR",
            hl: "en",
            api_key: process.env.SERPAPI_KEY
        });

        // The hotel results are inside the 'properties' array
        const hotels = response.properties || [];
        
        const cleanHotels = hotels.map(h => ({
            name: h.name,
            price: h.rate_per_night?.lowest || "N/A",
            rating: h.overall_rating,
            reviews: h.reviews,
            thumbnail: h.images?.[0]?.thumbnail,
            link: h.link,
            description: h.description
        }));

        res.json({ city, count: cleanHotels.length, hotels: cleanHotels });

    } catch (err) {
        res.status(500).json({ error: "Hotel search failed", details: err.message });
    }
});

app.post('/api/itinerary/create',userMiddleware,async (req,res)=>{
    const {destination,startdate,enddate} =req.body;

    if (!destination || !startdate || !enddate) {
    return res.status(400).json({ message: "Missing required itinerary fields" });
    }
    try{
        const newItenary = await ItenaryModel.create({
        userId: req.userId,      // 👈 from JWT middleware
        destination,
        startdate,
        enddate,
        events: [],
        flightdetails: null,
        hoteldetails: null
        });

       res.status(200).json({
        message: "Itinerary created",
        itineraryId: newItenary._id
});
    }catch(err){
        console.error(err);
        res.status(500).json({
        message: "Failed to create itinerary"
        });
    }
   
});

app.post("/api/itinerary/event", userMiddleware, async (req, res) => {
  const { itineraryId, event } = req.body;

  if (!itineraryId || !event) {
    return res.status(400).json({
      message: "itineraryId and event are required"
    });
  }

  try {
    const itinerary = await ItenaryModel.findOneAndUpdate(
      {
        _id: itineraryId,
        userId: req.userId // 🔒 ensure owner
      },
      {
        $push: { events: event }
      },
      { new: true }
    );

    if (!itinerary) {
      return res.status(404).json({
        message: "Itinerary not found or unauthorized"
      });
    }

    res.json({message: "Event added"});
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to add event"
    });
  }
});
app.post("/api/itinerary/flight", userMiddleware, async (req, res) => {
  const { itineraryId, flightdetails } = req.body;

  if (!itineraryId || !flightdetails) {
    return res.status(400).json({
      message: "itineraryId and flightdetails are required"
    });
  }

  try {
    const itinerary = await ItenaryModel.findOneAndUpdate(
      {
        _id: itineraryId,
        userId: req.userId
      },
      {
        $set: { flightdetails }
      },
      { new: true }
    );

    if (!itinerary) {
      return res.status(404).json({
        message: "Itinerary not found or unauthorized"
      });
    }

    res.json(itinerary);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to add flight"
    });
  }
});
//----------return flighst add-----------
app.post("/api/itinerary/returnflight", userMiddleware, async (req, res) => {
  const { itineraryId, returnflight } = req.body;

  if (!itineraryId || !returnflight) {
    return res.status(400).json({
      message: "itineraryId and returnflight are required"
    });
  }

  try {
    const itinerary = await ItenaryModel.findOneAndUpdate(
      {
        _id: itineraryId,
        userId: req.userId
      },
      {
        $set: { returnflight }
      },
      { new: true }
    );

    if (!itinerary) {
      return res.status(404).json({
        message: "Itinerary not found or unauthorized"
      });
    }

    res.json(itinerary);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to add flight"
    });
  }
});

app.post("/api/itinerary/hotel", userMiddleware, async (req, res) => {
  const { itineraryId, hoteldetails } = req.body;

  if (!itineraryId || !hoteldetails) {
    return res.status(400).json({
      message: "itineraryId and hoteldetails are required"
    });
  }

  try {
    const itinerary = await ItenaryModel.findOneAndUpdate(
      {
        _id: itineraryId,
        userId: req.userId
      },
      {
        $set: { hoteldetails }
      },
      { new: true }
    );

    if (!itinerary) {
      return res.status(404).json({
        message: "Itinerary not found or unauthorized"
      });
    }

    res.json(itinerary);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to add hotel"
    });
  }
});
app.get("/api/itinerary/:id", userMiddleware, async (req, res) => {
  try {
    const itinerary = await ItenaryModel.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }

    res.json(itinerary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch itinerary" });
  }
});
app.get("/api/itineraries", userMiddleware, async (req, res) => {
  try {
    const itineraries = await ItenaryModel.find({
      userId: req.userId
    }).sort({ _id: -1 }); // latest first (optional)

    res.json({
      itineraries
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch itineraries" });
  }
});


app.get("/api/profile", userMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        status: "User not found"
      });
    }

    res.status(200).json({
      status: "Success",
      user
    });
  } catch (error) {
    res.status(500).json({
      status: "Server error",
      error: error.message
    });
  }
});
// UPDATE USER PROFILE
app.put("/api/profile", userMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // from JWT middleware

    const {
      firstname,
      lastname,
      gender,
      dob,
      nationality,
      city,
      state,
      phone_number
    } = req.body;

    // Only allow safe fields to be updated
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        firstname,
        lastname,
        gender,
        dob,
        nationality,
        city,
        state,
        phone_number
      },
      {
        new: true,            // return updated document
        runValidators: true   // enforce schema rules
      }
    ).select("-password");   // never send password

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to update profile",
      error: err.message
    });
  }
});
app.get('/api/route', async (req, res) => {
    const { start, end, mode } = req.query;

    if (!start || !end) {
        return res.status(400).json({ error: "Please provide both start and end locations." });
    }

    try {
        const response = await getJson({
            engine: "google_maps_directions",
            start_addr: start,
            end_addr: end,
            // 0: Driving, 3: Transit, 2: Walking, 1: Bicycling
            travel_mode: mode || "0", 
            api_key: process.env.SERPAPI_KEY
        });

        // Extracting the main route info
        const routeData = response.directions?.[0] || {};
        
        res.json({
            origin: start,
            destination: end,
            distance: routeData.formatted_distance || "N/A",
            duration: routeData.formatted_duration || "N/A",
            steps: routeData.legs?.[0]?.steps || []
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch route data" });
    }
});
//route code 
async function geocodeCity(city) {
  const url = `https://api.openrouteservice.org/geocode/search`;

  const response = await axios.get(url, {
    params: {
      api_key: OPENROUTE_KEY,
      text: city,
      size: 1
    }
  });

  if (!response.data.features.length) {
    throw new Error(`Location not found: ${city}`);
  }

  const [lng, lat] = response.data.features[0].geometry.coordinates;
  return { lat, lng };
}
const OPENROUTE_KEY = process.env.OPENROUTE_KEY;

/* ------------------ 2️⃣ Route API ------------------ */
app.post("/api/map", async (req, res) => {
  try {
    const { startCity, endCity, mode } = req.body;

    if (!startCity || !endCity) {
      return res.status(400).json({ error: "Start or End city missing" });
    }

    const start = await geocodeCity(startCity);
    const end = await geocodeCity(endCity);

    const routeResponse = await axios.post(
      `https://api.openrouteservice.org/v2/directions/${mode}/geojson`,
      {
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat]
        ]
      },
      {
        headers: {
          Authorization: OPENROUTE_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      startCity,
      endCity,
      mode,
      route: routeResponse.data
    });

  } catch (error) {
    console.error("OPENROUTE ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to get route" });
  }
});

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
app.get("/api/google/status", (req, res) => {
  if (global.googleTokens) {
    return res.json({ connected: true });
  }
  res.json({ connected: false });
});

app.get("/api/google/auth", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.events"]
  });
  res.redirect(url);
});

app.get("/api/google/callback", async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    global.googleTokens = tokens; // TEMP store tokens
    res.send("Google connected! You can close this tab.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Google Auth failed");
  }
});

app.post("/api/google/add-event", async (req, res) => {
  try {
    const { event } = req.body;
    const tokens = global.googleTokens;
    if (!tokens) return res.status(401).json({ message: "Google not connected" });

    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Ensure the date is in a format Google understands
    // If event.date is "2025-12-22", this works perfectly.
    const startDateTime = `${event.date}T${event.time || "10:00"}:00`;
    const endDateTime = `${event.date}T${event.time ? parseInt(event.time) + 1 : "11"}:00:00`;

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: event.title,
        location: event.venue || event.address,
        description: `Booked via Travel App. Ticket Link: ${event.ticket_link || 'N/A'}`,
        start: { 
            dateTime: new Date(startDateTime).toISOString(), 
            timeZone: "Asia/Kolkata" 
        },
        end: { 
            dateTime: new Date(endDateTime).toISOString(), 
            timeZone: "Asia/Kolkata" 
        },
      }
    });app.post("/api/google/add-event", async (req, res) => {
  try {
    const { event } = req.body;
    const tokens = global.googleTokens;
    if (!tokens) return res.status(401).json({ message: "Google not connected" });

    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Ensure the date is in a format Google understands
    // If event.date is "2025-12-22", this works perfectly.
    const startDateTime = `${event.date}T${event.time || "10:00"}:00`;
    const endDateTime = `${event.date}T${event.time ? parseInt(event.time) + 1 : "11"}:00:00`;

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: event.title,
        location: event.venue || event.address,
        description: `Booked via Travel App. Ticket Link: ${event.ticket_link || 'N/A'}`,
        start: { 
            dateTime: new Date(startDateTime).toISOString(), 
            timeZone: "Asia/Kolkata" 
        },
        end: { 
            dateTime: new Date(endDateTime).toISOString(), 
            timeZone: "Asia/Kolkata" 
        },
      }
    });

    res.json({ success: true, googleEvent: response.data });
  } catch (err) {
    console.error("GOOGLE CALENDAR ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "Calendar insert failed", error: err.message });
  }
});

    res.json({ success: true, googleEvent: response.data });
  } catch (err) {
    console.error("GOOGLE CALENDAR ERROR:", err.response?.data || err.message);
    res.status(500).json({ message: "Calendar insert failed", error: err.message });
  }
});
const PORT = 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));