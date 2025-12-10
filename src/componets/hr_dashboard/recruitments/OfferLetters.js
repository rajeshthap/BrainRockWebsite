import React, { useEffect, useState, useContext, useRef } from "react";
import { Container } from "react-bootstrap";
import "../../../assets/css/Profile.css";
import SideNav from "../SideNav";
import HrHeader from "../HrHeader"; 
 
const OfferLetters = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
 
 const [isMobile, setIsMobile] = useState(false); 
  const [isTablet, setIsTablet] = useState(false);
  // Toggle Sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
   useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      
      // Only auto-set sidebar state on desktop (width >= 1024)
      // On mobile/tablet, preserve the user's toggle choice
      if (width >= 1024) {
        setSidebarOpen(true);
      }
    };
    
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
   <SideNav 
  sidebarOpen={sidebarOpen} 
  setSidebarOpen={setSidebarOpen} 
  isMobile={isMobile}
  isTablet={isTablet}
/>
 
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
 
export default OfferLetters;