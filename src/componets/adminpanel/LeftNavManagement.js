import React, { useContext, useEffect, useState } from "react";
import { Nav, Offcanvas, Collapse } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaChartLine,
  FaUserCheck,
} from "react-icons/fa";
import axios from "axios";

import "../../assets/css/emp_dashboard.css";
import { Link } from "react-router-dom";
import { PiUserListBold} from "react-icons/pi";

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
      icon: <PiUserListBold />,
      label: "Carousel",
 
      submenu: [
        
       
        {
          label: "Add Carousel",
          path: "/AddCarousel",
          icon: <FaChartLine />,
        },
        {
          label: "Edit Carousel",
          path: "/EditCarousel",
          icon: <FaChartLine />,
        },
        
       
      ],
    },
    {
      icon: <PiUserListBold />,
      label: "About Us",
 
      submenu: [
        
       
        {
          label: "About Us",
          path: "/EditAboutUs",
          icon: <FaChartLine />,
        },
        {
          label: "Contact Us",
          path: "/EditContactUs",
          icon: <FaChartLine />,
        },
        {
          label: "ContactUs Query",
          path: "/ContactUsQuery",
          icon: <FaChartLine />,
        },
        
        
      ],
    }, 
    {
      icon: <PiUserListBold />,
      label: "Manage Courses",
 
      submenu: [
        
       
        {
          label: "Add Course",
          path: "/AddCourses",
          icon: <FaChartLine />,
        },
        {
          label: "Edit Course",
          path: "/EditCourses",
          icon: <FaChartLine />,
        },
        
       
      ],
    }, 
    {
      icon: <PiUserListBold />,
      label: "Students Gallery",
 
      submenu: [
        
       
        {
          label: "Add Student",
          path: "/AddStudent",
          icon: <FaChartLine />,
        },
        {
          label: "Manage Student",
          path: "/ManageStudent",
          icon: <FaChartLine />,
        },
        
       
      ],
    },
     
     {
      icon: <PiUserListBold />,
      label: "Services",
 
      submenu: [
        
       
        {
          label: "Add Services",
          path: "/AddServices",
          icon: <FaChartLine />,
        },
        {
          label: "View Services",
          path: "/ViewServices",
          icon: <FaChartLine />,
        },
        
       
      ],
    },
   {
      icon: <PiUserListBold />,
      label: "Courses",
 
      submenu: [
        
       
        {
          label: "Add Courses",
          path: "/AddCourses",
          icon: <FaChartLine />,
        },
        {
          label: "View Courses",
          path: "/ViewCourses",
          icon: <FaChartLine />,
        },
        
       
      ],
    },
   {
      icon: <PiUserListBold />,
      label: "Image Gallery ",
 
      submenu: [
        
       
        {
          label: "Add Image",
          path: "/AddImage",
          icon: <FaChartLine />,
        },
        {
          label: "View Image",
          path: "/ViewImage",
          icon: <FaChartLine />,
        },
      
       
      ],
    },
   
        {
      icon: <FaTachometerAlt />,
      label: "Feedback",
      path: "/WebsiteManagement",
      active: true,
    },  
      
      {
      icon: <PiUserListBold />,
      label: "Student Gallery ",
 
      submenu: [
        
       
        {
          label: "Registered Student",
          path: "/CreateTeam",
          icon: <FaChartLine />,
        },
        {
          label: "Add Certification",
          path: "/AddCertification",
          icon: <FaChartLine />,
        },
        {
          label: "View Certified Student",
          path: "/ViewCertified",
          icon: <FaChartLine />,
        },
       
      ],
    },
       
       {
      icon: <PiUserListBold />,
      label: "Projects ",
 
      submenu: [
        
       
        {
          label: "Add Projects",
          path: "/AddProjects",
          icon: <FaChartLine />,
        },
        {
          label: "View Projects",
          path: "/ViewProjects",
          icon: <FaChartLine />,
        }, 
      ],
    },   
   

      {
      icon: <FaTachometerAlt />,
      label: "Online Messages",
      path: "/WebsiteManagement",
      active: true,
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
