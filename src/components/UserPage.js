import React from "react";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import "../assets/css/UserPage.css";
import PoorImg from "../assets/images/poorimg.jpg";
import Carousel from "react-bootstrap/Carousel";

 // ✅ Component
  
import Banner1 from "../assets/images/banner-1.png";

import Slider1 from "../assets/images/slider1.png";
import Slider2 from "../assets/images/slider2.png";
import Slider3 from "../assets/images/slider3.png";
import "../assets/css/slider.css";

import { ImProfile } from "react-icons/im";

import { MdReviews, MdStarRate } from "react-icons/md";

import NodeImg from "../../src/assets/images/node.png";
import PHPIcon from "../../src/assets/images/php.png";
import MySqlIcon from "../../src/assets/images/mysql.png"
import JavaIcon from "../../src/assets/images/java.png"
import DoutNetIcon from "../../src/assets/images/doutNet.png";
import PythonIcon from "../../src/assets/images/python.png";
import RailsIcon from "../../src/assets/images/rails.png";
import ReactIcon from "../../src/assets/images/reacticon.png"
import MongoDBIcon from "../../src/assets/images/mongodb.png"

import Customer from "./CarouselComponet/Customer";

import { data } from "react-router-dom";

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

      <div className="container-fluid br-head-box">
        <h1 className="text-center mb-4">Services we offer</h1>
      {/* <Data data={data} activeSlide={2} /> */}
        <div
          id="servicesCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="3000"
          data-bs-pause="false" // <- disables pause on hover
          data-bs-wrap="true"
        >
          <div className="carousel-inner">
            {/* First Slide */}
            <div className="carousel-item active">
              <div className="row justify-content-center d-flex">
                <div className="col-md-4 col-sm-12 mb-3 flex-fill">
                  <div className="service-card p-3 border rounded shadow-sm">
                    <div className="">
                      <img
                        src={Slider1}
                        alt="Slider One"
                        className="img-fluid mobile-app-img"
                      ></img>
                    </div>
                    <h4>Mobile App Development</h4>
                    <p>
                      We design and build high-performing, user-friendly mobile
                      apps tailored to your business needs, ensuring seamless
                      experiences across Android and iOS platforms.
                    </p>
                  </div>
                </div>

                <div className="col-md-4 col-sm-12 mb-3 d-flex">
                  <div className="service-card p-3 border rounded shadow-sm flex-fill">
                    <div className="">
                      <img
                        src={Slider2}
                        alt="Slider One"
                        className="img-fluid mobile-app-img"
                      ></img>
                    </div>
                    <h4>Web Design & Development</h4>
                    <p>
                      We craft visually stunning, responsive, and user-friendly
                      websites that drive engagement and deliver seamless
                      digital experiences.
                    </p>
                  </div>
                </div>
                <div className="col-md-4 col-sm-12 mb-3 d-flex">
                  <div className="service-card p-3 border rounded shadow-sm flex-fill">
                    <div className="">
                      <img
                        src={Slider3}
                        alt="Slider One"
                        className="img-fluid mobile-app-img"
                      ></img>
                    </div>
                    <h4>Software Testing Service</h4>
                    <p>
                      We craft visually stunning, responsive, and user-friendly
                      websites that drive engagement and deliver seamless
                      digital experiences.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Slide */}
            <div className="carousel-item">
              <div className="row justify-content-center">
                <div className="col-md-4 col-sm-12 mb-3 d-flex">
                  <div className="service-card p-3 border rounded shadow-sm flex-fill">
                    <div className="">
                      <img
                        src={Slider1}
                        alt="Slider One"
                        className="img-fluid mobile-app-img"
                      ></img>
                    </div>
                    <h4>Mobile App Development</h4>
                    <p>
                      We design and build high-performing, user-friendly mobile
                      apps tailored to your business needs, ensuring seamless
                      experiences across Android and iOS platforms.
                    </p>
                  </div>
                </div>

                <div className="col-md-4 col-sm-12 mb-3 d-flex">
                  <div className="service-card p-3 border rounded shadow-sm flex-fill">
                    <div className="">
                      <img
                        src={Slider2}
                        alt="Slider One"
                        className="img-fluid mobile-app-img"
                      ></img>
                    </div>
                    <h4>Web Design & Development</h4>
                    <p>
                      We craft visually stunning, responsive, and user-friendly
                      websites that drive engagement and deliver seamless
                      digital experiences.
                    </p>
                  </div>
                </div>
                <div className="col-md-4 col-sm-12 mb-3 d-flex">
                  <div className="service-card p-3 border rounded shadow-sm flex-fill">
                    <div className="">
                      <img
                        src={Slider3}
                        alt="Slider One"
                        className="img-fluid mobile-app-img"
                      ></img>
                    </div>
                    <h4>Software Testing Service</h4>
                    <p>
                      We craft visually stunning, responsive, and user-friendly
                      websites that drive engagement and deliver seamless
                      digital experiences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Controls */}
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#servicesCarousel"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#servicesCarousel"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>

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
              <img src={NodeImg} alt="node-img" className="img-fluid mt-3"></img>
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
       
<h1 className="text-center">
            Why customers love <br></br>
            <span className="br-span-list mt-3">working with us</span>
          </h1>
        <Carousel
          indicators={false}
          interval={4000}
          className="testimonial-carousel"
        >
          {/* Slide 1 */}
          <Carousel.Item>
            <div className="text-center p-4 shadow-sm border-0">
              <p className="testimonial-text">
                Without any doubt I recommend Alcaline Solutions as one of the
                best web design and digital marketing agencies. One of the best
                agencies I’ve come across so far. Wouldn’t be hesitated to
                introduce their work to someone else.
              </p>

              <Customer />
            </div>
          </Carousel.Item>

          {/* Slide 2 */}
          <Carousel.Item>
            <div className="text-center p-4 shadow-sm border-0">
              <p className="testimonial-text">
                The service was excellent and I really liked the design process.
                Everything went smoothly.
              </p>

             <Customer />
            </div>
          </Carousel.Item>
        </Carousel>
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
