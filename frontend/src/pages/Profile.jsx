import React, { useEffect, useState } from "react";
import axios from "axios";
import Nav from "../components/Nav";
import "../styles/Profile.css";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstname: "",
    lastname: "",
    gender: "",
    dob: "",
    nationality: "",
    city: "",
    state: "",
    email: "",
    phone_number: ""
  });

  // ---------------- FETCH PROFILE ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    axios
      .get("http://localhost:3000/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then((res) => {
        setProfile(res.data.user);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alert("Session expired. Please login again.");
        localStorage.clear();
      });
  }, []);

  // ---------------- HANDLE CHANGE ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------- EDIT ----------------
  const handleEdit = () => {
    setIsEditing(true);
  };

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    const token = localStorage.getItem("token");

    try {
      await axios.put(
        "http://localhost:3000/api/profile",
        profile,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  if (loading) return <h2 style={{ color: "white" }}>Loading...</h2>;

  // ---------------- UI ----------------
  return (
    <div className="profile-container">
      <Nav />

      <div className="container">
        <form className="form-wrapper-p">
          <h2 style={{ marginBottom: "1rem", color: "white" }}>
            Profile Details
          </h2>

          <div className="tiles-grid">
            <div className="tile blue">
              <span className="tile-label">First Name</span>
              <input
                className="input"
                name="firstname"
                value={profile.firstname || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="tile green">
              <span className="tile-label">Last Name</span>
              <input
                className="input"
                name="lastname"
                value={profile.lastname || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="tile purple">
              <span className="tile-label">Gender</span>
              <select
                className="input-g"
                name="gender"
                value={profile.gender || ""}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="tile purple">
              <span className="tile-label">Date of Birth</span>
              <input
                className="input"
                type="date"
                name="dob"
                value={profile.dob || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="tile yellow">
              <span className="tile-label">Nationality</span>
              <input
                className="input"
                name="nationality"
                value={profile.nationality || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="tile blue">
              <span className="tile-label">City</span>
              <input
                className="input"
                name="city"
                value={profile.city || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="tile green">
              <span className="tile-label">State</span>
              <input
                className="input"
                name="state"
                value={profile.state || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="tile purple">
              <span className="tile-label">Email</span>
              <input
                className="input"
                type="email"
                value={profile.email || ""}
                disabled
              />
            </div>

            <div className="tile yellow">
              <span className="tile-label">Phone Number</span>
              <input
                className="input"
                name="phone_number"
                value={profile.phone_number || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="actions">
  {!isEditing ? (
    <div className="button-group flex gap-25" >
      <button
        type="button"
        className="button-p"
        onClick={handleEdit}
      >
        Edit Profile
      </button>

      <button
        type="button"   // 🔥 THIS FIXES IT
        className="button-p secondary"
        onClick={() => navigate("/my-itineraries")}
      >
        View My Itineraries
      </button>
    </div>
  ) : (
    <button
      type="button"   // 🔥 ALSO IMPORTANT
      className="button-p"
      onClick={handleSave}
    >
      Save Changes
    </button>
  )}
</div>

        </form>
      </div>
    </div>
  );
}
