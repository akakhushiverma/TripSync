import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Nav from "../components/Nav";
import "../styles/Events.css";

export default function Events() {
  const location = useLocation();
  const trip = location.state?.trip;

  const city = trip?.destination;
  const startDate = trip?.start;
  const endDate = trip?.end;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleConnected, setGoogleConnected] = useState(false);

  /* ---------------- CHECK GOOGLE STATUS ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:3000/api/google/status")
      .then(res => setGoogleConnected(res.data.connected))
      .catch(() => setGoogleConnected(false));
  }, []);

  /* ---------------- FETCH EVENTS ---------------- */
  useEffect(() => {
    if (city && startDate && endDate) fetchEvents();
  }, [city, startDate, endDate]);

  const fetchEvents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:3000/api/events", {
        params: {
          city,
          start_date: startDate,
          end_date: endDate
        }
      });
      setEvents(res.data.events || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ADD EVENT ---------------- */
  const handleAddEvent = async (event) => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    return;
  }

  // 1. Format the date correctly (Google expects YYYY-MM-DD)
  // If your 'trip' object has the year, use that. 
  // SerpApi's event.date is often just "Month Day". 
  // Here we ensure we have a fallback or valid ISO string.
  const eventDate = event.date || trip.start; 

  const safeEvent = {
    ...event,
    date: eventDate, 
    time: event.time || "10:00" // Required for Google Calendar start time
  };

  try {
    // 1️⃣ Add to Itinerary (Internal DB)
    await axios.post(
      "http://localhost:3000/api/itinerary/event",
      { itineraryId: trip.id, event: safeEvent },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 2️⃣ Add to Google Calendar
    // Note: We don't need the Auth header here because you're using global.googleTokens 
    // on the backend, but in a production app, you'd associate tokens with a User ID.
    await axios.post(
      "http://localhost:3000/api/google/add-event",
      { event: safeEvent }
    );

    alert("✅ Event added to Itinerary & Google Calendar!");
  } catch (err) {
    console.error(err);
    alert("Failed to add event. Make sure Google is connected.");
  }
};
const handleAddToItinerary = async (event) => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    return;
  }

  try {
    await axios.post(
      "http://localhost:3000/api/itinerary/event",
      { itineraryId: trip.id, event },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("✅ Event added to your Itinerary!");
  } catch (err) {
    console.error(err);
    alert("Failed to add to itinerary.");
  }
};

/* ---------------- ADD TO CALENDAR ---------------- */
const handleAddToCalendar = async (event) => {
  if (!googleConnected) {
    window.location.href = "http://localhost:3000/api/google/auth";
    return;
  }

  // Ensure date is valid for Google
  const eventDate = event.date || trip.start;
  const safeEvent = {
    ...event,
    date: eventDate,
    time: event.time || "10:00"
  };

  try {
    await axios.post(
      "http://localhost:3000/api/google/add-event",
      { event: safeEvent }
    );
    alert("📅 Syncing... Event added to Google Calendar!");
  } catch (err) {
    console.error(err);
    alert("Failed to add to Google Calendar.");
  }
};
  /* ---------------- UI ---------------- */
  return (
    <div className="background-containerr">
      <Nav />
      <div className="background-content">
        <header className="events-header">
          <h2 className="section-title">Events in {city}</h2>
          <p className="events-subtitle">
            {startDate} — {endDate}
          </p>
        </header>

        {loading && <p className="loading-text">Loading events...</p>}
        {error && <p className="error-text">{error}</p>}

        <div className="travel-grid">
          {events.map((event, index) => (
            <div key={index} className="travel-card">
              <div className="card-image-wrapper">
                <img
                  src={
                    event.image
                      ? `${event.image}&w=1000&q=100`
                      : "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1000&q=100"
                  }
                  alt={event.title}
                />
              </div>

              <div className="card-details">
                <p className="card-category">EVENT</p>
                <h4 className="card-location">{event.title}</h4>
                <p className="card-date">
                  📅 {event.date || "TBA"} | ⏰ {event.time || "10:00"}
                </p>
                <p className="card-desc">
                  📍 {event.venue || "Venue TBA"}
                </p>

                <div className="event-actions">
  {event.ticket_link && (
    <a href={event.ticket_link} target="_blank" rel="noreferrer" className="ticket-link">
      View Tickets
    </a>
  )}

  <div className="button-group" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
    <button
      className="explore-btn"
      onClick={() => handleAddToItinerary(event)}
    >
      + Itinerary
    </button>

    <button
      className="calendar-btn"
      style={{
        backgroundColor: '#7e5b7aff', // Google Blue
        color: 'white',
        border: 'none',
        padding: '8px 6px',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
      onClick={() => handleAddToCalendar(event)}
    >
       Add to Calendar
    </button>
  </div>
</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
