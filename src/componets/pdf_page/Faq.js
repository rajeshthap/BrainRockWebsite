import React, { useEffect } from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import FooterPage from "../footer/FooterPage";

function Faq() {
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <React.Fragment>
      <div className="project-banner">
        <div className="site-breadcrumb-wpr">
          <h2 className="breadcrumb-title">Frequently Asked Questions</h2>
          <ul className="breadcrumb-menu clearfix">
            <li><Link to="/">Home</Link></li>
            <li className="px-2">/</li>
            <li><Link to="/faq">FAQ</Link></li>
            <li className="px-2">/</li>
          </ul>
        </div>
      </div>

      <Container className="ourteam-box-training mt-4 mb-3">
        <div className="my-3 main-mt-0">
          <div className="m-3 mobile-register">
            <h2 className="section-heading m-0">
              Frequently Asked Questions (FAQ)
            </h2>
            <h3 className="section-heading mt-2">Brainrock Consulting Services (BCS)</h3>
          </div>

          <div className="training-wrapper tearm-condition p-2">
            <ol type="numeric">
              <li><strong>1. What is Brainrock Consulting Services?</strong><br />
                Brainrock Consulting Services (BCS) is a professional web development and IT consulting company that provides customized web portals, software solutions, and technical training programs to individuals and organizations.
              </li>
              
              <li><strong>2. What services does Brainrock Consulting Services provide?</strong><br />
                We provide the following services:<br />
                • Custom Website Development<br />
                • Web Portal Development<br />
                • Software Development<br />
                • E-commerce Website Development<br />
                • Web Designing<br />
                • Technical Consulting<br />
                • Internship Programs<br />
                • Full Stack Development Training
              </li>
              
              <li><strong>3. What technologies do you work with?</strong><br />
                We work with modern technologies such as:<br />
                • PHP & MySQL<br />
                • Java<br />
                • Python<br />
                • HTML, CSS & JavaScript<br />
                • Bootstrap<br />
                • WordPress<br />
                • Full Stack Development Tools
              </li>
              
              <li><strong>4. Do you provide internship programs?</strong><br />
                Yes, Brainrock Consulting Services provides industry-oriented internship programs for students and professionals in:<br />
                • Web Development<br />
                • PHP Programming<br />
                • Python Programming<br />
                • Java Programming<br />
                • Full Stack Development<br />
                • Web Designing
              </li>
              
              <li><strong>5. Who can apply for internships?</strong><br />
                Students pursuing:<br />
                • BCA<br />
                • MCA<br />
                • B.Tech<br />
                • Diploma in Computer Science<br />
                • Any IT-related course<br />
                can apply for internship programs.
              </li>
              
              <li><strong>6. Do you provide certificates after internship completion?</strong><br />
                Yes, we provide Internship Completion Certificates after successful completion of the internship program.
              </li>
              
              <li><strong>7. Do you develop custom web portals?</strong><br />
                Yes, we develop customized web portals based on client requirements, including government projects, business portals, and management systems.
              </li>
              
              <li><strong>8. How can we contact Brainrock Consulting Services?</strong><br />
                You can contact us through:<br />
                • Email<br />
                • Phone<br />
                • Website Contact Form
              </li>
              
              <li><strong>9. Do you provide support after project completion?</strong><br />
                Yes, we provide technical support and maintenance services after project delivery.
              </li>
              
              <li><strong>10. Do you develop government projects?</strong><br />
                Yes, Brainrock Consulting Services has experience in developing customized portals and applications for government departments and organizations.
              </li>
            </ol>
          </div>
        </div>
      </Container>

      <Container fluid className="br-footer-box">
        <FooterPage />
      </Container>
    </React.Fragment>
  );
}

export default Faq;