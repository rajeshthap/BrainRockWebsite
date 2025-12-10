import React, { useContext, useEffect, useState } from "react";
import { Nav, Offcanvas, Collapse } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaImages,
  FaInfoCircle,
  FaUsers,
  FaBook,
  FaBuilding,
  FaImage,
  FaTools,
  FaComments,
  FaCube,
  FaProjectDiagram,
  FaServer,
} from "react-icons/fa";
import axios from "axios";

import "../../assets/css/emp_dashboard.css";
import { Link } from "react-router-dom";

import BRLogo from "../../assets/images/brainrock_logo.png";

import { AuthContext } from "../context/AuthContext";


const LeftNavManagement = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet }) => {
    const { logout } = useContext(AuthContext);
    const { user } = useContext(AuthContext);
const emp_id = user?.unique_id;  // This is the correct value

    const [userRole, setUserRole] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };
  



const menuItems = [
    {
      icon: <FaTachometerAlt />,
      label: "Dashboard",
      path: "/WebsiteManagement",
      active: true,
    },
    {
      icon: <FaImages />,
      label: "Carousel",
 
      submenu: [
        
       
        {
          label: "Add Carousel",
          path: "/AddCarousel",
          icon: <FaImage />,
        },
        {
          label: "Edit Carousel",
          path: "/EditCarousel",
          icon: <FaImages />,
        },
        
       
      ],
    },
    {
      icon: <FaInfoCircle />,
      label: "About Us",
 
      submenu: [
        
       
        {
          label: "About Us",
          path: "/EditAboutUs",
          icon: <FaInfoCircle />,
        },
        {
          label: "Contact Us",
          path: "/EditContactUs",
          icon: <FaComments />,
        },
        {
          label: "ContactUs Query",
          path: "/ContactUsQuery",
          icon: <FaComments />,
        },
        
        
      ],
    },
     {
      icon: <FaUsers />,
      label: "Our Team",
 
      submenu: [
        
       
        {
          label: "Add Our Team",
          path: "/AddOurTeam",
          icon: <FaUsers />,
        },
        {
          label: "Manage Our Team",
          path: "/ManageOurTeam",
          icon: <FaUsers />,
        },
        
        
        
      ],
    }, 
    {
      icon: <FaBook />,
      label: "Manage Courses",
 
      submenu: [
        
       
        {
          label: "Add Course",
          path: "/AddCourses",
          icon: <FaBook />,
        },
        {
          label: "Edit Course",
          path: "/EditCourses",
          icon: <FaBook />,
        },
        
       
      ],
    }, 

     {
      icon: <FaBook />,
      label: "Notification",
 
      submenu: [
        
       
        {
          label: "Add Notification",
          path: "/AddNotification",
          icon: <FaBook />,
        },
        {
          label: "Edit Notification",
          path: "/EditNotification",
          icon: <FaBook />,
        },
        
       
      ],
    }, 


     {
      icon: <FaBuilding />,
      label: "Client ",
 
      submenu: [
        
       
        {
          label: "Add Client ",
          path: "/AddClient",
          icon: <FaBuilding />,
        },
        {
          label: "Edit Client",
          path: "/EditClient",
          icon: <FaBuilding />,
        },
        
       
      ],
    }, 
    {
      icon: <FaUsers />,
      label: "Students Gallery",
 
      submenu: [
        {
          label: "Manage Student",
          path: "/ManageStudent",
          icon: <FaUsers />,
        },
        {
          label: "View Certified Student",
          path: "/ViewCertified",
          icon: <FaImage />,
        },
         {
          label: "All Students Data",
          path: "/AllStudentsData",
          icon: <FaUsers />,
        },
        
       
      ],
    },
     
     {
      icon: <FaTools />,
      label: "Services",
 
      submenu: [
        
       
        {
          label: "Add Services",
          path: "/AddServices",
          icon: <FaTools />,
        },
        {
          label: "View Services",
          path: "/ViewServices",
          icon: <FaTools />,
        },
        
       
      ],
    },
       {
      icon: <FaBuilding />,
      label: "Firm Management",
 
      submenu: [
        
       
        {
          label: "Add Firm",
          path: "/AddFirm",
          icon: <FaBuilding />,
        },
        {
          label: "Manage Firm",
          path: "/ManageFirm",
          icon: <FaBuilding />,
        },
        
       
      ],
    },
     {
      icon: <FaServer />,
      label: "Add Design & Dev",
 
      submenu: [
        
       
        {
          label: "Add Design",
          path: "/AddDesAndDev",
          icon: <FaServer />,
        },
        {
          label: "Manage Design",
          path: "/ManageDesAndDev",
          icon: <FaServer />,
        },
        
       
      ],
    },
  
  
   
        {
      icon: <FaTachometerAlt />,
      label: "Feedback",
      path: "/Feedbackget",
      active: true,
    },  
     {
      icon: <FaCube />,
      label: "Our Tech Stack ",
 
      submenu: [
        
       
        {
          label: "Manage Tech Stack",
          path: "/ManageTechStack",
          icon: <FaCube />,
        },
      ],
    }, 
    {
      icon: <FaProjectDiagram />,
      label: "Our Projects",
 
      submenu: [
        
       
        {
          label: "Add Project",
          path: "/AddProject",
          icon: <FaProjectDiagram />,
        },
        {
          label: "ManageProject",
          path: "/ManageProject",
          icon: <FaProjectDiagram />,
        },
      ],
    },
      {
      icon: <FaServer />,
      label: "IT Services ",
 
      submenu: [
        {
          label: "Add ItServices",
          path: "/AddItServices",
          icon: <FaServer />,
        },
        {
          label: "Manage ItServices",
          path: "/ManageItServices",
          icon: <FaServer />,
        }, 
      ],
    },   
  ];


  
  

  // 🔹 Auto-close sidebar when switching to mobile or tablet
  

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo">
             
              <span className="logo-text"><img src={BRLogo} alt="text"></img></span>
            </div>
          </div>
        </div>

        <Nav className="sidebar-nav flex-column">
          
        {menuItems
  .filter(item =>
    item.allowedRoles ? item.allowedRoles.includes(userRole) : true
  )
  .map((item, index) => (
    <div key={index}>
      {/* If submenu exists */}
      {item.submenu ? (
        <Nav.Link
          className={`nav-item ${item.active ? "active" : ""}`}
          onClick={() => toggleSubmenu(index)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-text">{item.label}</span>
          <span className="submenu-arrow">
            {openSubmenu === index ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        </Nav.Link>
      ) : (
        <Link
          to={item.path}
          className={`nav-item nav-link ${item.active ? "active" : ""}`}
          onClick={() => setSidebarOpen(false)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-text">{item.label}</span>
        </Link>
      )}

      {/* Submenu */}
      {item.submenu && (
        <Collapse in={openSubmenu === index}>
          <div className="submenu-container">
            {item.submenu.map((subItem, subIndex) => (
              <Link
                key={subIndex}
                to={subItem.path}
                className="submenu-item nav-link"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="submenu-icon">{subItem.icon}</span>
                <span className="nav-text br-text-sub">{subItem.label}</span>
              </Link>
            ))}
          </div>
        </Collapse>
      )}
    </div>
  ))}

        </Nav>

        <div className="sidebar-footer">
          <Nav.Link
            className="nav-item logout-btn"
           onClick={logout}
          >
            <span className="nav-icon">
              <FaSignOutAlt />
            </span>
            <span className="nav-text">Logout</span>
          </Nav.Link>
        </div>
      </div>

      {/*  Mobile / Tablet Sidebar (Offcanvas) */}
  <Offcanvas
  show={(isMobile || isTablet) && sidebarOpen}
  onHide={() => setSidebarOpen(false)}
  className="mobile-sidebar"
  placement="start"
  backdrop={true}
  scroll={false}
  enforceFocus={false} //  ADD THIS LINE — fixes close button focus issue
>
  <Offcanvas.Header closeButton className="br-offcanvas-header">
    <Offcanvas.Title className="br-off-title">Menu</Offcanvas.Title>
  </Offcanvas.Header>

  <Offcanvas.Body className="br-offcanvas">
    <Nav className="flex-column">
      {menuItems.map((item, index) => (
        <div key={index}>
          {item.submenu ? (
            <Nav.Link
              className={`nav-item ${item.active ? "active" : ""}`}
              onClick={() => toggleSubmenu(index)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text br-nav-text-mob">{item.label}</span>
              <span className="submenu-arrow">
                {openSubmenu === index ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            </Nav.Link>
          ) : (
            <Link
              to={item.path}
              className={`nav-item nav-link ${item.active ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text br-nav-text-mob">{item.label}</span>
            </Link>
          )}

          {item.submenu && (
            <Collapse in={openSubmenu === index}>
              <div className="submenu-container">
                {item.submenu.map((subItem, subIndex) => (
                  <Link
                    key={subIndex}
                    to={subItem.path}
                    className="submenu-item nav-link"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="nav-text">{subItem.label}</span>
                  </Link>
                ))}
              </div>
            </Collapse>
          )}
        </div>
      ))}
    </Nav>
  </Offcanvas.Body>
</Offcanvas>

    </>
  );
};

export default LeftNavManagement;
