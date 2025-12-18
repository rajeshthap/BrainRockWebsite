import React, { useState, useEffect } from "react";
import { Container, Spinner, Alert, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import FooterPage from "../../footer/FooterPage";
import "../../../assets/css/aboutus.css";
import "../../../assets/css/project.css";
import { FaArrowRight } from "react-icons/fa";

const API_BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";

function RunningProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/ourproject-items/`);
        if (!response.ok) throw new Error("Failed to fetch projects");

        const result = await response.json();
        setProjects(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <div className="project-banner">
        <div className="site-breadcrumb-wpr">
          <h2 className="breadcrumb-title">Our Projects</h2>
          <ul className="breadcrumb-menu clearfix">
            <li><Link to="/">Home</Link></li>
            <li className="px-2">/</li>
            <li>Project</li>
          </ul>
        </div>
      </div>

      <Container className="ourteam-section mt-4">
        <Row>
          {projects.map((project) => (
            <Col key={project.id} lg={4} md={6} sm={12} className="mb-4">
              <div 
                className="project-card"
               onClick={() =>
                          navigate("/ProjectDetail", {
                            state: { projectId: project.project_id }
                          })
                        }
                style={{ cursor: "pointer" }}
              >
                <img
                  src={
                    project.company_logo
                      ? `${API_BASE_URL}${project.company_logo}`
                      : "https://via.placeholder.com/400x250"
                  }
                  alt={project.title}
                  className="project-image"
                />

                <div className="project-body" style={{ whiteSpace: "pre-line" }}>
                  <h5 className="project-title">{project.title}</h5>

                  <p className="project-desc">
                    {project.description?.slice(0, 120)}...
                  </p>

                  <Link to className="feature-btn">
                    Read More<i class="ti-arrow-right"><FaArrowRight /></i>
</Link>

                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      <Container fluid className="br-footer-box">
        <FooterPage />
      </Container>
    </>
  );
}

export default RunningProjects;