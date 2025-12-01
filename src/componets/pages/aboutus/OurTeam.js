import React from 'react';
import { Container, Row } from 'react-bootstrap';
import "../../../assets/css/aboutus.css";

function OurTeam() {
  return (
    <div className="ourteam-section">
      <Container>
        <div className="ourteam-box">
           <Row className='mt-5'>
          <div >
            <h1> OUR Team</h1>
             <section className="our-team-section">
      <div className="container">
        <Row>
          <div className="col-lg-3 col-md-6 col-sm-6">
            <div className="our-team ">
              <div className="pic">
                <img 
                  src="https://i.ibb.co/8x9xK4H/team.jpg" 
                  alt="team"
                />
              </div>

              <div className="team-content">
                <h3 className="title">Team 1</h3>
                <span className="post">Inhaber & Geschäftsführer</span>
              </div>

              <ul className="social">
                <li>
                  <a href="#" target="_blank" rel="noopener noreferrer" className="fa fa-facebook"></a>
                </li>
                <li>
                  <a href="#" className="fa fa-twitter"></a>
                </li>
                <li>
                  <a href="#" className="fa fa-google-plus"></a>
                </li>
                <li>
                  <a href="#" className="fa fa-linkedin"></a>
                </li>
              </ul>
            </div>
          </div>
        </Row>
      </div>
    </section>

          </div>
        </Row>
        
        </div>
      </Container>
    </div>
  );
}

export default OurTeam;
