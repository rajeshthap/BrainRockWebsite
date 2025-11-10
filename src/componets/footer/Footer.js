import React from 'react'
import { Col, Container, Row } from "react-bootstrap";
import BrLogo from "../../assets/images/brainrock_logo.png"
import Logogoogleimg from "../../assets/images/google-img.png"
import { Link } from 'react-router-dom';
import "../../assets/css/Footer.css";
import { FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { TiSocialFacebook } from 'react-icons/ti';
function Footer() {
  return (
    <>
    <Container>
{/* <Row className='br-footer-box p-4'>
  <Col lg={3} md={3} sm={12} className='br-footer-details'>
  <div>
    <img src={BrLogo} alt="br-logo" className='img-fluid google-img'></img>
  </div>
  <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
 
   <div>
    <img src={Logogoogleimg} alt="logo" className='img-fluid google-img'></img>
  </div>
   </Col>
    <Col lg={3} md={3} sm={12}>
  <div className="br-footer-heading">
    <h4 className=''>Link</h4>
  </div>
  <ul type="none">
    <li>About Us</li>
    <li>services</li>
    <li>Case Studies</li>
    <li>How it Work</li>
    <li>Blog</li>
    <li>Careers</li>
    <li>Areas We Serve</li>
  </ul>
 
  
   </Col>
    <Col lg={3} md={3} sm={12} className="br-footer-details">
  <div className="br-footer-heading">
<h4>Our Head Office</h4>
  </div>
  <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
 
  <p>+91-8193991148<br></br> admin@brainrock.in</p>
 
   </Col>
    <Col lg={3} md={3} sm={12}>
 <div>

  <TiSocialFacebook  className='footer-icon'/>
  <FaInstagram className='footer-icon'/>
  <FaTwitter className='footer-icon'/>
  <FaLinkedinIn className='footer-icon'/>
 </div>
   </Col>

   
</Row> */}
      <div >

        <Col className='awc-footer-main '>
          <p>© 2025 Brainrock Consulting Services, All Right Reserved  <br /> <Link to="/https://www.brainrock.in/" target="_blank">Designed By Brainrock</Link></p>

        </Col>

      </div>
</Container>
    </>
  )
}

export default Footer