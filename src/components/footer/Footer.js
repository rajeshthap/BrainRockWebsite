import React from 'react'
import { Col } from "react-bootstrap";

import { Link } from 'react-router-dom';
import "../../assets/css/Footer.css";
function Footer() {
  return (
    <>

      <div >

        <Col className='awc-footer-main '>
          <p>© 2025 Uttarakhand State Resource Center for Children. All Rights Reserved  <br /> <Link to="/https://www.brainrock.in/" target="_blank">Designed By Brainrock</Link></p>

        </Col>

      </div>

    </>
  )
}

export default Footer