import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Nav from "../components/Nav";
import "../styles/Flights.css";

export default function Flights() {
  const location = useLocation();
  const trip = location.state?.trip;

  const source = trip?.startDestination;
  const destination = trip?.destination;
  const startDate = trip?.start;
  const endDate = trip?.end;

  const [goingFlights, setGoingFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);

  const [selectedGoing, setSelectedGoing] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (source && destination && startDate && endDate) {
      fetchFlights();
    }
  }, [source, destination, startDate, endDate]);

  const fetchFlights = async () => {
    setLoading(true);
    setError("");

    try {
      const [goingRes, returnRes] = await Promise.all([
        axios.get("http://localhost:3000/api/flights", {
          params: {
            from: source,
            to: destination,
            out_date: startDate,
          },
        }),
        axios.get("http://localhost:3000/api/flights", {
          params: {
            from: destination,
            to: source,
            out_date: endDate,
          },
        }),
      ]);

      setGoingFlights(goingRes.data.flights || []);
      setReturnFlights(returnRes.data.flights || []);
    } catch (err) {
      setError("Failed to fetch flights");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFlight = async (flight, type) => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    return;
  }

  try {
    if (type === "going") {
      await axios.post(
        "http://localhost:3000/api/itinerary/flight",
        {
          itineraryId: trip.id,
          flightdetails: flight,   // ✅ EXACT KEY BACKEND EXPECTS
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSelectedGoing(flight);
    }

    if (type === "return") {
      await axios.post(
        "http://localhost:3000/api/itinerary/returnflight",
        {
          itineraryId: trip.id,
          returnflight: flight,   // ✅ EXACT KEY BACKEND EXPECTS
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSelectedReturn(flight);
    }

    alert(`Flight added (${type}) ✅`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert("Failed to add flight");
  }
};

  const renderFlightCard = (flight, index, type) => {
    const isDisabled =
      (type === "going" && selectedGoing) ||
      (type === "return" && selectedReturn);

    return (
      <div key={index} className="flight-card">
        <div className="flight-header">
          {flight.airline_logo && (
            <img src={flight.airline_logo} alt={flight.airline} />
          )}
          <h3>{flight.airline}</h3>
        </div>

        <p><b>Flight No:</b> {flight.flight_number}</p>
        <p><b>Departure:</b> {flight.departure_airport} — {flight.departure_time}</p>
        <p><b>Arrival:</b> {flight.arrival_airport} — {flight.arrival_time}</p>
        <p><b>Duration:</b> {flight.duration}</p>
        <p><b>Price:</b> ₹{flight.price}</p>

        <button
          className="add-flight-btn"
          disabled={isDisabled}
          onClick={() => handleAddFlight(flight, type)}
        >
          {isDisabled ? "✓ Selected" : "+ Add to Itinerary"}
        </button>
      </div>
    );
  };

  return (
    <div className="page-wrapper">
      <Nav />

      <main className="flights-page">
        <header className="flights-header">
          <h1 className="flights-title">Flights for your Trip</h1>
          <p>{source} ⇄ {destination}</p>
        </header>

        {loading && <p className="status-msg">Loading flights...</p>}
        {error && <p className="status-msg error">{error}</p>}

        {/* LEFT / RIGHT SPLIT */}
        <div className="flights-split">

          {/* GOING */}
          <section className="flights-section">
            
                 <h2 >✈️ Going: {source} → {destination}</h2>
         
           
            <p className="flight-date">{startDate}</p>

            <div className="flights-grid">
              {goingFlights.map((f, i) =>
                renderFlightCard(f, i, "going")
              )}
            </div>
          </section>

          {/* RETURN */}
          <section className="flights-section">
            <h2>↩️ Return: {destination} → {source}</h2>
            <p className="flight-date">{endDate}</p>

            <div className="flights-grid">
              {returnFlights.map((f, i) =>
                renderFlightCard(f, i, "return")
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
