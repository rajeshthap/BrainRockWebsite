import React, { useEffect, useState } from "react";
import { Container, Spinner, Alert, Row, Col, Button } from "react-bootstrap";
import { useParams, Link, useLocation } from "react-router-dom";
import FooterPage from "../../footer/FooterPage";
// Make sure to import the CSS files that contain the module styles
import "../../../assets/css/course.css"; 
import "../../../assets/css/aboutus.css";
import "../../../assets/css/project.css";

const API_BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";

function ProjectDetail() {
  const location = useLocation();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Prioritize the ID passed via state, but fall back to the URL parameter `id`.
    const projectId = location.state?.projectId || id;
console.log("Fetching details for project ID:", projectId);
    if (projectId) {
      fetchProjectDetails(projectId);
    } else {
      setError("No project ID provided.");
      setLoading(false);
    }
  }, [location.state, id]);

  const fetchProjectDetails = async (projectId) => {
    try {
      const response = await fetch(
     
        `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/ourproject-items/?project_id=${projectId}`
      );
      if (!response.ok) throw new Error("Project not found");

      const result = await response.json();
      setProject(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        <Link to="/RunningProject" className="btn btn-primary">
          Back to Projects
        </Link>
      </Container>
    );
  }

  return (
    <>
      <div className="project-banner">
        <div className="site-breadcrumb-wpr">
          <h2 className="breadcrumb-title">Project Details</h2>
          <ul className="breadcrumb-menu clearfix" >
            <li><Link to="/">Home</Link></li>
            <li className="px-2">/</li>
            <li><Link to="/RunningProjects">Projects</Link></li>
            <li className="px-2">/</li>
            <li>{project?.title || "Details"}</li>
          </ul>
        </div>
      </div>

      <Container className="ourteam-box-training mt-4 mb-3">
        <div className="my-3 main-mt-0">
          <div className="m-3 mobile-register">
            <h2 className="section-heading  m-0">
              {project.title}
            </h2>
          </div>

          <div className="training-wrapper p-2">
            <Row>
              <Col md={12} sm={12}>
                {/* PROJECT DESCRIPTION */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number"></span>
                    Project Description
                  </h4>
                  <div className="module-card" style={{ whiteSpace: "pre-line" }}>
                    <ul>
                      <li>{project.description}</li>
                    </ul>
                  </div>
                  <div className="mt-3">
                {project.project_link && (
  <Button
    variant="primary" className="service-btn"
    onClick={() => window.open(project.project_link, "_blank")}
  >
    View
  </Button>
)}

</div>
                </div>

                {/* MODULES (IF ANY) */}
                {/* This section will only render if modules exist and the array is not empty */}
                {project.modules && project.modules.length > 0 &&
                  project.modules.map((module, index) => (
                    <div key={index} className="module-container">
                      <h4 className="module-heading">
                        <span className="module-number">{index + 2}</span>
                        {/* Assuming each module is an array like ['Module Title', 'Module Description'] */}
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
            </Row>
          </div>
        </div>
      </Container>

      <Container fluid className="br-footer-box">
        <FooterPage />
      </Container>
    </>
  );
}

export default ProjectDetail;