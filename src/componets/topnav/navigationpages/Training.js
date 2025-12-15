import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import "../../../assets/css/course.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import TrainingRegistration from "./TrainingRegistration";
import FooterPage from "../../footer/FooterPage";

const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const Training = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state?.courseId) {
      fetchCourseDetails(location.state.courseId);
    } else {
      setError("No course selected.");
      setLoading(false);
    }
  }, [location.state]);

  const fetchCourseDetails = async (courseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/course-items/`);
      if (!response.ok) throw new Error("Failed to fetch course details");

      const result = await response.json();
      const coursesData = result.data || result;

      const selectedCourse = coursesData.find(c => c.id === courseId);

      if (selectedCourse) {
        setCourse(selectedCourse);
      } else {
        setError("Course not found");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="danger">{error}</Alert>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          Go Back
        </button>
      </Container>
    );
  }

  return (
    <div className="ourteam-section">
      <div className='Trainingimg-banner'>
        <div className='site-breadcrumb-wpr'>
          <h2 className='breadcrumb-title'>Our Training</h2>
          <ul className='breadcrumb-menu clearfix'>
            <li><Link className="breadcrumb-home" to="/">Home</Link></li>
            <li className='px-2'>/</li>
            <li><Link className="breadcrumb-about" to="/Courses">Training</Link></li>
          </ul>
        </div>
      </div>

      <Container className="ourteam-box-training">
        <div className="my-3 main-mt-0">
          <div className="m-3 mobile-register">
            <h3 className="section-heading m-0">
              {course.title} Program
            </h3>
          </div>

          <div className="training-wrapper p-2">
            <Row>
              <Col md={6} sm={6}>

                {/*   FULL DESCRIPTION ALWAYS */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">1</span>
                    Training Description
                  </h4>
                  <div className="module-card">
                    <ul>
                      <li>{course.description}</li>
                    </ul>
                  </div>
                </div>

                {/* MODULES (IF ANY) */}
                {course.modules?.length > 0 &&
                  course.modules.map((module, index) => (
                    <div key={index} className="module-container">
                      <h4 className="module-heading">
                        <span className="module-number">{index + 2}</span>
                        {module[0]}
                      </h4>
                      <div className="module-card">
                        <ul>
                          <li>{module[1]}</li>
                        </ul>
                      </div>
                    </div>
                  ))
                }

              </Col>

              <Col md={6} sm={6}>
                <TrainingRegistration
                  courseTitle={course.title}
                  courseDuration={course.duration}
                />
              </Col>
            </Row>
          </div>
        </div>
      </Container>

      <Container fluid className="br-footer-box">
        <FooterPage />
      </Container>
    </div>
  );
};

export default Training;
