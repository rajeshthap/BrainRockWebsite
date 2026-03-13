import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/KheloJito.css'; // Make sure the path is correct

function KheloJito() {
  // State to control the visibility of the modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State to hold the form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const navigate = useNavigate();

  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handler for input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handler for form submission
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    console.log('Payload submitted:', formData);
    
    // Clear form and close modal
    setFormData({ name: '', email: '', phone: '' });
    closeModal();
    
    // Redirect to test page
    navigate('/test');
  };

  return (
    <div>
      {/* Main Button to trigger the modal */}
      <div className="button-container-gradient">
        <button className="btn-gradient" onClick={openModal}>
          Regiter 
        </button>
      </div>

      {/* The Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} // Prevents modal from closing when clicking inside
          >
            <button className="close-button" onClick={closeModal}>X</button>
            <h2>Join the Game!</h2>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default KheloJito;