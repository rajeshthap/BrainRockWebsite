import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import "../../../assets/css/aboutus.css";
import FooterPage from '../../footer/FooterPage';
import { Link } from 'react-router-dom';

function OurTeam() {
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

        let teamData = [];
        if (Array.isArray(data)) {
          teamData = data;
        } else if (data && Array.isArray(data.data)) {
          teamData = data.data;
        } else if (data && Array.isArray(data.results)) {
          teamData = data.results;
        } else if (data && typeof data === 'object') {
          teamData = [data];
        }

        const BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";
        const membersWithFullImageUrl = teamData.map(member => ({
          ...member,
          image: member.image ? `${BASE_URL}${member.image}` : null
        }));

        setTeamMembers(membersWithFullImageUrl);
      } catch (err) {
        setError(err.message);
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const defaultImage = "https://i.ibb.co/8x9xK4H/team.jpg";

  return (
    <div className="ourteam-section">

      <div className='team-banner'>
        <div className='site-breadcrumb-wpr'>
          <h2 className='breadcrumb-title'>Our Teams</h2>
          <ul className='breadcrumb-menu clearfix'>
            <li>
              <Link className="breadcrumb-home" to="/">Home</Link>
            </li>

            <li className='px-2'>/</li>

            <li>
              <Link className="breadcrumb-about" to="/">Team</Link>
            </li>
          </ul>

        </div>
      </div>
      <Container className='ourteam-box mt-4 mb-3'>


        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <Spinner animation="border" />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <section className="our-team-section  ">
            <div className="container">
              <Row className="justify-content-center">

                {teamMembers.length > 0 ? (
                  teamMembers.map((member, index) => (
                    <Col key={index} lg={3} md={6} sm={6} className="mb-4">
                      <div className="team-card">
                        <div className="team-card-img">
                          <img
                            src={member.image || defaultImage}
                            alt={member.full_name || "Team Member"}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = defaultImage;
                            }}
                          />

                          {/* Hover Overlay for Social Icons */}
                          <div className="team-overlay">
                            <ul className="team-social">
                              <li><a href="#"><i className="fab fa-twitter"></i></a></li>
                              <li><a href="#"><i className="fab fa-facebook-f"></i></a></li>
                              <li><a href="#"><i className="fab fa-linkedin-in"></i></a></li>
                              <li><a href="#"><i className="fab fa-instagram"></i></a></li>
                            </ul>
                          </div>
                        </div>

                        <div className="team-card-info">
                          <h3>{member.full_name}</h3>
                          <p>{member.designation}</p>
                        </div>
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
      </Container>

      <Container fluid className="br-footer-box">
        <FooterPage />
      </Container>
    </div>
  );
}

export default OurTeam;
