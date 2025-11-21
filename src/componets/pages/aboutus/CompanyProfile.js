import React from 'react'
import { Col, Container, Row } from 'react-bootstrap';
import "../../../assets/css/aboutus.css";
import "../../../assets/css/UserPage.css"
import PoorImg from "../../../assets/images/poorimg.jpg"
function CompanyProfile() {
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
                      <img
                        src={PoorImg}
                        alt="groupimage"
                        className="img-fluid  about-1 mt-30"
                      ></img>
                    </i>

                    <i>
                      <img
                        src={PoorImg}
                        alt="groupimage"
                        className="img-fluid  about-2"
                      ></img>
                    </i>
                  </div>
                  <div className="about-pic-content">
                    <i>
                      <img
                        src={PoorImg}
                        alt="groupimage"
                        className="img-fluid about-3"
                      ></img>
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
                <h2 className="heading-1">Why Choose Brainrock Consulting Services?</h2>
                <p> </p>
                <ul className="about-list">
                  <li>Experienced Professionals: Our team comprises skilled experts with extensive experience in web development and IT solutions.</li>
                  <li>Customized Solutions: We tailor our services to meet the unique needs of each client, ensuring optimal results.</li>
                  <li>Quality Assurance: We prioritize quality in every project, adhering to industry standards and best practices.</li>
                  <li>Customer-Centric Approach: Client satisfaction is at the core of our business, and we strive to exceed expectations.</li>
                  <li>Innovative Technologies: We leverage the latest technologies to deliver cutting-edge solutions that drive business growth.</li>
                </ul>
              </Col>
            </Row>
          </div>
        </Container>

      </div>

    </div>
  )
}

export default CompanyProfile