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
            <Row style={{ margin: '0 -15px' }}>
              {projects.map((project) => (
                <Col key={project.id} lg={4} md={6} sm={12} className="mb-4 mt-3" style={{ padding: '0 15px' }}>
                  <figure className="shape-box shape-box_half" style={{ margin: '0', overflow: 'hidden' }}>
                    <img
                      src={
                        project.company_logo
                          ? `${API_BASE_URL}${project.company_logo}`
                          : "https://via.placeholder.com/400x300?text=No+Image"
                      }
                      alt=""
                      style={{ width: '100%', height: 'auto' }}
                    />

                    <div className="brk-abs-overlay z-index-0 bg-black opacity-60"></div>

                    <figcaption>
                      <div className="show-cont">
                        <h4 className="card-main-title">
                          {project.company_name || "No Title"}
                        </h4>
                      </div>

                      <p className="card-content">
                        {project.description
                          ? project.description
                          : project.technology_used?.length
                            ? project.technology_used.join(", ")
                            : "No description available"}
                      </p>
                    </figcaption>

                    <span className="after"></span>
                  </figure>
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
