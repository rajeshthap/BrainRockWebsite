import React, { useState, useEffect } from "react";
import { Container, Spinner, Alert, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

// Icons
import { LuBrainCircuit } from "react-icons/lu";
import { FaArrowRight } from "react-icons/fa6";

import "../../../assets/css/aboutus.css";
import FooterPage from "../../footer/FooterPage";
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
    <>
      <div className='project-banner'>
              <div className='site-breadcrumb-wpr'>
                <h2 className='breadcrumb-title'>Our Projects</h2>
             <ul className='breadcrumb-menu clearfix'>
        <li>
          <Link className="breadcrumb-home" to="/">Home</Link>
        </li>
      
        <li className='px-2'>/</li>
      
        <li>
          <Link className="breadcrumb-about" to="/">Project</Link>
        </li>
      </ul>
      
              </div>
            </div>
    <div className="ourteam-section">
      <Container className="ourteam-box">

        <div className="box-wrapper">

          {/* repeat same UI for each project */}
          {projects.map((project, index) => (
            <figure key={project.id} className="shape-box shape-box_half">

              <img
                src={
                  project.company_logo
                    ? `${API_BASE_URL}${project.company_logo}`
                    : "https://via.placeholder.com/400x300?text=No+Image"
                }
                alt=""
              />

              <div className="brk-abs-overlay z-index-0 bg-black opacity-60"></div>

              <figcaption>
                <div className="show-cont">
                  {/* <h3 className="card-no">
                    {index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </h3> */}

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
          ))}

        </div>
      </Container>

      <Container fluid className="br-footer-box">
        <FooterPage />
      </Container>
    </div>
    </>
  );
}

export default RunningProjects;
