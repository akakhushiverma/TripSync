import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import "../styles/Itenary.css";

export default function Itenary() {
  const location = useLocation();
  const navigate = useNavigate();
  const trip = location.state?.trip;

  const cards = [
    { id: 1, label: "Event" },
    { id: 2, label: "Hotels" },
    { id: 3, label: "Route" },
    { id: 4, label: "Weather" }, // We'll use this to navigate to flights
    { id: 5, label: "Flights" }
  ];
const handleClick = (card) => {
  if (!trip) return;

  switch (card.label) {
    case "Route":
      navigate("/route", {
        state: { start: trip.startDestination, end: trip.destination },
      });
      break;
    case "Flights": // this card now opens FlightSearch
      navigate("/flights", {
        state: { trip },
      });
      break;
    case "Weather":
      navigate("/weather", { state: { trip } });
      break;     
    case "Event":
        navigate("/events", { state: { trip } }); // ✅ Navigate to Events page
        break;
    case "Hotels":
        navigate("/hotels", { state: { trip } }); // ✅ Navigate to Events page
        break;    
  
    default:
      alert(`You clicked ${card.label}`);
      break;
  }
  

};
const isComplete =
  trip &&
  trip.id &&
  trip.destination &&
  trip.start &&
  trip.end;

  return (
    <div className="itenary-container">
      <Nav />
      <div className="itenary-header">Itenary</div>
      <div className="itenary-content">
        {cards.map((card) => (
          <div
            key={card.id}
            className="day-card"
            onClick={() => handleClick(card)}
          >
            <h3>{card.label}</h3>
          </div>
        ))}
        {isComplete && (
  <div className="view-itinerary-wrapper ">
    <button
      className="view-itinerary-btn"
      onClick={() => navigate(`/itinerary/${trip.id}`)}
    >
      📄 View Final Itinerary
    </button>
  </div>
)}
      </div>
    </div>
  );
}
