import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "../../../assets/css/course.css";
import { Link } from "react-router-dom";

const TrainingBootstrap = () => {
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
                  📚 HTML, CSS & Bootstrap Training Program
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
                  HTML, CSS & Bootstrap Training Program
                  </h4>
                  <div className="module-card">
                    <div>
                      ✅ Introduction to HTML
                                    <ul>
                                      <li>What is HTML? </li>
                                      <li>
                                        HTML structure (DOCTYPE, html, head,
                                        body){" "}
                                      </li>
                                      <li>
                                        Setting up a development environment
                                        (VSCode, Live Server){" "}
                                      </li>
                                      <li>Writing your first HTML page</li>
                                    </ul>
                                    <br />✅ HTML Basics
                                    <ul>
                                      <li>What is HTML? </li>
                                      <li>
                                        HTML structure (DOCTYPE, html, head,
                                        body){" "}
                                      </li>
                                      <li>
                                        Setting up a development environment
                                        (VSCode, Live Server){" "}
                                      </li>
                                      <li>Writing your first HTML page</li>
                                    </ul>
                                    <br />✅ HTML5 Features
                                    <ul>
                                      <li>Audio and Video tags </li>
                                      <li>
                                        Semantic Elements (&lt;header&gt;,
                                        &lt;footer&gt;, &lt;article&gt;,
                                        &lt;section&gt;)
                                      </li>
                                      <li>
                                        Input types and attributes in HTML5
                                      </li>
                                    </ul>
                    </div>
                  </div>
                </div>

                {/* Module 2 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">2</span>
                   CSS (Cascading Style Sheets)
                  </h4>
                  <div className="module-card">
                    <div>
                        ✅ Introduction to CSS
                                    <ul>
                                      <li>What is CSS? </li>
                                      <li>
                                        Inline, Internal, and External CSS{" "}
                                      </li>
                                      <li>
                                        CSS Syntax (Selectors, Properties,
                                        Values)
                                      </li>
                                    </ul>
                                    <br />✅ Selectors & Properties
                                    <ul>
                                      <li>Element, ID, Class Selectors </li>
                                      <li>
                                        Pseudo-classes and Pseudo-elements
                                        (:hover, :nth-child){" "}
                                      </li>
                                      <li>Colors, Backgrounds, Borders</li>
                                      <li>Fonts, Text Styling </li>
                                    </ul>
                                    <br />✅ Box Model
                                    <ul>
                                      <li>Margin, Border, Padding, Content </li>
                                      <li>
                                        Understanding width, height, and
                                        overflow{" "}
                                      </li>
                                    </ul>
                                    <br />✅ Positioning & Layout
                                    <ul>
                                      <li>
                                        Static, Relative, Absolute, Fixed,
                                        Sticky{" "}
                                      </li>
                                      <li>
                                        Display Property (block, inline,
                                        inline-block, none){" "}
                                      </li>
                                      <li>Flexbox (Basics)</li>
                                      <li>CSS Grid (Basics) </li>
                                    </ul>
                                    <br />✅ Transitions & Animations
                                    <ul>
                                      <li>CSS Transitions </li>
                                      <li>Keyframe Animations </li>
                                    </ul>
                                    <br />✅ Responsive Design Basics
                                    <ul>
                                      <li>Media Queries </li>
                                      <li>Units: px, %, em, rem, vh, vw </li>
                                    </ul>
                    </div>
                  </div>
                </div>

                {/* Module 3 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">3</span>
                    Control Flow
                  </h4>
                  <div className="module-card">
                    <div>
                     <ul>
                            <li>If-Else Statements </li>
                            <li>Loops (for, while) </li>
                            <li>Break, Continue, Pass </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 4 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">4</span>
                    Bootstrap (Responsive Framework)
                  </h4>
                  <div className="module-card">
                    <div>
                      ✅ Introduction to Bootstrap
                                    <ul>
                                      <li>
                                        What is Bootstrap and Why use it?{" "}
                                      </li>
                                      <li>
                                        Setting up Bootstrap (CDN & Local){" "}
                                      </li>
                                    </ul>
                                    <br />✅ Bootstrap Grid System
                                    <ul>
                                      <li>Rows and Columns </li>
                                      <li>Container Classes </li>
                                      <li>Responsive Design with Grid</li>
                                    </ul>
                                    <br />✅ Bootstrap Components
                                    <ul>
                                      <li> Buttons, Alerts, Badges </li>
                                      <li>Navbar, Breadcrumbs, Pagination </li>
                                      <li>
                                        Cards, Modals, Accordion, Carousel
                                      </li>
                                    </ul>
                                    <br />✅ Bootstrap Forms
                                    <ul>
                                      <li>Form Layouts & Controls </li>
                                      <li>Validation Classes </li>
                                    </ul>
                                    <br />✅ Utilities and Helpers
                                    <ul>
                                      <li>Spacing (margins & paddings) </li>
                                      <li>Text Alignment and Colors </li>
                                      <li>Display Utilities</li>
                                    </ul>
                                    <br />✅ Bootstrap 5 New Features
                                    <ul>
                                      <li>Updated Grid System </li>
                                      <li>Customizable utilities </li>
                                    </ul>
                                    <br />
                    </div>
                  </div>
                </div>

                {/* Module 5 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">5</span>
                     Mini Projects (Hands-On Practice)
                  </h4>
                  <div className="module-card">
                    <div>
                   <ul>
                                      <li>
                                        Build a Personal Portfolio Website (HTML
                                        & CSS)
                                      </li>
                                      <li>
                                        Create a Responsive Landing Page using
                                        Bootstrap{" "}
                                      </li>
                                      <li>Design a Simple Blog Layout</li>
                                      <li>Build a Login & Registration Form</li>
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

export default TrainingBootstrap;
