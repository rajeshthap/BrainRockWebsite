import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { RiDashboard3Line } from "react-icons/ri";
import {
  MdLibraryBooks,
} from "react-icons/md";
import { FaAlignLeft } from "react-icons/fa";
import { LuLogOut } from "react-icons/lu";
import CompanyLogo from "../../assets/images/brainrock_logo.png";
import MenuIcon from "../../assets/images/menu_icon.png";
import "../../assets/css/LeftNav.css";
import { Dropdown, NavDropdown } from "react-bootstrap";
import { BiDonateHeart } from "react-icons/bi";
import { GiByzantinTemple } from "react-icons/gi";
import { LiaCalendarCheck } from "react-icons/lia";
import { FaRegFileLines } from "react-icons/fa6";
import { TbPasswordUser } from "react-icons/tb";
import { IoCalendarClear } from "react-icons/io5";

function LeftNav() {

  const [isNavClosed, setIsNavClosed] = useState(false);
  const [userName, setUserName] = useState("Loading...");
  const [activePath, setActivePath] = useState("");
  const location = useLocation();
  // alert state

  const [alertMessage, setAlertMessage] = useState("");
  useEffect(() => {
    // Get initial user name
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.name) {
      setUserName(storedUser.name);
    }
    setActivePath(location.pathname);
    // Poll for updates
    const interval = setInterval(() => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = JSON.parse(localStorage.getItem("updatedPhase1Data"));
      const newName =
        updatedUser?.kanya_name || storedUser?.name || "Unknown User";

      setUserName((prevName) => (prevName !== newName ? newName : prevName));
      setActivePath(location.pathname);
    }, 1000);

    return () => clearInterval(interval);
  }, [location.pathname]);

  const toggleNav = () => {
    setIsNavClosed(!isNavClosed);
  };

  const handleDownload = (fileUrl, fileName) => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.setAttribute("download", fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

 const logout = () => {
  const confirmLogout = window.confirm("Are you sure you want to logout?");
  if (confirmLogout) {
    // Clear storage/session if needed
    localStorage.clear();

    // Redirect after logout
    window.location.href = "/";
  }
};


  const navigationOptions = [
    { icon: <RiDashboard3Line />, label: "Dashboard-1", path: "#" },
    { icon: <BiDonateHeart />, label: "DashBoard-2", path: "#" },
    { icon: <LiaCalendarCheck />, label: "Dashboard-3", path: "#" },
    { icon: <IoCalendarClear />, label: "Dashboard-4", path: "#" },
    {
      icon: <GiByzantinTemple />,
      label: "Dashboard-5",
      path: "#",
      fileName: "praroop1_tutorial.pdf",
    },
    {
      icon: <MdLibraryBooks />,
      label: "Dashboard-6",

      path: "#",
      fileName: "shashandesh_new.pdf",
    },
    {
      path: "#",

      icon: <FaRegFileLines />,
      label: "Dashboard-7",
      fileName: "praroop2_tutorial.pdf",
    },
    { icon: <TbPasswordUser />, label: "Dashboard-8", path: "#" },
  ];

  return (
    <>
      {/* Header */}
      <header className="user-nd-header">
        <div className="logosec">
          <img
            src={MenuIcon}
            className="icn menuicn"
            alt="menu-icon"
            onClick={toggleNav}
          />
          <Link to="#" className="logo-page">
            <img src={CompanyLogo} alt="Manadavaaya" title="MAHADAVAAYA" className="logo" />
          </Link>


          {/* <div className="nd-title">
            <span className="nd-subtitle">उत्तराखंड सरकार | Gov.t of Uttarakhand</span>
            <span className="subtitle">
              महिला सशक्तिकरण एवं बाल विकास विभाग उत्तराखंड
            </span>
          </div> */}
        </div>

       <div className="message">
        
  <div className="nd-msg">User: {userName}

    
  </div>
  
  <Dropdown align="end" className="dp">

    <Dropdown.Toggle variant="light" id="dropdown-basic" className="nd-log-icon border-0">
      <LuLogOut />
    </Dropdown.Toggle>

    <Dropdown.Menu>
      <Dropdown.Item href="/UserProfile">My Profile</Dropdown.Item>
     

     

      <Dropdown.Divider />
      <Dropdown.Item onClick={logout}>Logout</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>

</div>
      </header>

      {/* Sidebar Navigation */}
      <div className={`navcontainer ${isNavClosed ? "navclose" : ""}`}>
        <nav className="nav">
          <div className="nav-upper-options">

            <div className="nd-menu">
              <FaAlignLeft className="icn menuicn" onClick={toggleNav} />
              <div className="nd-user">User: {userName}</div>
              <div className="nd-log-icon-mob" title="Logout" onClick={logout}>
                <LuLogOut />
              </div>
            </div>

            {navigationOptions.map((option, index) => (
              <React.Fragment key={index}>
                {option.download ? (
                  <div
                    className={`nav-option option${index + 1} ${activePath === option.fileUrl ? "active-nav" : ""
                      }`}
                    onClick={() => {
                      setActivePath(option.fileUrl);
                      handleDownload(option.fileUrl, option.fileName);
                    }}
                  >
                    <div className="nav-item d-flex">
                      <span className="nav-icon">{option.icon}</span>
                      <span className="nav-label">{option.label}</span>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={option.path}
                    className={`nav-option option${index + 1} ${activePath === option.path ? "active-nav" : ""
                      }`}
                    onClick={() => setActivePath(option.path)}
                  >
                    <div className="nav-item d-flex">
                      <span className="nav-icon">{option.icon}</span>
                      <span className="nav-label">{option.label}</span>
                    </div>
                  </Link>
                )}
              </React.Fragment>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}

export default LeftNav;
