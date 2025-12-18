import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../../assets/css/aboutus.css";
import { useLocation, Link } from "react-router-dom";
import { LuBrainCircuit } from "react-icons/lu";
import FooterPage from "../footer/FooterPage";

const ServicesDetails = () => {
  const location = useLocation();
  const serviceId = location.state?.serviceId;
  const serviceData = location.state?.serviceData;
  
  const [service, setService] = useState(serviceData || null);
  const [loading, setLoading] = useState(!serviceData);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we don't have service data from state, fetch it using the ID
    if (!serviceData && serviceId) {
      const fetchServiceData = async () => {
        try {
          const response = await fetch(
            `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/itservice-items/${serviceId}`
          );

          if (!response.ok) {
            throw new Error("Failed to fetch service data");
          }

          const result = await response.json();

          if (result.success) {
            const data = {
              ...result.data,
              icon: result.data.icon
                ? `https://mahadevaaya.com/brainrock.in/brainrock/backendbr${result.data.icon}`
                : null,
            };
            setService(data);
          } else {
            throw new Error("API returned unsuccessful response");
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchServiceData();
    } else if (serviceData) {
      setLoading(false);
    }
  }, [serviceId, serviceData]);

  // Render icon from URL OR default icon
  const renderIcon = (iconUrl) => {
    if (!iconUrl) return <LuBrainCircuit />;
    return <img src={iconUrl} alt="service-icon" style={{ width: "80px" }} />;
  };

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
            <Link to="/services" className="btn btn-primary mt-3">Back to Services</Link>
          </div>
        </Container>
      </div>
    );
  }

  // Check if service data exists
  if (!service) {
    return (
      <div className="ourteam-section">
        <Container className="ourteam-box">
          <div className="my-3 main-mt-0 text-center">
            <p>No service data available</p>
            <Link to="/services" className="btn btn-primary mt-3">Back to Services</Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <>
      <div className='Services-banner'>
        <div className='site-breadcrumb-wpr'>
          <h2 className='breadcrumb-title'>Our Services</h2>
          <ul className='breadcrumb-menu clearfix'>
            <li>
              <Link className="breadcrumb-home" to="/">Home</Link>
            </li>
            <li className='px-2'>/</li>
            <li>
              <Link className="breadcrumb-about" to="/ServicesPage">Services</Link>
            </li>
            <li className='px-2'>/</li>
            <li>
              <span className="breadcrumb-current">{service.title}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="ourteam-section">
        <Container className="ourteam-box">
          <div className="my-3 main-mt-0">
            <Row>
              <Col md={12} className="text-center mb-4">
              
                <h2 className="section-heading mt-3">{service.title}</h2>
              </Col>
              <Col md={12}>
                <div className="service-details-content">
                  <p style={{ whiteSpace: "pre-line" }}>{service.description}</p>
                  
                  {service.modules && service.modules.length > 0 && (
                    <div className="service-modules mt-4">
                      <h3>Service Modules</h3>
                      {service.modules.map((module, index) => (
                        <div key={index} className="module-item">
                          <h4>{module.title || `Module ${index + 1}`}</h4>
                          <p>{module.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Col>
              <Col md={12} className="text-center mt-4">
                <Link to="/ServicesPage" className="btn btn-primary back-btn">Back to Services</Link>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    
      <Container fluid className="br-footer-box mt-4">
        <FooterPage />
      </Container>
    </>
  );
};

export default ServicesDetails;