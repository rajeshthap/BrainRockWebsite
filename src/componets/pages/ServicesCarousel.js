import React from 'react';
import "../../assets/css/section.css";
import DevelopmentIcon from '../../assets/images/Development-icon.png';
import CloudIcon from '../../assets/images/cloud-icon.png'
import StrategyIcon from '../../assets/images/Strategy-icon.png'
import MobileIcon from '../../assets/images/mobile-icon.png'
import UIUXIcon from '../../assets/images/ui-icon.png'
import CybersecurityIcon from '../../assets/images/Cybersecurity-icon.png'
import InfrastructureIcon from '../../assets/images/IT-icon.png'
import DataServicesIcon from '../../assets/images/DataServices-icon.png'
import DigitalMarketingsIcon from '../../assets/images/DigitalMarketing-icon.png'
import ManagedITServicesIcon from '../../assets/images/ManagedITServicesIcon-icon.png'
import TestingIcon from '../../assets/images/qa-icon.png'
import ITTraningIcon from '../../assets/images/traning-icon.png'
import { Container } from 'react-bootstrap';
const ServicesCarousel = () => {
  const industries = [
    {
      name: "Software Development Services",
      icon: <img src={DevelopmentIcon} alt="DevelopmentIcon" className="img-fluid" />
    },

    {
      name: "Cloud Services",
      icon: <img src={CloudIcon} alt="CloudIcon" className="img-fluid" />
    },

    {
      name: "IT Consulting & Strategy",
      icon: <img src={StrategyIcon} alt="StrategyIcon" className="img-fluid" />
    },
    {
      name: "Mobile App Development",
      icon: <img src={MobileIcon} alt="MobileIcon" className="img-fluid" />
    },

    {
      name: "Website & UI/UX Services",
      icon: <img src={UIUXIcon} alt="UIUXIcon" className="img-fluid" />
    },

    {
      name: "Cybersecurity Services",
      icon: <img src={CybersecurityIcon} alt="CybersecurityIcon" className="img-fluid" />
    },

    {
      name: "IT Infrastructure Management",
      icon: <img src={InfrastructureIcon} alt="InfrastructureIcon" className="img-fluid" />
    },

    {
      name: "Data & Analytics Services",
      icon: <img src={DataServicesIcon} alt="DataServicesIcon" className="img-fluid" />
    },

    {
      name: "Digital Marketing Services",
      icon: <img src={DigitalMarketingsIcon} alt="DigitalMarketingsIcon" className="img-fluid" />
    },
    {
      name: "Managed IT Services",
      icon: <img src={ManagedITServicesIcon} alt="ManagedITServicesIcon" className="img-fluid" />
    },

    {
      name: "QA & Testing Services",
      icon: <img src={TestingIcon} alt="TestingIcon" className="img-fluid" />
    },
    {
      name: "IT Software Training & Development",
      icon: <img src={ITTraningIcon} alt="ITTraningIcon" className="img-fluid" />
    },



  ];

  return (

    <Container fluid className='mt-4'>
      <div className="sme-container mt-4 mb-5 pt-3">
        <div className="text-center">
          <h1 className=" hero-sub-title">
            Innovative <br></br>
            <span className="br-span-list mt-3">Service Offerings</span>
          </h1>
        </div>

        <div className="scroll-container">
          <div className="scroll-track">
            {/* First set of industries */}
            {industries.map((industry, index) => (
              <div key={index} className="industry-box">
                <div className="industry-icon">{industry.icon}</div>
                <span>{industry.name}</span>
              </div>
            ))}

            {/* Duplicate set for seamless looping */}
            {industries.map((industry, index) => (
              <div key={`duplicate-${index}`} className="industry-box">
                <div className="industry-icon">{industry.icon}</div>
                <span>{industry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div></Container>
  );
};

export default ServicesCarousel;