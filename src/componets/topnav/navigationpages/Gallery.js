import React from 'react'
import { Container, Row } from 'react-bootstrap'
import "../../../assets/css/course.css";

function Gallery() {
  return (
    <div className="ourteam-section">
      <Container className='ourteam-box'>
        <Row className='mt-5'>
          <div className='our-heading-team'>
            <h1>OUR Gallery</h1>
            <section className="our-team-section">
              <div className="container">
                <Row>
                  <div className="col-lg-3 col-md-6 col-sm-6">
                    <div className="our-our-teams">
                      <div className="pic">
                        <img
                          src="https://i.ibb.co/8x9xK4H/team.jpg"
                          alt="team"
                        />
                      </div>

                      <div className="team-content">
                        <h3 className="title">Deepika Chauhan</h3>
                        <span className="post">React.js</span>
                      </div>

                    </div>
                  </div>
                </Row>
              </div>
            </section>

          </div>
        </Row>
      </Container>
    </div>
  )
}

export default Gallery
