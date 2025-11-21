import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import "../../assets/css/UserPage.css"
import PoorImg from "../../assets/images/poorimg.jpg";
import Carousel from "react-bootstrap/Carousel";
import { FaArrowRight } from "react-icons/fa6";
// Component

import Banner1 from "../../assets/images/banner-1.png";
import Banner2 from "../../assets/images/banner-2.png"

import "../../assets/css/slider.css"
import { LuBrainCircuit } from "react-icons/lu";

import { SiCircuitverse } from "react-icons/si";

import { SiAmazoncloudwatch } from "react-icons/si";


import TechImg from "../../assets/images/shield-bg.png"
import { TbSettingsCode } from "react-icons/tb";
import { GrShieldSecurity } from "react-icons/gr";
import { LuSearchCode } from "react-icons/lu";
import { AiOutlineFileDone } from "react-icons/ai";
import ServicesCarousel from "./ServicesCarousel";
import TestimonialCarousel from "./TestimonialCarousel";
import { GoCodeReview } from "react-icons/go";
import { MdEngineering } from "react-icons/md";
import { Link } from "react-router-dom";
import FooterPage from "../footer/FooterPage";

function UserPage() {
  return (
    <div className="container-fluid p-0">
      <div className="craousal-main">
        <Carousel className="resorce-craousal  " interval={3000} pause={false}>
          <Carousel.Item>
            <Row className="resorce-img">
              <Col lg={6} md={6} sm={12}>
                <div className=" d-flex flex-column h-100 align-items-start justify-content-center bottom-0 resorce-sub-title ">
                  <h1 className=" bg-opacity-50 py-2 px-4">
                    <span class="hero-sub-title mb-20">Professional it solution ~</span>{" "}<br></br>
                    <span className="br-span-title"> Best It Solution Company</span>{" "}
                    {" "}

                  </h1>
                  <p className=" bg-opacity-50 py-2 px-4">
                    We deliver innovative IT solutions to help your business stay
                    ahead in the digital worldd
                  </p>
                </div>
              </Col>

              <Col lg={6} md={6} sm={12}>
                <div>
                  <i>
                    <img
                      src={Banner1}
                      alt="groupimage"
                      className="img-fluid"
                    ></img>
                  </i>
                </div>
              </Col>
            </Row>
            <Carousel.Caption></Carousel.Caption>

          </Carousel.Item>


          <Carousel.Item>
            <Row className="resorce-img">
              <Col lg={6} md={6} sm={12}>
                <div className=" d-flex flex-column h-100 align-items-start justify-content-center bottom-0 resorce-sub-title ">
                  <h1 className=" bg-opacity-50 py-2 px-4">
                    <span class="hero-sub-title mb-20">Professional it solution ~</span>{" "}<br></br>
                    <span className="br-span-title"> Best It Solution Company</span>{" "}
                    {" "}

                  </h1>
                  <p className=" bg-opacity-50 py-2 px-4">
                    We deliver innovative IT solutions to help your business stay
                    ahead in the digital worldd
                  </p>
                </div>
              </Col>

              <Col lg={6} md={6} sm={12}>
                <div>
                  <i>
                    <img
                      src={Banner2}
                      alt="Banner2"
                      className="img-fluid"
                    ></img>
                  </i>
                </div>
              </Col>
            </Row>
            <Carousel.Caption></Carousel.Caption>

          </Carousel.Item>
        </Carousel>
      </div>
      <div />
      <Container>
        <Row className="feature-area feature-minus">

          <Container>
            <div className="feature-wpr grid-3">

              <div className="feature-box">
                <div className="feature-icon">
                  <i class="flaticon-cloud"><LuBrainCircuit /></i>



                </div>
                <div className="flaticon-cloud">


                </div>
                <div className="feature-desc">   <h4>It Solution</h4>
                  <p>
                    It Solution
                    It is a long established fact that a reader will be distracted by the readable content fact that a reader will</p>

                  <Link to="/service-single" className="feature-btn">
                    Read More
                    <i className="ti-arrow-right"><FaArrowRight /></i>
                  </Link>
                </div>
              </div>
              <div className="feature-box">
                <div className="feature-icon">
                  <i class="flaticon-cloud"><SiCircuitverse /></i>



                </div>
                <div className="flaticon-cloud">


                </div>
                <div className="feature-desc">   <h4>
                  It Management</h4>
                  <p>
                    It is a long established fact that a reader will be distracted by the readable content fact that a reader will</p>

                  <Link to="/service-single" className="feature-btn">
                    Read More
                    <i className="ti-arrow-right"><FaArrowRight /></i>
                  </Link>
                </div>
              </div>
              <div className="feature-box">
                <div className="feature-icon">
                  <i class="flaticon-cloud"><SiAmazoncloudwatch /></i>



                </div>
                <div className="flaticon-cloud">


                </div>
                <div className="feature-desc">   <h4>
                  It Consultancy</h4>
                  <p>
                    It is a long established fact that a reader will be distracted by the readable content fact that a reader will</p>

                  <Link to="/service-single" className="feature-btn">
                    Read More
                    <i className="ti-arrow-right"><FaArrowRight /></i>
                  </Link>
                </div>
              </div>
            </div>

          </Container>
        </Row>



      </Container>
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

      <ServicesCarousel />
      <div className="resorce-main-section ">
        <Container>
          <div className="resorce-sub-list-design">


            <div class="text-center"><h1 class=" hero-sub-title">Our design and  <span class="br-span-list1 mt-3">development approach</span></h1></div>


            <Row>
              <Col lg={3} md={3} sm={12} className="box-info" >
                <div className="service-box">
                  <div className="service-icon">
                    <i className="flaticon-cloud-service"><MdEngineering /></i>
                  </div>
                  <div className="service-desc">

                    <h4 className="heading-5">UX Driven Engineering</h4>
                    <p>
                      We combine user-centric design with robust engineering to build digital solutions that are intuitive, engaging, and highly functional. Our process ensures that every line of code serves the user experience, delivering products that people love to us
                    </p>
                    <button className="service-btn">
                      Read More
                      <i className="ti-arrow-right"><FaArrowRight /></i>
                    </button>
                  </div>

                </div>

              </Col>
              <Col lg={3} md={3} sm={12} className="box-info" >
                <div className="service-box">
                  <div className="service-icon">
                    <i className="flaticon-cloud-service"><GoCodeReview /></i>
                  </div>
                  <div className="service-desc">

                    <h4 className="heading-5">Developing Shared Understanding</h4>
                    <p>
                      We bridge the gap between teams and stakeholders to create a clear, common vision. By fostering collaboration and aligning goals, we ensure seamless communication and
                    </p>
                    <button className="service-btn">
                      Read More
                      <i className="ti-arrow-right"><FaArrowRight /></i>
                    </button>
                  </div>

                </div>

              </Col>
              <Col lg={3} md={3} sm={12} className="box-info" >
                <div className="service-box">
                  <div className="service-icon">
                    <i className="flaticon-cloud-service"><TbSettingsCode /></i>
                  </div>
                  <div className="service-desc">

                    <h4 className="heading-5">Proven Experience and Expertise</h4>
                    <p>
                      With years of industry experience and a team of skilled professionals, we deliver reliable solutions that drive innovation and business growth.
                    </p>
                    <button className="service-btn">
                      Read More
                      <i className="ti-arrow-right"><FaArrowRight /></i>
                    </button>
                  </div>

                </div>

              </Col>
              <Col lg={3} md={3} sm={12} className="box-info" >
                <div className="service-box">
                  <div className="service-icon">
                    <i className="flaticon-cloud-service"><GrShieldSecurity /></i>
                  </div>
                  <div className="service-desc">

                    <h4 className="heading-5">Security & Intellectual Property (IP)</h4>
                    <p>
                      We prioritize data security and safeguard your intellectual property with strict confidentiality, robust systems, and compliance with global standards.
                    </p>
                    <button className="service-btn">
                      Read More
                      <i className="ti-arrow-right"><FaArrowRight /></i>
                    </button>
                  </div>

                </div>

              </Col>

              <Col lg={3} md={3} sm={12} className="mt-4 box-info" >
                <div className="service-box">
                  <div className="service-icon">
                    <i className="flaticon-cloud-service"><LuSearchCode /></i>
                  </div>
                  <div className="service-desc">

                    <h4 className="heading-5">Code Review</h4>
                    <p>
                      We ensure clean, efficient, and secure code through rigorous reviews, fostering high-quality software and seamless collaboration.
                    </p>
                    <button className="service-btn">
                      Read More
                      <i className="ti-arrow-right"><FaArrowRight /></i>
                    </button>
                  </div>

                </div>

              </Col>
              <Col lg={3} md={3} sm={12} className="mt-4 box-info" >
                <div className="service-box">
                  <div className="service-icon">
                    <i className="flaticon-cloud-service"><AiOutlineFileDone /></i>
                  </div>
                  <div className="service-desc">

                    <h4 className="heading-5">Quality Assurance & Testing</h4>
                    <p>
                      We deliver flawless digital solutions through rigorous QA processes and comprehensive testing to ensure performance, reliability, and user satisfaction.
                    </p>
                    <button className="service-btn">
                      Read More
                      <i className="ti-arrow-right"><FaArrowRight /></i>
                    </button>
                  </div>

                </div>

              </Col>
            </Row>




          </div>

        </Container>


      </div>
      <div>
        <Container fluid className="testimonial-bg">

          <Container>

            <div className="resorce-sub-list text-center">
              <h1 className="text-center mt-3">
                Our
                <span className="resorce-about-list">Tech Stack</span>
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
          </Container>
        </Container>
      </div>
      <div className="testimonial-section  py-5">
        {/* <h1 className="text-center">
            Why customers love <br></br>
            <span className="br-span-list mt-3">working with us</span>
          </h1> */}
        <TestimonialCarousel />
      </div>

      <Container fluid className="br-footer-box">
        <Container>
          <FooterPage /></Container>
      </Container>
    </div>
  );
}

export default UserPage;
