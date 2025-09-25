import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "../../assets/css/UserLogin.css"
import axios from "axios";
 
const UserLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState("");
  const [formData, setFormData] = useState({
    role: "",
    phone: "",
    name: "",
    password: "",
    Mode: "",
    Reason_query: "",
    live_location: "",
  });
 
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  const isPhoneNumber = (value) => /^\d{10}$/.test(value);
 
 
 
 
const handleLocationFetch = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
 
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse`,
            {
              params: {
                lat: latitude,
                lon: longitude,
                format: "json",
                addressdetails: 1, // 👈 ensures detailed breakdown
              },
            }
          );
 
          const address = response.data.address;
 
          // Pick smallest available place name first
          const place =
            address.village ||
            address.hamlet ||
            address.town ||
            address.suburb ||
            address.city_district ||
            address.city ||
            "";
 
          const district =
            address.county || address.state_district || "";
          const state = address.state || "";
          const postcode = address.postcode || "";
          const country = address.country || "";
 
          // Final string without duplicate city names
          const locationName = [place, district, state, postcode, country]
            .filter((v, i, arr) => v && arr.indexOf(v) === i) // remove duplicates
            .join(", ");
 
          setFormData((prev) => ({
            ...prev,
            live_location: locationName,
          }));
        } catch (err) {
          console.error("Error fetching address:", err);
          setFormData((prev) => ({
            ...prev,
            live_location: `Lat: ${latitude}, Lng: ${longitude}`,
          }));
        }
      },
      (error) => {
        console.error(error);
        alert("Unable to fetch location. Please allow permission in your browser.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
};
 
 
 
 const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors("");
 
  const { phone, name, password, role, Mode, Reason_query, live_location } = formData;
 
 
 
  // Validation//
  if (!phone || !password || !role || !Mode ||  !live_location) {
    setErrors("All fields are required.");
    return;
  }
 
  if (!isPhoneNumber(phone)) {
    setErrors("Please enter a valid 10-digit phone number.");
    return;
  }
 
  //  Prepare payload
  const payload = {
    phone,
    name,
    password,
    role,
    Mode,
    Reason_query,
    live_location,
  };
 
  try {
    const response = await axios.post(
      "https://brjobsedu.com/Attendence_portal/api/login/",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
 
    console.log(" Login success:", response.data);
 
       if (response.data.user) {
         localStorage.setItem("autoId", response.data.user);
         }
         if (response.data.role) {
      localStorage.setItem("role", response.data.role);
    }
 
      alert("Login successful!");
      console.log(localStorage.getItem('role'))
 
      //  Navigate according to role
      if (role === "admin") {
        navigate("/InnerDashBoard");
      } else if (role === "user") {
        navigate("/InnerDashBoard");
      } else {
        navigate("/"); // fallback
      }
 
    } catch (err) {
      if (err.response) {
        console.error("Server Response Error:", err.response.data);
        setErrors(err.response.data.detail || "Invalid login credentials.");
      } else {
        console.error("Request Error:", err.message);
        setErrors("Something went wrong. Please try again.");
      }
    }
  };
  return (
    <div className="login-box mx-auto">
      <div className="d-flex justify-content-between align-items-center br-heading mb-3">
        <h3 className="fw-bold mb-0">Login</h3>
             <Link to="/UserRegistration" >New user? Register</Link>
       
     
      </div>
 
      <Form onSubmit={handleSubmit}>
        {/* Usertype */}
        <Form.Group className="mb-3">
          <Form.Label>
            Role <span className="text-danger">*</span>
          </Form.Label>
          <Form.Select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            required
          >
            <option value="">Select User Name</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </Form.Select>
        </Form.Group>
 
          {/* Name*/}
        <Form.Group className="mb-3">
          <Form.Label>
            Name  <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your Name:"
            className="rounded-pill input-custom"
            required
          />
        </Form.Group>
 
        {/* Phone */}
        <Form.Group className="mb-3">
          <Form.Label>
            Phone Number <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter your Phone Number"
            className="rounded-pill input-custom"
            required
          />
        </Form.Group>
 
        {/* Password */}
        <Form.Group className="mb-2">
          <Form.Label>
            Password <span className="text-danger">*</span>
          </Form.Label>
          <div className="position-relative">
            <Form.Control
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your Password"
              className="rounded-pill input-custom pe-5"
              required
            />
            <button
              type="button"
              className="show-password-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </Form.Group>
 
        {/* Errors */}
        {errors && <div className="text-danger mb-2">{errors}</div>}
 
        <Form.Group className="mb-3 ">
           <Form.Label>
               <Link to="/ForgotPassword">Forgot password?</Link>
           </Form.Label>
          </Form.Group>
 
        {/* Work Mode */}
        <Form.Group className="mb-3">
          <Form.Label>
            Work Mode <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            as="select"
            name="Mode"
            value={formData.Mode}
            onChange={handleInputChange}
            className="rounded-pill input-custom"
            required
          >
            <option value="">Select work mode</option>
            <option value="WFH">WFH</option>
            <option value="On-office">On-office</option>
            <option value="WCD">WCD</option>
          </Form.Control>
        </Form.Group>
 
        {/* Reason_query */}
        <Form.Group className="mb-3">
          <Form.Label>
            Reason_query <span className="text-danger"></span>
          </Form.Label>
          <Form.Control
            as="textarea"
            name="Reason_query"
            value={formData.Reason_query}
            onChange={handleInputChange}
            placeholder="Enter your Reason_query"
            rows={4}
            className="rounded input-custom"
         
          />
        </Form.Group>
 
        {/* live_location */}
        <Form.Group className="mb-3">
          <Form.Label>
            Live Location <span className="text-danger">*</span>
          </Form.Label>
          <div className="d-flex">
            <Form.Control
              type="text"
              name="live_location"
              value={formData.live_location}
              onChange={handleInputChange}
              placeholder="Click button to fetch live_location"
              className="rounded-pill input-custom me-2"
              required
              readOnly
            />
            <Button
              variant="primary"
              className="rounded-pill"
              onClick={handleLocationFetch}>
              Get live_location
            </Button>
          </div>
        </Form.Group>
 
        {/* Submit */}
        <Button className="btn-login w-100" type="submit">
          Login
        </Button>
      </Form>
     
    </div>
  );
};
 
export default UserLogin;