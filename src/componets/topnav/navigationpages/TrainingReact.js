import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "../../../assets/css/course.css";
import { Link } from "react-router-dom";
import TrainingRegistration from "./TrainingRegistration";

const TrainingReact = () => {
  return (
    <div className="ourteam-section">
      <Container className="ourteam-box">
        <div className="my-3 main-mt-0">
          {/* Top Registration Button */}
          <div className="m-3 mobile-register">
            <Link
              to="/TrainingRegistration"
              state={{
                training_name: "React Training",
                training_description:
                  "Learn to build fast and scalable web applications using React. Gain hands-on experience with components, hooks, state management, API integration, and modern frontend workflows.",
              }}
              className="text-decoration-none"
            >
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="section-heading m-0">
                  📚 React Training Program
                </h3>

             
              </div>
            </Link>
          </div>

          <div className="training-wrapper p-2">
            <Row>
              {/* Left Column (Course Content) */}
              <Col md={6} sm={6} className="mb-4">
                {/* Module 1 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">1</span>
                    Introduction to React
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                        <li>What is React? </li>
                        <li>Why React? (Benefits & Use Cases) </li>
                        <li>
                          Setting up React environment (Node.js, npm,
                          create-react-app){" "}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Module 2 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">2</span>
                    React Fundamentals
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                        <li>Components: Functional vs Class Components </li>
                        <li>JSX (JavaScript XML) </li>
                        <li>Props and State </li>
                        <li>Handling Events </li>
                        <li>Conditional Rendering </li>
                        <li>Lists and Keys </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Module 3 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">3</span>
                    React Hooks (Modern React)
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                        <li>Introduction to Hooks </li>
                        <li>useState, useEffect </li>
                        <li>useRef, useContext, useReducer </li>
                        <li>Custom Hooks </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Module 4 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">4</span>
                    Routing in React
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                        <li>React Router basics </li>
                        <li>Dynamic Routing </li>
                        <li>Navigation & Redirects </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Module 5 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">5</span>
                    Styling in React
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                        <li>CSS Modules </li>
                        <li>Styled Components </li>
                        <li>Tailwind CSS with React </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Module 6 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">6</span>
                    Forms and Validation
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                        <li>Controlled vs Uncontrolled Components </li>
                        <li>Form handling </li>
                        <li>Validation with libraries (Formik/Yup) </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Module 7 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">7</span>
                    State Management
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                        <li>Context API </li>
                        <li>Redux Basics </li>
                        <li>Redux Toolkit (Modern Redux) </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Module 8 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">8</span>
                    API Integration
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                        <li>Fetching data with Fetch/Axios </li>
                        <li>Async/Await and Promises </li>
                        <li>Handling loading & error states </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Module 9 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">9</span>
                    Advanced React Concepts
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                        <li>Lazy Loading & Code Splitting </li>
                        <li>React.memo & useMemo for optimization </li>
                        <li>Error Boundaries </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Module 10 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">10</span>
                    Project Work (Hands-on)
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                        <li>Build a To-Do App / Blog App </li>
                        <li>
                          Integrate APIs (e.g., JSONPlaceholder or custom API){" "}
                        </li>
                        <li>Deploy to Netlify/Vercel </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Module 11 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">11</span>
                    Deployment
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                        <li>Preparing production builds </li>
                        <li>Hosting React apps </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Module 12 */}
                <div className="module-container">
                  <h4 className="module-heading">
                    <span className="module-number">12</span>
                    Best Practices & Next Steps
                  </h4>
                  <div className="module-card">
                    <div>
                      <ul>
                        <li>Folder structure </li>
                        <li>Reusable components </li>
                        <li>Introduction to Next.js (Optional) </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={6} sm={6} ><TrainingRegistration /></Col>
              <div className="text-center">
               
              </div>
            </Row>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TrainingReact;
