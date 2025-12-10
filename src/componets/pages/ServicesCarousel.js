import React, { useState, useEffect } from 'react';
import "../../assets/css/section.css";
import { Container } from 'react-bootstrap';

const ServicesCarousel = () => {
  // State for storing services data
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Base URL for images
  const BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/innovative-service-items/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const apiResponse = await response.json();
        
        // Extract the data array from the response
        if (apiResponse.success && apiResponse.data) {
          // Transform the API data to match the expected structure
          const transformedServices = apiResponse.data.map(service => ({
            name: service.title,
            icon: <img src={`${BASE_URL}${service.icon}`} alt={service.title} className="img-fluid" />
          }));
          
          setServices(transformedServices);
        } else {
          throw new Error('Invalid API response structure');
        }
        
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // If still loading, show a loading message
  if (loading) {
    return (
      <Container fluid className='mt-4 Service-bg-img'>
        <div className="sme-container pt-3">
          <div className="text-center">
            <h1 className=" hero-sub-title1 ">
              Innovative <br></br>
              <span className="br-span-list mt-3">Service Offerings</span>
            </h1>
          </div>
          <div className="text-center mt-5">
            <p>Loading services...</p>
          </div>
        </div>
      </Container>
    );
  }

  // If there's an error, show an error message
  if (error) {
    return (
      <Container fluid className='mt-4 Service-bg-img'>
        <div className="sme-container pt-3">
          <div className="text-center">
            <h1 className=" hero-sub-title1 ">
              Innovative <br></br>
              <span className="br-span-list mt-3">Service Offerings</span>
            </h1>
          </div>
          <div className="text-center mt-5">
            <p>Error loading services: {error}</p>
          </div>
        </div>
      </Container>
    );
  }

  // If no services are available
  if (services.length === 0) {
    return (
      <Container fluid className='mt-4 Service-bg-img'>
        <div className="sme-container pt-3">
          <div className="text-center">
            <h1 className=" hero-sub-title1 ">
              Innovative <br></br>
              <span className="br-span-list mt-3">Service Offerings</span>
            </h1>
          </div>
          <div className="text-center mt-5">
            <p>No services available at the moment.</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className='mt-4 Service-bg-img'>
      <div className="sme-container pt-3">
        <div className="text-center">
          <h1 className=" hero-sub-title1 ">
            Innovative <br></br>
            <span className="br-span-list mt-3">Service Offerings</span>
          </h1>
        </div>

        <div className="scroll-container">
          <div className="scroll-track">
            {/* First set of services */}
            {services.map((service, index) => (
              <div key={index} className="industry-box">
                <div className="industry-icon industry-icon-red img-fluid rounded-circle">{service.icon}</div>
                <span>{service.name}</span>
              </div>
            ))}

            
          </div>
        </div>
      </div>
    </Container>
  );
};

export default ServicesCarousel;