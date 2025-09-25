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
import LeftNav from "./components/DashBoard/LeftNav";
import InnerDashBoard from "./components/DashBoard/InnerDashBoard";
import UserLogin from "./components/login/UserLogin";
import UserRegistration from "./components/registration/UserRegistration";
import UserProfile from "./components/DashBoard/UserProfile";
import UserVerifyOtp from "./components/DashBoard/UserVerifyOtp";
import ForgotPassword from "./components/registration/ForgotPassword";

function App() {
  const location = useLocation();

  // Paths where NavBar should be hidden
  const hiddenPaths = new Set([
    "/InnerDashBoard",  "/LeftNav", "/UserProfile"
  ]);

  // Paths where Footer should be hidden
  const hiddenFooter1 = new Set([
    "/InnerDashBoard","/LeftNav","/UserLogin","/UserRegistration","/UserProfile"
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
        
        
      </Routes>

      {!shouldHideFooter1 && <Footer />}
    </>
  );
}

export default App;
