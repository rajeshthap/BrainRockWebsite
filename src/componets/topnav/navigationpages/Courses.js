import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { AiOutlineFileDone } from 'react-icons/ai'
import { FaArrowRight, FaPhp, FaPython, FaReact } from 'react-icons/fa'
import "../../../assets/css/course.css";
import { useNavigate } from "react-router-dom";
import { DiMysql } from "react-icons/di";
import { MdDeveloperBoard } from "react-icons/md";
import { IoLogoHtml5 } from "react-icons/io";
import { TbDeviceDesktop } from "react-icons/tb";
function Courses() {
  const navigate = useNavigate();
  return (
    <div className="ourteam-section">
      <Container className='ourteam-box'>
        <Row>
          <Col lg={3} md={3} sm={12} className="box-info" >
            <div className="service-box">
              <div className="service-icon text-center">
                <i className="flaticon-cloud-service"><FaReact /></i>
              </div>
              <div className="service-desc course-sub-heading">

                <h4 className="heading-5">React JS Advanced Mastery</h4>
                <p>
                  Dive into advanced hooks, context API, performance optimization, routing, and architecture.
                </p>
                <p className="course-info">
                  <span className="course-label">Price:</span>
                  <span className="course-value">₹4,999</span>
                </p>

                <p className="course-info">
                  <span className="course-label">Duration:</span>
                  <span className="course-value">6 weeks</span>
                </p>
                <button className="service-btn-read" onClick={() => navigate("/TrainingReact")}>
                  Read More
                  <i className="ti-arrow-right"><FaArrowRight /></i>
                </button>
              </div>

            </div>

          </Col>

          <Col lg={3} md={3} sm={12} className="box-info" >
            <div className="service-box">
              <div className="service-icon text-center">
                <i className="flaticon-cloud-service"><FaPython /></i>
              </div>
              <div className="service-desc course-sub-heading">

                <h4 className="heading-5">Python Advanced Mastery</h4>
                <p>
                  Master Python programming from the ground up. Learn core concepts, data structures, object-oriented programming, file handling, and popular libraries to build real-world applications.
                </p>
                <p className="course-info">
                  <span className="course-label">Price:</span>
                  <span className="course-value">₹4,999</span>
                </p>

                <p className="course-info">
                  <span className="course-label">Duration:</span>
                  <span className="course-value">6 weeks</span>
                </p>
                <button className="service-btn-read" onClick={() => navigate("/Python")}>
                  Read More
                  <i className="ti-arrow-right"><FaArrowRight /></i>
                </button>
              </div>

            </div>

          </Col>

          <Col lg={3} md={3} sm={12} className="box-info" >
            <div className="service-box">
              <div className="service-icon text-center">
                <i className="flaticon-cloud-service"><FaPhp /></i>
              </div>
              <div className="service-desc course-sub-heading">

                <h4 className="heading-5">PHP Advanced Mastery</h4>
                <p>
                  Learn to build dynamic and interactive web applications using PHP. Gain hands-on experience with server-side scripting, form handling, database integration, and real-world project development.
                </p>
                <p className="course-info">
                  <span className="course-label">Price:</span>
                  <span className="course-value">₹4,999</span>
                </p>

                <p className="course-info">
                  <span className="course-label">Duration:</span>
                  <span className="course-value">6 weeks</span>
                </p>
                <button className="service-btn-read" onClick={() => navigate("/TrainingPHP")}>
                  Read More
                  <i className="ti-arrow-right"><FaArrowRight /></i>
                </button>
              </div>

            </div>

          </Col>

          <Col lg={3} md={3} sm={12} className="box-info" >
            <div className="service-box">
              <div className="service-icon text-center">
                <i className="flaticon-cloud-service"><DiMysql /></i>
              </div>
              <div className="service-desc course-sub-heading">

                <h4 className="heading-5">My SQL Advanced Mastery</h4>
                <p>
                  Gain practical experience in database design, querying, indexing, and optimization with MySQL. Learn to build and manage relational databases effectively using real-world examples.
                </p>
                <p className="course-info">
                  <span className="course-label">Price:</span>
                  <span className="course-value">₹4,999</span>
                </p>

                <p className="course-info">
                  <span className="course-label">Duration:</span>
                  <span className="course-value">6 weeks</span>
                </p>
                <button className="service-btn-read" onClick={() => navigate("/TrainingMySql")}>
                  Read More
                  <i className="ti-arrow-right"><FaArrowRight /></i>
                </button>
              </div>

            </div>

          </Col>

          <Col lg={3} md={3} sm={12} className="box-info" >
            <div className="service-box">
              <div className="service-icon text-center">
                <i className="flaticon-cloud-service"><IoLogoHtml5 /></i>
              </div>
              <div className="service-desc course-sub-heading">

                <h4 className="heading-5">HTML, CSS & Bootstrap Training Program</h4>
                <p>
                  Get hands-on with web basics and responsive design using Bootstrap.
                </p>
                <p className="course-info">
                  <span className="course-label">Price:</span>
                  <span className="course-value">₹4,999</span>
                </p>

                <p className="course-info">
                  <span className="course-label">Duration:</span>
                  <span className="course-value">6 weeks</span>
                </p>
                <button className="service-btn-read" onClick={() => navigate("/TrainingBootstrap")}>
                  Read More
                  <i className="ti-arrow-right"><FaArrowRight /></i>
                </button>
              </div>

            </div>

          </Col>

          <Col lg={3} md={3} sm={12} className="box-info" >
            <div className="service-box">
              <div className="service-icon text-center">
                <i className="flaticon-cloud-service"><MdDeveloperBoard /></i>
              </div>
              <div className="service-desc course-sub-heading">

                <h4 className="heading-5">Web Development Training</h4>
                <p>
                  Develop Web design thinking skills to craft user-friendly digital experiences. Learn wireframing, prototyping, usability testing, and modern tools to create visually appealing and functional interfaces.
                </p>
                <p className="course-info">
                  <span className="course-label">Price:</span>
                  <span className="course-value">₹4,999</span>
                </p>

                <p className="course-info">
                  <span className="course-label">Duration:</span>
                  <span className="course-value">6 weeks</span>
                </p>
                <button className="service-btn-read" onClick={() => navigate("/TrainingWebDesign")}>
                  Read More
                  <i className="ti-arrow-right"><FaArrowRight /></i>
                </button>
              </div>

            </div>

          </Col>

          <Col lg={3} md={3} sm={12} className="box-info" >
            <div className="service-box">
              <div className="service-icon text-center">
                <i className="flaticon-cloud-service"><TbDeviceDesktop /></i>
              </div>
              <div className="service-desc course-sub-heading">

                <h4 className="heading-5">UI/UX Designer</h4>
                <p>
                  Develop design thinking skills to craft user-friendly digital experiences. Learn wireframing, prototyping, usability testing, and modern tools to create visually appealing and functional interfaces.
                </p>
                <p className="course-info">
                  <span className="course-label">Price:</span>
                  <span className="course-value">₹4,999</span>
                </p>

                <p className="course-info">
                  <span className="course-label">Duration:</span>
                  <span className="course-value">6 weeks</span>
                </p>
                <button className="service-btn-read" onClick={() => navigate("/UIUXTraining")}>
                  Read More
                  <i className="ti-arrow-right"><FaArrowRight /></i>
                </button>
              </div>

            </div>

          </Col>
        </Row>

        <Row className='mt-5'>
          <div >
            <h1> OUR Team</h1>
             <section className="our-team-section">
      <div className="container">
        <Row>
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="our-team ">
              <div className="pic">
                <img 
                  src="https://i.ibb.co/8x9xK4H/team.jpg" 
                  alt="team"
                />
              </div>

              <div className="team-content">
                <h3 className="title">Team 1</h3>
                <span className="post">Inhaber & Geschäftsführer</span>
              </div>

              <ul className="social">
                <li>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="fa fa-facebook"></a>
                </li>
                <li>
                  <a href="#" className="fa fa-twitter"></a>
                </li>
                <li>
                  <a href="#" className="fa fa-google-plus"></a>
                </li>
                <li>
                  <a href="#" className="fa fa-linkedin"></a>
                </li>
              </ul>
            </div>
          </div>
        </Row>
      </div>
    </section>

          </div>
        </Row>

      </Container>
    </div>



  )
}

export default Courses