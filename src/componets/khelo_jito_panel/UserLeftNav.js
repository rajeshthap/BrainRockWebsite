import React, { useContext, useState } from "react";
import { Nav, Offcanvas, Collapse } from "react-bootstrap";
import { FaHandshakeAngle } from "react-icons/fa6";

import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaQuestionCircle,
  FaBook,
} from "react-icons/fa";

import "../../assets/css/emp_dashboard.css";
import { Link } from "react-router-dom";
import "../../assets/css/user_dashborad_style.css"
import { AuthContext } from "../context/AuthContext";
const UserLeftNav = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet }) => {
    const { logout } = useContext(AuthContext);
    const { user } = useContext(AuthContext);
    // const emp_id = user?.unique_id;  // This is the correct value

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
            icon: <FaBook />,
            label: "Quiz Details",
            path: "/TestWinner",
            active: true,
        },
        {
            icon: <FaQuestionCircle />,
            label: "Quiz Categories",
            path: "/Quiz",
            active: true,
        },
        
        
        
     
        
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <div
                className={`sidebar-user  ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
            >
                <div className="sidebar-header">
                    <div className="logo-container text-center">
                        {sidebarOpen && <h5 className="mb-0 text-white">User DashBoard</h5>}
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

                {/* <div className="sidebar-footer">
                    <Nav.Link
                        className="nav-item logout-btn"
                        onClick={logout}
                    >
                        <span className="nav-icon">
                            <FaSignOutAlt />
                        </span>
                        <span className="nav-text">Logout</span>
                    </Nav.Link>
                </div> */}
            </div>

            {/* Mobile / Tablet Sidebar (Offcanvas) */}
            <Offcanvas
                show={(isMobile || isTablet) && sidebarOpen}
                onHide={() => setSidebarOpen(false)}
                className="mobile-sidebar-new"
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