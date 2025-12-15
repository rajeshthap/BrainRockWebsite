import React, { useState, useEffect } from "react";
import { Container, Spinner, Alert, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import FooterPage from "../../footer/FooterPage";
import "../../../assets/css/aboutus.css";
import "../../../assets/css/project.css";

const API_BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";

function RunningProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/ourproject-items/`);
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

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
      <Container className="ourteam-box ">
        <div className=" text-center">

          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>

        </div></Container>
    );
  }

  if (error) {
    return (
      <div className="ourteam-section text-center">
        <Container className="ourteam-box">
          <Alert variant="danger">Error: {error}</Alert>
        </Container>
      </div>
    );
  }

  return (
    <>
      <div className="project-banner">


        <div className="site-breadcrumb-wpr">
          <h2 className="breadcrumb-title">Our Projects</h2>

          <ul className="breadcrumb-menu clearfix">
            <li>
              <Link className="breadcrumb-home" to="/">Home</Link>
            </li>
            <li className="px-2">/</li>
            <li>
              <Link className="breadcrumb-about" to="/">Project</Link>
            </li>
          </ul>
        </div>
      </div>
      <Container className="ourteam-section" style={{ overflow: 'hidden', }}>
        <div >
          <Container className="ourteam-box mt-3 mb-3" style={{ maxWidth: '100%', padding: '0 15px' }}>
          <Row>
  {projects.map((project) => (
    <Col key={project.id} lg={4} md={6} sm={12} className="mb-4">
      <div className="project-card">
        <img
          src={
            project.company_logo
              ? `${API_BASE_URL}${project.company_logo}`
              : "https://via.placeholder.com/400x250?text=No+Image"
          }
          alt={project.title || "Project Image"}
          className="project-image"
        />

       <div className="project-body">
  <h5 className="project-title">
    {project.title || "No Title"}
  </h5>
  
 
  <p className="project-desc" style={{ whiteSpace: "pre-line" }}>
    {project.description || "No description available"}
  </p>

  {project.project_link ? (
    <a
      href={project.project_link}
      target="_blank"
      rel="noopener noreferrer"
      className="read-more-btn"
    >
      Read More
    </a>
  ) : (
    <a
      href="#"
      className="read-more-btn"
      onClick={(e) => {
        e.preventDefault();
        window.location.reload();
      }}
    >
      Read More
    </a>
  )}
</div>

      </div>
    </Col>
  ))}
</Row>

          </Container>
        </div>
      </Container>
      <Container fluid className="br-footer-box">
        <FooterPage />
      </Container>

    </>
  );
}

export default RunningProjects;