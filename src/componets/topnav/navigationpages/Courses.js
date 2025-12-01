import React, { useState, useEffect } from 'react'
import { Col, Container, Row, Spinner, Alert } from 'react-bootstrap'
import { AiOutlineFileDone } from 'react-icons/ai'
import { FaArrowRight, FaPhp, FaPython, FaReact } from 'react-icons/fa'
import "../../../assets/css/course.css";
import { useNavigate } from "react-router-dom";
import { DiMysql } from "react-icons/di";
import { MdDeveloperBoard } from "react-icons/md";
import { IoLogoHtml5 } from "react-icons/io";
import { TbDeviceDesktop } from "react-icons/tb";

// Define the base URL for the API and media
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/course-items/`);
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const result = await response.json();

        // Assuming the API returns { success: true, data: [...] } or a direct array
        const coursesData = result.data || result;

        // Map over the data to construct full image URLs and format prices
        const processedCourses = coursesData.map(course => ({
          ...course,
          // Construct full icon URL, handle null icon, and add cache-busting timestamp
          icon: course.icon ? `${API_BASE_URL}${course.icon}?t=${Date.now()}` : null,
          // Format price to Indian Rupees
          formattedPrice: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
          }).format(course.price)
        }));

        setCourses(processedCourses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="ourteam-section">
      <Container className='ourteam-box'>
        {loading && (
          <div className="text-center my-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}
        {error && (
          <Alert variant="danger" className="my-5">
            {error}
          </Alert>
        )}
        {!loading && !error && (
          <Row>
            {courses.map((course) => (
              <Col key={course.id} lg={3} md={3} sm={12} className="box-info" >
                <div className="service-box">
                  <div className="service-icon text-center">
                    {/* Conditionally render the icon image or a default icon */}
                    {course.icon ? (
                      <img src={course.icon} alt={course.title} style={{ width: '60px', height: '60px' }} />
                    ) : (
                      <i className="flaticon-cloud-service"><AiOutlineFileDone /></i>
                    )}
                  </div>
                  <div className="service-desc course-sub-heading">
                    <h4 className="heading-5">{course.title}</h4>
                    <p>{course.description}</p>
                    <p className="course-info">
                      <span className="course-label">Price:</span>
                      <span className="course-value">{course.formattedPrice}</span>
                    </p>
                    <p className="course-info">
                      <span className="course-label">Duration:</span>
                      <span className="course-value">{course.duration}</span>
                    </p>
                    <button className="service-btn-read" onClick={() => navigate(`/course/${course.id}`)}>
                      Read More
                      <i className="ti-arrow-right"><FaArrowRight /></i>
                    </button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}

        {/* The "OUR TEAM" section is static, so it remains unchanged */}
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