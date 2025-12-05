import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "../../assets/css/course.css";
import FooterPage from "../footer/FooterPage";

const ServicesDetails = () => {
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/itservice-items/');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setServiceData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
          </div>
        </Container>
      </div>
    );
  }

  // Render the component with fetched data
  return (
    <div className="ourteam-section">
      <Container className="ourteam-box">
        <div className="my-3 main-mt-0">
          {/* Title Section (Registration removed) */}
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
                {/* Dynamically render modules from API */}
                {serviceData.modules.map((module, index) => (
                  <div className="module-container" key={index}>
                    <h4 className="module-heading">
                      <span className="module-number">{index + 1}</span>
                      {module[0]}
                    </h4>
                    <div className="module-card">
                      <div>
                        <p>{module[1]}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </Col>
              <div className="text-center">
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