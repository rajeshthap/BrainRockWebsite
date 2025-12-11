import React, { useContext, useEffect, useState } from "react";
import { Nav, Offcanvas, Collapse } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaUsers,
  FaUserCheck,
  FaCalendarAlt,
  FaMoneyBill,
  FaBuilding,
  FaBriefcase,
  FaBell,
} from "react-icons/fa";
import axios from "axios";

import "../../assets/css/emp_dashboard.css";
import { Link } from "react-router-dom";

import BRLogo from "../../assets/images/brainrock_logo.png";
import { AuthContext } from "../context/AuthContext";


const SideNav = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet }) => {
    const { logout } = useContext(AuthContext);
    const { user } = useContext(AuthContext);
    const emp_id = user?.unique_id;  // This is the correct value
    const userRole = user?.role?.toLowerCase(); // Get role directly from context

    const [openSubmenu, setOpenSubmenu] = useState(null);
    const toggleSubmenu = (index) => {
      setOpenSubmenu(openSubmenu === index ? null : index);
    };

    // Determine dashboard title based on user role
    const dashboardTitle = userRole === "hr" ? "HR Dashboard" : "Employee Dashboard";

const menuItems = [
    {
      icon: <FaTachometerAlt />,
      label: "Dashboard",
      path: "/HrDashBoard",
      active: true,
    },
     
     {
      icon: <FaUsers />,
      label: "Team Managment",
      submenu: [
        {
          label: "Create Team",
          path: "/CreateTeam",
          icon: <FaUsers />,
          allowedRoles: ["hr", "manager"],
        },
        {
          label: "Manage Team",
          path: "/ManageTeam",
          icon: <FaUsers />,
          allowedRoles: ["hr", "manager"],
        },
        {
          label: "My Team",
          path: "/MyTeam",
          icon: <FaUsers />,
          allowedRoles: ["employee"],
        },
      ],
    },
  // {
  //     icon: <FaTachometerAlt />,
  //     label: "Payroll",
  //     path: "/EmpList",
  //     active: true,
  //   },
    {
      icon: <FaUsers />,
      label: "Employee Management",
      allowedRoles: ["hr", "manager"],
      submenu: [
        {
          label: "Employee Directory",
          path: "/EmployeeManagement",
          icon: <FaUsers />,
        },
        
       
        // {
        //   label: "Role & Access Management",
        //   path: "/EmployeeManagement",
        //   icon: <FaChartLine />,
        // },
        {
          label: "Employee Transfer / Promotion",
          path: "/EmployeeTransfer",
          icon: <FaBriefcase />,
        },
        // {
        //   label: "Employee Exit & Clearance",
        //   path: "/EmployeeManagement",
        //   icon: <FaChartLine />,
        // },
      ],
    },
  // {
  //     icon: <ImProfile />,
  //     label: "Employee Profile",
 
  //     submenu: [
  //       {
  //         label: "Personal Information",
  //         path: "/EmployeeManagement",
  //         icon: <FaChartLine />,
  //       },
  //        {
  //         label: "Contact Details",
  //         path: "/EmployeeManagement",
  //         icon: <FaChartLine />,
  //       },
 
  //        {
  //         label: "Job Info.(Designation, Department, Joining Date)",
  //         path: "/EmployeeManagement",
  //         icon: <FaChartLine />,
  //       },
  //       {
  //         label: "Salary Details",
  //         path: "/EmployeeManagement",
  //         icon: <FaChartLine />,
  //       },
  //       {
  //         label: "Documents & ID Proofs",
  //         path: "/EmployeeManagement",
  //         icon: <FaChartLine />,
  //       },
  //       {
  //         label: "Emergency Contact",
  //         path: "/EmployeeManagement",
  //         icon: <FaChartLine />,
  //       },
  //       {
  //         label: "Bank Details",
  //         path: "/EmployeeManagement",
  //         icon: <FaChartLine />,
  //       },
       
  //     ],
  //   },
 
     {
      icon: <FaUserCheck />,
      label: "Attendance",
 
      submenu: [
        {
          label: "Daily Attendance",
          path: "/DailyAttendance",
          icon: <FaUserCheck />,
        },
       
        {
          label: "Attendance Regularization",
          path: "/AttendanceRegularization",
          icon: <FaUserCheck />,
        },
       
       
       
       
      ],
    },
   
 {
      icon: <FaCalendarAlt />,
      label: " Leave",
 
      submenu: [
        {
          label: "Leave Management",
          path: "/LeaveManagement",
          icon: <FaCalendarAlt />,
        },
        // {
        //   label: "Leave Approval",
        //   path: "/EmployeeManagement",
        //   icon: <FaChartLine />,
        // },
        // {
        //   label: "Leave Balance",
        //   path: "/EmployeeManagement",
        //   icon: <FaChartLine />,
        // },
        {
          label: "Leave Calendar",
          path: "/ApplyLeaveCalendar",
          icon: <FaCalendarAlt />,
        },
       
        {
          label: "Leave History",
          path: "/LeaveHistory",
          icon: <FaCalendarAlt />,
        },
       
      ],
    },
 
 {
      icon: <FaMoneyBill />,
      label: "Payroll",
 
      submenu: [
        {
          label: "Salary Structure",
          path: "/SalaryStructure",
          icon: <FaMoneyBill />,
        },
         {
          label: "Salary Calculation",
          path: "/EmpList",
          icon: <FaMoneyBill />,
        },
    
        {
          label: "Payslip Generation",
          path: "/PayslipGenerator",
          icon: <FaMoneyBill />,
        },
       
       
       
        // {
        //   label: "Payroll Reports",
        //   path: "/EmployeeManagement",
        //   icon: <FaChartLine />,
        // },
       
      ],
    },
 
     {
      icon: <FaBuilding />,
      label: "Departments",
      allowedRoles: ["hr", "manager"],
 
      submenu: [

         {
          label: "Departmental Hierarchy",
          path: "/DepartmentHierarchy",
          icon: <FaBuilding />,
        },
       
        {
          label: "Add / Edit Department",
          path: "/EmployeeManagement",
          icon: <FaBuilding />,
        },
        // {
        //   label: "Department Heads",
        //   path: "/EmployeeManagement",
        //   icon: <FaChartLine />,
        // },
       
        // {
        //   label: "Department Performance Overview",
        //   path: "/EmployeeManagement",
        //   icon: <FaChartLine />,
        // },
       
       
       
      ],
    },
   
 
    {
      icon: <FaBriefcase />,
      label: "Recruitment",
 
      submenu: [
        {
          label: "Job Openings",
          path: "/JobOpenings",
          icon: <FaBriefcase />,
           allowedRoles: ["hr", "manager"],
        },
        {
          label: "Candidate Applications",
          path: "/JobApplications",
          icon: <FaBriefcase />,
           allowedRoles: ["hr", "manager"],
        },
        {
          label: "Interview Scheduling",
          path: "/InterviewSch",
          icon: <FaBriefcase />,
        },
        // {
        //   label: "Shortlisting & Hiring",
        //   path: "/Shortlisting",
        //   icon: <FaChartLine />,
        // },
        {
          label: "Offer Letters",
          path: "/OfferLetters",
          icon: <FaBriefcase />,
        },
       
      ],
    },
  //  {
  //     icon: <GrDocumentPerformance />,
  //     label: "Performance",
 
  //     submenu: [
  //       {
  //         label: "Performance Goals / KPIs",
  //         path: "/EmployeeManagement",
  //         icon: <FaChartLine />,
  //       },
  //       {
  //         label: "Appraisal Forms",
  //         path: "/EmployeeManagement",
  //         icon: <FaChartLine />,
  //       },
  //       {
  //         label: "Feedback & Ratings",
  //         path: "/EmployeeManagement",
  //         icon: <FaChartLine />,
  //       },
  //       {
  //         label: "Training & Development",
  //         path: "/EmployeeManagement",
  //         icon: <FaChartLine />,
  //       },
  //       {
  //         label: "Promotion Recommendations",
  //         path: "/EmployeeManagement",
  //         icon: <FaChartLine />,
  //       },
  //       {
  //         label: "Performance Reports",
  //         path: "/EmployeeManagement",
  //         icon: <FaChartLine />,
  //       },
       
       
       
  //     ],
  //   },
   
  //  {
  //     icon: <FaBell />,
  //     label: "Notifications",
 
  //     submenu: [
  //       {
  //         label: "Leave / Attendance Alerts",
  //         path: "/EmployeeManagement",
  //         icon: <FaBell />,
  //       },
  //       {
  //         label: "Birthday & Anniversary Wishes",
  //         path: "/EmployeeManagement",
  //         icon: <FaBell />,
  //       },
  //       {
  //         label: "Payroll Notification",
  //         path: "/EmployeeManagement",
  //         icon: <FaBell />,
  //       },
  //       {
  //         label: "Recruitment Updates",
  //         path: "/EmployeeManagement",
  //         icon: <FaBell />,
  //       },
       
       
       
       
       
  //     ],
  //   },
 
    //  {
    //   icon: <AiOutlineFile />,
    //   label: "Reports",
 
    //   submenu: [
    //     {
    //       label: "Attendance Reports",
    //       path: "/EmployeeManagement",
    //       icon: <FaChartLine />,
    //     },
    //     {
    //       label: "Leave Reports",
    //       path: "/EmployeeManagement",
    //       icon: <FaChartLine />,
    //     },
    //     {
    //       label: "Payroll Reports",
    //       path: "/EmployeeManagement",
    //       icon: <FaChartLine />,
    //     },
    //     {
    //       label: "Recruitment Reports",
    //       path: "/EmployeeManagement",
    //       icon: <FaChartLine />,
    //     },
    //     {
    //       label: "Department Reports",
    //       path: "/EmployeeManagement",
    //       icon: <FaChartLine />,
    //     },
    //     {
    //       label: "Employee Summary Reports",
    //       path: "/EmployeeManagement",
    //       icon: <FaChartLine />,
    //     },
       
       
       
       
       
    //   ],
    // },
    //   {
    //   icon: <RiSettings2Line />,
    //   label: "Settings",
 
    //   submenu: [
    //     {
    //       label: "Company Profile",
    //       path: "/EmployeeManagement",
    //       icon: <FaChartLine />,
    //     },
    //     {
    //       label: "Role Permissions",
    //       path: "/EmployeeManagement",
    //       icon: <FaChartLine />,
    //     },
    //     {
    //       label: "Workflow Settings",
    //       path: "/EmployeeManagement",
    //       icon: <FaChartLine />,
    //     },
    //     {
    //       label: "Leave Policy Configuration",
    //       path: "/EmployeeManagement",
    //       icon: <FaChartLine />,
    //     },
    //     {
    //       label: "Attendance Rules",
    //       path: "/EmployeeManagement",
    //       icon: <FaChartLine />,
    //     },
    //     {
    //       label: "Payroll Configuration",
    //       path: "/EmployeeManagement",
    //       icon: <FaChartLine />,
    //     },
       
       
       
       
       
    //   ],
    // },
 
      
  ];


  
  

  // 🔹 Auto-close sidebar when switching to mobile or tablet
  

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="sidebar-header">
          <div className="logo-container text-center">
            <h5 className="mb-0 text-white">{dashboardTitle}</h5>
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
            {item.submenu
              .filter(subItem =>
                subItem.allowedRoles ? subItem.allowedRoles.includes(userRole) : true
              )
              .map((subItem, subIndex) => (
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
    <Offcanvas.Title className="br-off-title">{dashboardTitle}</Offcanvas.Title>
  </Offcanvas.Header>

  <Offcanvas.Body className="br-offcanvas">
    <Nav className="flex-column">
      {menuItems
        .filter(item =>
          item.allowedRoles ? item.allowedRoles.includes(userRole) : true
        )
        .map((item, index) => (
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
                {item.submenu
                  .filter(subItem =>
                    subItem.allowedRoles ? subItem.allowedRoles.includes(userRole) : true
                  )
                  .map((subItem, subIndex) => (
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