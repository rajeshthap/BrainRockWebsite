import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Pagination,
  Alert,
  Modal,
  Form,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

const API_URL =
  "https://brainrock.in/brainrock/backend/api/interview-candidates/";

const api = axios.create({
  baseURL: "https://brainrock.in/brainrock/backend/api/",
  withCredentials: true,
});

const InterViewManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Data state
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Form / modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Responsive check
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setSidebarOpen(width >= 1024);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Fetch candidates
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_URL);
      if (response.data && Array.isArray(response.data.data)) {
        setCandidates(response.data.data);
      } else if (Array.isArray(response.data)) {
        setCandidates(response.data);
      } else {
        setCandidates([]);
      }
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Filter candidates
  const filteredCandidates =
    searchTerm.trim() === ""
      ? candidates
      : candidates.filter((c) => {
          const lower = searchTerm.toLowerCase();
          return (
            c.name?.toLowerCase().includes(lower) ||
            c.email?.toLowerCase().includes(lower) ||
            c.candidate_id?.toLowerCase().includes(lower)
          );
        });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCandidates.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Validation
  const validateField = (name, value, isEdit) => {
    let msg = "";
    switch (name) {
      case "name":
        if (!value.trim()) msg = "Name is required";
        break;
      case "email":
        if (!value.trim()) msg = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(value)) msg = "Invalid email format";
        break;
      case "password":
        if (!isEdit) {
          if (!value) msg = "Password is required";
          else if (value.length < 6) msg = "Password must be at least 6 characters";
        }
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value, !!selectedCandidate);
    if (errorMsg) setErrorMsg("");
  };

  const validateBeforeSubmit = (isEdit) => {
    let temp = {};
    if (!formData.name) temp.name = "Name is required";
    if (!formData.email) temp.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) temp.email = "Invalid email format";
    if (!isEdit && !formData.password) temp.password = "Password is required";
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "" });
    setErrors({});
    setSelectedCandidate(null);
  };

  // Open add modal
  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
    setErrorMsg("");
  };

  // Open edit modal
  const handleEditClick = (c) => {
    setSelectedCandidate(c);
    setFormData({ name: c.name, email: c.email, password: "" });
    setErrors({});
    setShowEditModal(true);
    setErrorMsg("");
  };

  // Open delete modal
  const handleDeleteClick = (c) => {
    setSelectedCandidate(c);
    setShowDeleteModal(true);
  };

  // Submit add
  const handleAddSubmit = async () => {
    if (!validateBeforeSubmit(false)) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await api.post(API_URL, formData);
      setSuccessMsg("Candidate added successfully!");
      setShowAddModal(false);
      resetForm();
      fetchCandidates();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const apiErrors = {};
        Object.keys(err.response.data.errors).forEach((key) => {
          const v = err.response.data.errors[key];
          apiErrors[key] = Array.isArray(v) ? v[0] : v;
        });
        setErrors((prev) => ({ ...prev, ...apiErrors }));
      } else {
        setErrorMsg(err.response?.data?.message || "Failed to add candidate");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit update
  const handleEditSubmit = async () => {
    if (!validateBeforeSubmit(true)) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const payload = {
        candidate_id: selectedCandidate.candidate_id,
        name: formData.name,
        email: formData.email,
      };
      if (formData.password) payload.password = formData.password;
      await api.put(API_URL, payload);
      setSuccessMsg("Candidate updated successfully!");
      setShowEditModal(false);
      resetForm();
      fetchCandidates();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const apiErrors = {};
        Object.keys(err.response.data.errors).forEach((key) => {
          const v = err.response.data.errors[key];
          apiErrors[key] = Array.isArray(v) ? v[0] : v;
        });
        setErrors((prev) => ({ ...prev, ...apiErrors }));
      } else {
        setErrorMsg(err.response?.data?.message || "Failed to update candidate");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedCandidate) return;
    setIsSubmitting(true);
    try {
      await api.delete(API_URL, { data: { candidate_id: selectedCandidate.candidate_id } });
      setSuccessMsg("Candidate deleted successfully!");
      setShowDeleteModal(false);
      setSelectedCandidate(null);
      fetchCandidates();
    } catch (err) {
      setErrorMsg("Failed to delete candidate");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <LeftNavManagement
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <AdminHeader toggleSidebar={toggleSidebar} />

        {/* Dashboard Body */}
        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            {successMsg && (
              <Alert variant="success" dismissible onClose={() => setSuccessMsg("")}>
                {successMsg}
              </Alert>
            )}
            {errorMsg && (
              <Alert variant="danger" dismissible onClose={() => setErrorMsg("")}>
                {errorMsg}
              </Alert>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Interview Candidates Management</h2>
              <div className="d-flex gap-2">
                <div style={{ width: "300px" }}>
                  <input
                    type="text"
                    placeholder="Search by name, email or ID..."
                    className="form-control"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <Button variant="primary" onClick={handleAddClick}>
                  + Add Candidate
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="danger" className="mb-4">
                Error: {error}
              </Alert>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading candidates data...</p>
              </div>
            ) : (
              <>
                <Row className="mt-3">
                  <div className="col-md-12">
                    <table className="temp-rwd-table">
                      <tbody>
                        <tr>
                          <th>S.No</th>
                          <th>Candidate ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th className="text-center">Action</th>
                        </tr>

                        {currentItems.length > 0 ? (
                          currentItems.map((c, index) => (
                            <tr key={c.candidate_id}>
                              <td data-th="S.No">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </td>
                              <td data-th="Candidate ID">{c.candidate_id}</td>
                              <td data-th="Name">{c.name}</td>
                              <td data-th="Email">{c.email}</td>
                              <td data-th="Action" className="text-center">
                                <Button
                                  variant="warning"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleEditClick(c)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(c)}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center">
                              No candidates data available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Row>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                      {[...Array(totalPages).keys()].map((page) => (
                        <Pagination.Item
                          key={page + 1}
                          active={page + 1 === currentPage}
                          onClick={() => handlePageChange(page + 1)}
                        >
                          {page + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() => handlePageChange(currentPage + 1)}
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

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Candidate</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Name <span className="br-span-star">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter candidate name"
                isInvalid={!!errors.name}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Email <span className="br-span-star">*</span>
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                isInvalid={!!errors.email}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Password <span className="br-span-star">*</span>
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                isInvalid={!!errors.password}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Submitting...
              </>
            ) : (
              "Add Candidate"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Candidate</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Name <span className="br-span-star">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                Email <span className="br-span-star">*</span>
              </Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password (leave blank to keep current)</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter new password"
                isInvalid={!!errors.password}
                disabled={isSubmitting}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEditSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                Updating...
              </>
            ) : (
              "Update Candidate"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete candidate <strong>{selectedCandidate?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={isSubmitting}>
            {isSubmitting ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InterViewManagement;