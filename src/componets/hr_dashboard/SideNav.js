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
import { PiPaypalLogo, PiUserListBold, PiUsersThreeBold } from "react-icons/pi";
import { RiPlayListAddFill, RiSettings2Line } from "react-icons/ri";
import { ImProfile } from "react-icons/im";
import { TbDeviceDesktopSearch } from "react-icons/tb";
import { GrDocumentPerformance } from "react-icons/gr";
import { IoDocumentsOutline } from "react-icons/io5";
import { IoIosNotifications } from "react-icons/io";
import { AiOutlineFile } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import BRLogo from "../../assets/images/brainrock_logo.png";
import { FaUsersViewfinder } from "react-icons/fa6";
import { AuthContext } from "../context/AuthContext";


const SideNav = ({ sidebarOpen, setSidebarOpen, isMobile, isTablet }) => {
    const { logout } = useContext(AuthContext);
    const { user } = useContext(AuthContext);
const emp_id = user?.unique_id;  // This is the correct value

    const [userRole, setUserRole] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const toggleSubmenu = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };
  
 useEffect(() => {
  if (!emp_id) return;  // prevent calling undefined

  axios
    .get(`https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee-details/?emp_id=${emp_id}`,{
      withCredentials:true
    })
    .then((res) => {
      const role = res.data?.role || res.data?.employee_role || null;
      setUserRole(role);
    })
    .catch((err) => console.log("SideNav Error:", err));
}, [emp_id]);


const menuItems = [
    {
      icon: <FaTachometerAlt />,
      label: "Dashboard",
      path: "/HrDashBoard",
      active: true,
    },
     
     {
      icon: <PiUserListBold />,
      label: "Team Managment",
 
      submenu: [
        
       
        {
          label: "Create Team",
          path: "/CreateTeam",
          icon: <FaChartLine />,
        },
        {
          label: "Manage Team",
          path: "/ManageTeam",
          icon: <FaChartLine />,
        },
        {
          label: "My Team",
          path: "/MyTeam",
          icon: <FaChartLine />,
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
      icon: <PiUserListBold />,
      label: "Employee Management",
 
      submenu: [
        {
          label: "Employee Directory",
          path: "/EmployeeManagement",
          icon: <FaUsersViewfinder />,
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
          icon: <FaChartLine />,
        },
       
        {
          label: "Attendance Regularization",
          path: "/AttendanceRegularization",
          icon: <FaChartLine />,
        },
       
       
       
       
      ],
    },
   
 {
      icon: <FaChartLine />,
      label: " Leave",
 
      submenu: [
        {
          label: "Leave Management",
          path: "/LeaveManagement",
          icon: <FaChartLine />,
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
          icon: <FaChartLine />,
        },
       
        {
          label: "Leave History",
          path: "/LeaveHistory",
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
          path: "/SalaryStructure",
          icon: <FaChartLine />,
        },
         {
          label: "Salary Calculation",
          path: "/EmpList",
          icon: <FaChartLine />,
        },
        {
          label: "Payroll Processing",
          path: "/EmployeeManagement",
          icon: <FaChartLine />,
        },
        {
          label: "Payslip Generation",
          path: "/PayslipGenerator",
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
          label: "Departmental Hierarchy",
          path: "/DepartmentHierarchy",
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

export default SideNav;
