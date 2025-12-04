import React, { useState, useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import "../../assets/css/aboutus.css";

// Missing imports FIXED
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
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

        if (result.success) {
          const data = result.data.map((item) => ({
            ...item,
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
    <div className="ourteam-section ">
      <Container className="">
      <div className="ourteam-box ">
        <Container className="">
          <Row className=''>
                      <div className='our-heading-team'>
                        <h1> Our Services</h1>
                      </div>
                    </Row>
          <Row className="feature-area feature-minus-top">
            <Container>
              <div className="feature-wpr grid-3">
                {/* LOADING */}
                {itServiceLoading ? (
                  Array(3)
                    .fill()
                    .map((_, index) => (
                      <div className="feature-box" key={index}>
                        <div className="feature-icon">
                          <i className="flaticon-cloud">
                            <div
                              className="spinner-border spinner-border-sm"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          </i>
                        </div>
                        <div className="flaticon-cloud"></div>
                        <div className="feature-desc">
                          <h4>Loading...</h4>
                          <p>Loading content...</p>
                          <Link to="/service-single" className="feature-btn">
                            Read More
                            <i className="ti-arrow-right">
                              <FaArrowRight />
                            </i>
                          </Link>
                        </div>
                      </div>
                    ))
                ) : // ERROR
                itServiceError ? (
                  Array(3)
                    .fill()
                    .map((_, index) => (
                      <div className="feature-box" key={index}>
                        <div className="feature-icon">
                          <i className="flaticon-cloud">
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
                          <Link to="/service-single" className="feature-btn">
                            Read More
                            <i className="ti-arrow-right">
                              <FaArrowRight />
                            </i>
                          </Link>
                        </div>
                      </div>
                    ))
                ) : // SUCCESS – API DATA
                itServiceData.length > 0 ? (
                  itServiceData.map((item) => (
                    <div className="feature-box" key={item.id}>
                      <div className="feature-icon">
                        <i className="flaticon-cloud">
                          {renderIcon(item.icon)}
                        </i>
                      </div>
                      <div className="flaticon-cloud"></div>
                      <div className="feature-desc">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                        <Link to="/service-single" className="feature-btn">
                          Read More
                          <i className="ti-arrow-right">
                            <FaArrowRight />
                          </i>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  // DEFAULT FALLBACK
                  <>
                    <div className="feature-box">
                      <div className="feature-icon">
                        <i className="flaticon-cloud">
                          <LuBrainCircuit />
                        </i>
                      </div>
                      <div className="flaticon-cloud"></div>
                      <div className="feature-desc">
                        <h4>It Solution</h4>
                        <p>
                          It Solution It is a long established fact that a
                          reader will be distracted by the readable content.
                        </p>
                        <Link to="/service-single" className="feature-btn">
                          Read More
                          <i className="ti-arrow-right">
                            <FaArrowRight />
                          </i>
                        </Link>
                      </div>
                    </div>

                    <div className="feature-box">
                      <div className="feature-icon">
                        <i className="flaticon-cloud">
                          <SiCircuitverse />
                        </i>
                      </div>
                      <div className="flaticon-cloud"></div>
                      <div className="feature-desc">
                        <h4>It Management</h4>
                        <p>
                          It is a long established fact that a reader will be
                          distracted by the readable content.
                        </p>
                        <Link to="/service-single" className="feature-btn">
                          Read More
                          <i className="ti-arrow-right">
                            <FaArrowRight />
                          </i>
                        </Link>
                      </div>
                    </div>

                    <div className="feature-box">
                      <div className="feature-icon">
                        <i className="flaticon-cloud">
                          <SiAmazoncloudwatch />
                        </i>
                      </div>
                      <div className="flaticon-cloud"></div>
                      <div className="feature-desc">
                        <h4>It Consultancy</h4>
                        <p>
                          It is a long established fact that a reader will be
                          distracted by the readable content.
                        </p>
                        <Link to="/service-single" className="feature-btn">
                          Read More
                          <i className="ti-arrow-right">
                            <FaArrowRight />
                          </i>
                        </Link>
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
  );
}

export default ServicesPage;
