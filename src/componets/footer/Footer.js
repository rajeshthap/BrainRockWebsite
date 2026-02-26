import React from 'react'
import { Col, Container } from "react-bootstrap";
import { Link } from 'react-router-dom';
import "../../assets/css/Footer.css";

function Footer() {
  return (
    <>
      <Container>
        <div>
          <Col className='awc-footer-main '>
            <p>
              © 2025-26 Brainrock Consulting Services, All Right Reserved  
              <br />
              <Link to="/https://www.brainrock.in/" target="_blank">
                Designed By Brainrock
              </Link>
              {" | "}
              <Link to="/Terms" className='term'>
                Terms & Conditions
              </Link>
            </p>
          </Col>
        </div>
      </Container>
    </>
  )
}

export default Footer