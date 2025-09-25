import React from "react";
import { Card, Col, Container, Row} from "react-bootstrap";
import "../assets/css/UserPage.css";
import PoorImg from "../assets/images/poorimg.jpg";
import Carousel from 'react-bootstrap/Carousel';
import Footer from "../components/footer/Footer"
import Banner1 from "../assets/images/banner-1.png";
import Banner2 from "../assets/images/banner-2.png";
import Banner3 from "../assets/images/banner-3.png";
import Groupchild from "../assets/images/Groupchild.png"
import Slider1 from "../assets/images/slider1.png"
import "../assets/css/slider.css";
import { FaNode } from "react-icons/fa";
function UserPage() {
  return (

    <div className="container-fluid">
    
      <Carousel className="resorce-craousal  " interval={3000} pause={false}>
        <Carousel.Item>
          <Row className="resorce-img">

            <Col lg={6} md={6} sm={12}>
              <div className=" d-flex flex-column h-100 align-items-start justify-content-center bottom-0 resorce-sub-title ">
                <h1 className=" bg-opacity-50 py-2 px-4">Empowering Your Business With
<br></br> Next-Gen IT Solutions</h1>
                <p className=" bg-opacity-50 py-2 px-4">We deliver innovative IT solutions to help your business stay ahead in the digital worldd</p>

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
          <Carousel.Caption>

          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <Row className="resorce-img">

            <Col lg={6} md={6} sm={12}>

              <div className=" d-flex flex-column h-100 align-items-start justify-content-center bottom-0 resorce-sub-title ">
                <h1 className=" bg-opacity-50 py-2 px-4">Nurturing Little Hearts<br></br> Growing Bright Futures</h1>
                <p className=" bg-opacity-50 py-2 px-4">Safe, Loving, and Supportive Care for Every Child</p>

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
          <Carousel.Caption>

          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <Row className="resorce-img">

            <Col lg={6} md={6} sm={12}>

              <div className=" d-flex flex-column h-100 align-items-start justify-content-center bottom-0 resorce-sub-title ">
                <h1 className=" bg-opacity-50 py-2 px-4">Nurturing Little Hearts<br></br> Growing Bright Futures</h1>
                <p className=" bg-opacity-50 py-2 px-4">Safe, Loving, and Supportive Care for Every Child</p>

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
          <Carousel.Caption>

          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <Row className="resorce-img">

            <Col lg={6} md={6} sm={12}>
              <div className=" d-flex flex-column h-100 align-items-start justify-content-center bottom-0 resorce-sub-title ">
                <h1 className=" bg-opacity-50 py-2 px-4">Nurturing Little Hearts<br></br> Growing Bright Futures</h1>
                <p className=" bg-opacity-50 py-2 px-4">Safe, Loving, and Supportive Care for Every Child</p>

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
          <Carousel.Caption>

          </Carousel.Caption>
        </Carousel.Item>



      </Carousel>
      <div />
<Container>
      <Row className="mt-3">
        
        <Col lg={6} md={6} sm={12}>
          <div className="resorce-sub-list">
            <h1>About <br></br>
Brainrock Experience</h1>
           <p>
            Brainrock Consulting Services is one of the most trusted website development and industrial internship providers in Dehradun, Uttarakhand. We deliver highly efficient web solutions that excel in quality, performance, and value. Backed by a qualified, dedicated, and enthusiastic team, our work stands out with a distinct edge over others in the industry.
           </p>
          </div>
        </Col>
        <Col lg={6} md={6} sm={12}>
          <div>
            <i>
              <img src={PoorImg} alt="groupimage" className="img-fluid"></img>
            </i>
          </div>
        </Col>
      </Row>

      </Container>
<div className="container-fluid">
  <h1 className="text-center mb-4">Services we offer</h1>

  <div
    id="servicesCarousel"
    className="carousel slide"
    data-bs-ride="carousel"
    data-bs-interval="3000"
    data-bs-pause="false"  // <- disables pause on hover
    data-bs-wrap="true"
  >
    <div className="carousel-inner">

      {/* First Slide */}
      <div className="carousel-item active">
        <div className="row justify-content-center">
          <div className="col-md-4 col-sm-12 mb-3">
            <div className="service-card p-3 border rounded shadow-sm text-center">
              <h4>Mobile App Development</h4>
              <p>We design and build high-performing, user-friendly mobile apps tailored to your business needs, ensuring seamless experiences across Android and iOS platforms.</p>
            </div>
          </div>
          <div className="col-md-4 col-sm-12 mb-3">
            <div className="service-card p-3 border rounded shadow-sm text-center">
              <h4>Web Design & Development</h4>
              <p>We craft visually stunning, responsive, and user-friendly websites that drive engagement and deliver seamless digital experiences.</p>
            </div>
          </div>
          <div className="col-md-4 col-sm-12 mb-3">
            <div className="service-card p-3 border rounded shadow-sm text-center">
              <h4>Software Testing Service</h4>
              <p>We craft visually stunning, responsive, and user-friendly websites that drive engagement and deliver seamless digital experiences.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Second Slide */}
     <div className="carousel-item">
        <div className="row justify-content-center">
          <div className="col-md-4 col-sm-12 mb-3">
            <div className="service-card p-3 border rounded shadow-sm text-center">
              <h4>Mobile App Development</h4>
              <p>We design and build high-performing, user-friendly mobile apps tailored to your business needs, ensuring seamless experiences across Android and iOS platforms.</p>
            </div>
          </div>
          <div className="col-md-4 col-sm-12 mb-3">
            <div className="service-card p-3 border rounded shadow-sm text-center">
              <h4>Web Design & Development</h4>
              <p>We craft visually stunning, responsive, and user-friendly websites that drive engagement and deliver seamless digital experiences.</p>
            </div>
          </div>
          <div className="col-md-4 col-sm-12 mb-3">
            <div className="service-card p-3 border rounded shadow-sm text-center">
              <h4>Software Testing Service</h4>
              <p>We craft visually stunning, responsive, and user-friendly websites that drive engagement and deliver seamless digital experiences.</p>
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
      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
      <span className="visually-hidden">Previous</span>
    </button>
    <button
      className="carousel-control-next"
      type="button"
      data-bs-target="#servicesCarousel"
      data-bs-slide="next"
    >
      <span className="carousel-control-next-icon" aria-hidden="true"></span>
      <span className="visually-hidden">Next</span>
    </button>
  </div>
</div>

<Container>
  <div>
    <h1 className="text-center">Our design and <br></br>development approach</h1>
    <Row className="mt-4">
      <Col lg={6} md={6} sm={12} className="mb-3">
      <Card className="p-3">
      
      <Row>
        <Col lg={2} md={2} sm={12}> 
       
        <div className="">
        <img src={Slider1} alt="Slider One" className="img-fluid"></img>
      </div>
      </Col>
        <Col lg={10} md={10} sm={12}>
         <h2>UX Driven Engineering</h2>
      <p>We combine user-centric design with robust engineering to build digital solutions that are intuitive, engaging, and highly functional. Our process ensures that every line of code serves the user experience, delivering products that people love to us</p>

        </Col>

      </Row>
      </Card>
      </Col>
        <Col lg={6} md={6} sm={12} className="mb-3">
      <Card className="p-3">
     
      <Row>
        <Col lg={2} md={2} sm={12}> 
       
        <div className="">
        <img src={Slider1} alt="Slider One" className="img-fluid"></img>
      </div>
      </Col>
        <Col lg={10} md={10} sm={12}>
         <h2>UX Driven Engineering</h2>
      <p>We combine user-centric design with robust engineering to build digital solutions that are intuitive, engaging, and highly functional. Our process ensures that every line of code serves the user experience, delivering products that people love to us</p>

        </Col>

      </Row>
      </Card>
      </Col>
      <Col lg={6} md={6} sm={12} className="">
      <Card className="p-3">
      
      <Row>
        <Col lg={2} md={2} sm={12}> 
       
        <div className="">
        <img src={Slider1} alt="Slider One" className="img-fluid"></img>
      </div>
      </Col>
        <Col lg={10} md={10} sm={12}>
         <h2>UX Driven Engineering</h2>
      <p>We combine user-centric design with robust engineering to build digital solutions that are intuitive, engaging, and highly functional. Our process ensures that every line of code serves the user experience, delivering products that people love to us</p>

        </Col>

      </Row>
      </Card>
      </Col>
       <Col lg={6} md={6} sm={12} className="">
      <Card className="p-3">
      
      <Row>
        <Col lg={2} md={2} sm={12}> 
       
        <div className="">
        <img src={Slider1} alt="Slider One" className="img-fluid"></img>
      </div>
      </Col>
        <Col lg={10} md={10} sm={12}>
         <h2>UX Driven Engineering</h2>
      <p>We combine user-centric design with robust engineering to build digital solutions that are intuitive, engaging, and highly functional. Our process ensures that every line of code serves the user experience, delivering products that people love to us</p>

        </Col>

      </Row>
      </Card>
      </Col>

    </Row>
  </div>
  <div><h1 className="text-center">Our<br></br>Tech Stack</h1></div>
  <Row>
    <Col lg={3} md={3} sm={12}>
    <div>
     <FaNode />
    </div>
    </Col>
     <Col lg={3} md={3} sm={12}>
    <div>
     <FaNode />
    </div>
    </Col>
     <Col lg={3} md={3} sm={12}>
    <div>
     <FaNode />
    </div>
    </Col>
     <Col lg={3} md={3} sm={12}>
    <div>
     <FaNode />
    </div>
    </Col>
  </Row>

</Container>


      <Footer />
    </div >
  );
}

export default UserPage;
