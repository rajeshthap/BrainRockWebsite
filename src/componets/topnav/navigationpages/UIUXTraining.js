import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "../../../assets/css/course.css";
import { Link } from "react-router-dom";

const UIUXTraining = () => {
  return (
    <div className="ourteam-section">
      <Container className="ourteam-box">
        <div className="my-3 main-mt-0">
          {/* Top Registration Button */}
          <div className="m-3 mobile-register">
            <Link
              to="/TrainingRegistration"
              state={{
                training_name: "Python Training",
                training_description:
                  "Master Python programming from the ground up. Learn core concepts, data structures, object-oriented programming, file handling, and popular libraries to build real-world applications.",
              }}
              className="text-decoration-none"
            >
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="section-heading m-0">
                 📚 UI/UX Designer Training Program Outline
                </h3>

                <button className="btn-register-top">Register Now</button>
              </div>
            </Link>
          </div>

          <div className="training-wrapper p-2">
            <Row>
              {/* Left Column (Course Content) */}
              <Col md={12} sm={12} className="mb-4">
                {/* Module 1 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">1</span>
                         1. Introduction to UI/UX Design
                  </h4>
                  <div className="module-card">
                    <div>
                    <ul>
                                  <li>     What is UI (User Interface) and UX
                                      (User Experience)? <br />
                                        Difference between UI & UX <br />
                                        Role of a UI/UX Designer in Web & App
                                      Development
                                      <br />  Design Thinking Process Overview</li> 
                                    </ul>
                    </div>
                  </div>
                </div>

                {/* Module 2 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">2</span>
                  UX Design (User Experience)
                  </h4>
                  <div className="module-card">
                    <div>
                            Understanding Users
                                    <ul>
                                      <li>
                                        User Research (Surveys, Interviews,
                                        Personas){" "}
                                      </li>
                                      <li>Identifying Pain Points & Needs </li>
                                      <li>Creating User Personas </li>
                                      <li>User Journey Mapping </li>
                                    </ul>
                                    <br />  UX Processes
                                    <ul>
                                      <li>
                                        Information Architecture (Sitemaps &
                                        Flows){" "}
                                      </li>
                                      <li>
                                        Wireframing (Low-Fidelity Designs)
                                      </li>
                                      <li>
                                        Prototyping (Mid & High-Fidelity){" "}
                                      </li>
                                      <li>
                                        Usability Testing (Collecting Feedback &
                                        Improving Designs){" "}
                                      </li>
                                    </ul>
                                    <br />  Tools for UX Design
                                    <ul>
                                      <li>Figma (UX workflows) </li>
                                      <li>Adobe XD or Sketch (optional) </li>
                                      <li>Miro (User Flows & Mind Maps) </li>
                                    </ul>
                    </div>
                  </div>
                </div>

                {/* Module 3 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">3</span>
                  UI Design (User Interface)
                  </h4>
                  <div className="module-card">
                    <div>
                    Visual Design Principles
                                    <ul>
                                      <li>Layout, Grids & Spacing </li>
                                      <li>Color Theory and Accessibility </li>
                                      <li>
                                        Typography: Fonts, Hierarchy &
                                        Readability{" "}
                                      </li>
                                      <li>
                                        Designing for Multiple Devices (Mobile
                                        First Design){" "}
                                      </li>
                                    </ul>
                                    <br />  UI Components
                                    <ul>
                                      <li>
                                        Buttons, Forms, Cards, Icons, Modals{" "}
                                      </li>
                                      <li>
                                        Design Systems & Style Guides
                                        (Consistency in Design){" "}
                                      </li>
                                      <li>
                                        Micro-Interactions and Animations{" "}
                                      </li>
                                    </ul>
                                    <br />  UI Tools
                                    <ul>
                                      <li>
                                        {" "}
                                        Figma (Designing Components & Frames){" "}
                                      </li>
                                      <li>
                                        Adobe XD or Sketch (optional for
                                        Interface Design){" "}
                                      </li>
                                    </ul>
                    </div>
                  </div>
                </div>

                {/* Module 4 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">4</span>
                  Responsive & Adaptive Design
                  </h4>
                  <div className="module-card">
                    <div>
                  <ul>
                                     <li>  Designing for Web, Mobile, and Tablet{" "}
                                      <br />
                                        Breakpoints and Grids <br />  Creating
                                      Mobile App UI (iOS & Android Guidelines)</li> 
                                    </ul>
                    </div>
                  </div>
                </div>

                {/* Module 5 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">5</span>
                   Collaboration & Handoff
                  </h4>
                  <div className="module-card">
                    <div>
                    <ul>
                                    <li>   Working with Developers (Exporting
                                      Assets & Code) <br />
                                        Handoff Tools: Zeplin / Figma Inspect{" "}
                                      <br />  Version Control in Design Files</li> 
                                    </ul>
                    </div>
                  </div>
                </div>

                {/* Module 6 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">6</span>
                    Hands-On Practice & Projects
                  </h4>
                  <div className="module-card">
                    <div>
                    <ul>
                                      <li>Create a Landing Page Wireframe </li>
                                      <li>
                                        Design a Mobile App (Food Delivery /
                                        E-commerce App UI){" "}
                                      </li>
                                      <li>
                                        Redesign an Existing Website (Focus on
                                        UX Improvements){" "}
                                      </li>
                                    </ul>
                                    <br />  Capstone Project:
                                    <ul>
                                      <li>
                                        Complete UI/UX Design for a Real-World
                                        App or Website{" "}
                                      </li>
                                      <li>
                                        Prepare Portfolio Ready Case Studies{" "}
                                      </li>
                                    </ul>
                    </div>
                  </div>
                </div>

                 {/* Module 6 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">7</span>
                   Portfolio Building & Career Guidance
                  </h4>
                  <div className="module-card">
                    <div>
                     <ul>
                                     <li>   Creating Your Design Portfolio <br />
                                        Preparing for UI/UX Interviews <br /> 
                                      Understanding Freelance & Agency Workflows</li>
                                    </ul>
                    </div>
                  </div>
                </div>

            
             
              </Col>
              <div className="text-center">
                <Link
                  to="/TrainingRegistration"
                  state={{
                    training_name: "Python Training",
                    training_description:
                      "Master Python programming from the ground up. Learn core concepts, data structures, object-oriented programming, file handling, and popular libraries to build real-world applications.",
                  }}
                >
                  <button className="btn-register-top btn-regis">
                    Register Now
                  </button>
                </Link>
              </div>
            </Row>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default UIUXTraining;
