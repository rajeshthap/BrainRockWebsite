import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner, Pagination } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";

// Define the base URL for your API
const API_BASE_URL = 'https://brainrock.in/brainrock/backend/api/module-question/';

const ManagePlay = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  // Data state
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    question_text: "",
    options: ["", "", "", ""],
    correct_answer: 0,
    marks: 1
  });

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Fetch questions on component mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(API_BASE_URL, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const questionsData = response.data.data || response.data;
        setQuestions(questionsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Filter questions based on search term
  const filteredQuestions = searchTerm.trim() === ''
    ? questions
    : questions.filter((question) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          question.question_text?.toLowerCase().includes(lowerSearch) ||
          question.options.some(option => option.toLowerCase().includes(lowerSearch))
        );
      });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const response = await axios.delete(
          API_BASE_URL,
          {
            data: { id: id },
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        setQuestions(prevData => prevData.filter(item => item.id !== id));

        setMessage("Question deleted successfully!");
        setVariant("success");
        setShowAlert(true);

        setTimeout(() => setShowAlert(false), 3000);
      } catch (error) {
        console.error('Error deleting question:', error);
        setMessage(error.message || "Failed to delete question");
        setVariant("danger");
        setShowAlert(true);

        setTimeout(() => setShowAlert(false), 5000);
      }
    }
  };

  // Handle edit
  const handleEdit = (question) => {
    setCurrentEditItem(question);
    setEditFormData({
      question_text: question.question_text,
      options: question.options || ["", "", "", ""],
      correct_answer: question.correct_answer,
      marks: question.marks || 1
    });
    setShowEditModal(true);
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('option')) {
      // Handle option inputs
      const optionIndex = parseInt(name.split('-')[1]);
      setEditFormData(prev => {
        const newOptions = [...prev.options];
        newOptions[optionIndex] = value;
        return {
          ...prev,
          options: newOptions
        };
      });
    } else {
      // Handle text, number, and select inputs
      setEditFormData(prev => ({
        ...prev,
        [name]: name === 'correct_answer' ? parseInt(value) : value
      }));
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      id: currentEditItem.id,
      question_text: editFormData.question_text,
      options: editFormData.options,
      correct_answer: editFormData.correct_answer,
      marks: editFormData.marks
    };

    try {
      const response = await axios.put(
        API_BASE_URL,
        dataToSend,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status < 200 || response.status >= 300) {
        const errorData = response.data || { message: 'Server error' };
        throw new Error(errorData.message || `Failed to update question (Status: ${response.status})`);
      }

      setQuestions(prevData =>
        prevData.map(item =>
          item.id === currentEditItem.id
            ? {
                ...item,
                question_text: editFormData.question_text,
                options: editFormData.options,
                correct_answer: editFormData.correct_answer,
                marks: editFormData.marks
              }
            : item
        )
      );

      setMessage("Question updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error updating question:', error);
      setMessage(error.message || "Failed to update question");
      setVariant("danger");
      setShowAlert(true);

      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  return (
    <div className="dashboard-container">
      <LeftNavManagement
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content">
        <AdminHeader toggleSidebar={toggleSidebar} />
        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Manage Khelo Jito Questions</h2>
              <div style={{ width: '300px' }}>
                <input
                  type="text"
                  placeholder="Search by question or options..."
                  className="form-control"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {showAlert && (
              <Alert variant={variant} className="mb-4" onClose={() => setShowAlert(false)} dismissible>
                {message}
              </Alert>
            )}

            {loading ? (
              <div className="text-center my-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <>
                <Row>
                  {currentItems.length === 0 ? (
                    <Col xs={12} className="text-center my-5">
                      <p>{searchTerm ? 'No questions match your search.' : 'No questions found.'}</p>
                    </Col>
                  ) : (
                    currentItems.map((question) => (
                      <Col lg={4} md={6} sm={12} className="mb-4" key={question.id}>
                        <Card className="h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <Card.Title className="managetitle">Question {question.id}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                  Marks: {question.marks}
                                </Card.Subtitle>
                              </div>
                            </div>
                            <Card.Text style={{ minHeight: '80px' }}>{question.question_text}</Card.Text>
                            <div className="mb-3">
                              <strong>Options:</strong>
                              <ul className="list-unstyled">
                                {question.options.map((option, index) => (
                                  <li key={index} className={`${index === question.correct_answer ? 'text-success' : ''}`}>
                                    {index === question.correct_answer && '✓ '}
                                    {option}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="d-flex justify-content-end">
                              <Button
                                variant="primary"
                                size="sm"
                                className="me-2"
                                onClick={() => handleEdit(question)}
                              >
                                <FaEdit className="me-1" /> Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(question.id)}
                              >
                                <FaTrash className="me-1" /> Delete
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  )}
                </Row>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                      {[...Array(totalPages).keys()].map(page => (
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

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Question</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Question Text</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter question text"
                name="question_text"
                value={editFormData.question_text}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Options</Form.Label>
              <div className="options-container">
                {editFormData.options.map((option, index) => (
                  <div key={index} className="option-item mb-2">
                    <Form.Control
                      type="text"
                      placeholder={`Enter option ${index + 1}`}
                      name={`option-${index}`}
                      value={option}
                      onChange={handleEditChange}
                      required
                    />
                  </div>
                ))}
              </div>
            </Form.Group>

            <Row>
              <Col lg={6} md={6} sm={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Correct Answer</Form.Label>
                  <Form.Select
                    name="correct_answer"
                    value={editFormData.correct_answer}
                    onChange={handleEditChange}
                    required
                  >
                    {editFormData.options.map((_, index) => (
                      <option key={index} value={index}>
                        Option {index + 1}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col lg={6} md={6} sm={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Marks</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="10"
                    placeholder="Enter marks"
                    name="marks"
                    value={editFormData.marks}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagePlay;
