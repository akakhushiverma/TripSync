import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../components/Nav";
import "../styles/Profile.css";
import { useNavigate } from "react-router-dom";

export default function MyItineraries() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:3000/api/itineraries", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        setItineraries(res.data.itineraries || res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load itineraries");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <h2 style={{ color: "white" }}>Loading...</h2>;
  }

  return (
    <div className="profile-container">
      <Nav />

      <div className="container">
        <h2 style={{ color: "white", marginBottom: "1rem" }}>
          My Itineraries
        </h2>

        {itineraries.length === 0 ? (
          <p style={{ color: "gray" }}>No itineraries found</p>
        ) : (
          <div className="tiles-grid">
            {itineraries.map((it) => (
              <div key={it._id} className="tile blue">
                <h3 style={{ color: "white" }}>{it.destination}</h3>

                <p style={{ color: "#ddd" }}>
                  {it.startdate} → {it.enddate}
                </p>

                <button
                  type="button"
                  className="button-p"
                  style={{ marginTop: "0.5rem" }}
                  onClick={() => navigate(`/itinerary/${it._id}`)}
                >
                  Open Itinerary
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
