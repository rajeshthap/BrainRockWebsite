import React, { useState } from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import Logo from "../../assets/images/brainrock_logo.png";
import { Link } from "react-router-dom";
import "../../assets/css/NavBar.css";
import Header from "./Header";

function NavBar() {
  const [expanded, setExpanded] = useState(false);

  const closeMenu = () => setExpanded(false);

  return (
    <>
      <Header />

      <Navbar
        sticky="top"
        expand="lg"
        expanded={expanded}
        className="bg-body-tertiary navbar-top awc-main justify-content-between"
      >
        <Container fluid className="container-fluid awc-mob-responsive">
          <Link to="/" className="logo-page" onClick={closeMenu}>
            <img src={Logo} alt="logo" className="logo-wecd" />
          </Link>

          <Link to="/" onClick={closeMenu}>
            <div className="awc-title">
              <span className="awc-subtitle">
                <span className="br-span">Brainrock</span> Consulting Services
              </span>
              <p className="sub-awc-title">I.S.O certified 9001:2015</p>
            </div>
          </Link>

          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            className="toggle-logo"
            onClick={() => setExpanded(expanded ? false : true)}
          />

          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto justify-content-end flex-grow-1 nd-nav">

              <Nav.Link as={Link} to="/" onClick={closeMenu}>Home</Nav.Link>

              <NavDropdown title="About Us" id="AboutUs" onClick={(e) => e.stopPropagation()} className="about-drop">
                <NavDropdown.Item as={Link} to="/CompanyProfile" onClick={closeMenu}>
                  Company Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/OurTeam" onClick={closeMenu}>
                  Our Team
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/RunningProjects" onClick={closeMenu}>
                  Project
                </NavDropdown.Item>
              </NavDropdown>

              <Nav.Link as={Link} to="/ServicesPage" onClick={closeMenu}>Services</Nav.Link>
              <Nav.Link as={Link} to="/Courses" onClick={closeMenu}>Courses</Nav.Link>
              <Nav.Link as={Link} to="/Gallery" onClick={closeMenu}>Gallery</Nav.Link>
              <Nav.Link as={Link} to="/Feedback" onClick={closeMenu}>Feedback</Nav.Link>
              <Nav.Link as={Link} to="/TrainingRegistration" onClick={closeMenu}>
                Registration
              </Nav.Link>
              <Nav.Link as={Link} to="/Certificate" onClick={closeMenu}>Certificate</Nav.Link>
              <Nav.Link as={Link} to="/Contact" onClick={closeMenu}>Contact Us</Nav.Link>
 <Nav.Link as={Link} to="/Career" onClick={closeMenu}>Career</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default NavBar;
