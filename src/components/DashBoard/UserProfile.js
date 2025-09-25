import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Spinner,
  Container,
  Row,
  Col,
  Button,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ProfileNav from "../topnav/ProfileNav";
import "../../assets/css/ProfileNav.css"

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Utility function to get full photo URL
  const getFullPhotoURL = (photo) => {
    if (!photo) return "https://via.placeholder.com/150"; // fallback

    const BASE_URL = "https://brjobsedu.com/Attendence_portal";

    if (photo.startsWith("http")) return photo;

    return `${BASE_URL.replace(/\/+$/, "")}/${photo.replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    const userId = localStorage.getItem("autoId");

    if (!userId) {
      setError("No User ID found. Please login again.");
      alert("No User ID found");
      setLoading(false);
      navigate("UserLogin");
      return;
    }

    const fetchUserData = async () => {
      try {
        const profileRes = await axios.get(
          `https://brjobsedu.com/Attendence_portal/api/Register_data/${userId}/`
        );

        console.log("API Response:", profileRes.data);

        let user = null;

        // Case 1: Direct object
        if (profileRes.data && !Array.isArray(profileRes.data)) {
          user = profileRes.data;
        }
        // Case 2: Array of users
        else if (Array.isArray(profileRes.data) && profileRes.data.length > 0) {
          user = profileRes.data[0];
        }
        // Case 3: Nested object
        else if (profileRes.data?.data) {
          user = profileRes.data.data;
        }

        if (user) {
          setUserData(user);
        } else {
          setError("Unexpected API response format.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status" />
        <span className="ms-2">Loading Dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <>
   <ProfileNav /> 
    <Container className="mt-5">
      {/* User Profile Card */}
      <Card className="p-4 shadow-lg mb-4">
        <Row className="align-items-center">
          <Col md={3} lg={3} sm={12} className="text-center">
            <img
              src={getFullPhotoURL(userData?.photo)}
              alt="User"
              className="rounded-circle"
              width="150"
              height="150"
            />
          </Col>

          <Col md={6} lg={6} sm={12}>
            <h3 className="fw-bold">
              {userData?.first_name ?? ""} {userData?.last_name ?? ""}
            </h3>
            <p className="mb-1">
              <strong>Email:</strong> {userData?.email ?? "N/A"}
            </p>
            <p className="mb-1">
              <strong>Phone:</strong> {userData?.phone_number ?? "N/A"}
            </p>
            <p className="mb-1">
              <strong>Designation:</strong> {userData?.Designation ?? "N/A"}
            </p>
          </Col>

          <Col md={3} lg={3} sm={12} className="text-center">
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </Col>
        </Row>
      </Card>
    </Container>
     </>
  );
};

export default UserProfile;
