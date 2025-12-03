import React from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import { FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa'
import Logogoogleimg from "../../assets/images/google-img.png";
import BrLogo from "../../assets/images/brainrock_logo.png"
import { TiSocialFacebook, TiSocialFacebookCircular } from "react-icons/ti";
import "../../assets/css/Footer.css";
import { MdKeyboardArrowRight } from "react-icons/md";
import { MdArrowForwardIos } from "react-icons/md";
import Logo from "../../assets/images/brainrock_logo.png";
import fImge from "../../assets/images/de-1.jpg";
import FImg1 from "../../assets/images/de-2.jpg";
function FooterPage() {
  return (
    <div>

      <Row className='g-5'>
        <Col lg={4} md={6} sm={6}>

          <div className='footer-widget about-us'>

            <div className='footer-logo mb-30'><img src={Logo} alt="logo" className="logo-wecd" /></div>

            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temp incididunt ut labore et dolore</p>

            <div className='subscribe-area'>
              <Form className=''>
                <span className='btn-shape'></span>
                <Form.Control type="email" placeholder="Enter email" className='input-style-4' />
                <button className='btn-subs'> <i><MdKeyboardArrowRight /></i></button>
              </Form>

            </div>

          </div>
          <div className='mt-3'>

            <TiSocialFacebook className='footer-icon' />
            <FaInstagram className='footer-icon' />
            <FaTwitter className='footer-icon' />
            <FaLinkedinIn className='footer-icon' />
          </div>

        </Col>
        <Col lg={2} md={6} sm={6}>

          <div className='footer-widget footer-link'>

            <h4 className='footer-widget-title'>
              Important Links

              <span className='footer-title-line'></span>
            </h4>
            <ul className='footer-list'>

              <li> <i><MdArrowForwardIos className='i-space' /></i>About Us</li>
              <li> <i><MdArrowForwardIos className='i-space' /></i>Meet Our Team</li>
              <li> <i><MdArrowForwardIos className='i-space' /></i>Our Projects</li>
              <li> <i><MdArrowForwardIos className='i-space' /></i>News & Media</li>
              <li> <i><MdArrowForwardIos className='i-space' /></i>Contact us</li>

            </ul>

          </div>


        </Col>
        <Col lg={4} md={6} sm={6}>
          <div className='footer-widget footer-recent-post'>
            <h4 className='footer-widget-title'>
              Working Hours

              <span className='footer-title-line'></span>
            </h4>
            <div className='recent-post-wrp'>
              <div className='footer-recent-post-single'>

                <div className='recent-post-pic'> <img src={fImge} alt="fImge" className="" /></div>

                <div className='recent-post-desc'>
                  <h5>
                    Fruitcake cotton candy<br></br>
                    wafer pudding
                  </h5>
                  <span className='recent-post-date'>17 April 2023</span>
                </div>
              </div>
            </div>
            <div className='recent-post-wrp'>
              <div className='footer-recent-post-single'>

                <div className='recent-post-pic'> <img src={FImg1} alt="FImg1" className="" /></div>

                <div className='recent-post-desc'>
                  <h5>
                    Muffin apple pie tootsie
                    <br></br>
                    sweet cotton roll
                  </h5>
                  <span className='recent-post-date'>18 April 2023</span>
                </div>
              </div>
            </div>
          </div>



        </Col>
        <Col lg={2} md={6} sm={6}>

          <div className='footer-widget footer-link'>

            <h4 className='footer-widget-title'>
              IT Services

              <span className='footer-title-line'></span>
            </h4>
            <ul className='footer-list'>

              <li> <i><MdArrowForwardIos className='i-space' /></i>Web Design</li>
              <li> <i><MdArrowForwardIos className='i-space' /></i>It Services</li>
              <li> <i><MdArrowForwardIos className='i-space' /></i>Industries Services</li>
              <li> <i><MdArrowForwardIos className='i-space' /></i>Feature Box</li>
              <li> <i><MdArrowForwardIos className='i-space' /></i>Tab Service</li>





            </ul>

          </div>


        </Col>
      </Row>




    </div>
  )
}

export default FooterPage