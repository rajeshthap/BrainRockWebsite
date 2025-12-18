import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import "../../assets/css/aboutus.css";
import { Link } from "react-router-dom";
import { LuBrainCircuit } from "react-icons/lu";
import { SiCircuitverse, SiAmazoncloudwatch } from "react-icons/si";
import { FaArrowRight } from "react-icons/fa";
import FooterPage from "../footer/FooterPage";

function ServicesPage({ showBannerAndFooter = true }) {
  const [itServiceData, setItServiceData] = useState([]);
  const [itServiceLoading, setItServiceLoading] = useState(true);
  const [itServiceError, setItServiceError] = useState(null);

  // Render icon from URL OR default icon
  const renderIcon = (iconUrl) => {
    if (!iconUrl) return <LuBrainCircuit />;
    return <img src={iconUrl} alt="service-icon" style={{ width: "80px" }} />;
  };

  // Function to truncate text to a specific length
  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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

  // This is the main content of your services. We put it in a separate function
  // to make the conditional rendering in the return statement cleaner.
  const renderServiceContent = () => (
    <Container className="">
      <Row className="feature-area feature-minus-top">
        <Container>
          <div className="feature-wpr grid-3">
            {itServiceLoading ? (
              Array(3).fill().map((_, index) => (
                <div className="feature-box" key={index}>
                  <div className="feature-icon">
                    <i class="flaticon-cloud">
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </i>
                  </div>
                  <div className="flaticon-cloud"></div>
                  <div className="feature-desc">
                    <h4>Loading...</h4>
                    <p>Loading content...</p>
                    <Link to="/ServicesDetails" className="feature-btn">
                      Read More <i className="ti-arrow-right"><FaArrowRight /></i>
                    </Link>
                  </div>
                </div>
              ))
            ) : itServiceError ? (
              Array(3).fill().map((_, index) => (
                <div className="feature-box" key={index}>
                  <div className="feature-icon">
                    <i class="flaticon-cloud"><LuBrainCircuit /></i>
                  </div>
                  <div className="flaticon-cloud"></div>
                  <div className="feature-desc">
                    <h4>Error Loading Data</h4>
                    <p>Unable to load service information. Please try again later.</p>
                    <Link to="/ServicesDetails" className="feature-btn">
                      Read More <i className="ti-arrow-right"><FaArrowRight /></i>
                    </Link>
                  </div>
                </div>
              ))
            ) : itServiceData.length > 0 ? (
              itServiceData.map((item) => (
                <div className="feature-box" key={item.id}>
                  <div className="feature-icon">
                    <i class="flaticon-cloud">{renderIcon(item.icon)}</i>
                  </div>
                  <div className="flaticon-cloud"></div>
                  <div className="feature-desc">
                    <h4>{item.title}</h4>
                    <p style={{ whiteSpace: "pre-line" }}>{truncateText(item.description)}</p>
                    <Link to="/ServicesDetails" state={{ serviceId: item.id, serviceData: item }} className="feature-btn">
                      Read More <i className="ti-arrow-right"><FaArrowRight /></i>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              // Fallback hardcoded data
              <>
                <div className="feature-box">
                  <div className="feature-icon"><i class="flaticon-cloud"><LuBrainCircuit /></i></div>
                  <div className="flaticon-cloud"></div>
                  <div className="feature-desc">
                    <h4>It Solution</h4>
                    <p>{truncateText("It Solution It is a long established fact that a reader will be distracted by the readable content fact that a reader will")}</p>
                    <Link to="/ServicesDetails" state={{ serviceId: 1, serviceData: { id: 1, title: "It Solution", description: "..." } }} className="feature-btn">
                      Read More <i className="ti-arrow-right"><FaArrowRight /></i>
                    </Link>
                  </div>
                </div>
                <div className="feature-box">
                  <div className="feature-icon"><i class="flaticon-cloud"><SiCircuitverse /></i></div>
                  <div className="flaticon-cloud"></div>
                  <div className="feature-desc">
                    <h4>It Management</h4>
                    <p>{truncateText("It is a long established fact that a reader will be distracted by the readable content fact that a reader will")}</p>
                    <Link to="/ServicesDetails" state={{ serviceId: 2, serviceData: { id: 2, title: "It Management", description: "..." } }} className="feature-btn">
                      Read More <i className="ti-arrow-right"><FaArrowRight /></i>
                    </Link>
                  </div>
                </div>
                <div className="feature-box">
                  <div className="feature-icon"><i class="flaticon-cloud"><SiAmazoncloudwatch /></i></div>
                  <div className="flaticon-cloud"></div>
                  <div className="feature-desc">
                    <h4>It Consultancy</h4>
                    <p>{truncateText("It is a long established fact that a reader will be distracted by the readable content fact that a reader will")}</p>
                    <Link to="/ServicesDetails" state={{ serviceId: 3, serviceData: { id: 3, title: "It Consultancy", description: "..." } }} className="feature-btn">
                      Read More <i className="ti-arrow-right"><FaArrowRight /></i>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </Container>
      </Row>
    </Container>
  );

  return (
    <>
      {/* Condition: Show banner ONLY if showBannerAndFooter is true */}
      {showBannerAndFooter && (
        <div className='Services-banner'>
          <div className='site-breadcrumb-wpr'>
            <h2 className='breadcrumb-title'>Our Services</h2>
            <ul className='breadcrumb-menu clearfix'>
              <li><Link className="breadcrumb-home" to="/">Home</Link></li>
              <li className='px-2'>/</li>
              <li><Link className="breadcrumb-about" to="/ServicesPage">Services</Link></li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="">
        <Container className="">
          {/* 
            --- THIS IS THE KEY PART ---
            This condition checks the prop.
            - If showBannerAndFooter is TRUE, it adds the `ourteam-box mt-4` wrapper.
            - If showBannerAndFooter is FALSE, it renders the content WITHOUT the wrapper.
          */}
          {showBannerAndFooter ? (
            <div className="ourteam-box ourteam-section  mt-4">
              {renderServiceContent()}
            </div>
          ) : (
            renderServiceContent()
          )}
        </Container>
        <Container />
        
        {/* Condition: Show footer ONLY if showBannerAndFooter is true */}
        {showBannerAndFooter && (
          <Container fluid className="br-footer-box mt-4">
            <FooterPage />
          </Container>
        )}
      </div>
    </>
  );
}

export default ServicesPage;