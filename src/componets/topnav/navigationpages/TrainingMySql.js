import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "../../../assets/css/course.css";
import { Link } from "react-router-dom";

const TrainingMySql = () => {
  return (
    <div className="ourteam-section">
      <Container className="ourteam-box">
        <div className="my-3 main-mt-0">
          {/* Top Registration Button */}
          <div className="m-3 mobile-register">
            <Link
              to="/TrainingRegistration"
              state={{
                training_name: "MySQL Training",
                training_description:
                  "Gain practical experience in database design, querying, indexing, and optimization with MySQL. Learn to build and manage relational databases effectively using real-world examples.",
              }}
              className="text-decoration-none"
            >
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="section-heading m-0">
                  📚 MySQL Training Program Outline
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
                   Introduction to Databases & MySQL
                  </h4>
                  <div className="module-card">
                    <div>
                          <ul>
                            <li>What is a Database? </li>
                            <li>Why use MySQL? </li>
                            <li>Features of MySQL </li>
                            <li>
                              Installing MySQL and Workbench (or phpMyAdmin){" "}
                            </li>
                            <li>
                              Basic Database Terminology (Tables, Rows, Columns,
                              Primary Keys){" "}
                            </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 2 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">2</span>
                   MySQL Basics
                  </h4>
                  <div className="module-card">
                    <div>
                        <ul>
                            <li>Connecting to MySQL Server </li>
                            <li>Creating and Selecting Databases </li>
                            <li>Creating Tables </li>
                            <li>
                              Data Types in MySQL (INT, VARCHAR, DATE, TEXT,
                              etc.){" "}
                            </li>
                            <li>
                              Inserting, Updating, Deleting Records (CRUD
                              Basics){" "}
                            </li>
                            <li>Retrieving Data with SELECT </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 3 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">3</span>
                   Filtering and Sorting Data
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>Using WHERE Clause </li>
                            <li>
                              Comparison Operators (=, &lt;, &gt;, BETWEEN,
                              LIKE, IN)
                            </li>
                            <li>Logical Operators (AND, OR, NOT) </li>
                            <li>Sorting Results (ORDER BY) </li>
                            <li>Limiting Results (LIMIT) </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 4 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">4</span>
                    Functions and Expressions
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>
                              String Functions (CONCAT, UPPER, LOWER, TRIM,
                              SUBSTRING){" "}
                            </li>
                            <li>Numeric Functions (ROUND, CEIL, FLOOR, MOD)</li>
                            <li>
                              Date and Time Functions (NOW, CURDATE,
                              DATE_FORMAT){" "}
                            </li>
                            <li>
                              Aggregate Functions (COUNT, SUM, AVG, MIN, MAX){" "}
                            </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 5 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">5</span>
                     Joins in MySQL
                  </h4>
                  <div className="module-card">
                    <div>
                     <ul>
                            <li>
                              Understanding Relationships (One-to-One,
                              One-to-Many, Many-to-Many){" "}
                            </li>
                            <li>INNER JOIN </li>
                            <li>LEFT JOIN </li>
                            <li>RIGHT JOIN </li>
                            <li>CROSS JOIN </li>
                            <li>Self Joins </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 6 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">6</span>
                   Grouping Data
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>Using GROUP BY </li>
                            <li>Filtering Groups with HAVING </li>
                            <li>Combining GROUP BY and Aggregate Functions </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 7 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">7</span>
                   Subqueries & Advanced Queries
                  </h4>
                  <div className="module-card">
                    <div>
                        <ul>
                            <li>Subqueries in SELECT, FROM, WHERE </li>
                            <li>EXISTS and NOT EXISTS</li>
                            <li>Correlated Subqueries </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 8 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">8</span>
                    Data Integrity & Constraints
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>Primary Keys & Foreign Keys </li>
                            <li>NOT NULL, UNIQUE, AUTO_INCREMENT </li>
                            <li>DEFAULT Values </li>
                            <li>ON DELETE / ON UPDATE Actions </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 9 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">9</span>
                   Database Design & Normalization
                  </h4>
                  <div className="module-card">
                    <div>
                       <ul>
                            <li>Introduction to Database Design </li>
                            <li>
                              First, Second, Third Normal Forms (1NF, 2NF, 3NF){" "}
                            </li>
                            <li>ER Diagrams (Entity Relationship Diagrams) </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 10 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">10</span>
                    User Management & Security
                  </h4>
                  <div className="module-card">
                    <div>
                       <ul>
                            <li>Creating Users and Granting Privileges </li>
                            <li>Managing Roles and Permissions</li>
                            <li>Backing up and Restoring Databases </li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 11 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">11</span>
                    Advanced Topics
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>Transactions (BEGIN, COMMIT, ROLLBACK)</li>
                            <li>Indexing for Optimization </li>
                            <li>Views (Creating and Managing Views)</li>
                            <li>Stored Procedures and Functions (Basics) </li>
                            <li>Triggers</li>
                          </ul>
                    </div>
                  </div>
                </div>

                {/* Module 12 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">12</span>
                   Hands-On Projects
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                            <li>Build a Library Management Database </li>
                            <li>
                              Create an E-commerce Database (Products, Orders,
                              Customers){" "}
                            </li>
                            <li>
                              Design a Student Result Management Database{" "}
                            </li>
                          </ul>
                    </div>
                  </div>
                </div>

                
              </Col>
              <div className="text-center">
                <Link
                  to="/TrainingRegistration"
                  state={{
                    training_name: "My SQL Training",
                    training_description:
                      "Gain practical experience in database design, querying, indexing, and optimization with MySQL. Learn to build and manage relational databases effectively using real-world examples.",
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

export default TrainingMySql;
