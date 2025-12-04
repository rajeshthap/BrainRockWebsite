import React, { useState, useEffect } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

// Icons
import { LuBrainCircuit } from "react-icons/lu"; 
import { FaArrowRight } from "react-icons/fa6";

import "../../../assets/css/aboutus.css";
import FooterPage from "../../footer/FooterPage";

const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

function RunningProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Fetch data from the API endpoint
        const response = await fetch(`${API_BASE_URL}/api/ourproject-items/`);
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const result = await response.json();
        // The API might wrap the data in a `data` property, handle that
        const projectsData = result.data || result;
        setProjects(projectsData);
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
      <div className="ourteam-section text-center">
        <Container className="ourteam-box">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      </div>
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
    <div className="ourteam-section">
      <Container className="ourteam-box">

        {/* Heading + Total Count */}
        <div className="our-heading-team">
          <h1>OUR PROJECTS</h1>
          <p style={{ marginTop: "-10px", fontSize: "18px", color: "#555" }}>
            Total Completed Projects: <b>{projects.length}</b>
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid-3">
          {projects.map((project) => (
            <div className="feature-box" key={project.id}>
              <div className="feature-icon">
                {/* Display company logo if it exists, otherwise show a default icon */}
                {project.company_logo ? (
                  <img 
                    src={`${API_BASE_URL}${project.company_logo}`} 
                    alt={`${project.company_name} logo`} 
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '50%' }} 
                  />
                ) : (
                  <i className="flaticon-cloud"><LuBrainCircuit /></i>
                )}
              </div>

              <div className="feature-desc">
                <h4>{project.company_name}</h4>
                <p>{project.technology_used.join(', ')}</p>

                <Link to="#" className="feature-btn">
                  Read More
                  <i className="ti-arrow-right">
                    <FaArrowRight />
                  </i>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </Container>
       <Container fluid className="br-footer-box">
        
          <FooterPage />
      </Container>
    </div>
  );
}

export default RunningProjects;