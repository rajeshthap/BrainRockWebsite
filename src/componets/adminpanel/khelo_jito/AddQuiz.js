import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, InputGroup } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { FaPlus, FaTrash } from "react-icons/fa";
import axios from "axios";

const AddQuiz = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
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
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);

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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle question input changes
  const handleQuestionChange = (questionIndex, e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
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

  // Add new question
  const addQuestion = () => {
    setFormData(prev => ({
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

  // Remove question
  const removeQuestion = (questionIndex) => {
    if (formData.questions.length > 1) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.filter((_, index) => index !== questionIndex)
      }));
    }
  };

  // Clear form function
  const clearForm = () => {
    setFormData({
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
    setMessage("");
    setShowAlert(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setShowAlert(false);
    
    try {
      // Create payload
      const dataToSend = {
        ...formData,
        number_of_questions: formData.questions.length
      };
      
      // Using the API endpoint for quizzes
      const response = await axios.post(
        'https://brainrock.in/brainrock/backend/api/quiz-items/',
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
        throw new Error(errorData.message || 'Failed to add quiz');
      }
      
      // Success path
      alert('Quiz added successfully!');
      setMessage("Quiz added successfully!");
      setVariant("success");
      setShowAlert(true);
      clearForm();
      
      setTimeout(() => setShowAlert(false), 3000);
      
    } catch (error) {
      console.error('Error adding quiz:', error);
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = "Network error: Could not connect to the server. Please check the API endpoint.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
      setVariant("danger");
      setShowAlert(true);
      
      setTimeout(() => setShowAlert(false), 5000);
      
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
            <h2 className="mb-4">Add New Quiz</h2>
            
            {showAlert && (
              <Alert variant={variant} className="mb-4" onClose={() => setShowAlert(false)} dismissible>
                {message}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Quiz ID</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter quiz ID (e.g., QUIZ-00001)"
                  name="quiz_id"
                  value={formData.quiz_id}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Quiz Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter quiz title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
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
                  value={formData.description}
                  onChange={handleChange}
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
                      value={formData.quiz_category}
                      onChange={handleChange}
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
                      value={formData.price}
                      onChange={handleChange}
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
                      value={formData.start_date_time}
                      onChange={handleChange}
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
                      value={formData.end_date_time}
                      onChange={handleChange}
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
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
              </Form.Group>
              
              <hr className="my-4" />
              
              <h3>Questions ({formData.questions.length})</h3>
              
              {formData.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="mb-4 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>Question {questionIndex + 1}</h4>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeQuestion(questionIndex)}
                      disabled={formData.questions.length <= 1}
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
                      onChange={(e) => handleQuestionChange(questionIndex, e)}
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
                              onChange={(e) => handleQuestionChange(questionIndex, e)}
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
                      onChange={(e) => handleQuestionChange(questionIndex, e)}
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
                onClick={addQuestion}
                className="mb-4"
              >
                <FaPlus className="me-1" /> Add Question
              </Button>
              
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting}
                className="me-2"
              >
                {isSubmitting ? 'Submitting...' : 'Add Quiz'}
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={clearForm}
                type="button"
              >
                Clear
              </Button>
            </Form>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default AddQuiz;
