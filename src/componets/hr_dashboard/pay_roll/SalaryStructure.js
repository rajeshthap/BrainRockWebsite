import React, {  useState } from "react";
import { Container } from "react-bootstrap";
import "../../../assets/css/Profile.css";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
 
 
const SalaryStructure = () => {
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
 
           
          </div>
        </Container>
      </div>
    </div>
  );
};
 
export default SalaryStructure;