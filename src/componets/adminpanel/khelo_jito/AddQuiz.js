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
    title: "",
    description: "",
    quiz_category: "",
    start_date_time: "",
    end_date_time: "",
    price: 0,
    entry_fee: "0.00",
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
      title: "",
      description: "",
      quiz_category: "",
      start_date_time: "",
      end_date_time: "",
      price: 0,
      entry_fee: "0.00",
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
      // Create payload (exclude quiz_id since it's auto-generated)
      const { quiz_id, ...payload } = formData;
      const dataToSend = {
        ...payload,
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
            <h2 className="mb-4" style={{ fontSize: '1.25rem', fontWeight: '600' }}>Add New Quiz</h2>
            
            {showAlert && (
              <Alert variant={variant} className="mb-4" onClose={() => setShowAlert(false)} dismissible>
                {message}
              </Alert>
            )}
            
            <Form onSubmit={handleSubmit} style={{ fontSize: '0.8rem' }}>
              {/* First line: Title and Description */}
              <Row>
                <Col lg={6} md={6} sm={12}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: '500' }}>Quiz Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter quiz title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      size="sm"
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', maxWidth: '300px' }}
                    />
                  </Form.Group>
                </Col>
                <Col lg={6} md={6} sm={12}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: '500' }}>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={1}
                      placeholder="Enter quiz description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      size="sm"
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', maxWidth: '300px' }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Second line: Category, Price, Entry Fee, Dates */}
              <Row>
                <Col lg={3} md={4} sm={12}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: '500' }}>Category</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter quiz category"
                      name="quiz_category"
                      value={formData.quiz_category}
                      onChange={handleChange}
                      required
                      size="sm"
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', maxWidth: '150px' }}
                    />
                  </Form.Group>
                </Col>
                <Col lg={2} md={4} sm={12}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: '500' }}>Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      placeholder="Price"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      size="sm"
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', maxWidth: '100px' }}
                    />
                  </Form.Group>
                </Col>
                <Col lg={2} md={4} sm={12}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: '500' }}>Entry Fee (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Fee"
                      name="entry_fee"
                      value={formData.entry_fee}
                      onChange={handleChange}
                      required
                      size="sm"
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', maxWidth: '100px' }}
                    />
                  </Form.Group>
                </Col>
                <Col lg={3} md={6} sm={12}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: '500' }}>Start Date</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="start_date_time"
                      value={formData.start_date_time}
                      onChange={handleChange}
                      required
                      size="sm"
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', maxWidth: '180px' }}
                    />
                  </Form.Group>
                </Col>
                <Col lg={2} md={6} sm={12}>
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: '500' }}>End Date</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="end_date_time"
                      value={formData.end_date_time}
                      onChange={handleChange}
                      required
                      size="sm"
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', maxWidth: '180px' }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-2">
                <Form.Check
                  type="checkbox"
                  label={<span style={{ fontSize: '0.8rem' }}>Active</span>}
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                />
              </Form.Group>
              
              <hr className="my-2" />
              
              <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>Questions ({formData.questions.length})</h3>
              
              {formData.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="mb-2 p-2 border rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '500' }}>Question {questionIndex + 1}</h4>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeQuestion(questionIndex)}
                      disabled={formData.questions.length <= 1}
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    >
                      <FaTrash className="me-1" /> Remove
                    </Button>
                  </div>
                  
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: '500' }}>Question Text</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={1}
                      placeholder="Enter question text"
                      name="question_text"
                      value={question.question_text}
                      onChange={(e) => handleQuestionChange(questionIndex, e)}
                      required
                      size="sm"
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', maxWidth: '400px' }}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: '500' }}>Options</Form.Label>
                    <div className="options-container">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="option-item mb-1">
                          <InputGroup size="sm">
                            <InputGroup.Text style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>Option {optionIndex + 1}</InputGroup.Text>
                            <Form.Control
                              type="text"
                              placeholder={`Enter option ${optionIndex + 1}`}
                              name={`option-${optionIndex}`}
                              value={option}
                              onChange={(e) => handleQuestionChange(questionIndex, e)}
                              required
                              style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', maxWidth: '350px' }}
                            />
                          </InputGroup>
                        </div>
                      ))}
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: '0.8rem', fontWeight: '500' }}>Correct Answer</Form.Label>
                    <Form.Select
                      name="correct_answer"
                      value={question.correct_answer}
                      onChange={(e) => handleQuestionChange(questionIndex, e)}
                      required
                      size="sm"
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', maxWidth: '150px' }}
                    >
                      {question.options.map((_, index) => (
                        <option key={index} value={index} style={{ fontSize: '0.8rem' }}>
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
                className="me-2"
                size="sm"
                style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
              >
                <FaPlus className="me-1" /> Add Question
              </Button>
              
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSubmitting}
                className="me-2"
                size="sm"
                style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
              >
                {isSubmitting ? 'Submitting...' : 'Add Quiz'}
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={clearForm}
                type="button"
                size="sm"
                style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}
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
