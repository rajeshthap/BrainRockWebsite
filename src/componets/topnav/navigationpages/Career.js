import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Spinner,
  Alert,
  Modal,
  Button,
  Form,
} from "react-bootstrap";
import "../../../assets/css/career.css";
import FooterPage from "../../footer/FooterPage";
import { Link } from "react-router-dom";

function Career() {
  const [jobs, setJobs] = useState([]);
  const [jobLoading, setJobLoading] = useState(true);
  const [jobError, setJobError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resume, setResume] = useState(null);

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [resumeError, setResumeError] = useState(null);

  // Fetch Jobs
  useEffect(() => {
    fetch(
      "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/job-opening/"
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load job openings");
        return res.json();
      })
      .then((data) => setJobs(data))
      .catch((err) => setJobError(err.message))
      .finally(() => setJobLoading(false));
  }, []);

  // Open Modal
  const handleApplyClick = (jobId) => {
    setSelectedJobId(jobId);
    setShowModal(true);
  };

  // PDF Validation
  const handleResumeChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setResume(null);
      setResumeError(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setResume(null);
      setResumeError("Only PDF files are allowed.");
      return;
    }

    setResume(file);
    setResumeError(null);
  };

  // Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (resumeError) return;

    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    const formData = new FormData();
    formData.append("job_id", selectedJobId);
    formData.append("full_name", fullName);
    formData.append("email", email);
    formData.append("phone", phone);
    if (resume) formData.append("resume", resume);

    fetch(
      "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/job-application/",
      {
        method: "POST",
        body: formData,
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.error || data.message === "error") {
          setFormError("Submission failed. Please check details.");
        } else {
          setFormSuccess("Application submitted successfully!");
          setFullName("");
          setEmail("");
          setPhone("");
          setResume(null);
          setResumeError(null);
        }
      })
      .catch(() => setFormError("Something went wrong!"))
      .finally(() => setFormLoading(false));
  };

  return (
    <>
      <div className="career-banner">
        <div className="site-breadcrumb-wpr">
          <h2 className="breadcrumb-title">New Job Openings</h2>
          <ul className="breadcrumb-menu clearfix">
            <li>
              <Link className="breadcrumb-home" to="/">
                Home
              </Link>
            </li>
            <li className="px-2">/</li>
            <li>
              <Link className="breadcrumb-about" to="/">
                Openings
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="ourteam-section mt-4">
        <Container>
          <div className="ourteam-box">
            {jobLoading && (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            )}

            {jobError && (
              <Alert variant="danger" className="text-center">
                {jobError}
              </Alert>
            )}

            <Row>
              {jobs.map((job) => (
                <Col lg={4} md={6} sm={12} key={job.id} className="mb-4">
                  <Card className="br-career-card shadow-sm">
                    <Card.Body className="br-career-body">
                      <div className="br-career-title">
                        {job.title}
                      </div>

                      <p className="br-career-info">
                        {job.department}-{job.location}
                      </p>

                      <p>
                        <strong>Employment:</strong> {job.employment_type}
                      </p>
                      <p>
                        <strong>Salary:</strong> {job.salary_range}
                      </p>
                      <p>
                        <strong>Experience:</strong> {job.experience_level}
                      </p>
                      <p>
                        <strong>Education:</strong> {job.education}
                      </p>

                      <p className="mt-2">
                        <strong>Skills:</strong>
                        <br />
                        {job.skills.join(", ")}
                      </p>

                      <p>
                        <strong>Deadline:</strong> {job.application_deadline}
                      </p>

                      <div className="job-opening-btn">
                        <Button
                          className="btn btn-primary job-view-btn"
                          onClick={() => handleApplyClick(job.job_id)}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </Container>

        <Container fluid className="br-footer-box mt-3">
          <FooterPage />
        </Container>
      </div>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="br-career-modal">
          <Modal.Title className="br-job-apply">Apply for Job</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {formError && <Alert variant="danger">{formError}</Alert>}
          {formSuccess && <Alert variant="success">{formSuccess}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="br-label"
                placeholder="Enter full name"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="br-label"
                placeholder="enter email ID"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="br-label"
                placeholder="enter phone number"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>
                Resume <span className="resume-pdf">(PDF Only)</span>
              </Form.Label>
              <Form.Control
                type="file"
                accept="application/pdf"
                onChange={handleResumeChange}
                className="br-label"
              />
              {resumeError && (
                <small className="text-danger">{resumeError}</small>
              )}
            </Form.Group>
            <div className="text-center">
              <Button
                type="submit"
                className="btn btn-primary job-view-btn"
                disabled={formLoading || resumeError}
              >
                {formLoading ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Career;
