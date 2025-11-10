import React, { useState } from "react";
import { Nav, Offcanvas, Collapse } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaChartLine,
  FaUserCheck,
} from "react-icons/fa";
import "../../assets/css/emp_dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { PiPaypalLogo, PiUserListBold, PiUsersThreeBold } from "react-icons/pi";
import { RiPlayListAddFill, RiSettings2Line } from "react-icons/ri";
import { ImProfile } from "react-icons/im";
import { TbDeviceDesktopSearch } from "react-icons/tb";
import { GrDocumentPerformance } from "react-icons/gr";
import { IoDocumentsOutline } from "react-icons/io5";
import { IoIosNotifications } from "react-icons/io";
import { AiOutlineFile } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import { FaUsersViewfinder } from "react-icons/fa6";

const SideNav = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet }) => {
  const navigate = useNavigate();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };
  const menuItems = [
    {
      icon: <FaTachometerAlt />,
      label: "Dashboard",
      path: "/HrDashBoard",
      active: true,
    },

    {
      icon: <PiUserListBold />,
      label: "Employee Management",

      submenu: [
        {
          label: "Employee Directory",
          path: "/EmployeeManagement",
          icon: <FaUsersViewfinder />,
        },
        {
          label: "Add / Edit Employee",
          path: "/EmployeeManagement",
          icon: <RiPlayListAddFill />,
        },
        {
          label: "Employee Status (Active / Inactive)",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Role & Access Management",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Employee Transfer / Promotion",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Employee Exit & Clearance",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
      ],
    },
  {
      icon: <ImProfile />,
      label: "Employee Profile",

      submenu: [
        {
          label: "Personal Information",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
         {
          label: "Contact Details",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },

         {
          label: "Job Info.(Designation, Department, Joining Date)",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Salary Details",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Documents & ID Proofs",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Emergency Contact",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Bank Details",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
       
      ],
    },

     {
      icon: <FaUserCheck />,
      label: "Attendance",

      submenu: [
        {
          label: "Daily Attendance",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Manual Attendance Entry",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Attendance Regularization",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Shift Management",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Late / Early Report",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Monthly Attendance Summary",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
       
      ],
    },
   
 {
      icon: <FaChartLine />,
      label: " Leave Management",

      submenu: [
        {
          label: "Apply Leave",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Leave Approval",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Leave Balance",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Leave Calendar",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Leave Policy Setup",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Leave History",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
       
      ],
    },
  
 {
      icon: <PiPaypalLogo />,
      label: "Payroll",

      submenu: [
        {
          label: "Salary Structure",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Payroll Processing",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Payslip Generation",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Deductions & Allowances",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Tax Calculation (TDS, PF, ESI)",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Bonus / Incentives",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Payroll Reports",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
       
      ],
    },

     {
      icon: <PiUsersThreeBold />,
      label: "Departments",

      submenu: [
        {
          label: "Department List",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Add / Edit Department",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Department Heads",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Departmental Hierarchy",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Department Performance Overview",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        
       
       
      ],
    },
   

    {
      icon: <TbDeviceDesktopSearch />,
      label: "Recruitment",

      submenu: [
        {
          label: "Job Openings",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Candidate Applications",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Interview Scheduling",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Shortlisting & Hiring",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Offer Letters",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Onboarding Process",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        
       
       
      ],
    },
   {
      icon: <GrDocumentPerformance />,
      label: "Performance",

      submenu: [
        {
          label: "Performance Goals / KPIs",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Appraisal Forms",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Feedback & Ratings",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Training & Development",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Promotion Recommendations",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Performance Reports",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        
       
       
      ],
    },
    {
      icon: <IoDocumentsOutline />,
      label: "Documents",

      submenu: [
        {
          label: "Employee Documents",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Templates (Offer Letter, Appraisal Form)",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "FUpload / Download Files",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Document Expiry Alerts",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        
       
        
       
       
      ],
    },
   {
      icon: <IoIosNotifications />,
      label: "Notifications",

      submenu: [
        {
          label: "Leave / Attendance Alerts",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Birthday & Anniversary Wishes",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Payroll Notification",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Recruitment Updates",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        
       
        
       
       
      ],
    },

     {
      icon: <AiOutlineFile />,
      label: "Reports",

      submenu: [
        {
          label: "Attendance Reports",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Leave Reports",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Payroll Reports",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Recruitment Reports",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Department Reports",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Employee Summary Reports",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        
       
        
       
       
      ],
    },
      {
      icon: <RiSettings2Line />,
      label: "Settings",

      submenu: [
        {
          label: "Company Profile",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Role Permissions",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Workflow Settings",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Leave Policy Configuration",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Attendance Rules",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Payroll Configuration",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        
       
        
       
       
      ],
    },

       {
      icon: <CgProfile />,
      label: " Profile (User’s Own)",

      submenu: [
        {
          label: "View / Edit Profile",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Change Password",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Upload Profile Picture",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Notification Preferences",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
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
          <div className="logo-container">
            <div className="logo">
              <span className="logo-icon">D</span>
              <span className="logo-text">Dashboard</span>
            </div>
          </div>
        </div>

        <Nav className="sidebar-nav flex-column">
          {menuItems.map((item, index) => (
            <div key={index}>
              {/*  Wrap with Link if no submenu */}
              {item.submenu ? (
                <Nav.Link
                  className={`nav-item ${item.active ? "active" : ""}`}
                  onClick={() => toggleSubmenu(index)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text ">{item.label}</span>
                  <span className="submenu-arrow">
                    {openSubmenu === index ? (
                      <FaChevronDown />
                    ) : (
                      <FaChevronRight />
                    )}
                  </span>
                </Nav.Link>
              ) : (
                <Link
                  to={item.path}
                  className={`nav-item nav-link ${item.active ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)} // close on click (for UX)
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                </Link>
              )}

              {/*  Submenu */}
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
                        <span className="nav-text br-text-sub">
                          {subItem.label}
                        </span>
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
            onClick={() => {
              // handle logout logic here
              navigate("/login");
            }}
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
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
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
                      {openSubmenu === index ? (
                        <FaChevronDown />
                      ) : (
                        <FaChevronRight />
                      )}
                    </span>
                  </Nav.Link>
                ) : (
                  <Link
                    to={item.path}
                    className={`nav-item nav-link ${
                      item.active ? "active" : ""
                    }`}
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

export default SideNav;
