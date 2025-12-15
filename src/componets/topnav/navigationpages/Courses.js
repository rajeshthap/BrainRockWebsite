import React, { useState, useEffect } from 'react';
import { Col, Container, Row, Spinner, Alert } from 'react-bootstrap';
import { AiOutlineFileDone } from 'react-icons/ai';
import { FaArrowRight } from 'react-icons/fa6';
import "../../../assets/css/course.css";
import { Link, useNavigate } from "react-router-dom";
import FooterPage from '../../footer/FooterPage';

const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //   15 WORDS ONLY
  const getShortDescription = (text, words = 15) => {
    if (!text) return "";
    const splitText = text.split(" ");
    return splitText.length > words
      ? splitText.slice(0, words).join(" ") + "..."
      : text;
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/course-items/`);
        if (!response.ok) throw new Error('Failed to fetch courses');

        const result = await response.json();
        const coursesData = result.data || result;

        const processedCourses = coursesData.map(course => {
          // Format both regular price and offer price
          const formattedPrice = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
          }).format(course.price);
          
          let formattedOfferPrice = null;
          if (course.offer_price) {
            formattedOfferPrice = new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR'
            }).format(course.offer_price);
          }

          return {
            ...course,
            icon: course.icon ? `${API_BASE_URL}${course.icon}?t=${Date.now()}` : null,
            formattedPrice,
            formattedOfferPrice
          };
        });

        setCourses(processedCourses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <>
      <div className='Courses-banner'>
        <div className='site-breadcrumb-wpr'>
          <h2 className='breadcrumb-title'>Our Courses</h2>
          <ul className='breadcrumb-menu clearfix'>
            <li><Link className="breadcrumb-home" to="/">Home</Link></li>
            <li className='px-2'>/</li>
            <li><Link className="breadcrumb-about" to="/">Courses</Link></li>
          </ul>
        </div>
      </div>

      <Container className='ourteam-box mt-4 mb-3' style={{ overflow: 'hidden' }}>
        <div className="ourteam-section">

          {loading && (
            <div className="text-center my-5">
              <Spinner animation="border" />
            </div>
          )}

          {error && (
            <Alert variant="danger" className="my-5">{error}</Alert>
          )}

          {!loading && !error && (
            <Row className="g-4" style={{ margin: '0' }}>
              {courses.map((course) => (
                <Col key={course.id} lg={3} md={4} sm={6} xs={12} style={{ padding: '10px' }}>
                  <div className="service-box equal-card" style={{
                    height: 'auto',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div className="service-icon text-center">
                      {course.icon ? (
                        <img src={course.icon} alt={course.title} style={{ width: "60px", height: "60px" }} />
                      ) : (
                        <AiOutlineFileDone size={50} />
                      )}
                    </div>

                    <div className="service-desc course-sub-heading" style={{
                      flex: '1 0 auto',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <h4 className="heading-5">{course.title}</h4>

                      {/*   ONLY 15 WORDS */}
                      <p style={{ flex: '1 0 auto' }}>
                        {getShortDescription(course.description, 15)}
                      </p>

                      <p className="course-info">
                        <span className="course-label">Price:</span>
                        <span className="course-value">{course.formattedPrice}</span>
                      </p>

                      {/* Add offer price if available */}
                      {course.formattedOfferPrice && (
                        <p className="course-info">
                          <span className="course-label">Offer Price:</span>
                          <span className="course-value" style={{ color: 'red', fontWeight: 'bold' }}>
                            {course.formattedOfferPrice}
                          </span>
                        </p>
                      )}

                      <p className="course-info">
                        <span className="course-label">Duration:</span>
                        <span className="course-value">{course.duration}</span>
                      </p>

                      <button
                        className="service-btn-read"
                        onClick={() =>
                          navigate("/Training", {
                            state: { courseId: course.id }
                          })
                        }
                      >
                        Read More <FaArrowRight />
                      </button>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </Container>

      <Container fluid className="br-footer-box">
        <FooterPage />
      </Container>
    </>
  );
}

export default Courses;