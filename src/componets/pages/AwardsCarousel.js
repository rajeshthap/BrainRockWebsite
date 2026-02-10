import React, { useState, useEffect } from 'react';
import "../../assets/css/section.css";
import { Container, Row, Col, Spinner, Button } from 'react-bootstrap';

const AwardsCarousel = () => {
  // State for storing awards data
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Base URL for images
  const BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";

  // Fetch awards from API
  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/award-items/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch awards');
        }
        
        const apiResponse = await response.json();
        
        // Extract the data array from the response
        if (apiResponse.success && apiResponse.data) {
          // Transform the API data to match the expected structure
          const transformedAwards = apiResponse.data.map(award => ({
            id: award.id,
            title: award.title,
            description: award.description,
            image: award.image ? `${BASE_URL}${award.image}` : null,
            modules: award.modules || []
          }));
          
          setAwards(transformedAwards);
        } else {
          throw new Error('Invalid API response structure');
        }
        
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchAwards();
  }, []);

  // Helper function to bold specific text in a string
  const boldText = (text, target) => {
    if (!text) return text;
    const regex = new RegExp(`(${target})`, 'g');
    return text.split(regex).map((part, index) => 
      part === target ? (
        <span key={index} style={{ 
          color: '#000000', 
          fontWeight: '700' 
        }}>{part}</span>
      ) : part
    );
  };

  // Helper function to render award box with text on left (8 cols) and image on right (4 cols)
  const renderAwardBox = (award) => (
    <div className="about-box p-2" key={award.id}>
      <div className="" style={{ height: '100%' }}>
        <Row>
          {/* Left side - Text content (8 columns) */}
          <Col lg={8} md={8} sm={12} className="service-desc" style={{ padding: '0px 25px 25px 25px' }}>
            <h4 className="heading-5" style={{ marginBottom: '20px', color: '#1973d8' }}>{award.title}</h4>
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#333',
              marginBottom: '20px'
            }}>
               {boldText(award.description || "Award earned from Brainrock Consulting Services", "Quality Management System (QMS)")}
            </p>
            
            {/* Business Credibility Highlight */}
            
              <p style={{
                fontSize: '13px',
                lineHeight: '1.5',
                margin: '0'
              }}>
                
               
              </p>
            
            
            {/* Display modules if available */}
            {award.modules && award.modules.length > 0 && (
              <div className="award-modules" style={{ marginTop: '20px' }}>
                {award.modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} style={{ marginBottom: '20px' }}>
                    {/* First item as title */}
                    <p style={{ 
                      fontWeight: 'bold', 
                      fontSize: '12px', 
                      marginBottom: '12px',
                      color: '#1973d8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {module[0]}
                    </p>
                    {/* Remaining items as bullet points */}
                    <ul style={{ 
                      paddingLeft: '20px', 
                      margin: '0', 
                      fontSize: '14px',
                      color: '#000',
                      lineHeight: '1.5'
                    }}>
                      {module.slice(1).map((point, pointIndex) => {
                        // Split the text at the first colon
                        const colonIndex = point.indexOf(':');
                        if (colonIndex !== -1) {
                          const title = point.substring(0, colonIndex + 1); // Include the colon
                          const description = point.substring(colonIndex + 1).trim(); // Text after the colon
                          
                          return (
                            <li key={pointIndex} style={{ marginBottom: '8px' }}>
                              <span style={{ fontWeight: 'bold' }}>{title}</span> {description}
                            </li>
                          );
                        } else {
                          // If no colon, render the text normally
                          return (
                            <li key={pointIndex} style={{ marginBottom: '8px' }}>
                              {point}
                            </li>
                          );
                        }
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Col>
          
          {/* Right side - Image with button (4 columns) */}
          <Col lg={4} md={4} sm={12} className="service-icon" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
           
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            overflow: 'hidden',
            padding: '20px'
          }}>
            {award.image ? (
              <>
                <div style={{
                  width: '100%',
                  height: '75%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  overflow: 'hidden',
                  backgroundColor: '#ffffff',
                  borderRadius: '6px',
                  padding: '10px'
                }}>
                  <img 
                    src={award.image} 
                    alt={award.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              
              </>
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: '14px'
              }}>
                No Image
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );

  // Helper function to render loading box
  const renderLoadingBox = (index) => (
    <div className="about-box p-2 mb-4" key={index}>
      <div className="" style={{ height: '100%' }}>
        <Row>
          <Col lg={8} md={8} sm={12} className="service-desc" style={{ padding: '25px' }}>
            <h4 className="heading-5">Loading...</h4>
            <p>Loading content...</p>
          </Col>
          <Col lg={4} md={4} sm={12} className="service-icon" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            height: '300px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            padding: '20px'
          }}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Col>
        </Row>
      </div>
    </div>
  );

  return (

    <div className="resorce-main-section">
          <Container className="bg-br">
      <div className="resorce-sub-list-design">
        <div className="text-center">
          <h1 className="hero-sub-title">
            Brainrock{" "}
            <span className="br-span-list1 mt-3"> Certifications  & Authorizations</span>
          </h1>
        </div>

        {loading ? (
          // Show loading state while fetching data
          <Row>
            {Array(4).fill().map((_, index) => renderLoadingBox(index))}
          </Row>
        ) : error ? (
          // Show error state if API call fails
          <Row>
            <Col lg={12} md={12} sm={12} className="text-center">
              <div className="alert alert-danger" role="alert">
                <h4>Error loading awards</h4>
                <p>{error}</p>
              </div>
            </Col>
          </Row>
        ) : awards.length > 0 ? (
          // Render awards with text on left (8 cols) and image on right (4 cols)
          <Row>
            {awards.map(award => renderAwardBox(award))}
          </Row>
        ) : (
          // Show when no awards are available
          <Row>
            <Col lg={12} md={12} sm={12} className="text-center">
              <p>No awards available at the moment.</p>
            </Col>
          </Row>
        )}
      </div>
           </Container>
    </div>
 
  
   
  );
};

export default AwardsCarousel;