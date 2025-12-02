import React, { useState, useEffect } from 'react'
import { Col, Container, Row } from 'react-bootstrap';
import "../../../assets/css/aboutus.css";
import "../../../assets/css/UserPage.css"

function CompanyProfile() {
  const [aboutData, setAboutData] = useState({
    title: "",
    description: "",
    image: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/aboutus-item/');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        
        // The API returns data in the format {success: true, data: [{...}]}
        if (result.success && result.data && result.data.length > 0) {
          // Get the first item from the array
          const item = result.data[0];
          
          // Process the data to construct full image URL if exists
          const processedData = {
            title: item.title,
            description: item.description,
            image: item.image ? `https://mahadevaaya.com/brainrock.in/brainrock/backendbr${item.image}` : null
          };
          
          setAboutData(processedData);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return <div className="ourteam-section"><div className="ourteam-box"><Container fluid><div className="text-center my-5">Loading...</div></Container></div></div>;
  }

  if (error) {
    return <div className="ourteam-section"><div className="ourteam-box"><Container fluid><div className="text-center my-5 text-danger">Error: {error}</div></Container></div></div>;
  }

  return (
    <div className="ourteam-section">
      <div className='company-banner'>
        <div className='site-breadcrumb-wpr'>
          <h2 className='breadcrumb-title'>About Company</h2>
          <ul className='breadcrumb-menu clearfix'>
            <li>Home</li>
            <li className='px-2'>/</li>
            <li>About Us</li>
          </ul>
        </div>
      </div>

      <div className="ourteam-box">
        <Container fluid>
          <div className="about-wpr my-5">
            <Row>
              <Col lg={6} md={6} sm={12} className="about-box p-2">
                <div className="about-left-content">
                  <div className="about-phase-1">
                    <i>
                      {aboutData.image ? (
                        <img
                          src={aboutData.image}
                          alt="About Us"
                          className="img-fluid about-1 mt-30"
                        />
                      ) : (
                        <div className="img-fluid about-1 mt-30 d-flex align-items-center justify-content-center bg-light" style={{height: '200px'}}>
                          <span className="text-muted">No image available</span>
                        </div>
                      )}
                    </i>
                    <i>
                      {aboutData.image ? (
                        <img
                          src={aboutData.image}
                          alt="About Us"
                          className="img-fluid about-2"
                        />
                      ) : (
                        <div className="img-fluid about-2 d-flex align-items-center justify-content-center bg-light" style={{height: '200px'}}>
                          <span className="text-muted">No image available</span>
                        </div>
                      )}
                    </i>
                  </div>
                  <div className="about-pic-content">
                    <i>
                      {aboutData.image ? (
                        <img
                          src={aboutData.image}
                          alt="About Us"
                          className="img-fluid about-3"
                        />
                      ) : (
                        <div className="img-fluid about-3 d-flex align-items-center justify-content-center bg-light" style={{height: '200px'}}>
                          <span className="text-muted">No image available</span>
                        </div>
                      )}
                    </i>
                    <div className="about-yr-exp"><p>18</p>
                      <h5>
                        <span>Year</span> Experience
                      </h5></div>
                  </div>
                </div>
              </Col>
              <Col lg={6} md={6} sm={12} className="about-right pl-30 d-flex flex-column justify-content-center p-5">
                <span className="hero-sub-title">About Us</span>
                <h2 className="heading-1">{aboutData.title}</h2>
                <p>{aboutData.description}</p>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </div>
  )
}

export default CompanyProfile;