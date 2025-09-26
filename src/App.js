import React from "react";
import "@fontsource/roboto-slab";        // Defaults to weight 400
import "@fontsource/roboto-slab/400.css"; // Explicit weight 400 (optional)
import "@fontsource/roboto-slab/700.css"; // Explicit weight 700 (optional)

import "@fontsource/roboto/400.css";

import { Route, Routes, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "font-awesome/css/font-awesome.min.css";
import NavBar from "./components/topnav/NavBar";

import Home from "./components/Home";
import Footer from "../src/components/footer/Footer";
// admindashboard
import "../src/components/custom/customstyle.css";
import "../src/components/custom/style.css";

import UserRegistration from "./components/UserDashBoard/registration/UserRegistration";
import UserLogin from "./components/UserDashBoard/login/UserLogin";

import InnerDashBoard from "./components/UserDashBoard/InnerDashBoard";

import UserProfile from "./components/UserDashBoard/UserProfile";
import UserVerifyOtp from "./components/UserDashBoard/UserVerifyOtp";
import ForgotPassword from "./components/UserDashBoard/registration/ForgotPassword";
import LeftNav from "./components/UserDashBoard/LeftNav";
import AdminInnerDashBoard from "./components/AdminDashBoard/admin_dashboard/AdminInnerDashBoard";
import AdminLeftNav from "./components/AdminDashBoard/admin_dashboard/AdminLeftNav";

function App() {
  const location = useLocation();

  // Paths where NavBar should be hidden
  const hiddenPaths = new Set([
    "/InnerDashBoard",  "/LeftNav", "/UserProfile", "/AdminInnerDashBoard","/AdminLeftNav"
  ]);

  // Paths where Footer should be hidden
  const hiddenFooter1 = new Set([
    "/InnerDashBoard","/LeftNav","/UserLogin","/UserRegistration","/UserProfile","/AdminInnerDashBoard", "/AdminLeftNav"
  ]);

  const shouldHideNavbar = hiddenPaths.has(location.pathname);
  const shouldHideFooter1 = hiddenFooter1.has(location.pathname);

  return (
    <>
      {!shouldHideNavbar && <NavBar />}

      <Routes>
        <Route path="/" element={<Home />} />      
        <Route path="/Footer" element={<Footer />} />
        <Route path="/LeftNav" element={<LeftNav />} />
        <Route path="/InnerDashBoard" element={<InnerDashBoard />} />
        <Route path="/LeftNav" element={<LeftNav />} />
        <Route path="/UserLogin" element={<UserLogin />} />
        <Route path="/UserRegistration" element={<UserRegistration />} />
        <Route path="/UserProfile" element={<UserProfile />} />
        <Route path="/UserVerifyOtp" element={<UserVerifyOtp />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/AdminInnerDashBoard" element={<AdminInnerDashBoard />} />
        <Route path="/AdminLeftNav" element={<AdminLeftNav />} />
        
        
      </Routes>

      {!shouldHideFooter1 && <Footer />}
    </>
  );
}

export default App;
