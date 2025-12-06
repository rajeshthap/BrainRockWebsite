import React, { useState, useEffect } from "react";
import { Container, Alert } from "react-bootstrap";
import "../../../assets/css/ContactForm.css";
import FooterPage from "../../footer/FooterPage";
import { Link } from "react-router-dom";

function Career() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  
  // State for company details
  const [companyDetails, setCompanyDetails] = useState({
    address: "",
    email: "",
    phone: ""
  });
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [detailsError, setDetailsError] = useState(null);

  // Fetch company details on component mount
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/company-details/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch company details');
        }
        
        const result = await response.json();
        
        // Handle the actual API response format
        if (result.success && result.data && result.data.length > 0) {
          // Get the first item from the data array
          const companyInfo = result.data[0];
          
          setCompanyDetails({
            address: companyInfo.address,
            email: companyInfo.email,
            phone: companyInfo.phone
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
        setDetailsError(error.message);
      } finally {
        setDetailsLoading(false);
      }
    };

    fetchCompanyDetails();
  }, []);

  // live validation
  const validateField = (name, value) => {
    let error = "";

    if (!value.trim()) {
      error = "* This field is required";
    } else {
      if (name === "email" && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
        error = "* Invalid email format";
      }
      if (name === "phone" && !/^[0-9]{10}$/.test(value.replace(/[^0-9]/g, ''))) {
        error = "* Enter valid 10 digit mobile no";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    validateField(name, value); // LIVE validation
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowAlert(false);
    
    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (!formData[key].trim()) {
        newErrors[key] = "* This field is required";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API
      const apiData = {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone.startsWith('+') ? formData.phone : `+91-${formData.phone}`,
        subject: formData.subject,
        message: formData.message
      };

      // Send data to API
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/contact-us/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      const result = await response.json();
      
      // Show success message
      setApiResponse({
        success: true,
        message: "Your message has been sent successfully!"
      });
      setShowAlert(true);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
      setApiResponse({
        success: false,
        message: "Failed to send your message. Please try again later."
      });
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
        <div className='contact'>
                      <div className='site-breadcrumb-wpr'>
                        <h2 className='breadcrumb-title'>New Job Openings</h2>
                     <ul className='breadcrumb-menu clearfix'>
                <li>
                  <Link className="breadcrumb-home" to="/">Home</Link>
                </li>
              
                <li className='px-2'>/</li>
              
                <li>
                  <Link className="breadcrumb-about" to="/">FeedBack</Link>
                </li>
              </ul>
              
                      </div>
                    </div>
    <div className="ourteam-section">
      <Container>
        <div className="ourteam-box">
         
        </div>
      </Container>
       <Container fluid className="br-footer-box">
        
          <FooterPage />
      </Container>
    </div>
    </>
  );
}

export default Career;