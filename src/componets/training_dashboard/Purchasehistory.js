import React, { useState, useEffect, useContext } from "react";
import { Container } from "react-bootstrap";
import "../../assets/css/trainingdashboard.css";
import TrainingHeader from "./TrainingHeader";
import TrainingLeftnav from "./TrainingLeftnav";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

const Purchasehistory = () => {
  const { user } = useContext(AuthContext);
  const applicantId = user?.unique_id; // Get applicant ID from AuthContext
  
  // Console log to track unique ID after login
  console.log("TrainingDashBoard Component - User object:", user);
  console.log("TrainingDashBoard Component - Unique ID (applicantId):", applicantId);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
 
  const navigate = useNavigate();

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setSidebarOpen(width >= 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="dashboard-container">
      <TrainingLeftnav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
      />
      <div className="main-content">
        <TrainingHeader toggleSidebar={toggleSidebar} />
        <Container fluid className="dashboard-body">
        test
        </Container>
      </div>
    </div>
  );
};

export default Purchasehistory;