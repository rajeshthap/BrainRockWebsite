import React, { useState, useEffect } from 'react';
import "../../assets/css/section.css";
import { Container, Row, Col, Spinner, Modal, Button } from 'react-bootstrap';

const AwardsCarousel = () => {
  
  // State for storing awards data
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAward, setSelectedAward] = useState(null);
  
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

  // Handle opening detail modal
  const handleAwardClick = (award) => {
    setSelectedAward(award);
    setShowDetailModal(true);
  };

  // Handle closing detail modal
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedAward(null);
  };

  return (
    <div className="resorce-main-section">
      <Container>
        <div className="resorce-sub-list-design">
          <div className="text-center">
            <h1 className="hero-sub-title">
              Brainrock{" "}
              <span className="br-span-list1 mt-3">Rewards & Certifications</span>
            </h1>
          </div>

          <Row>
            {loading ? (
              // Show loading state while fetching data
              Array(6)
                .fill()
                .map((_, index) => (
                  <Col
                    lg={3}
                    md={4}
                    sm={6}
                    xs={12}
                    className="box-info"
                    key={index}
                  >
                    <div className="service-box">
                      <div className="service-icon" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '200px'
                      }}>
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                      </div>
                      <div className="service-desc">
                        <h4 className="heading-5">Loading...</h4>
                        <p>Loading content...</p>
                      </div>
                    </div>
                  </Col>
                ))
            ) : error ? (
              // Show error state if API call fails
              <Col lg={12} md={12} sm={12} className="text-center">
                <div className="alert alert-danger" role="alert">
                  <h4>Error loading awards</h4>
                  <p>{error}</p>
                </div>
              </Col>
            ) : awards.length > 0 ? (
              // Map over the awards data to render items dynamically
              awards.map((award) => (
                <Col
                  lg={3}
                  md={4}
                  sm={6}
                  xs={12}
                  key={award.id}
                  className="box-info"
                >
                  <div className="service-box" style={{
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    height: '100%'
                  }}
                  onClick={() => handleAwardClick(award)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div className="service-icon" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '200px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      {award.image ? (
                        <img 
                          src={award.image} 
                          alt={award.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
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
                    </div>
                    <div className="service-desc">
                      <h4 className="heading-5">{award.title}</h4>
                      <p>
                        {award.description && award.description.length > 100
                          ? award.description.substring(0, 100) + "..."
                          : award.description || "Award earned from Brainrock Consulting Services"}
                      </p>
                    </div>
                  </div>
                </Col>
              ))
            ) : (
              // Show when no awards are available
              <Col lg={12} md={12} sm={12} className="text-center">
                <p>No awards available at the moment.</p>
              </Col>
            )}
          </Row>
        </div>
      </Container>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={handleCloseDetailModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedAward?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '75vh', overflowY: 'auto', padding: '30px' }}>
          {selectedAward && (
            <div>
              {/* Award Image */}
              {selectedAward.image && (
                <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                  <img 
                    src={selectedAward.image} 
                    alt={selectedAward.title}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '350px',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>
              )}

              {/* Title */}
              <div style={{ marginBottom: '20px', textAlign: 'center', borderBottom: '2px solid #0056b3', paddingBottom: '15px' }}>
                <h3 style={{ fontWeight: 'bold', color: '#333', margin: '0' }}>
                  {selectedAward.title}
                </h3>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '30px' }}>
                <p style={{
                  lineHeight: '1.8',
                  color: '#555',
                  fontSize: '15px',
                  textAlign: 'justify'
                }}>
                  {selectedAward.description}
                </p>
              </div>

              {/* Modules Section */}
              {selectedAward.modules && selectedAward.modules.length > 0 ? (
                <div style={{ marginTop: '30px', borderTop: '2px solid #e0e0e0', paddingTop: '25px' }}>
                  <h4 style={{ marginBottom: '25px', fontWeight: '700', color: '#333', fontSize: '18px' }}>
                    Core Purpose
                  </h4>
                  
                  {selectedAward.modules.map((module, moduleIndex) => (
                    <div key={moduleIndex} style={{
                      marginBottom: '25px',
                      paddingLeft: '15px',
                      borderLeft: '4px solid #0056b3',
                      backgroundColor: '#f8f9ff',
                      padding: '15px',
                      borderRadius: '4px'
                    }}>
                      {/* Module Title */}
                      {module.title && (
                        <h5 style={{
                          marginBottom: '15px',
                          color: '#0056b3',
                          fontWeight: '700',
                          fontSize: '16px',
                          margin: '0 0 12px 0'
                        }}>
                          {module.title}
                        </h5>
                      )}

                      {/* Submodules/Points */}
                      {module.submodules && module.submodules.length > 0 ? (
                        <ul style={{
                          marginLeft: '0',
                          paddingLeft: '20px',
                          listStyleType: 'none',
                          color: '#555'
                        }}>
                          {module.submodules.map((point, pointIndex) => (
                            <li key={pointIndex} style={{
                              marginBottom: '10px',
                              lineHeight: '1.6',
                              fontSize: '14px',
                              position: 'relative',
                              paddingLeft: '0'
                            }}>
                              <span style={{
                                display: 'inline-block',
                                width: '6px',
                                height: '6px',
                                backgroundColor: '#0056b3',
                                borderRadius: '50%',
                                marginRight: '10px',
                                marginTop: '5px',
                                verticalAlign: 'middle'
                              }}></span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ color: '#999', fontSize: '14px', margin: '0', fontStyle: 'italic' }}>
                          No details available
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: '30px', borderTop: '2px solid #e0e0e0', paddingTop: '25px', textAlign: 'center' }}>
                  <p style={{ color: '#999', fontSize: '14px', fontStyle: 'italic' }}>
                    No additional details available for this award
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #e0e0e0', padding: '15px 20px' }}>
          <Button variant="secondary" onClick={handleCloseDetailModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AwardsCarousel;
