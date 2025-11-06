import React from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import "../../assets/css/UserPage.css"
import PoorImg from "../../assets/images/poorimg.jpg";
import Carousel from "react-bootstrap/Carousel";

 // Component
  
import Banner1 from "../../assets/images/banner-1.png";

import "../../assets/css/slider.css"

import { ImProfile } from "react-icons/im";

import { MdReviews } from "react-icons/md";

import PHPIcon from "../../assets/images/php.png";
import MySqlIcon from "../../assets/images/mysql.png"
import JavaIcon from "../../assets/images/java.png"
import DoutNetIcon from "../../assets/images/doutNet.png";
import PythonIcon from "../../assets/images/python.png";
import RailsIcon from "../../assets/images/rails.png";
import ReactIcon from "../../assets/images/reacticon.png"
import MongoDBIcon from "../../assets/images/mongodb.png"

import ServicesCarousel from "./ServicesCarousel";
import TestimonialCarousel from "./TestimonialCarousel";


function UserPage() {
  return (
    <div className="container-fluid">
      <Carousel className="resorce-craousal  " interval={3000} pause={false}>
        <Carousel.Item>
          <Row className="resorce-img">
            <Col lg={6} md={6} sm={12}>
              <div className=" d-flex flex-column h-100 align-items-start justify-content-center bottom-0 resorce-sub-title ">
                <h1 className=" bg-opacity-50 py-2 px-4">
                  <span className="br-span-title"> Empowering</span>{" "}
                  <span className="br-span-sublist">Your Business</span>{" "}
                  <span className="br-span-title">With</span>
                  <br></br> <span className="br-span-list">Next-Gen IT</span>{" "}
                  <span className="br-span-sublist">Solutions</span>
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
                  <span className="br-span-title"> Empowering</span>{" "}
                  <span className="br-span-sublist">Your Business</span>{" "}
                  <span className="br-span-title">With</span>
                  <br></br> <span className="br-span-list">Next-Gen IT</span>{" "}
                  <span className="br-span-sublist">Solutions</span>
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
                  <span className="br-span-title"> Empowering</span>{" "}
                  <span className="br-span-sublist">Your Business</span>{" "}
                  <span className="br-span-title">With</span>
                  <br></br> <span className="br-span-list">Next-Gen IT</span>{" "}
                  <span className="br-span-sublist">Solutions</span>
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
                  <span className="br-span-title"> Empowering</span>{" "}
                  <span className="br-span-sublist">Your Business</span>{" "}
                  <span className="br-span-title">With</span>
                  <br></br> <span className="br-span-list">Next-Gen IT</span>{" "}
                  <span className="br-span-sublist">Solutions</span>
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
      <div />
      <Container>
        <Row className="mt-3">
          <Col lg={6} md={6} sm={12}>
            <div className="resorce-sub-list">
              <h1>
                About <br></br>
                <span className="resorce-about-list">Brainrock Experience</span>
              </h1>
              <p>
                Brainrock Consulting Services is one of the most trusted website
                development and industrial internship providers in Dehradun,
                Uttarakhand. We deliver highly efficient web solutions that
                excel in quality, performance, and value. Backed by a qualified,
                dedicated, and enthusiastic team, our work stands out with a
                distinct edge over others in the industry.
              </p>
            </div>
          </Col>
          <Col lg={6} md={6} sm={12}>
            <div className="br-img">
              <i>
                <img
                  src={PoorImg}
                  alt="groupimage"
                  className="img-fluid br-img"
                ></img>
              </i>
            </div>
          </Col>
        </Row>
      </Container>
<ServicesCarousel />
      

      <Container>
        <div className="resorce-sub-list-design">
          <h1 className="text-center">
            Our design and <br></br>
            <span className="br-span-list mt-3">development approach</span>
          </h1>
          <Row className="mt-3">
            <Col lg={6} md={6} sm={12} className="mb-3 d-flex">
              <Card className="p-3 card-box-details flex-fill">
                <Row>
                  <Col lg={2} md={2} sm={12}>
                    <div className="card-box-image">
                      <ImProfile className="design-icon" />
                    </div>
                  </Col>
                  <Col lg={10} md={10} sm={12} className="services-design-head">
                    <h2>UX Driven Engineering</h2>
                    <p>
                      We combine user-centric design with robust engineering to
                      build digital solutions that are intuitive, engaging, and
                      highly functional. Our process ensures that every line of
                      code serves the user experience, delivering products that
                      people love to us
                    </p>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col lg={6} md={6} sm={12} className="mb-3 d-flex">
              <Card className="p-3 card-box-details flex-fill">
                <Row>
                  <Col lg={2} md={2} sm={12}>
                    <div className="card-box-image">
                      <ImProfile className="design-icon" />
                    </div>
                  </Col>
                  <Col lg={10} md={10} sm={12} className="services-design-head">
                    <h2>Developing Shared Understanding</h2>
                    <p>
                      We bridge the gap between teams and stakeholders to create
                      a clear, common vision. By fostering collaboration and
                      aligning goals, we ensure seamless communication and
                      successful project outcomes.
                    </p>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col lg={6} md={6} sm={12} className="mb-3 d-flex">
              <Card className="p-3 card-box-details flex-fill">
                <Row>
                  <Col lg={2} md={2} sm={12}>
                    <div className="card-box-image">
                      <ImProfile className="design-icon" />
                    </div>
                  </Col>
                  <Col lg={10} md={10} sm={12} className="services-design-head">
                    <h2>Proven Experience and Expertise</h2>
                    <p>
                      With years of industry experience and a team of skilled
                      professionals, we deliver reliable solutions that drive
                      innovation and business growth.
                    </p>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col lg={6} md={6} sm={12} className="mb-3 d-flex">
              <Card className="p-3 card-box-details flex-fill">
                <Row>
                  <Col lg={2} md={2} sm={12}>
                    <div className="card-box-image">
                      <ImProfile className="design-icon" />
                    </div>
                  </Col>
                  <Col lg={10} md={10} sm={12} className="services-design-head">
                    <h2>Security & Intellectual Property (IP)</h2>
                    <p>
                      We prioritize data security and safeguard your
                      intellectual property with strict confidentiality, robust
                      systems, and compliance with global standards.
                    </p>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col lg={6} md={6} sm={12} className="mb-3 d-flex">
              <Card className="p-3 card-box-details flex-fill">
                <Row>
                  <Col lg={2} md={2} sm={12}>
                    <div className="card-box-image">
                      <MdReviews  className="design-icon" />
                    </div>
                  </Col>
                  <Col lg={10} md={10} sm={12} className="services-design-head">
                    <h2>Code Reviews</h2>
                    <p>
                      We ensure clean, efficient, and secure code through
                      rigorous reviews, fostering high-quality software and
                      seamless collaboration.
                    </p>
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col lg={6} md={6} sm={12} className="mb-3 d-flex">
              <Card className="p-3 card-box-details flex-fill">
                <Row>
                  <Col lg={2} md={2} sm={12}>
                    <div className="card-box-image">
                      <ImProfile className="design-icon" />
                    </div>
                  </Col>
                  <Col lg={10} md={10} sm={12} className="services-design-head">
                    <h2>Quality Assurance & Testing</h2>
                    <p>
                      We deliver flawless digital solutions through rigorous QA
                      processes and comprehensive testing to ensure performance,
                      reliability, and user satisfaction.
                    </p>
                  </Col>
                </Row>
              </Card>
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
              <img src={PHPIcon} alt="node-img" className="img-fluid mt-3"></img>
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
              <img src={PythonIcon} alt="Python-img" className="img-fluid br-tech-img"></img>
            </div>
          </Col>
        
          <Col lg={3} md={3} sm={6} className="mt-3">
         
            <div>
              <img src={RailsIcon} alt="Rails-img" className="img-fluid "></img>
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
        
          <Col lg={12} md={12} sm={12} className=""> <h3><span className="br-card-span-text">Hire the best developers and</span> <br></br><span>designers around!</span></h3></Col>
                <Col lg={6} md={6} sm={12}> <Button variant="" className="hire-btn text-end">Hire Top Developers</Button></Col>
        </Row>
   

      </div>
    


</Container>
    </div>
  );
}

export default UserPage;
