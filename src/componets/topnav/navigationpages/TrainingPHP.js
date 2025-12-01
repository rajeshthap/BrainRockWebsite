import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "../../../assets/css/course.css";
import { Link } from "react-router-dom";

const TrainingPHP = () => {
  return (
    <div className="ourteam-section">
      <Container className="ourteam-box">
        <div className="my-3 main-mt-0">
          {/* Top Registration Button */}
          <div className="m-3 mobile-register">
            <Link
              to="/TrainingRegistration"
              state={{
                training_name: "PHP Training",
                training_description:
                  "Learn to build dynamic and interactive web applications using PHP. Gain hands-on experience with server-side scripting, form handling, database integration, and real-world project development.",
              }}
              className="text-decoration-none"
            >
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="section-heading m-0">
                  📚 PHP Training Program
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
                    Introduction to PHP
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>What is PHP? </li>
                            <li>Features of PHP </li>
                            <li>PHP vs Other Languages (Java, Python) </li>
                            <li>
                              Setting up PHP environment (XAMPP/WAMP/LAMP,
                              VSCode/Sublime){" "}
                            </li>
                            <li>Your first PHP program (Hello World!) </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 2 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">2</span>
                    PHP Basics
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>PHP Syntax & Tags </li>
                            <li>Variables and Constants </li>
                            <li>
                              Data Types in PHP (string, int, float, bool,
                              arrays, objects){" "}
                            </li>
                            <li>
                              Operators (Arithmetic, Assignment, Comparison,
                              Logical){" "}
                            </li>
                            <li>Comments in PHP </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 3 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">3</span>
                     Control Structures
                  </h4>
                  <div className="module-card">
                    <div>
                       <ul>
                            <li>If, If-Else, Nested If </li>
                            <li>Switch-Case </li>
                            <li>Loops (for, while, do-while, foreach) </li>
                            <li>Break & Continue Statements </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 4 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">4</span>
                   Functions in PHP
                  </h4>
                  <div className="module-card">
                    <div>
                     <ul>
                            <li>Defining and Calling Functions </li>
                            <li>
                              Arguments (Default, Optional, Return Values){" "}
                            </li>
                            <li>Variable Scope (Global & Local) </li>
                            <li>Include & Require Statements </li>
                            <li>
                              PHP Built-in Functions (String, Array, Math){" "}
                            </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 5 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">5</span>
                     Working with Forms
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>GET vs POST Methods </li>
                            <li>Retrieving Form Data </li>
                            <li>Validating User Input </li>
                            <li>Sanitizing Data (Security Basics) </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 6 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">6</span>
                     Arrays in PHP
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>
                              Indexed, Associative, and Multidimensional Arrays{" "}
                            </li>
                            <li>
                              Array Functions (sort, explode, implode, etc.){" "}
                            </li>
                            <li>Iterating Arrays (foreach, for loops) </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 7 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">7</span>
                  Strings and Regular Expressions
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>
                              String Functions (strlen, str_replace, substr,
                              etc.){" "}
                            </li>
                            <li>
                              Pattern Matching with Regex (preg_match,
                              preg_replace){" "}
                            </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 8 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">8</span>
                   Working with Files
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>
                              Reading & Writing Files (fopen, fread, fwrite,
                              fclose){" "}
                            </li>
                            <li>File Uploads </li>
                            <li>File Handling Best Practices </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 9 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">9</span>
                    Session Management
                  </h4>
                  <div className="module-card">
                    <div>
                     <ul>
                            <li>Cookies vs Sessions </li>
                            <li>Creating and Managing Sessions </li>
                            <li>Secure Session Handling </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 10 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">10</span>
                  PHP & MySQL Database
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>Introduction to MySQL </li>
                            <li>Connecting PHP with MySQL (mysqli and PDO) </li>
                            <li>
                              CRUD Operations (Create, Read, Update, Delete){" "}
                            </li>
                            <li>
                              Prepared Statements to prevent SQL Injection{" "}
                            </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 11 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">11</span>
                     Error Handling & Debugging
                  </h4>
                  <div className="module-card">
                    <div>
                     <ul>
                            <li>Types of Errors (Syntax, Runtime, Logic) </li>
                            <li>Try-Catch Exception Handling </li>
                            <li>Debugging Techniques </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 12 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">12</span>
                    Object-Oriented Programming (OOP) in PHP
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>Classes & Objects</li>
                            <li>Constructors and Destructors </li>
                            <li>Inheritance </li>
                            <li>Encapsulation & Polymorphism </li>
                          </ul>
                    </div>
                  </div>
                </div>

                  <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">12</span>
                   PHP Advanced Topics
                  </h4>
                  <div className="module-card">
                    <div>
                     <ul>
                            <li>PHP Email Handling (mail function) </li>
                            <li>
                              Introduction to REST APIs (Create and Consume
                              APIs){" "}
                            </li>
                            <li>Working with JSON Data </li>
                            <li>
                              Introduction to PHP Frameworks (Laravel basics
                              overview){" "}
                            </li>
                          </ul>
                    </div>
                  </div>
                </div>

                   <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">12</span>
                 Project Work (Hands-on)
                  </h4>
                  <div className="module-card">
                    <div>
                    <ul>
                           
                              <li>
                                Simple Blog Application (CRUD operations){" "}
                              </li>
                              <li>User Login & Registration System </li>
                           
                          </ul>
                    </div>
                  </div>
                </div>
              </Col>
              <div className="text-center">
                <Link
                  to="/TrainingRegistration"
                  state={{
                    training_name: "React Training",
                    training_description:
                      "Learn to build dynamic and interactive web applications using PHP. Gain hands-on experience with server-side scripting, form handling, database integration, and real-world project development.",
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

export default TrainingPHP;
