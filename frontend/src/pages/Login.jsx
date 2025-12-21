import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../components/Nav"; 
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  
  // Registration States
  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [nationality, setNationality] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:3000/login", { email, password });
        if (res.data.status === "Success") {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("userId", res.data.userId);
          navigate("/");
        } else { alert(res.data.status); }
      } else {
        const res = await axios.post("http://localhost:3000/register", { 
          username, email, password, firstname, lastname, 
          gender, dob, city, state, nationality, phone_number: phoneNumber 
        });
        alert(res.data.status);
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.status || "Error! Please try again.");
    }
  };

  return (
    <div className="login-page-wrapper">
      <Nav />
      <div className="login-container">
        <form className={`login-form ${!isLogin ? "signup-mode" : ""}`} onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>{isLogin ? "Welcome Back" : "Create Account"}</h2>
            <p>Access your global travel dashboard</p>
          </div>

          <div className="form-body">
            {!isLogin && (
              <div className="signup-grid">
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="tel" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                <input type="text" placeholder="First Name" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
                <input type="text" placeholder="Last Name" value={lastname} onChange={(e) => setLastname(e.target.value)} />
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
            )}

            <div className="main-inputs">
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="submit-btn">{isLogin ? "LOG IN" : "SIGN UP"}</button>

          <p className="toggle-text">
            {isLogin ? "Don't have an account?" : "Already a member?"}
            <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? " Register" : " Login"}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}