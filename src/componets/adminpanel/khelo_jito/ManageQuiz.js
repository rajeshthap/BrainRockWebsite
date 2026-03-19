import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner, Pagination, InputGroup } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { FaPlus } from "react-icons/fa6";

// Define the base URL for your API
const API_BASE_URL = 'https://brainrock.in/brainrock/backend/api/quiz-items/';

const ManageQuiz = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  // Data state
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // View and Edit modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentViewItem, setCurrentViewItem] = useState(null);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    quiz_id: "",
    title: "",
    description: "",
    quiz_category: "",
    start_date_time: "",
    end_date_time: "",
    price: 0,
    is_active: true,
    questions: [
      {
        question_text: "",
        options: ["", "", "", ""],
        correct_answer: 0
      }
    ]
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

  // Fetch quizzes on component mount
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(API_BASE_URL, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const quizzesData = response.data.data || response.data;
        setQuizzes(quizzesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Filter quizzes based on search term
  const filteredQuizzes = searchTerm.trim() === ''
    ? quizzes
    : quizzes.filter((quiz) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          quiz.title?.toLowerCase().includes(lowerSearch) ||
          quiz.description?.toLowerCase().includes(lowerSearch) ||
          quiz.quiz_category?.toLowerCase().includes(lowerSearch)
        );
      });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredQuizzes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Handle delete
  const handleDelete = async (quiz_id) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        const response = await axios.delete(
          API_BASE_URL,
          {
            data: { quiz_id: quiz_id },
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        setQuizzes(prevData => prevData.filter(item => item.quiz_id !== quiz_id));

        setMessage("Quiz deleted successfully!");
        setVariant("success");
        setShowAlert(true);

        setTimeout(() => setShowAlert(false), 3000);
      } catch (error) {
        console.error('Error deleting quiz:', error);
        setMessage(error.message || "Failed to delete quiz");
        setVariant("danger");
        setShowAlert(true);

        setTimeout(() => setShowAlert(false), 5000);
      }
    }
  };

  // Handle view
  const handleView = (quiz) => {
    setCurrentViewItem(quiz);
    setShowViewModal(true);
  };

  // Handle edit
  const handleEdit = (quiz) => {
    setCurrentEditItem(quiz);
    setEditFormData({
      ...quiz,
      start_date_time: new Date(quiz.start_date_time).toISOString().slice(0, 16),
      end_date_time: new Date(quiz.end_date_time).toISOString().slice(0, 16)
    });
    setShowEditModal(true);
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle question input changes in edit form
  const handleEditQuestionChange = (questionIndex, e) => {
    const { name, value } = e.target;
    
    setEditFormData(prev => {
      const newQuestions = [...prev.questions];
      
      if (name.startsWith('option')) {
        // Handle option inputs
        const optionIndex = parseInt(name.split('-')[1]);
        newQuestions[questionIndex].options[optionIndex] = value;
      } else {
        // Handle question text and correct answer
        newQuestions[questionIndex][name] = name === 'correct_answer' ? parseInt(value) : value;
      }
      
      return {
        ...prev,
        questions: newQuestions
      };
    });
  };

  // Add new question in edit form
  const addEditQuestion = () => {
    setEditFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: "",
          options: ["", "", "", ""],
          correct_answer: 0
        }
      ]
    }));
  };

  // Remove question in edit form
  const removeEditQuestion = (questionIndex) => {
    if (editFormData.questions.length > 1) {
      setEditFormData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, index) => index !== questionIndex)
      }));
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dataToSend = {
        ...editFormData,
        number_of_questions: editFormData.questions.length
      };
      
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
        throw new Error(errorData.message || 'Failed to update quiz');
      }

      setQuizzes(prevData =>
        prevData.map(item =>
          item.quiz_id === currentEditItem.quiz_id
            ? {
                ...item,
                ...dataToSend
              }
            : item
        )
      );

      setMessage("Quiz updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error updating quiz:', error);
      setMessage(error.message || "Failed to update quiz");
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
              <h2 className="mb-0">Manage Quizzes</h2>
              <div style={{ width: '300px' }}>
                <input
                  type="text"
                  placeholder="Search by title, description or category..."
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
                      <p>{searchTerm ? 'No quizzes match your search.' : 'No quizzes found.'}</p>
                    </Col>
                  ) : (
                    currentItems.map((quiz) => (
                      <Col lg={4} md={6} sm={12} className="mb-4" key={quiz.id}>
                        <Card className="h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div>
                                <Card.Title className="managetitle">{quiz.title}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                  {quiz.quiz_category}
                                </Card.Subtitle>
                              </div>
                              <div className={`badge ${quiz.is_active ? 'bg-success' : 'bg-danger'}`}>
                                {quiz.is_active ? 'Active' : 'Inactive'}
                              </div>
                            </div>
                            <Card.Text style={{ minHeight: '60px' }}>
                              {quiz.description.length > 100 
                                ? `${quiz.description.substring(0, 100)}...` 
                                : quiz.description}
                            </Card.Text>
                            <div className="mb-3">
                              <div className="d-flex justify-content-between mb-1">
                                <small className="text-muted">Questions:</small>
                                <small className="fw-bold">{quiz.questions?.length || 0}</small>
                              </div>
                              <div className="d-flex justify-content-between mb-1">
                                <small className="text-muted">Price:</small>
                                <small className="fw-bold">₹{quiz.price}</small>
                              </div>
                              <div className="d-flex justify-content-between mb-1">
                                <small className="text-muted">Start:</small>
                                <small className="fw-bold">
                                  {new Date(quiz.start_date_time).toLocaleDateString()}
                                </small>
                              </div>
                              <div className="d-flex justify-content-between">
                                <small className="text-muted">End:</small>
                                <small className="fw-bold">
                                  {new Date(quiz.end_date_time).toLocaleDateString()}
                                </small>
                              </div>
                            </div>
                            <div className="d-flex justify-content-end">
                              <Button
                                variant="primary"
                                size="sm"
                                className="me-2"
                                onClick={() => handleEdit(quiz)}
                              >
                                <FaEdit className="me-1" /> Edit
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="me-2"
                                onClick={() => handleView(quiz)}
                              >
                                View
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(quiz.quiz_id)}
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
          <Modal.Title>Edit Quiz</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            {currentEditItem && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Quiz ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={editFormData.quiz_id}
                    disabled
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Quiz Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter quiz title"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter quiz description"
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
                
                <Row>
                  <Col lg={6} md={6} sm={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter quiz category"
                        name="quiz_category"
                        value={editFormData.quiz_category}
                        onChange={handleEditChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={6} md={6} sm={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        placeholder="Enter quiz price"
                        name="price"
                        value={editFormData.price}
                        onChange={handleEditChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col lg={6} md={6} sm={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date & Time</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="start_date_time"
                        value={editFormData.start_date_time}
                        onChange={handleEditChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={6} md={6} sm={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date & Time</Form.Label>
                      <Form.Control
                        type="datetime-local"
                        name="end_date_time"
                        value={editFormData.end_date_time}
                        onChange={handleEditChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Active"
                    name="is_active"
                    checked={editFormData.is_active}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  />
                </Form.Group>
                
                <hr className="my-4" />
                
                <h3>Questions ({editFormData.questions.length})</h3>
                
                {editFormData.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="mb-4 p-3 border rounded">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h4>Question {questionIndex + 1}</h4>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeEditQuestion(questionIndex)}
                        disabled={editFormData.questions.length <= 1}
                      >
                        <FaTrash className="me-1" /> Remove
                      </Button>
                    </div>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Question Text</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Enter question text"
                        name="question_text"
                        value={question.question_text}
                        onChange={(e) => handleEditQuestionChange(questionIndex, e)}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Options</Form.Label>
                      <div className="options-container">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="option-item mb-2">
                            <InputGroup>
                              <InputGroup.Text>Option {optionIndex + 1}</InputGroup.Text>
                              <Form.Control
                                type="text"
                                placeholder={`Enter option ${optionIndex + 1}`}
                                name={`option-${optionIndex}`}
                                value={option}
                                onChange={(e) => handleEditQuestionChange(questionIndex, e)}
                                required
                              />
                            </InputGroup>
                          </div>
                        ))}
                      </div>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Correct Answer</Form.Label>
                      <Form.Select
                        name="correct_answer"
                        value={question.correct_answer}
                        onChange={(e) => handleEditQuestionChange(questionIndex, e)}
                        required
                      >
                        {question.options.map((_, index) => (
                          <option key={index} value={index}>
                            Option {index + 1}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                ))}
                
                <Button
                  variant="secondary"
                  type="button"
                  onClick={addEditQuestion}
                  className="mb-4"
                >
                  <FaPlus className="me-1" /> Add Question
                </Button>
              </>
            )}
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

      {/* View Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{currentViewItem?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentViewItem && (
            <>
              <div className="mb-4">
                <h5>Description</h5>
                <p>{currentViewItem.description}</p>
              </div>
              
              <div className="row mb-4">
                <div className="col-md-6">
                  <h5>Category</h5>
                  <p>{currentViewItem.quiz_category}</p>
                </div>
                <div className="col-md-6">
                  <h5>Price</h5>
                  <p>₹{currentViewItem.price}</p>
                </div>
                <div className="col-md-6">
                  <h5>Start Date</h5>
                  <p>{new Date(currentViewItem.start_date_time).toLocaleString()}</p>
                </div>
                <div className="col-md-6">
                  <h5>End Date</h5>
                  <p>{new Date(currentViewItem.end_date_time).toLocaleString()}</p>
                </div>
                <div className="col-md-6">
                  <h5>Status</h5>
                  <p className={`${currentViewItem.is_active ? 'text-success' : 'text-danger'}`}>
                    {currentViewItem.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="col-md-6">
                  <h5>Questions</h5>
                  <p>{currentViewItem.questions?.length || 0}</p>
                </div>
              </div>
              
              <hr className="my-4" />
              
              <h5>Questions</h5>
              {currentViewItem.questions && currentViewItem.questions.length > 0 ? (
                currentViewItem.questions.map((question, index) => (
                  <div key={index} className="mb-3 p-3 border rounded">
                    <h6>Question {index + 1}</h6>
                    <p>{question.question_text}</p>
                    <div className="mb-2">
                      <strong>Options:</strong>
                      <ul className="list-unstyled mt-1">
                        {question.options.map((option, optIndex) => (
                          <li key={optIndex} className={`${optIndex === question.correct_answer ? 'text-success' : ''}`}>
                            {optIndex === question.correct_answer && '✓ '}
                            {option}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <strong>Correct Answer:</strong> 
                      <span className="text-success ms-2">
                        Option {question.correct_answer + 1}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No questions available for this quiz.</p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageQuiz;
