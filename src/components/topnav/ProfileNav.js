import React from "react";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import logo from "../../assets/images/brainrock_logo.png"
import "../../assets/css/ProfileNav.css";
 
const ProfileNav = () => {
  return (
    <Navbar expand="lg" className="bg-body-tertiary shadow-sm py-2">
      <Container fluid className="dashboard-title">
        {/*  Only Logo */}
        <Navbar.Brand href="#">
          <div className="d-flex align-items-center logo-textt">
            <img
              src={logo}
              alt="Company Logo"
              className="img-fluid"
             
            />
             <h1>BrainRock <span> Attendance Sheet</span></h1>  
          </div>
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};
 
export default ProfileNav;