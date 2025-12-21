import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Nav from "../components/Nav";
import "../styles/ItenaryCard.css";

export default function ItenaryDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItinerary();
  }, [id]);

  const fetchItinerary = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:3000/api/itinerary/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      setError("Failed to load itinerary details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="itenary-container"><p className="itenary-header">Loading Trip...</p></div>;
  if (error) return <div className="itenary-container"><p className="error-msg">{error}</p></div>;

  return (
    <div className="itenary-container">
      <Nav />
      <div className="header-section">
        <h1 className="trip-title" >{data.destination.toUpperCase()} TRIP</h1>
        <p className="trip-dates">{data.startdate} — {data.enddate}</p>
      </div>

      <div className="itenary-content">
        {/* Flights Section */}
        <div className="section-wrapper">
          <h3 className="section-heading">✈️ Flights</h3>
          <div className="tiles-grid">
            {/* Departure */}
            <div className="info-card">
              <span className="card-label">Going Flight</span>
              <div className="flight-info">
                <img src={data.flightdetails.airline_logo} alt="logo" className="airline-logo" />
                <div>
                  <h4>{data.flightdetails.airline} ({data.flightdetails.flight_number})</h4>
                  <p className="airport-text">{data.flightdetails.departure_airport}</p>
                  <p className="airport-arrow">→ {data.flightdetails.arrival_airport}</p>
                  <p className="price-tag">₹{data.flightdetails.price}</p>
                </div>
              </div>
            </div>

            {/* Return */}
            <div className="info-card">
              <span className="card-label">Return Flight</span>
              <div className="flight-info">
                <img src={data.returnflight.airline_logo} alt="logo" className="airline-logo" />
                <div>
                  <h4>{data.returnflight.airline} ({data.returnflight.flight_number})</h4>
                  <p className="airport-text">{data.returnflight.departure_airport}</p>
                  <p className="airport-arrow">→ {data.returnflight.arrival_airport}</p>
                  <p className="price-tag">₹{data.returnflight.price}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Section */}
        <div className="section-wrapper">
          <h3 className="section-heading">🏨 Hotel</h3>
          <div className="info-card hotel-card">
            <img src={data.hoteldetails.thumbnail} alt="hotel" className="hotel-main-img" />
            <div className="hotel-details">
              <h4>{data.hoteldetails.name}</h4>
              <p className="rating">{"⭐".repeat(Math.floor(data.hoteldetails.rating))} {data.hoteldetails.rating} ({data.hoteldetails.reviews} reviews)</p>
              <p className="description">{data.hoteldetails.description}</p>
              <a href={data.hoteldetails.link} target="_blank" rel="noreferrer" className="view-btn">View Details</a>
            </div>
          </div>
        </div>

        {/* Events Section */}
        <div className="section-wrapper">
          <h3 className="section-heading">📅 Planned Events</h3>
          <div className="events-list">
            {data.events.map((event, index) => (
              <div key={index} className="event-card">
                <img src={event.image} alt="event" className="event-img" />
                <div className="event-info">
                  <span className="event-date">{event.date} | {event.time}</span>
                  <h4>{event.title}</h4>
                  <p className="venue">{event.venue}</p>
                  <a href={event.ticket_link} target="_blank" rel="noreferrer" className="ticket-link">Book Tickets</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}