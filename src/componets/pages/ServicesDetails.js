import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "../../assets/css/course.css";
import { useLocation, Link } from "react-router-dom";
import FooterPage from "../footer/FooterPage";

const ServicesDetails = () => {
  const location = useLocation();
  const serviceId = location.state?.serviceId; // Get the service ID from navigation state
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all services and then find the specific one by ID
    const fetchData = async () => {
      try {
        if (!serviceId) {
          throw new Error('No service ID provided');
        }
        
        // Fetch all services
        const response = await fetch(`https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/itservice-items/`);
        if (!response.ok) {
          throw new Error('Failed to fetch services data');
        }
        const result = await response.json();
        
        // Check if the API response is successful
        if (result.success && result.data) {
          // Find the specific service by ID from the response
          const foundService = result.data.find(service => service.id == serviceId);
          
          if (!foundService) {
            throw new Error(`Service with ID ${serviceId} not found`);
          }
          
          // Process the data
          const processedData = {
            id: foundService.id,
            title: foundService.title,
            description: foundService.description,
            modules: foundService.modules || [],
            icon: foundService.icon
              ? `https://mahadevaaya.com/brainrock.in/brainrock/backendbr${foundService.icon}`
              : null,
          };
          setServiceData(processedData);
        } else {
          throw new Error("API returned unsuccessful response");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching service data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId]); // Re-run effect when serviceId changes

  // Render loading state
  if (loading) {
    return (
      <div className="ourteam-section">
        <Container className="ourteam-box">
          <div className="my-3 main-mt-0 text-center">
            <p>Loading...</p>
          </div>
        </Container>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="ourteam-section">
        <Container className="ourteam-box">
          <div className="my-3 main-mt-0 text-center">
            <p>Error: {error}</p>
            <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
          </div>
        </Container>
      </div>
    );
  }

  // Check if serviceData exists
  if (!serviceData) {
    return (
      <div className="ourteam-section">
        <Container className="ourteam-box">
          <div className="my-3 main-mt-0 text-center">
            <p>No service data available</p>
            <Link to="/" className="btn btn-primary mt-3">Back to Home</Link>
          </div>
        </Container>
      </div>
    );
  }

  // Render the component with fetched data
  return (
    <div className="ourteam-section">
      <div className='serviceimg-banner'>
                <div className='site-breadcrumb-wpr'>
                  <h2 className='breadcrumb-title'>Our Services</h2>
               <ul className='breadcrumb-menu clearfix'>
          <li>
            <Link className="breadcrumb-home" to="/">Home</Link>
          </li>
        
          <li className='px-2'>/</li>
        
          <li>
            <Link className="breadcrumb-about" to="/">Services</Link>
          </li>
        </ul>
        
                </div>
              </div>
      <Container className="ourteam-box">
        <div className="my-3 main-mt-0">
          {/* Title Section */}
          <div className="m-3 mobile-register">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="section-heading m-0">
                📚 {serviceData.title}
              </h3>
            </div>
          </div>

          <div className="training-wrapper p-2">
            <Row>
              {/* Left Column (Course Content) */}
              <Col md={12} sm={12} className="mb-4">
                {/* Service Description */}
                <div className="module-container">
                  <div className="module-card">
                    <div>
                      <p>{serviceData.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Dynamically render modules from API */}
                {serviceData.modules && serviceData.modules.length > 0 && (
                  <>
                    <h4 className="text-center my-4">Course Modules</h4>
                    {serviceData.modules.map((module, index) => (
                      <div className="module-container" key={index}>
                        <h4 className="module-heading">
                          <span className="module-number">{index + 1}</span>
                          {module[0] || `Module ${index + 1}`}
                        </h4>
                        <div className="module-card">
                          <div>
                            <p>{module[1] || 'Module description'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </Col>
              <div className="text-center">
                <Link to="/" className="btn btn-primary mt-3">Back to Services</Link>
              </div>
            </Row>
          </div>
        </div>
      </Container>
      <Container fluid className="br-footer-box">
        <FooterPage />
      </Container>
    </div>
  );
};

export default ServicesDetails;