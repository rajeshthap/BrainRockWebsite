import React, { useState } from "react";
import { Container} from "react-bootstrap";


import "../../assets/css/attendance.css";
import SideNav from "../hr_dashboard/SideNav";
import HrHeader from "../hr_dashboard/HrHeader";

const HrProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);



  return (
    <div className="dashboard-container">
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
      
                 <div className="br-box-container"> My Profile</div>
        </Container>
      </div>
    </div>
  );
};

export default HrProfile;
