import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import "../../assets/css/aboutus.css";

function ServicesPage() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/ourteam-items/');
        if (!response.ok) {
          throw new Error('Failed to fetch team members');
        }
        const data = await response.json();
        
        // Debug: Log the actual response
        console.log('API Response:', data);
        
        // Handle different response formats
        let teamData = [];
        if (Array.isArray(data)) {
          // If data is already an array
          teamData = data;
        } else if (data && Array.isArray(data.data)) {
          // If data has a 'data' property that's an array
          teamData = data.data;
        } else if (data && Array.isArray(data.results)) {
          // If data has a 'results' property that's an array (common in DRF)
          teamData = data.results;
        } else if (data && typeof data === 'object') {
          // If it's a single object, wrap it in an array
          teamData = [data];
        } else {
          console.warn('Unexpected data format:', data);
          teamData = [];
        }
        
        // Prepend base URL to image paths
        const BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";
        const membersWithFullImageUrl = teamData.map(member => ({
          ...member,
          image: member.image ? `${BASE_URL}${member.image}` : null
        }));
        
        setTeamMembers(membersWithFullImageUrl);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError(err.message);
        // Ensure teamMembers remains an array even on error
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  // Default image if team member image is null
  const defaultImage = "https://i.ibb.co/8x9xK4H/team.jpg";

  return (
    <div className="ourteam-section">
      <Container>
        <div className="ourteam-box">
          <Row className='mt-5'>
            <div className='our-heading-team'>
              <h1>OUR Services</h1>
            </div>
          </Row>

          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" />
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <section className="our-team-section">
              <div className="container">
                <Row>
                  {Array.isArray(teamMembers) && teamMembers.length > 0 ? (
                    teamMembers.map((member, index) => (
                      <Col key={member.id || index} className="col-lg-3 col-md-6 col-sm-6 mb-4">
                        <div className="our-team">
                          <div className="pic">
                            <img 
                              src={member.image || defaultImage} 
                              alt={member.full_name || 'Team member'}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = defaultImage;
                              }}
                            />
                          </div>

                          <div className="team-content">
                            <h3 className="title">{member.full_name || 'Team Member'}</h3>
                            <span className="post">{member.designation || 'Team Member'}</span>
                          </div>

                          <ul className="social">
                            {member.facebook_profile_link && (
                              <li>
                                <a 
                                  href={member.facebook_profile_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="fa fa-facebook"
                                ></a>
                              </li>
                            )}
                            {member.x_profile_link && (
                              <li>
                                <a 
                                  href={member.x_profile_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="fa fa-twitter"
                                ></a>
                              </li>
                            )}
                            {member.instagram_profile_link && (
                              <li>
                                <a 
                                  href={member.instagram_profile_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="fa fa-instagram"
                                ></a>
                              </li>
                            )}
                            {member.linkedinn_profile_link && (
                              <li>
                                <a 
                                  href={member.linkedinn_profile_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="fa fa-linkedin"
                                ></a>
                              </li>
                            )}
                          </ul>
                        </div>
                      </Col>
                    ))
                  ) : (
                    <Col xs={12} className="text-center">
                      <p>No team members found.</p>
                    </Col>
                  )}
                </Row>
              </div>
            </section>
          )}
        </div>
      </Container>
    </div>
  );
}

export default ServicesPage;