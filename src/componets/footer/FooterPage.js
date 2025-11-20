import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa'
import Logogoogleimg from "../../assets/images/google-img.png";
import BrLogo from "../../assets/images/brainrock_logo.png"
import { TiSocialFacebook, TiSocialFacebookCircular } from "react-icons/ti";
import "../../assets/css/Footer.css";

function FooterPage() {
  return (
    <div>

      <Row className='g-5'>
        <Col lg={4} md={6} sm={6}>

          <div className='footer-widget about-us'>

            <div className='footer-logo mb-30'></div>
            <p>saSASASASA</p>
            <div className='subscribe-area'>



            </div>

          </div>


        </Col>
        <Col lg={2} md={6} sm={6}>1</Col>
        <Col lg={4} md={6} sm={6}>1</Col>
        <Col lg={2} md={6} sm={6}>1</Col>
      </Row>


      <Row className=' p-4'>
        <Col lg={3} md={3} sm={12} className='br-footer-details'>
          <div>
            <img src={BrLogo} alt="br-logo" className='img-fluid google-img'></img>
          </div>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>

          <div>
            <img src={Logogoogleimg} alt="logo" className='img-fluid google-img'></img>
          </div>
        </Col>
        <Col lg={3} md={3} sm={12} className='footer-li'>
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

            <TiSocialFacebook className='footer-icon' />
            <FaInstagram className='footer-icon' />
            <FaTwitter className='footer-icon' />
            <FaLinkedinIn className='footer-icon' />
          </div>
        </Col>


      </Row>

    </div>
  )
}

export default FooterPage