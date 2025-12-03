import React from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

// Icons
import { LuBrainCircuit } from "react-icons/lu";
import { SiCircuitverse, SiAmazoncloudwatch } from "react-icons/si";
import { FaArrowRight } from "react-icons/fa6";

import "../../../assets/css/aboutus.css";

function RunningProjects() {

  // ⭐ Your All Projects List (Add more here)
  const projects = [
    {
      id: 1,
      title: "IT Brainrock Project",
      desc: "react.js",
      icon: <LuBrainCircuit />
    },
   
  ];

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
                <i className="flaticon-cloud">{project.icon}</i>
              </div>

              <div className="feature-desc">
                <h4>{project.title}</h4>
                <p>{project.desc}</p>

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
    </div>
  );
}

export default RunningProjects;
