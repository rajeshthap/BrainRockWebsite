import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "../../../assets/css/course.css";
import { Link } from "react-router-dom";

const TrainingWebDesign = () => {
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
                  📚Web Development Training Program
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
                        1. Introduction to Web Development
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                                    <li> ✅ What is Web Development? <br />
                                      ✅ Frontend vs Backend vs Full Stack{" "}
                                      <br />✅ How the Web Works (HTTP,
                                      Browsers, Servers) <br />✅ Tools Setup:
                                      VSCode, Browsers, Node.js, Git <br /></li> 
                                    </ul>
                    </div>
                  </div>
                </div>

                {/* Module 2 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">2</span>
                  Frontend Development
                  </h4>
                  <div className="module-card">
                    <div>
                         ✅ HTML (Structure)
                                    <ul>
                                      <li>
                                        HTML Elements, Attributes, and Structure{" "}
                                      </li>
                                      <li>
                                        Forms, Tables, Multimedia (Audio/Video){" "}
                                      </li>
                                      <li>Semantic HTML5 Tags </li>
                                    </ul>
                                    <br />✅ CSS (Styling)
                                    <ul>
                                      <li>
                                        CSS Syntax, Selectors (class, id,
                                        pseudo){" "}
                                      </li>
                                      <li>
                                        Box Model, Colors, Fonts, Backgrounds
                                      </li>
                                      <li>
                                        Positioning & Layout (Flexbox, Grid){" "}
                                      </li>
                                      <li>
                                        Responsive Design (Media Queries){" "}
                                      </li>
                                      <li>CSS Animations & Transitions </li>
                                    </ul>
                                    <br />✅ Bootstrap / Tailwind CSS (Optional
                                    Framework)
                                    <ul>
                                      <li>Grid System </li>
                                      <li>
                                        Ready-made UI Components (Navbar, Cards,
                                        Modals){" "}
                                      </li>
                                      <li>Responsive Utilities </li>
                                    </ul>
                                    <br />✅ JavaScript (Interactivity)
                                    <ul>
                                      <li>Introduction to JavaScript </li>
                                      <li>Variables, Data Types, Operators</li>
                                      <li>Functions, Arrays, Objects </li>
                                      <li>
                                        DOM Manipulation (getElementById,
                                        querySelector){" "}
                                      </li>
                                      <li>Events (onclick, onsubmit)</li>
                                      <li>
                                        ES6 Features (let/const, Arrow
                                        Functions, Template Literals){" "}
                                      </li>
                                    </ul>
                    </div>
                  </div>
                </div>

                {/* Module 3 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">3</span>
                     Backend Development (Introduction)
                  </h4>
                  <div className="module-card">
                    <div>
                    ✅ Introduction to Backend
                                    <ul>
                                      <li>What is a Server? </li>
                                      <li>Basics of REST APIs </li>
                                    </ul>
                                    <br />✅ Node.js & Express.js (Optional)
                                    <ul>
                                      <li>Setting up Node.js Environment </li>
                                      <li>
                                        Creating a simple server with Express{" "}
                                      </li>
                                      <li>Routing in Express </li>
                                      <li>Handling Forms and Data </li>
                                    </ul>
                                    <br />✅ Database (MySQL / MongoDB)
                                    <ul>
                                      <li> Introduction to Databases </li>
                                      <li>Connecting Backend with Database </li>
                                      <li>Performing CRUD Operations </li>
                                    </ul>
                    </div>
                  </div>
                </div>

                {/* Module 4 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">4</span>
                    Version Control (Git & GitHub)
                  </h4>
                  <div className="module-card">
                    <div>
                    <ul>
                                    <li> ✅ Git Basics (init, add, commit, push,
                                      pull) <br />
                                      ✅ Creating a GitHub Account & Hosting
                                      Code <br />✅ Collaborating with Teams
                                      (Branches & Pull Requests)</li> 
                                    </ul>
                    </div>
                  </div>
                </div>

                {/* Module 5 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">5</span>
                    Deployment & Hosting
                  </h4>
                  <div className="module-card">
                    <div>
                    <ul>
                                    <li> ✅ Hosting Static Sites (Netlify, Vercel,
                                      GitHub Pages) <br />
                                      ✅ Hosting Dynamic Sites (Heroku or
                                      Render) <br /></li> 
                                    </ul>
                    </div>
                  </div>
                </div>

                {/* Module 6 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">6</span>
                     Hands-On Projects
                  </h4>
                  <div className="module-card">
                    <div>
                     <ul>
                                      <li>Personal Portfolio Website </li>
                                      <li>Responsive Landing Page </li>
                                      <li>
                                        To-Do List App (with Local Storage){" "}
                                      </li>
                                    </ul>
                                    <br />✅ Full Stack Project (Optional)
                                    <ul>
                                      <li>
                                        Simple Blog App or E-commerce Website{" "}
                                      </li>
                                      <li>
                                        User Authentication (Login &
                                        Registration){" "}
                                      </li>
                                      <li>API Integration </li>
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

export default TrainingWebDesign;
