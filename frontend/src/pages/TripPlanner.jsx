import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Nav from "../components/Nav";
import "../styles/TripPlanner.css";

function daysBetween(startStr, endStr) {
  const s = new Date(startStr);
  const e = new Date(endStr);
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  return Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

export default function TripPlanner() {
  const navigate = useNavigate();

  const [startDestination, setStartDestination] = useState("");
  const [destination, setDestination] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");

    if (!startDestination || !destination || !start || !end) {
      setError("Please fill all required fields.");
      return;
    }

    if (daysBetween(start, end) <= 0) {
      setError("End date must be after start date.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first.");
      return;
    }

    try {
      setLoading(true);

      // 🔥 CREATE ITINERARY IN BACKEND
      const res = await axios.post(
        "http://localhost:3000/api/itinerary/create",
        {
          destination,
          startdate: start,
          enddate: end,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const itineraryId = res.data.itineraryId;

      // 🧠 CREATE TRIP OBJECT (REAL ID)
      const trip = {
        id: itineraryId,
        startDestination,
        destination,
        start,
        end,
        budget: budget ? Number(budget) : null,
        createdAt: new Date().toISOString(),
      };

      // 👉 GO TO ITENARY PAGE
      navigate("/Itenary", { state: { trip } });

    } catch (err) {
      console.error(err);
      setError("Failed to create itinerary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="background-container">
      <Nav />
      <div className="container">
        <form className="form-wrapper" onSubmit={handleGenerate}>
          {error && <div className="form-error">{error}</div>}

          <div className="tile blue">
            <span className="tile-label">Start Destination</span>
            <input
              className="input"
              value={startDestination}
              onChange={(e) => setStartDestination(e.target.value)}
              placeholder="e.g. Mumbai"
            />
          </div>

          <div className="tile green">
            <span className="tile-label">Destination</span>
            <input
              className="input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Paris"
            />
          </div>

          <div className="tile purple dates-tile">
            <span className="tile-label">Start Date</span>
            <input
              className="input"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </div>

          <div className="tile purple dates-tile">
            <span className="tile-label">End Date</span>
            <input
              className="input"
              type="date"
              value={end}
              min={start}
              onChange={(e) => setEnd(e.target.value)}
            />
          </div>

          <div className="tile yellow">
            <span className="tile-label">Budget</span>
            <input
              className="input"
              type="number"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="optional"
            />
          </div>

          <div className="actions">
            <button type="submit" className="button" disabled={loading}>
              {loading ? "Creating..." : "Generate Itinerary"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
