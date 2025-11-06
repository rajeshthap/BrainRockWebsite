import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Carousel } from "react-bootstrap";
import "../../assets/css/section.css";
import Customer1 from "../../assets/images/women.jpg";
import { FaStar } from "react-icons/fa";

const TestimonialCarousel = () => {
  return (
    <>
      <section className="testimonial_section">
        <div className="container">
          <div className="row">
            <div className="col-lg-7">
              <div className="about_content">
                <div className="background_layer"></div>
                <div className="layer_content">
                  <div className="section_title">
                    <h2>
                      Why customers love<strong>Cworking with us</strong>
                    </h2>
                    <div className="heading_line">
                      <span></span>
                    </div>
                    <p>
                      Without any doubt I recommend Alcaline Solutions as one of
                      the best web design and digital marketing agencies. One of
                      the best agencies I’ve came across so far. Wouldn’t be
                      hesitated to introduce their work to someone else.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="testimonial_box">
                <div className="testimonial_container">
                  <div className="background_layer"></div>
                  <div className="layer_content">
                    {/* React-Bootstrap Carousel */}
                    <Carousel
                      indicators={false}
                      controls={true}
                      interval={3000}
                      className="testimonial_owlCarousel owl-carousel"
                    >
                      <Carousel.Item>
                        <div className="testimonials">
                          <div className="testimonial_content">
                            <div className="testimonial_caption">
                              <div className="star-rating">
                                {[...Array(5)].map((_, index) => (
                                  <FaStar
                                    key={index}
                                    className="star-rating-icon"
                                  />
                                ))}
                              </div>
                              <h6>Imran Khan</h6>
                              <span>Software Engineer</span>
                            </div>
                            <p>
                              The team at Tectxon industry is very talented,
                              dedicated, well organized and knowledgeable. I was
                              most satisfied with the quality of the
                              workmanship. They did excellent work.
                            </p>
                          </div>
                          <div className="images_box">
                            <div className="testimonial_img">
                              <img
                                className="img-center"
                                src={Customer1}
                                alt="images not found"
                              />
                            </div>
                          </div>
                        </div>
                      </Carousel.Item>

                      <Carousel.Item>
                        <div className="testimonials">
                          <div className="testimonial_content">
                            <div className="testimonial_caption">
                              <div className="star-rating">
                                {[...Array(5)].map((_, index) => (
                                  <FaStar
                                    key={index}
                                    className="customer-icon"
                                  />
                                ))}
                              </div>
                              <h6>Robert Clarkson</h6>
                              <span>Web Devloper</span>
                            </div>
                            <p>
                              The team at Tectxon industry is very talented,
                              dedicated, well organized and knowledgeable. I was
                              most satisfied with the quality of the
                              workmanship. They did excellent work.
                            </p>
                          </div>
                          <div className="images_box">
                            <div className="testimonial_img">
                              <img
                                className="img-center img-fluid"
                                src={Customer1}
                                alt="images not found"
                              />
                            </div>
                          </div>
                        </div>
                      </Carousel.Item>

                      <Carousel.Item>
                        <div className="testimonials">
                          <div className="testimonial_content">
                            <div className="testimonial_caption">
                              <div className="star-rating">
                                {[...Array(5)].map((_, index) => (
                                  <FaStar
                                    key={index}
                                    className="customer-icon"
                                  />
                                ))}
                              </div>
                              <h6>Robert Clarkson</h6>
                            <span>Front End Devloper</span>
                            </div>
                            <p>
                              The team at Tectxon industry is very talented,
                              dedicated, well organized and knowledgeable. I was
                              most satisfied with the quality of the
                              workmanship. They did excellent work.
                            </p>
                          </div>
                          <div className="images_box">
                            <div className="testimonial_img">
                              <img
                                className="img-center img-fluid"
                                src={Customer1}
                                alt="images not found"
                              />
                            </div>
                          </div>
                        </div>  
                      </Carousel.Item>
                      <Carousel.Item>
                        <div className="testimonials">
                          <div className="testimonial_content">
                            <div className="testimonial_caption">
                              <div className="star-rating">
                                {[...Array(5)].map((_, index) => (
                                  <FaStar
                                    key={index}
                                    className="customer-icon"
                                  />
                                ))}
                              </div>
                              <h6>Robert Clarkson</h6>
                              <span>CEO, Axura</span>
                            </div>
                            <p>
                              The team at Tectxon industry is very talented,
                              dedicated, well organized and knowledgeable. I was
                              most satisfied with the quality of the
                              workmanship. They did excellent work.
                            </p>
                          </div>
                          <div className="images_box">
                            <div className="testimonial_img">
                              <img
                                className="img-center img-fluid"
                                src={Customer1}
                                alt="images not found"
                              />
                            </div>
                          </div>
                        </div>
                      </Carousel.Item>
                      <Carousel.Item>
                        <div className="testimonials">
                          <div className="testimonial_content">
                            <div className="testimonial_caption">
                              <div className="star-rating">
                                {[...Array(5)].map((_, index) => (
                                  <FaStar
                                    key={index}
                                    className="customer-icon"
                                  />
                                ))}
                              </div>
                              <h6>Robert Clarkson</h6>
                              <span>CEO, Axura</span>
                            </div>
                            <p>
                              The team at Tectxon industry is very talented,
                              dedicated, well organized and knowledgeable. I was
                              most satisfied with the quality of the
                              workmanship. They did excellent work.
                            </p>
                          </div>
                          <div className="images_box">
                            <div className="testimonial_img">
                              <img
                                className="img-center img-fluid"
                                src={Customer1}
                                alt="images not found"
                              />
                            </div>
                          </div>
                        </div>
                      </Carousel.Item>
                    </Carousel>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------- Second Section (with Row/Col) -------- */}
    </>
  );
};

export default TestimonialCarousel;
