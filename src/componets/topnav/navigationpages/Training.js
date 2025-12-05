import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import "../../../assets/css/course.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import TrainingRegistration from "./TrainingRegistration";
import FooterPage from "../../footer/FooterPage";

// Define the base URL for the API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const Training = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if course data is passed through navigation state
    if (location.state && location.state.courseId) {
      fetchCourseDetails(location.state.courseId);
    } else {
      setError("No course selected. Please select a course from the courses page.");
      setLoading(false);
    }
  }, [location.state]);

  const fetchCourseDetails = async (courseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/course-items/`);
      if (!response.ok) {
        throw new Error('Failed to fetch course details');
      }
      const result = await response.json();
      const coursesData = result.data || result;
      
      // Find the specific course by ID
      const selectedCourse = coursesData.find(c => c.id === courseId);
      
      if (selectedCourse) {
        setCourse(selectedCourse);
      } else {
        setError("Course not found.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ourteam-section">
        <Container className="ourteam-box">
          <div className="text-center my-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ourteam-section">
        <Container className="ourteam-box">
          <Alert variant="danger" className="my-5">
            {error}
          </Alert>
          <div className="text-center">
            <button onClick={() => navigate(-1)} className="btn btn-primary">
              Go Back
            </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="ourteam-section">
      <Container className="ourteam-box-training">
        <div className="my-3 main-mt-0">
          {/* Top Registration Button */}
          <div className="m-3 mobile-register">
            <Link
              to="/TrainingRegistration"
              state={{
                training_name: course.title,
                training_description: course.description,
              }}
              className="text-decoration-none"
            >
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="section-heading m-0">
                  📚 {course.title} Program
                </h3>
              </div>
            </Link>
          </div>

          <div className="training-wrapper p-2">
            <Row>
              {/* Left Column (Course Content) */}
              <Col md={6} sm={6} className="mb-4">
                {/* Dynamic Modules */}
                {course.modules && course.modules.length > 0 ? (
                  course.modules.map((module, index) => (
                    <div key={index} className="module-container">
                      <h4 className="module-heading">
                        <span className="module-number">{index + 1}</span>
                        {module[0]}
                      </h4>
                      <div className="module-card">
                        <div>
                          <ul>
                            <li>{module[1]}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="module-container">
                    <h4 className="module-heading">
                      <span className="module-number">1</span>
                      Course Overview
                    </h4>
                    <div className="module-card">
                      <div>
                        <ul>
                          <li>{course.description}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </Col>
              <Col md={6} sm={6}>
                <TrainingRegistration 
                  courseTitle={course.title}
                  courseDuration={course.duration}
                />
              </Col>
              <div className="text-center">
               
              </div>
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