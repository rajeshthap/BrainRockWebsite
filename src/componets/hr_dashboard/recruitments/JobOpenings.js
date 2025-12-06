import React, { useEffect, useState } from "react";
import { Container, Row, Button, Modal, Form, Alert, Badge, Pagination } from "react-bootstrap";
import "../../../assets/css/Profile.css";
import SideNav from "../SideNav";
import HrHeader from "../HrHeader";

const JobOpenings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Form state for posting/editing job
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    employment_type: "",
    salary_range: "",
    experience_level: "",
    education: "",
    description: "",
    responsibilities: [""],
    requirements: [""],
    skills: [""],
    application_deadline: "",
  });
  const [editingJobId, setEditingJobId] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all job openings
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/job-opening/",
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch jobs");
      const data = await response.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setMessage("Failed to load job openings");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle array field changes (responsibilities, requirements, skills)
  const handleArrayChange = (field, index, value) => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray,
      };
    });
  };

  // Add new item to array field
  const addArrayItem = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
  };

  // Remove item from array field
  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Open modal for new job
  const handlePostJob = () => {
    setEditingJobId(null);
    setFormData({
      title: "",
      department: "",
      location: "",
      employment_type: "",
      salary_range: "",
      experience_level: "",
      education: "",
      description: "",
      responsibilities: [""],
      requirements: [""],
      skills: [""],
      application_deadline: "",
    });
    setShowModal(true);
  };

  // Open modal for editing job
  const handleEditJob = (job) => {
    setEditingJobId(job.id);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      employment_type: job.employment_type,
      salary_range: job.salary_range,
      experience_level: job.experience_level,
      education: job.education,
      description: job.description,
      responsibilities: job.responsibilities || [""],
      requirements: job.requirements || [""],
      skills: job.skills || [""],
      application_deadline: job.application_deadline,
    });
    setShowModal(true);
  };

  // Submit job form (POST or PUT)
const handleSubmitJob = async (e) => {
  e.preventDefault();

  // Filter out empty strings from array fields
  const cleanData = {
    ...formData,
    responsibilities: formData.responsibilities.filter((r) => r.trim()),
    requirements: formData.requirements.filter((r) => r.trim()),
    skills: formData.skills.filter((s) => s.trim()),
  };

  try {
    // Always use the base endpoint for both POST and PUT
    const url = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/job-opening/";
    const method = editingJobId ? "PUT" : "POST";

    // Create FormData to send job_id in payload
    const dataToSend = new FormData();
    
    // Add job_id to payload if editing
    if (editingJobId) {
      const currentJob = jobs.find(job => job.id === editingJobId);
      dataToSend.append('job_id', currentJob.job_id);
    }
    
    // Add all other fields
    Object.keys(cleanData).forEach(key => {
      if (Array.isArray(cleanData[key])) {
        dataToSend.append(key, JSON.stringify(cleanData[key]));
      } else {
        dataToSend.append(key, cleanData[key]);
      }
    });

    const response = await fetch(url, {
      method,
      credentials: "include",
      body: dataToSend, // Send as FormData instead of JSON
    });

    if (!response.ok) throw new Error("Failed to save job");

    setMessage(
      editingJobId ? "Job updated successfully!" : "Job posted successfully!"
    );
    setVariant("success");
    setShowAlert(true);
    setShowModal(false);
    fetchJobs();

    setTimeout(() => setShowAlert(false), 3000);
  } catch (error) {
    console.error("Error saving job:", error);
    setMessage("Failed to save job");
    setVariant("danger");
    setShowAlert(true);
  }
};

  // Delete job
const handleDeleteJob = async (jobId) => {
  if (!window.confirm("Are you sure you want to delete this job?")) return;

  try {
    // Find the job to get its job_id
    const jobToDelete = jobs.find(job => job.id === jobId);
    
    // Create FormData to send job_id in payload
    const dataToSend = new FormData();
    dataToSend.append('job_id', jobToDelete.job_id);

    // Use the base endpoint without ID in the path
    const response = await fetch(
      "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/job-opening/",
      {
        method: "DELETE",
        credentials: "include",
        body: dataToSend, // Send job_id in the payload
      }
    );

    if (!response.ok) throw new Error("Failed to delete job");

    setMessage("Job deleted successfully!");
    setVariant("success");
    setShowAlert(true);
    fetchJobs();

    setTimeout(() => setShowAlert(false), 3000);
  } catch (error) {
    console.error("Error deleting job:", error);
    setMessage("Failed to delete job");
    setVariant("danger");
    setShowAlert(true);
  }
};

  // Change job status
