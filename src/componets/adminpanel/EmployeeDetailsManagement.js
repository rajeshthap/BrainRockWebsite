import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import LeftNavManagement from "./LeftNavManagement";



const EmployeeDetailsManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Form state adapted for services
  const [formData, setFormData] = useState({
    title: "",
    icon: null // Will hold the file object for the service icon
  });
  
  // State for icon preview
  const [iconPreview, setIconPreview] = useState(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success"); // 'success' or 'danger'
  const [showAlert, setShowAlert] = useState(false);

  // Responsive check
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setSidebarOpen(width >= 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);



  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  



  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <LeftNavManagement
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <AdminHeader toggleSidebar={toggleSidebar} />

        {/* Dashboard Body */}
        <Container fluid className="dashboard-body ">
          <div className="br-box-container mt-3">
            <h2 className="mb-4">Add New</h2>
            
           
           
          </div>
        </Container>
      </div>
    </div>
  );
};

export default EmployeeDetailsManagement;