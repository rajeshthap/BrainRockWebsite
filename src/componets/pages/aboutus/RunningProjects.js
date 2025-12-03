import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import "../../../assets/css/aboutus.css";
import TechImg from "../../../assets/images/hr.jpg"

function RunningProjects() {
  return (
    <div className="ourteam-section">
      <Container>
        <div className="ourteam-box">
    

            <div className="resorce-sub-list text-center">
              <h1 className="text-center mt-3">
                Our
                <span className="resorce-about-list">Running Project</span>
              </h1>
            </div>
            <div>

              <Row className="d-flex justify-content-center br-tech-stack">

                <Col lg={6} md={6} sm={12} className="mb-3"><h3><b>Brainrock Consulting – Technologies We Use as a Top Application Development Company</b></h3>


                  <p>At <b>Brainrock Consulting,</b> we leverage the most advanced and reliable technologies to deliver high-performance <b>Application Development and mobile applications.</b> As a top application development company, we follow agile methodologies to ensure smooth project execution—from initial ideation and UI/UX design to development, testing, deployment, and long-term maintenance.</p>
                  <p>Our expert developers work with a powerful and future-ready tech stack, including <b> React Native, Flutter, Kotlin, Swift, React.js, Next.js, Node.js, Laravel, </b> and other industry-leading tools. This enables us to build scalable, secure, and feature-rich applications tailored to your business needs.</p>

                </Col>
                <Col lg={6} md={6} sm={12} className="mb-3 text-center"> <div>
                  <img
                    src={TechImg}
                    alt="TechImg"
                    className="img-fluid mt-3"
                  ></img>
                </div></Col>
              </Row>

            </div>
      
        
        </div>
      </Container>
    </div>
  );
}

export default RunningProjects;
