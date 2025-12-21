import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Nav from "../components/Nav"; // make sure Nav is imported
import "../styles/Route.css"; // external CSS
import "leaflet/dist/leaflet.css";

export default function Route() {
  const location = useLocation();
  const { start, end } = location.state || {};

  const [mode, setMode] = useState("driving-car");
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BACKEND_URL = "http://localhost:3000/api/map";

  useEffect(() => {
    if (start && end) {
      fetchRoute();
    }
    // eslint-disable-next-line
  }, [mode]);

  const fetchRoute = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.post(BACKEND_URL, {
        startCity: start,
        endCity: end,
        mode,
      });

      const feature = res.data.route.features[0];
      const coords = feature.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

      const summary = feature.properties.summary;
      setRouteCoords(coords);
      setDistance((summary.distance / 1000).toFixed(2) + " km");
      setDuration((summary.duration / 60).toFixed(2) + " mins");
    } catch (err) {
      console.error(err);
      setError("Failed to load route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
        <div className="page-wrapper">
              <Nav />
              <main className="route-page">
                <header className="route-header">
                  <h1>
                     Route
                  </h1>
                   
                </header>
                <div class={" flex items-center gap-30 "}>
                   <div >
                               <MapContainer
                              center={routeCoords.length ? routeCoords[0] : [28.6139, 77.2090]}
                              zoom={6}
                              className="route-map"
                            >
                              <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; OpenStreetMap contributors"
                              />

                              {routeCoords.length > 0 && (
                                <>
                                  <Marker position={routeCoords[0]} />
                                  <Marker position={routeCoords[routeCoords.length - 1]} />
                                  <Polyline positions={routeCoords} />
                                  </>
                              )}
                            </MapContainer>
                  </div>
                  <div class={"pr-200px bg-orange-100 text-black "}>
                      <p>
                      <strong>From:</strong> {start} <br />
                      <strong>To:</strong> {end}
                    </p>
                      <div className="mode-select">
                      <label>
                        <strong>Mode: </strong>
                        <select value={mode} onChange={(e) => setMode(e.target.value)}>
                          <option value="driving-car">Driving</option>
                          <option value="cycling-regular">Cycling</option>
                          <option value="foot-walking">Walking</option>
                        </select>
                      </label>
                    </div>
                     {loading && <p>Loading route...</p>}
                      {error && <p className="error">{error}</p>}
                      {distance && (
                        <div className="route-info">
                          <p><strong>Distance:</strong> {distance}</p>
                          <p><strong>Duration:</strong> {duration}</p>
                        </div>
                      )}

                  </div>
                 
                </div>
                
                
        

       
       
        
              </main>
            </div>
        {/* <h2>🗺️ Route</h2>
        <p>
          <strong>From:</strong> {start} <br />
          <strong>To:</strong> {end}
        </p>

        <div className="mode-select">
          <label>
            <strong>Mode: </strong>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="driving-car">Driving</option>
              <option value="cycling-regular">Cycling</option>
              <option value="foot-walking">Walking</option>
            </select>
          </label>
        </div>

        {loading && <p>Loading route...</p>}
        {error && <p className="error">{error}</p>}

        {distance && (
          <div className="route-info">
            <p><strong>Distance:</strong> {distance}</p>
            <p><strong>Duration:</strong> {duration}</p>
          </div>
        )}

        <div className="map-wrapper">
          <MapContainer
            center={routeCoords.length ? routeCoords[0] : [28.6139, 77.2090]}
            zoom={6}
            className="route-map"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {routeCoords.length > 0 && (
              <>
                <Marker position={routeCoords[0]} />
                <Marker position={routeCoords[routeCoords.length - 1]} />
                <Polyline positions={routeCoords} />
              </>
            )}
          </MapContainer>
        </div> */}
      
    </>
  );
}
