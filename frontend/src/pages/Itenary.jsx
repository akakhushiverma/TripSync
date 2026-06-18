import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import "../styles/Itenary.css";

export default function Itenary() {
  const location = useLocation();
  const navigate = useNavigate();
  const trip = location.state?.trip;

  const agents = [
    { id: 1, label: "Events", desc: "Discover local events & festivals", icon: "E" },
    { id: 2, label: "Hotels", desc: "Find the best places to stay", icon: "H" },
    { id: 3, label: "Route", desc: "Get directions & distance", icon: "R" },
    { id: 4, label: "Weather", desc: "Check forecast for trip dates", icon: "W" },
    { id: 5, label: "Flights", desc: "Search departure & return flights", icon: "F" }
  ];

  const handleClick = (card) => {
    if (!trip) return;
    switch (card.label) {
      case "Route":
        navigate("/route", { state: { start: trip.startDestination, end: trip.destination } });
        break;
      case "Flights":
        navigate("/flights", { state: { trip } });
        break;
      case "Weather":
        navigate("/weather", { state: { trip } });
        break;
      case "Events":
        navigate("/events", { state: { trip } });
        break;
      case "Hotels":
        navigate("/hotels", { state: { trip } });
        break;
      default:
        break;
    }
  };

  const isComplete = trip && trip.id && trip.destination && trip.start && trip.end;

  return (
    <div className="itn-page">
      <Nav />

      <div className="itn-content">
        {/* Trip Info Header */}
        <div className="itn-hero">
          <span className="itn-label">YOUR TRIP</span>
          <h1 className="itn-destination">{trip?.destination || "—"}</h1>
          <p className="itn-dates">
            {trip?.startDestination} to {trip?.destination} | {trip?.start} — {trip?.end}
          </p>
        </div>

        {/* Agent Cards */}
        <div className="itn-agents-grid">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="itn-agent-card"
              onClick={() => handleClick(agent)}
            >
              <div className="agent-icon-circle">{agent.icon}</div>
              <div className="agent-text">
                <h3>{agent.label}</h3>
                <p>{agent.desc}</p>
              </div>
              <span className="agent-arrow">&rarr;</span>
            </div>
          ))}
        </div>

        {/* View Final Itinerary */}
        {isComplete && (
          <button
            className="itn-final-btn"
            onClick={() => navigate(`/itinerary/${trip.id}`)}
          >
            View Final Itinerary
          </button>
        )}
      </div>
    </div>
  );
}
