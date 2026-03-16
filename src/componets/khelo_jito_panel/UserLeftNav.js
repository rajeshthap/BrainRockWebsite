import React, { useContext, useEffect, useState } from "react";
import { Nav, Offcanvas, Collapse } from "react-bootstrap";
import { FaHandshakeAngle } from "react-icons/fa6";

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
  FaGraduationCap,  // Added for courses
  FaBell,            // Added for notifications
  FaUserPlus,        // Added for client management
  FaEdit,            // Added for edit operations
  FaPlusCircle,      // Added for add operations
  FaEnvelope,        // Added for contact queries
  FaUserCheck,       // Added for certified students
  FaDatabase,        // Added for student data
  FaLaptopCode,      // Added for design & dev
  FaCog,             // Added for services
  FaIndustry,        // Added for firm management
  FaNetworkWired,    // Added for tech stack
  FaTasks,           // Added for projects
  FaCloud,           // Added for IT services
  FaFileInvoice,     // Added for bill generation
  FaTrophy,          // Added for Khelo Jito
} from "react-icons/fa";

import axios from "axios";

import "../../assets/css/emp_dashboard.css";
import { Link } from "react-router-dom";

import BRLogo from "../../assets/images/brainrock_logo.png";

import { AuthContext } from "../context/AuthContext";


const UserLeftNav = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet }) => {
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
            path: "/UserDashBoard",
            active: true,
        },
       
       
        {
            icon: <FaFileInvoice />,  // Updated icon
            label: "test",
            submenu: [
                {
                    label: "Test 1",
                    path: "#",
                    icon: <FaPlusCircle />,
                },
              
            ],
        },
       
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <div
                className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
            >
                <div className="sidebar-header">
                    <div className="logo-container text-center">
                        <h5 className="mb-0 text-white">User DashBoard</h5>
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

            {/* Mobile / Tablet Sidebar (Offcanvas) */}
            <Offcanvas
                show={(isMobile || isTablet) && sidebarOpen}
                onHide={() => setSidebarOpen(false)}
                className="mobile-sidebar"
                placement="start"
                backdrop={true}
                scroll={false}
                enforceFocus={false}
            >
                <Offcanvas.Header closeButton className="br-offcanvas-header">
                    <Offcanvas.Title className="br-off-title">User Dashboard</Offcanvas.Title>
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

export default UserLeftNav;