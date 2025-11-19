import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import "../../assets/css/UserPage.css"
import PoorImg from "../../assets/images/poorimg.jpg";
import Carousel from "react-bootstrap/Carousel";
import { FaArrowRight } from "react-icons/fa6";
// Component

import Banner1 from "../../assets/images/banner-1.png";

import "../../assets/css/slider.css"
import { LuBrainCircuit } from "react-icons/lu";

import { SiCircuitverse } from "react-icons/si";

import { SiAmazoncloudwatch } from "react-icons/si";
import PHPIcon from "../../assets/images/php.png";
import MySqlIcon from "../../assets/images/mysql.png";
import JavaIcon from "../../assets/images/java.png";
import DoutNetIcon from "../../assets/images/doutNet.png";
import PythonIcon from "../../assets/images/python.png";
import RailsIcon from "../../assets/images/rails.png";
import ReactIcon from "../../assets/images/reacticon.png";
import MongoDBIcon from "../../assets/images/mongodb.png";
import { TbSettingsCode } from "react-icons/tb";
import { GrShieldSecurity } from "react-icons/gr";
import { LuSearchCode } from "react-icons/lu";
import { AiOutlineFileDone } from "react-icons/ai";
import ServicesCarousel from "./ServicesCarousel";
import TestimonialCarousel from "./TestimonialCarousel";
import { GoCodeReview } from "react-icons/go";
import { MdEngineering } from "react-icons/md";
import { Link } from "react-router-dom";

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
      <div className="resorce-main-section py-5">
        <Container>
          <div className="resorce-sub-list-design">


            <div class="text-center"><h1 class=" hero-sub-title">Our design and  <br></br><span class="br-span-list mt-3">development approach</span></h1></div>


            <Row>
              <Col lg={3} md={3} sm={12} >
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
              <Col lg={3} md={3} sm={12} >
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
              <Col lg={3} md={3} sm={12} >
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
              <Col lg={3} md={3} sm={12} >
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

              <Col lg={3} md={3} sm={12} className="mt-4" >
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
                      <i className="ti-arrow-right"><LuSearchCode /></i>
                    </button>
                  </div>

                </div>

              </Col>
              <Col lg={3} md={3} sm={12} className="mt-4" >
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
                      <i className="ti-arrow-right"><LuSearchCode /></i>
                    </button>
                  </div>

                </div>

              </Col>
            </Row>




          </div>
          <div className="resorce-sub-list">
            <h1 className="text-center mt-3">
              Our <br></br>
              <span className="resorce-about-list">Tech Stack</span>
            </h1>
          </div>
          <div>
            <Row className="d-flex justify-content-center br-tech-stack">
              <Col lg={2} md={2} sm={6} className="mb-3">
                <div>
                  <img
                    src={PHPIcon}
                    alt="node-img"
                    className="img-fluid mt-3"
                  ></img>
                </div>
              </Col>

              <Col lg={2} md={2} sm={6} className="mb-3">
                <div>
                  <img src={PHPIcon} alt="php-img"></img>
                </div>
              </Col>
              <Col lg={2} md={2} sm={6} className="mb-3">
                <div>
                  <img src={MySqlIcon} alt="MySql-img"></img>
                </div>
              </Col>
              <Col lg={2} md={2} sm={6} className="mb-3">
                <div>
                  <img src={JavaIcon} alt="Java-img"></img>
                </div>
              </Col>
              <Col lg={2} md={2} sm={6} className="mb-3">
                <div>
                  <img src={DoutNetIcon} alt=".Net-img"></img>
                </div>
              </Col>
              <Col lg={2} md={2} sm={6} className="mt-3">
                <div>
                  <img
                    src={PythonIcon}
                    alt="Python-img"
                    className="img-fluid br-tech-img"
                  ></img>
                </div>
              </Col>

              <Col lg={3} md={3} sm={6} className="mt-3">
                <div>
                  <img
                    src={RailsIcon}
                    alt="Rails-img"
                    className="img-fluid "
                  ></img>
                </div>
              </Col>
              <Col lg={3} md={3} sm={6}>
                <div>
                  <img src={ReactIcon} alt="react-img"></img>
                </div>
              </Col>

              <Col lg={3} md={3} sm={6} className="mt-3">
                <div>
                  <img src={MongoDBIcon} alt="MongoDB-img"></img>
                </div>
              </Col>
            </Row>
          </div>
        </Container>

      </div>
      <div className="testimonial-section resorce-sub-list-design py-5">
        {/* <h1 className="text-center">
            Why customers love <br></br>
            <span className="br-span-list mt-3">working with us</span>
          </h1> */}
        <TestimonialCarousel />
      </div>

      <Container>
        <div className="br-card-bg">
          <Row>
            <Col lg={12} md={12} sm={12} className="">
              {" "}
              <h3>
                <span className="br-card-span-text">
                  Hire the best developers and
                </span>{" "}
                <br></br>
                <span>designers around!</span>
              </h3>
            </Col>
            <Col lg={6} md={6} sm={12}>
              {" "}
              <Button variant="" className="hire-btn text-end">
                Hire Top Developers
              </Button>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}

export default UserPage;
