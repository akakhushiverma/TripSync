import React, { useEffect, useRef, useState } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import './Nav.css';

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();

  const getColor = () => {
    switch (location.pathname) {
      case "/": return "rgba(86, 42, 77, 0.7)"; // Darker glass for home
      case "/planner": return "rgba(26, 44, 158, 0.4)";
      case "/profile": return "rgba(110, 79, 126, 0.5)";
      case "/login": return "rgba(0, 128, 128, 0.4)";
      default: return "rgba(0, 0, 0, 0.5)";
    }
  };

  const navRef = useRef(null);
  const [markerStyle, setMarkerStyle] = useState({ left: 0, width: 0 });

  const updateMarker = (el) => {
    if (el) {
      setMarkerStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
      });
    }
  };

  useEffect(() => {
    const active = navRef.current?.querySelector('.active');
    if (active) updateMarker(active);
  }, [location.pathname]);

  const handleLoginClick = () => {
    navigate("/login", { state: { from: location.pathname } });
  };

  return (
    <div
      className="top-header"
      style={{
        backgroundColor: getColor(),
      }}
    >
      <div className="brand" onClick={() => navigate("/")}>
        <span className="brand-icon">✈</span> TripSync
      </div>

      <nav ref={navRef} className="nav-menu">
        {['/', '/planner', '/profile'].map((path, i) => {
          const labels = ['Home', 'Planner', 'Profile'];
          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                isActive ? 'nav-item active' : 'nav-item'
              }
              onMouseEnter={(e) => updateMarker(e.target)}
            >
              {labels[i]}
            </NavLink>
          );
        })}

        <button
          className="nav-item-login-btn"
          onClick={handleLoginClick}
        >
          Login
        </button>

        {/* The sliding underline */}
        <span
          className="marker"
          style={{ left: markerStyle.left, width: markerStyle.width }}
        />
      </nav>
    </div>
  );
}