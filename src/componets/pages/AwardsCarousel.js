import React, { useState, useEffect } from 'react';
import "../../assets/css/section.css";
import { Container } from 'react-bootstrap';

const AwardsCarousel = () => {
  // State for storing awards data
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Base URL for images
  const BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";

  // Fetch awards from API
  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/award-items/');
        
        if (!response.ok) {
          throw new Error('Failed to fetch awards');
        }
        
        const apiResponse = await response.json();
        
        // Extract the data array from the response
        if (apiResponse.success && apiResponse.data) {
          // Transform the API data to match the expected structure
          const transformedAwards = apiResponse.data.map(award => ({
            id: award.id,
            title: award.title,
            description: award.description,
            image: award.image ? `${BASE_URL}${award.image}` : null
          }));
          
          setAwards(transformedAwards);
        } else {
          throw new Error('Invalid API response structure');
        }
        
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchAwards();
  }, []);

  // If still loading, show a loading message
  if (loading) {
    return (
      <Container fluid className='mt-4 Service-bg-img'>
        <div className="sme-container pt-3">
          <div className="text-center">
            <h1 className=" hero-sub-title1 ">
              Brainrock <br></br>
              <span className="br-span-list mt-3">Experience</span>
            </h1>
          </div>
          <div className="text-center mt-5">
            <p>Loading awards...</p>
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
              Brainrock <br></br>
              <span className="br-span-list mt-3">Experience</span>
            </h1>
          </div>
          <div className="text-center mt-5">
            <p>Error loading awards: {error}</p>
          </div>
        </div>
      </Container>
    );
  }

  // If no awards are available
  if (awards.length === 0) {
    return (
      <Container fluid className='mt-4 Service-bg-img'>
        <div className="sme-container pt-3">
          <div className="text-center">
            <h1 className=" hero-sub-title1 ">
              Brainrock <br></br>
              <span className="br-span-list mt-3">Experience</span>
            </h1>
          </div>
          <div className="text-center mt-5">
            <p>No awards available at the moment.</p>
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
            Brainrock <br></br>
            <span className="br-span-list mt-3">Experience</span>
          </h1>
        </div>

        <div className="scroll-container">
          <div className="scroll-track">
            {/* Display awards */}
            {awards.map((award) => (
              <div key={award.id} className="industry-box">
                <div className="industry-icon industry-icon-red img-fluid rounded-circle">
                  {award.image ? (
                    <img 
                      src={award.image} 
                      alt={award.title} 
                      className="img-fluid" 
                      style={{ 
                        borderRadius: '50%', 
                        width: '100%', 
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div 
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f0f0f0',
                        color: '#999',
                        fontSize: '14px'
                      }}
                    >
                      No Image
                    </div>
                  )}
                </div>
                <span>{award.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default AwardsCarousel;
