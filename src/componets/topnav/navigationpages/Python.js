import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "../../../assets/css/course.css";
import { Link } from "react-router-dom";

const Python = () => {
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
                  📚 Python Training Program
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
                   Introduction to Python
                  </h4>
                  <div className="module-card">
                    <div>
                       <ul>
                            <li>What is Python? </li>
                            <li>Why Python? (Features & Use Cases) </li>
                            <li>
                              Installing Python & Setting up IDE
                              (PyCharm/VSCode){" "}
                            </li>
                            <li>
                              Writing your first Python program (Hello World!){" "}
                            </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 2 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">2</span>
                   Python Basics
                  </h4>
                  <div className="module-card">
                    <div>
                        <ul>
                            <li>
                              Variables & Data Types (int, float, string, bool){" "}
                            </li>
                            <li>
                              Operators (Arithmetic, Logical, Relational){" "}
                            </li>
                            <li>Input & Output </li>
                            <li>Comments & Code Readability </li>
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
                    Functions in Python
                  </h4>
                  <div className="module-card">
                    <div>
                     <ul>
                            <li>Defining & Calling Functions </li>
                            <li>
                              Arguments (Positional, Keyword, Default, *args,
                              **kwargs){" "}
                            </li>
                            <li>Lambda Functions </li>
                            <li>Recursion </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 5 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">5</span>
                    Data Structures
                  </h4>
                  <div className="module-card">
                    <div>
                     <ul>
                            <li>Lists, Tuples, Sets, Dictionaries </li>
                            <li>List Comprehensions </li>
                            <li>Working with Strings </li>
                            <li>Common Methods & Operations </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 6 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">6</span>
                    Object-Oriented Programming (OOP)
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>Classes & Objects </li>
                            <li>Constructors (__init__) </li>
                            <li>Inheritance, Polymorphism </li>
                            <li>Encapsulation </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 7 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">7</span>
                   Modules and Packages
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>Importing Modules </li>
                            <li>
                              Standard Library Overview (math, random, datetime,
                              os, sys){" "}
                            </li>
                            <li>Creating Custom Modules </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 8 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">8</span>
                    File Handling
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>Reading & Writing Files (Text & CSV) </li>
                            <li>Working with JSON files </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 9 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">9</span>
                   Exception Handling
                  </h4>
                  <div className="module-card">
                    <div>
                     <ul>
                            <li>Try, Except, Finally </li>
                            <li>Custom Exceptions </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 10 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">10</span>
                    Working with Libraries
                  </h4>
                  <div className="module-card">
                    <div>
                       <ul>
                            <li>NumPy (Basics of arrays) </li>
                            <li>
                              Pandas (DataFrames and basic data analysis){" "}
                            </li>
                            <li>Matplotlib (Simple plotting) </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 11 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">11</span>
                    Python for Web & Automation (Optional Advanced Topics)
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>
                              Introduction to Flask/Django (Web Frameworks){" "}
                            </li>
                            <li>Web Scraping with BeautifulSoup/Requests </li>
                            <li>
                              Automating tasks with Python (e.g., Excel
                              automation){" "}
                            </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 12 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">12</span>
                    Project Work (Hands-on)
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>
                              Mini Projects:{" "}
                             
                                <li>Calculator App </li>
                                <li>To-Do List (CLI based) </li>
                                <li>Data Analysis on CSV </li>
                                <li>Web Scraper (e.g., fetch job postings) </li>
                             
                            </li>
                          </ul>
                    </div>
                  </div>
                </div>

                   <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">12</span>
                     Deployment & Next Steps
                  </h4>
                  <div className="module-card">
                    <div>
                        <ul>
                            <li>Running Python scripts </li>
                            <li>Introduction to Virtual Environments </li>
                            <li>Publishing on GitHub </li>
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

export default Python;
