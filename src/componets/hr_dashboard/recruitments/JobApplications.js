import React, { useEffect, useState } from "react";
import { Container, Row, Button, Modal, Form, Alert, Badge, Pagination, Spinner } from "react-bootstrap";
import "../../../assets/css/Profile.css";
import SideNav from "../SideNav";
import HrHeader from "../HrHeader";

// Define base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const JobApplications = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Form state for viewing/editing application
  const [formData, setFormData] = useState({
    application_id: "",
    full_name: "",
    email: "",
    phone: "",
    status: "applied",
    job_id: "",
  });
  const [editingApplicationId, setEditingApplicationId] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch all job applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/job-application/`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch applications");
      const data = await response.json();
      
      // Handle both single object and array responses
      const appData = data.data ? (Array.isArray(data.data) ? data.data : [data.data]) : (Array.isArray(data) ? data : []);
      setApplications(appData);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setMessage("Failed to load job applications");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle status change directly from table
  const handleStatusChange = async (applicationId, application_id, newStatus) => {
    try {
      // Create FormData to send application_id in payload
      const dataToSend = new FormData();
      dataToSend.append('application_id', application_id);
      dataToSend.append('status', newStatus);

      // Use base endpoint for status updates
      const response = await fetch(
        `${API_BASE_URL}/api/job-application/`,
        {
          method: "PUT",
          credentials: "include",
          body: dataToSend,
        }
      );

      if (!response.ok) throw new Error("Failed to update status");

      // Update the application in state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      );

      setMessage("Status updated successfully!");
      setVariant("success");
      setShowAlert(true);

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error updating status:", error);
      setMessage("Failed to update status");
      setVariant("danger");
      setShowAlert(true);
      
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  // Submit application form (PUT)
  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    try {
      // Create FormData to send application_id in payload
      const dataToSend = new FormData();
      dataToSend.append('application_id', formData.application_id);
      dataToSend.append('full_name', formData.full_name);
      dataToSend.append('email', formData.email);
      dataToSend.append('phone', formData.phone);
      dataToSend.append('status', formData.status);
      dataToSend.append('job_id', formData.job_id);

      // Use base endpoint for updates
      const response = await fetch(
        `${API_BASE_URL}/api/job-application/`,
        {
          method: "PUT",
          credentials: "include",
          body: dataToSend,
        }
      );

      if (!response.ok) throw new Error("Failed to update application");

      setMessage("Application updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowModal(false);
      fetchApplications();

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error updating application:", error);
      setMessage("Failed to update application");
      setVariant("danger");
      setShowAlert(true);
    }
  };

  // Delete application
  const handleDeleteApplication = async (applicationId, application_id) => {
    if (!window.confirm("Are you sure you want to delete this application?"))
      return;

    try {
      // Create FormData to send application_id in payload
      const dataToSend = new FormData();
      dataToSend.append('application_id', application_id);

      // Use base endpoint for delete
      const response = await fetch(
        `${API_BASE_URL}/api/job-application/`,
        {
          method: "DELETE",
          credentials: "include",
          body: dataToSend,
        }
      );

      if (!response.ok) throw new Error("Failed to delete application");

      setMessage("Application deleted successfully!");
      setVariant("success");
      setShowAlert(true);
      fetchApplications();

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error deleting application:", error);
      setMessage("Failed to delete application");
      setVariant("danger");
      setShowAlert(true);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      applied: "info",
      shortlisted: "primary",
      rejected: "danger",
    };
    return variants[status] || "secondary";
  };

  // Filter and paginate applications
  const filteredApplications = applications.filter(app =>
    app.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedApplications = filteredApplications.slice(
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
            <h2 className="mb-4">Job Applications</h2>

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

            <div className="mb-3">
              <Form.Control
                    type="text"
                    placeholder="Search by applicant name, email, or job ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
            </div>

            {loading ? (
              <div className="d-flex justify-content-center">
                <Spinner animation="border" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <p className="text-muted">No job applications found.</p>
            ) : (
              <>
                <Row className="mt-3">
                  <div className="col-md-12">
                    <table className="temp-rwd-table">
                      <tbody>
                        <tr>
                          <th>S.No</th>
                          <th>Application ID</th>
                          <th>Applicant Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Job ID</th>
                          <th>Status</th>
                          <th>Applied Date</th>
                          <th>Resume</th>
                          <th>Actions</th>
                        </tr>

                        {paginatedApplications.map((app, index) => (
                          <tr key={app.id}>
                            <td data-th="S.No">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td data-th="Application ID">{app.application_id}</td>
                            <td data-th="Applicant Name">{app.full_name}</td>
                            <td data-th="Email">{app.email}</td>
                            <td data-th="Phone">{app.phone}</td>
                            <td data-th="Job ID">{app.job_id}</td>
                            <td data-th="Status">
                              <Form.Select
                                value={app.status}
                                onChange={(e) => handleStatusChange(app.id, app.application_id, e.target.value)}
                                size="sm"
                                style={{ width: "120px" }}
                              >
                                <option value="applied">Applied</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="rejected">Rejected</option>
                              </Form.Select>
                            </td>
                            <td data-th="Applied Date">
                              {new Date(app.applied_at).toLocaleDateString()}
                            </td>
                            <td data-th="Resume">
                              {app.resume ? (
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={() => window.open(`${API_BASE_URL}${app.resume}`, '_blank')}
                                >
                                  View Resume
                                </Button>
                              ) : (
                                <span className="text-muted">No Resume</span>
                              )}
                            </td>
                            <td data-th="Actions">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteApplication(app.id, app.application_id)}
                              >
                                Delete
                              </Button>
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
          </div>
        </Container>
      </div>

      {/* View/Edit Application Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Application Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitApplication}>
            <Form.Group className="mb-3">
              <Form.Label>Application ID</Form.Label>
              <Form.Control
                type="text"
                name="application_id"
                value={formData.application_id}
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Job ID</Form.Label>
              <Form.Control
                type="text"
                name="job_id"
                value={formData.job_id}
                disabled
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="me-2">
              Update Application
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default JobApplications;