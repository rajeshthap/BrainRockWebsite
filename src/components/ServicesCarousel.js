import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Carousel, Row, Col } from "react-bootstrap";
import Slider1 from "../assets/images/slider1.png";
import Slider2 from "../assets/images/slider2.png";
import Slider3 from "../assets/images/slider1.png"
import "../../src/assets/css/section.css";

const ServicesCarousel = () => {
  const slides = [
    [
      {
        img: Slider1,
        title: "Mobile App Development",
        desc: `We design and build high-performing, user-friendly mobile apps tailored to your business needs, ensuring seamless experiences across Android and iOS platforms.`
      },
      {
        img: Slider2,
        title: "Web Design & Development",
        desc: `We craft visually stunning, responsive, and user-friendly websites that drive engagement and deliver seamless digital experiences.`
      },
      {
        img: Slider3,
        title: "Software Testing Service",
        desc: `We ensure your software is bug-free, reliable, and high-performing with our comprehensive testing services.`
      }
    ],
    [
      {
        img: Slider1,
        title: "Mobile App Development",
        desc: `We design and build high-performing, user-friendly mobile apps tailored to your business needs, ensuring seamless experiences across Android and iOS platforms.`
      },
      {
        img: Slider2,
        title: "Web Design & Development",
        desc: `We craft visually stunning, responsive, and user-friendly websites that drive engagement and deliver seamless digital experiences.`
      },
      {
        img: Slider3,
        title: "Software Testing Service",
        desc: `We ensure your software is bug-free, reliable, and high-performing with our comprehensive testing services.`
      }
    ]
  ];

  return (
    <div className="container-fluid br-head-box py-5">
      <h1 className="text-center mb-4">Services we offer</h1>
      <Carousel
        indicators={false}
        controls={true}
        interval={3000}
        pause={false}
      >
        {slides.map((slide, idx) => (
          <Carousel.Item key={idx}>
            <Row className="justify-content-center d-flex">
              {slide.map((card, i) => (
                <Col
                  md={4}
                  sm={12}
                  key={i}
                  className="mb-3 d-flex"
                >
                  <div className="service-card p-3 border rounded shadow-sm flex-fill text-center">
                    <img
                      src={card.img}
                      alt={card.title}
                      className="img-fluid mobile-app-img mb-3"
                    />
                    <h4>{card.title}</h4>
                    <p>{card.desc}</p>
                  </div>
                </Col>
              ))}
            </Row>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default ServicesCarousel;
