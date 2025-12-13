import React, { useState, useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import "../../assets/css/aboutus.css";

// Missing imports FIXED
import { Link } from "react-router-dom";
import { LuBrainCircuit } from "react-icons/lu";
import { SiCircuitverse, SiAmazoncloudwatch } from "react-icons/si";

import FooterPage from "../footer/FooterPage";

function ServicesPage() {
  // FIXED: Missing states
  const [itServiceData, setItServiceData] = useState([]);
  const [itServiceLoading, setItServiceLoading] = useState(true);
  const [itServiceError, setItServiceError] = useState(null);

  // Render icon from URL OR default icon
  const renderIcon = (iconUrl) => {
    if (!iconUrl) return <LuBrainCircuit />;
    return <img src={iconUrl} alt="service-icon" style={{ width: "80px" }} />;
  };

  useEffect(() => {
    const fetchItServiceData = async () => {
      try {
        const response = await fetch(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/itservice-items/"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch IT service data");
        }

        const result = await response.json();

        // Check if the API response is successful
        if (result.success) {
          // Extract the data array from the response
          const data = result.data.map((item) => ({
            ...item,
            // Construct full image URL if image path is provided
            icon: item.icon
              ? `https://mahadevaaya.com/brainrock.in/brainrock/backendbr${item.icon}`
              : null,
          }));
          setItServiceData(data);
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (error) {
        setItServiceError(error.message);
      } finally {
        setItServiceLoading(false);
      }
    };

    fetchItServiceData();
  }, []);

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
              <Link className="breadcrumb-about" to="/">Services</Link>
            </li>
          </ul>

        </div>
      </div>
      <div className="ourteam-section ">
        <Container className="">
          <div className="ourteam-box mt-4 ">
            <Container className="">

              <Row className="feature-area feature-minus-top">
                <Container>
                  <div className="feature-wpr" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {itServiceLoading ? (
                      // Show loading state while fetching data
                      Array(3)
                        .fill()
                        .map((_, index) => (
                          <div className="feature-box" key={index} style={{ width: '100%' }}>
                            <div className="feature-icon">
                              <i class="flaticon-cloud">
                                <div
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                >
                                  <span className="visually-hidden">Loading...</span>
                                </div>
                              </i>
                            </div>
                            <div className="flaticon-cloud"></div>
                            <div className="feature-desc">
                              <h4>Loading...</h4>
                              <p>Loading content...</p>
                              {/* Removed Read More button */}
                            </div>
                          </div>
                        ))
                    ) : itServiceError ? (
                      // Show error state if API call fails
                      Array(3)
                        .fill()
                        .map((_, index) => (
                          <div className="feature-box" key={index} style={{ width: '100%' }}>
                            <div className="feature-icon">
                              <i class="flaticon-cloud">
                                <LuBrainCircuit />
                              </i>
                            </div>
                            <div className="flaticon-cloud"></div>
                            <div className="feature-desc">
                              <h4>Error Loading Data</h4>
                              <p>
                                Unable to load service information. Please try again
                                later.
                              </p>
                              {/* Removed Read More button */}
                            </div>
                          </div>
                        ))
                    ) : itServiceData.length > 0 ? (
                      // Map over the IT service data to render items dynamically
                      itServiceData.map((item, index) => (
                        <div className="feature-box" key={item.id} style={{ width: '100%' }}>
                          <div className="feature-icon">
                            <i class="flaticon-cloud">{renderIcon(item.icon)}</i>
                          </div>
                          <div className="flaticon-cloud"></div>
                          <div className="feature-desc">
                            <h4>{item.title}</h4>
                            <p style={{ whiteSpace: "pre-line" }}>
                              {item.description}
                            </p>
                            {/* Removed Read More button */}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Fallback to hardcoded data if no data is available
                      <>
                        <div className="feature-box" style={{ width: '100%' }}>
                          <div className="feature-icon">
                            <i class="flaticon-cloud">
                              <LuBrainCircuit />
                            </i>
                          </div>
                          <div className="flaticon-cloud"></div>
                          <div className="feature-desc">
                            <h4>It Solution</h4>
                            <p>
                              It Solution It is a long established fact that a reader
                              will be distracted by the readable content fact that a
                              reader will
                            </p>
                            {/* Removed Read More button */}
                          </div>
                        </div>
                        <div className="feature-box" style={{ width: '100%' }}>
                          <div className="feature-icon">
                            <i class="flaticon-cloud">
                              <SiCircuitverse />
                            </i>
                          </div>
                          <div className="flaticon-cloud"></div>
                          <div className="feature-desc">
                            <h4>It Management</h4>
                            <p>
                              It is a long established fact that a reader will be
                              distracted by the readable content fact that a reader
                              will
                            </p>
                            {/* Removed Read More button */}
                          </div>
                        </div>
                        <div className="feature-box" style={{ width: '100%' }}>
                          <div className="feature-icon">
                            <i class="flaticon-cloud">
                              <SiAmazoncloudwatch />
                            </i>
                          </div>
                          <div className="flaticon-cloud"></div>
                          <div className="feature-desc">
                            <h4>It Consultancy</h4>
                            <p>
                              It is a long established fact that a reader will be
                              distracted by the readable content fact that a reader
                              will
                            </p>
                            {/* Removed Read More button */}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Container>
              </Row>
            </Container>
          </div>
        </Container>
        <Container />

        <Container fluid className="br-footer-box mt-4">
          <FooterPage />
        </Container>
      </div>
    </>
  );
}

export default ServicesPage;