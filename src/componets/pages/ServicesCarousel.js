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

    



  ];

  return (
    <div className="sme-container">
      <h2 className="sme-title">Built for SMEs in India</h2>

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
    </div>
  );
};

export default ServicesCarousel;