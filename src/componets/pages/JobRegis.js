import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

function JobRegis({ show, onHide }) {
  const [jobForm, setJobForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    experience: "",
    resume_file: null,
  });
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState("");
  const [jobSuccess, setJobSuccess] = useState(false);

  const handleJobChange = (e) => {
    const { name, value } = e.target;
    if (name === "resume_file") {
      setJobForm((prev) => ({ ...prev, resume_file: e.target.files[0] }));
    } else {
      setJobForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    setJobError("");
    setJobSuccess(false);

    if (!jobForm.full_name.trim()) {
      setJobError("Name is required");
      return;
    }
    if (!jobForm.email.trim()) {
      setJobError("Email is required");
      return;
    }
    if (!jobForm.phone.trim()) {
      setJobError("Phone number is required");
      return;
    }
    if (!jobForm.experience.trim()) {
      setJobError("Experience is required");
      return;
    }

    setJobLoading(true);
    try {
      const formData = new FormData();
      formData.append("full_name", jobForm.full_name);
      formData.append("email", jobForm.email);
      formData.append("phone", jobForm.phone);
      formData.append("experience", jobForm.experience);
      if (jobForm.resume_file) {
        formData.append("resume_file", jobForm.resume_file);
      }

      await axios.post(
        "https://brainrock.in/brainrock/backend/api/job-openings/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setJobSuccess(true);
      setJobForm({
        full_name: "",
        email: "",
        phone: "",
        experience: "",
        resume_file: null,
      });
      setTimeout(() => {
        onHide();
        setJobSuccess(false);
      }, 2000);
    } catch (err) {
      setJobError("Failed to submit. Please try again.");
    } finally {
      setJobLoading(false);
    }
  };

  // Array for experience dropdown (0 to 10 years)
  const experienceOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Job Application</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {jobSuccess ? (
          <Alert variant="success">
            Your job application has been submitted successfully!
          </Alert>
        ) : (
          <Form onSubmit={handleJobSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="full_name"
                value={jobForm.full_name}
                onChange={handleJobChange}
                placeholder="Enter your full name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={jobForm.email}
                onChange={handleJobChange}
                placeholder="Enter your email"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={jobForm.phone}
                onChange={handleJobChange}
                placeholder="Enter your phone number"
              />
            </Form.Group>
            
            {/* Experience Dropdown starts here */}
            <Form.Group className="mb-3">
              <Form.Label>Experience</Form.Label>
              <Form.Select
                name="experience"
                value={jobForm.experience}
                onChange={handleJobChange}
              >
                <option value="">Select your experience</option>
                {experienceOptions.map((year) => (
                  <option key={year} value={year}>
                    {year} {year === 1 ? "Year" : "Years"}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {/* Experience Dropdown ends here */}

            <Form.Group className="mb-3">
              <Form.Label>Resume</Form.Label>
              <Form.Control
                type="file"
                name="resume_file"
                onChange={handleJobChange}
              />
            </Form.Group>
            {jobError && <Alert variant="danger">{jobError}</Alert>}
            <Button
              variant="primary"
              type="submit"
              disabled={jobLoading}
              className="w-100"
            >
              {jobLoading ? "Submitting..." : "Submit Application"}
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default JobRegis;