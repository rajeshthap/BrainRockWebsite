import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Row,
  Col,
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
import { AuthContext } from "../../context/AuthContext";

const API_URL =
  "https://brainrock.in/brainrock/backend/api/candidate-interview-questions/";

const api = axios.create({
  baseURL: "https://brainrock.in/brainrock/backend/api/",
  withCredentials: true,
});

const CandidateInterviewQues = () => {
  const { user, logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Data state
  const [questions, setQuestions] = useState([]);
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
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question_text: "",
    options: ["", "", "", ""],
    correct_answer: 0,
    marks: 5,
    category: "",
  });
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

  // Fetch questions
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_URL);
      if (response.data && Array.isArray(response.data.data)) {
        setQuestions(response.data.data);
      } else if (Array.isArray(response.data)) {
        setQuestions(response.data);
      } else {
        setQuestions([]);
      }
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Filter questions
  const filteredQuestions =
    searchTerm.trim() === ""
      ? questions
      : questions.filter((q) => {
          const lower = searchTerm.toLowerCase();
          return (
            q.question_text?.toLowerCase().includes(lower) ||
            q.category?.toLowerCase().includes(lower)
          );
        });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const resetForm = () => {
    setFormData({
      question_text: "",
      options: ["", "", "", ""],
      correct_answer: 0,
      marks: 5,
      category: "",
    });
    setErrors({});
    setSelectedQuestion(null);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
    if (errors.options) {
      setErrors((prev) => ({ ...prev, options: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errorMsg) setErrorMsg("");
  };

  const validateBeforeSubmit = () => {
    let temp = {};
    if (!formData.question_text.trim()) temp.question_text = "Question text is required";
    const emptyOption = formData.options.findIndex((o) => !o.trim());
    if (emptyOption !== -1) temp.options = `Option ${emptyOption + 1} is required`;
    if (!formData.category.trim()) temp.category = "Category is required";
    if (!formData.marks || formData.marks <= 0) temp.marks = "Marks must be greater than 0";
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  // Open add modal
  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
    setErrorMsg("");
  };

  // Open edit modal
  const handleEditClick = (q) => {
    setSelectedQuestion(q);
    setFormData({
      question_text: q.question_text,
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ["", "", "", ""],
      correct_answer: q.correct_answer ?? 0,
      marks: q.marks ?? 5,
      category: q.category ?? "",
    });
    setErrors({});
    setShowEditModal(true);
    setErrorMsg("");
  };

  // Open delete modal
  const handleDeleteClick = (q) => {
    setSelectedQuestion(q);
    setShowDeleteModal(true);
  };

  // Submit add
  const handleAddSubmit = async () => {
    if (!validateBeforeSubmit()) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await api.post(API_URL, {
        ...formData,
        marks: Number(formData.marks),
        correct_answer: Number(formData.correct_answer),
      });
      setSuccessMsg("Question added successfully!");
      setShowAddModal(false);
      resetForm();
      fetchQuestions();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const apiErrors = {};
        Object.keys(err.response.data.errors).forEach((key) => {
          const v = err.response.data.errors[key];
          apiErrors[key] = Array.isArray(v) ? v[0] : v;
        });
        setErrors((prev) => ({ ...prev, ...apiErrors }));
      } else {
        setErrorMsg(err.response?.data?.message || "Failed to add question");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit update
  const handleEditSubmit = async () => {
    if (!validateBeforeSubmit()) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const payload = {
        id: selectedQuestion.id,
        question_text: formData.question_text,
        options: formData.options,
        correct_answer: Number(formData.correct_answer),
        marks: Number(formData.marks),
        category: formData.category,
      };
      await api.put(API_URL, payload);
      setSuccessMsg("Question updated successfully!");
      setShowEditModal(false);
      resetForm();
      fetchQuestions();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const apiErrors = {};
        Object.keys(err.response.data.errors).forEach((key) => {
          const v = err.response.data.errors[key];
          apiErrors[key] = Array.isArray(v) ? v[0] : v;
        });
        setErrors((prev) => ({ ...prev, ...apiErrors }));
      } else {
        setErrorMsg(err.response?.data?.message || "Failed to update question");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedQuestion) return;
    setIsSubmitting(true);
    try {
      await api.delete(API_URL, { data: { id: selectedQuestion.id } });
      setSuccessMsg("Question deleted successfully!");
      setShowDeleteModal(false);
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (err) {
      setErrorMsg("Failed to delete question");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionForm = (isEdit) => (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>
          Question Text <span className="br-span-star">*</span>
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="question_text"
          value={formData.question_text}
          onChange={handleChange}
          placeholder="Enter question text"
          isInvalid={!!errors.question_text}
          disabled={isSubmitting}
        />
        <Form.Control.Feedback type="invalid">
          {errors.question_text}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Label className="mb-2">
        Options <span className="br-span-star">*</span>
      </Form.Label>
      {formData.options.map((opt, idx) => (
        <Form.Group className="mb-2 d-flex align-items-center gap-2" key={idx}>
          <Form.Check
            type="radio"
            name="correct_answer"
            checked={Number(formData.correct_answer) === idx}
            onChange={() => setFormData({ ...formData, correct_answer: idx })}
            disabled={isSubmitting}
          />
          <Form.Control
            type="text"
            value={opt}
            onChange={(e) => handleOptionChange(idx, e.target.value)}
            placeholder={`Option ${idx + 1}`}
            disabled={isSubmitting}
            isInvalid={!!errors.options && !opt.trim()}
          />
        </Form.Group>
      ))}
      {errors.options && (
        <div className="text-danger small mb-3">{errors.options}</div>
      )}

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Marks <span className="br-span-star">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              name="marks"
              value={formData.marks}
              onChange={handleChange}
              isInvalid={!!errors.marks}
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              {errors.marks}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>
              Category <span className="br-span-star">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g. PHP, Python"
              isInvalid={!!errors.category}
              disabled={isSubmitting}
            />
            <Form.Control.Feedback type="invalid">
              {errors.category}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
    </Form>
  );

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
              <h2 className="mb-0">Candidate Interview Questions</h2>
              <div className="d-flex gap-2">
                <div style={{ width: "300px" }}>
                  <input
                    type="text"
                    placeholder="Search by question or category..."
                    className="form-control"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <Button variant="primary" onClick={handleAddClick}>
                  + Add Question
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
                <p className="mt-2">Loading questions data...</p>
              </div>
            ) : (
              <>
                <Row className="mt-3">
                  <div className="col-md-12">
                    <table className="temp-rwd-table">
                      <tbody>
                        <tr>
                          <th>S.No</th>
                          <th>ID</th>
                          <th>Question</th>
                          <th>Category</th>
                          <th>Marks</th>
                          <th className="text-center">Action</th>
                        </tr>

                        {currentItems.length > 0 ? (
                          currentItems.map((q, index) => (
                            <tr key={q.id}>
                              <td data-th="S.No">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </td>
                              <td data-th="ID">{q.id}</td>
                              <td data-th="Question">
                                <div className="message-preview">
                                  {q.question_text?.length > 60
                                    ? `${q.question_text.substring(0, 60)}...`
                                    : q.question_text}
                                </div>
                              </td>
                              <td data-th="Category">{q.category}</td>
                              <td data-th="Marks">{q.marks}</td>
                              <td data-th="Action" className="text-center">
                                <Button
                                  variant="warning"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleEditClick(q)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(q)}
                                >
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center">
                              No questions data available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Row>

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
          <Modal.Title>Add Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderQuestionForm(false)}</Modal.Body>
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
              "Add Question"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderQuestionForm(true)}</Modal.Body>
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
              "Update Question"
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
          Are you sure you want to delete this question?
          <div className="mt-2 text-muted small">
            {selectedQuestion?.question_text}
          </div>
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

export default CandidateInterviewQues;