const handleStatusChange = async (jobId, newStatus) => {
  try {
    // Find the job to get its job_id
    const job = jobs.find((j) => j.id === jobId);
    
    // Create FormData to send job_id in payload
    const dataToSend = new FormData();
    dataToSend.append('job_id', job.job_id);
    dataToSend.append('status', newStatus);

    // Use the base endpoint without ID in the path
    const response = await fetch(
      "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/job-opening/",
      {
        method: "PUT",
        credentials: "include",
        body: dataToSend, // Send job_id in the payload
      }
    );

    if (!response.ok) throw new Error("Failed to update status");

    setMessage("Status updated successfully!");
    setVariant("success");
    setShowAlert(true);
    fetchJobs();

    setTimeout(() => setShowAlert(false), 3000);
  } catch (error) {
    console.error("Error updating status:", error);
    setMessage("Failed to update status");
    setVariant("danger");
    setShowAlert(true);
  }
};

  const getStatusBadge = (status) => {
    const variants = {
      active: "success",
      closed: "danger",
      draft: "warning",
    };
    return variants[status] || "secondary";
  };

  // Filter and paginate jobs
  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Job Openings</h2>
              <Button variant="primary" onClick={handlePostJob}>
                + Post New Job
              </Button>
            </div>

            {showAlert && (
              <Alert
                variant={variant}
                dismissible
                onClose={() => setShowAlert(false)}
                className="mb-3"
              >
                {message}
              </Alert>
            )}

            {loading ? (
              <p>Loading jobs...</p>
            ) : (
              <>
                <div className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Search by title, department, or location..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {filteredJobs.length === 0 ? (
                  <p className="text-muted">No job openings found.</p>
                ) : (
                  <>
                    <Row className="mt-3">
                      <div className="col-md-12">
                        <table className="temp-rwd-table">
                          <tbody>
                            <tr>
                              <th>S.No</th>
                              <th>Job Title</th>
                              <th>Department</th>
                              <th>Location</th>
                              <th>Experience</th>
                              <th>Status</th>
                              <th>Deadline</th>
                              <th>Actions</th>
                            </tr>

                            {paginatedJobs.map((job, index) => (
                              <tr key={job.id}>
                                <td data-th="S.No">
                                  {(currentPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td data-th="Job Title">{job.title}</td>
                                <td data-th="Department">{job.department}</td>
                                <td data-th="Location">{job.location}</td>
                                <td data-th="Experience">
                                  {job.experience_level}
                                </td>
                                <td data-th="Status">
                                  <Badge bg={getStatusBadge(job.status)}>
                                    {job.status}
                                  </Badge>
                                </td>
                                <td data-th="Deadline">
                                  {new Date(
                                    job.application_deadline
                                  ).toLocaleDateString()}
                                </td>
                                <td data-th="Actions">
                                  <Button
                                    variant="info"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleEditJob(job)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleDeleteJob(job.id)}
                                  >
                                    Delete
                                  </Button>
                                  <select
                                    className="form-select form-select-sm d-inline"
                                    style={{ width: "120px" }}
                                    value={job.status}
                                    onChange={(e) =>
                                      handleStatusChange(job.id, e.target.value)
                                    }
                                  >
                                    <option value="active">Active</option>
                                    <option value="draft">Draft</option>
                                    <option value="closed">Closed</option>
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Row>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center align-items-center mt-4">
                        <Pagination>
                          <Pagination.Prev
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                          />

                          {[...Array(totalPages)].map((_, index) => (
                            <Pagination.Item
                              key={index + 1}
                              active={index + 1 === currentPage}
                              onClick={() => setCurrentPage(index + 1)}
                            >
                              {index + 1}
                            </Pagination.Item>
                          ))}

                          <Pagination.Next
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                              )
                            }
                            disabled={currentPage === totalPages}
                          />
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </Container>
      </div>

      {/* Post/Edit Job Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingJobId ? "Edit Job Opening" : "Post New Job"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitJob}>
            <Form.Group className="mb-3">
              <Form.Label>Job Title *</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Department *</Form.Label>
              <Form.Control
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Location *</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Employment Type *</Form.Label>
              <Form.Control
                type="text"
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Salary Range *</Form.Label>
              <Form.Control
                type="text"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Experience Level *</Form.Label>
              <Form.Control
                type="text"
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Education *</Form.Label>
              <Form.Control
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Responsibilities</Form.Label>
              {formData.responsibilities.map((resp, index) => (
                <div key={index} className="mb-2 d-flex gap-2">
                  <Form.Control
                    type="text"
                    value={resp}
                    onChange={(e) =>
                      handleArrayChange("responsibilities", index, e.target.value)
                    }
                    placeholder={`Responsibility ${index + 1}`}
                  />
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeArrayItem("responsibilities", index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => addArrayItem("responsibilities")}
              >
                Add Responsibility
              </Button>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Requirements</Form.Label>
              {formData.requirements.map((req, index) => (
                <div key={index} className="mb-2 d-flex gap-2">
                  <Form.Control
                    type="text"
                    value={req}
                    onChange={(e) =>
                      handleArrayChange("requirements", index, e.target.value)
                    }
                    placeholder={`Requirement ${index + 1}`}
                  />
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeArrayItem("requirements", index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => addArrayItem("requirements")}
              >
                Add Requirement
              </Button>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Skills</Form.Label>
              {formData.skills.map((skill, index) => (
                <div key={index} className="mb-2 d-flex gap-2">
                  <Form.Control
                    type="text"
                    value={skill}
                    onChange={(e) =>
                      handleArrayChange("skills", index, e.target.value)
                    }
                    placeholder={`Skill ${index + 1}`}
                  />
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeArrayItem("skills", index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => addArrayItem("skills")}
              >
                Add Skill
              </Button>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Application Deadline *</Form.Label>
              <Form.Control
                type="date"
                name="application_deadline"
                value={formData.application_deadline}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="me-2">
              {editingJobId ? "Update Job" : "Post Job"}
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default JobOpenings;