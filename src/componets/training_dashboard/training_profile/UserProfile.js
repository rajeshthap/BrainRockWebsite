import React, { useState } from "react";
import { Container } from "react-bootstrap";
import "../../../assets/css/trainingdashboard.css";

import { useNavigate } from "react-router-dom";

import TrainingHeader from "../TrainingHeader";
import TrainingLeftnav from "../TrainingLeftnav";

const UserProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();



 

 


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

         <div className="br-box-container">
            User Profile
         </div>

        </Container>
      </div>
    </div>
  );
};

export default UserProfile;