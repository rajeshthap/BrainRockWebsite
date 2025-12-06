import React, { useEffect, useState } from "react";
import { Container, Table, Button, Modal, Form, Alert, Badge } from "react-bootstrap";
import "../../../assets/css/Profile.css";
import SideNav from "../SideNav";
import HrHeader from "../HrHeader";

const JobApplications = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);

  // Form state for viewing/editing application
  const [formData, setFormData] = useState({
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
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/job-application/",
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

  // Open modal for viewing/editing application
  const handleViewApplication = (app) => {
    setEditingApplicationId(app.id);
    setFormData({
      full_name: app.full_name,
      email: app.email,
      phone: app.phone,
      status: app.status,
      job_id: app.job_id,
    });
    setShowModal(true);
  };

  // Submit application form (PUT)
  const handleSubmitApplication = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/job-application/${editingApplicationId}/`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
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

  // Delete application using job_id
  const handleDeleteApplication = async (applicationId, jobId) => {
    if (!window.confirm("Are you sure you want to delete this application?"))
      return;

    try {
      const response = await fetch(
        `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/job-application/${applicationId}/`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ job_id: jobId }),
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
      selected: "success",
    };
    return variants[status] || "secondary";
  };

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

            {loading ? (
              <p>Loading applications...</p>
            ) : applications.length === 0 ? (
              <p className="text-muted">No job applications received yet.</p>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Applicant Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Job ID</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td>{app.full_name}</td>
                      <td>{app.email}</td>
                      <td>{app.phone}</td>
                      <td>{app.job_id}</td>
                      <td>
                        <Badge bg={getStatusBadge(app.status)}>
                          {app.status}
                        </Badge>
                      </td>
                      <td>
                        {new Date(app.applied_at).toLocaleDateString()}
                      </td>
                      <td>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => handleViewApplication(app)}
                        >
                          View/Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleDeleteApplication(app.id, app.job_id)
                          }
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
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
                <option value="selected">Selected</option>
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