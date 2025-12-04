import React from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaYoutube } from 'react-icons/fa'
import Logogoogleimg from "../../assets/images/google-img.png";
import BrLogo from "../../assets/images/brainrock_logo.png"
import { TiSocialFacebook, TiSocialFacebookCircular } from "react-icons/ti";
import "../../assets/css/Footer.css";
import { MdKeyboardArrowRight } from "react-icons/md";
import { MdArrowForwardIos } from "react-icons/md";
import Logo from "../../assets/images/brainrock_logo.png";
import fImge from "../../assets/images/de-1.jpg";
import FImg1 from "../../assets/images/de-2.jpg";
import { Link } from 'react-router-dom';
function FooterPage() {
  return (
    <div>

      <Row className='g-5'>
        <Col lg={4} md={6} sm={6}>
          <div className='footer-widget about-us'>
           <Link to="/"> <div className='footer-logo mb-30'><img src={Logo} alt="logo" className="logo-wecd" /></div></Link>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod temp incididunt ut labore et dolore</p>
            <div className='subscribe-area'>
              <Form className=''>
                <span className='btn-shape'></span>
                <Form.Control type="email" placeholder="Enter email" className='input-style-4' />
                <button className='btn-subs'> <i><MdKeyboardArrowRight /></i></button>
              </Form>
            </div>
          </div>
          

        </Col>
        <Col lg={2} md={6} sm={6}>

          <div className='footer-widget footer-link'>

            <h4 className='footer-widget-title'>
           Important Links

              <span className='footer-title-line'></span>
            </h4>
            <ul className='footer-list'>

             <Link to="/CompanyProfile"> <li> <i><MdArrowForwardIos className='i-space' /></i>About Us</li></Link>
           <Link to="/OurTeam"> <li> <i><MdArrowForwardIos className='i-space' /></i>Meet Our Team</li></Link>  
             <Link to="/RunningProjects"> <li> <i><MdArrowForwardIos className='i-space' /></i>Our Projects</li></Link>   
          <Link to="/Contact"><li> <i><MdArrowForwardIos className='i-space' /></i>Contact us</li></Link>
            </ul>
          </div>

        </Col>
        <Col lg={3} md={6} sm={6}>
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
        <Col lg={3} md={6} sm={6}>

          <div className='footer-widget footer-link'>

            <h4 className='footer-widget-title'>
             Quick Links

              <span className='footer-title-line'></span>
            </h4>
            <ul className='footer-list'>

             <Link to="https://x.com/brainrockdotin"  target="_blank" 
  rel="noopener noreferrer"> <li> <i><MdArrowForwardIos className='i-space' /></i><i className='i-space'><FaTwitter/></i>@brainrockdotin</li></Link>
            <Link to="https://www.facebook.com/BrainRock.in"  target="_blank" 
  rel="noopener noreferrer">  <li> <i><MdArrowForwardIos className='i-space' /></i><i className='i-space'><FaFacebookF /></i>@BrainRock.in</li></Link> 
              <Link to="https://brainrock.in/index.php#"  target="_blank" 
  rel="noopener noreferrer"> <li> <i><MdArrowForwardIos className='i-space' /></i><i className='i-space'><FaYoutube/></i>@brainrockdotin</li></Link> 
             <Link to="https://www.instagram.com/brain_rockdotin/"  target="_blank" 
  rel="noopener noreferrer">  <li> <i><MdArrowForwardIos className='i-space' /></i><i className='i-space'><FaInstagram /></i>@Brain_rockdotin</li></Link> 
            <Link to="https://www.linkedin.com/in/brain-rock-377a69168/"  target="_blank" 
  rel="noopener noreferrer">  <li> <i><MdArrowForwardIos className='i-space' /></i><i className='i-space'><FaLinkedinIn /></i>@brain-rock</li></Link> 





            </ul>

          </div>


        </Col>
      </Row>




    </div>
  )
}

export default FooterPage