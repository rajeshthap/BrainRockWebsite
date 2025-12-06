import React, { useEffect, useState, useContext, useRef } from "react";
import { Container } from "react-bootstrap";
import "../../../assets/css/Profile.css";
import SideNav from "../SideNav";
import HrHeader from "../HrHeader";
 
 
const InterviewSch = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
 
  // Toggle Sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
 
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
 
      {/* Main Content */}
      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} />
 
        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            <h2>My Profile</h2>
 
            {/* Here you can add profile details or design */}
            <p className="mt-3">Profile information will display here.</p>
          </div>
        </Container>
      </div>
    </div>
  );
};
 
export default InterviewSch;