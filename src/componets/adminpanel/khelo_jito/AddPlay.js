import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, InputGroup } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { FaPlus, FaTrash } from "react-icons/fa";
import axios from "axios";

const AddPlay = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
   // Form state
   const [formData, setFormData] = useState({
     question_text: "",
     question_hindi_text: "",
     options: ["", "", "", ""],
     options_hindi: ["", "", "", ""],
     correct_answer: 0,
     marks: 1
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
    
    if (name.startsWith('option_hindi_')) {
      // Handle Hindi option inputs
      const optionIndex = parseInt(name.split('_')[2]);
      setFormData(prev => {
        const newOptionsHindi = [...prev.options_hindi];
        newOptionsHindi[optionIndex] = value;
        return {
          ...prev,
          options_hindi: newOptionsHindi
        };
      });
    } else if (name.startsWith('option')) {
      // Handle English option inputs
      const optionIndex = parseInt(name.split('-')[1]);
      setFormData(prev => {
        const newOptions = [...prev.options];
        newOptions[optionIndex] = value;
        return {
          ...prev,
          options: newOptions
        };
      });
    } else {
      // Handle text, number, and select inputs
      setFormData(prev => ({
        ...prev,
        [name]: name === 'correct_answer' ? parseInt(value) : value
      }));
    }
  };

  // Clear form function
  const clearForm = () => {
    setFormData({
      question_text: "",
      question_hindi_text: "",
      options: ["", "", "", ""],
      options_hindi: ["", "", "", ""],
      correct_answer: 0,
      marks: 1
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
        question_text: formData.question_text,
        question_hindi_text: formData.question_hindi_text || "",
        options: formData.options,
        options_hindi: formData.options_hindi,
        correct_answer: formData.correct_answer,
        marks: formData.marks
      };
      
      // Using the API endpoint for module questions
      const response = await axios.post(
        'https://brainrock.in/brainrock/backend/api/module-question/',
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
        throw new Error(errorData.message || 'Failed to add question');
      }
      
      // Success path
      alert('Question added successfully!');
      setMessage("Question added successfully!");
      setVariant("success");
      setShowAlert(true);
      clearForm();
      
      setTimeout(() => setShowAlert(false), 3000);
      
    } catch (error) {
      console.error('Error adding question:', error);
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
             <style>{`
               .add-question-form .form-control,
               .add-question-form .form-select {
                 padding: 0.375rem 0.5rem;
                 font-size: 0.875rem;
               }
               .add-question-form .form-label {
                 font-size: 0.875rem;
                 margin-bottom: 0.25rem;
                 font-weight: 500;
               }
               .add-question-form .btn {
                 padding: 0.375rem 0.75rem;
                 font-size: 0.875rem;
               }
               .add-question-form .input-group-text {
                 padding: 0.375rem 0.5rem;
                 font-size: 0.875rem;
                 background-color: #f8f9fa;
               }
               .add-question-form textarea {
                 min-height: 60px;
               }
             `}</style>
             
             <h2 className="mb-3 h5">Add New Question</h2>
             
             {showAlert && (
               <Alert variant={variant} className="mb-3 py-2" onClose={() => setShowAlert(false)} dismissible>
                 {message}
               </Alert>
             )}
             
             <Form onSubmit={handleSubmit} className="add-question-form">
                <Form.Group className="mb-2">
                  <Form.Label>Question (English)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Enter question in English"
                    name="question_text"
                    value={formData.question_text}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-2">
                  <Form.Label>Question (Hindi) <span className="text-muted">(Optional)</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Enter question in Hindi"
                    name="question_hindi_text"
                    value={formData.question_hindi_text || ""}
                    onChange={handleChange}
                  />
                </Form.Group>
               
               <Form.Group className="mb-2">
                 <Form.Label>Options (English)</Form.Label>
                 <div className="options-container">
                   {formData.options.map((option, index) => (
                     <div key={index} className="option-item mb-1">
                       <InputGroup size="sm">
                         <InputGroup.Text>{index + 1}</InputGroup.Text>
                         <Form.Control
                           type="text"
                           placeholder={`Option ${index + 1}`}
                           name={`option-${index}`}
                           value={option}
                           onChange={handleChange}
                           required
                         />
                       </InputGroup>
                     </div>
                   ))}
                 </div>
               </Form.Group>
               
               <Form.Group className="mb-2">
                 <Form.Label>Options (Hindi) <span className="text-muted">(Optional)</span></Form.Label>
                 <div className="options-container">
                   {formData.options_hindi.map((option, index) => (
                     <div key={index} className="option-item mb-1">
                       <InputGroup size="sm">
                         <InputGroup.Text>{index + 1}</InputGroup.Text>
                         <Form.Control
                           type="text"
                           placeholder={`विकल्प ${index + 1}`}
                           name={`option_hindi_${index}`}
                           value={option}
                           onChange={handleChange}
                         />
                       </InputGroup>
                     </div>
                   ))}
                 </div>
               </Form.Group>
               
               <Row className="g-2 mb-2">
                 <Col xs={12} sm={6}>
                   <Form.Group>
                     <Form.Label>Correct Answer</Form.Label>
                     <Form.Select
                       size="sm"
                       name="correct_answer"
                       value={formData.correct_answer}
                       onChange={handleChange}
                       required
                     >
                       {formData.options.map((_, index) => (
                         <option key={index} value={index}>
                           Option {index + 1}
                         </option>
                       ))}
                     </Form.Select>
                   </Form.Group>
                 </Col>
                 <Col xs={12} sm={6}>
                   <Form.Group>
                     <Form.Label>Marks</Form.Label>
                     <Form.Control
                       type="number"
                       min="1"
                       max="10"
                       placeholder="Marks"
                       size="sm"
                       name="marks"
                       value={formData.marks}
                       onChange={handleChange}
                       required
                     />
                   </Form.Group>
                 </Col>
               </Row>
               
               <div className="d-flex gap-2">
                 <Button 
                   variant="primary" 
                   type="submit" 
                   disabled={isSubmitting}
                   size="sm"
                 >
                   {isSubmitting ? 'Saving...' : 'Save'}
                 </Button>
                 <Button 
                   variant="outline-secondary" 
                   onClick={clearForm}
                   type="button"
                   size="sm"
                 >
                   Clear
                 </Button>
               </div>
             </Form>
           </div>
         </Container>
       </div>
     </div>
   );
};

export default AddPlay;
