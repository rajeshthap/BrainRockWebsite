import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Carousel } from "react-bootstrap";
import "../../assets/css/section.css";
import Customer1 from "../../assets/images/women.jpg";
import { FaStar } from "react-icons/fa";

const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Marketing Director",
      company: "TechCorp Inc.",
      text: "This service transformed our workflow. The team's attention to detail and innovative solutions exceeded our expectations.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Product Manager",
      company: "InnovateLab",
      text: "Outstanding results from day one. The intuitive interface and powerful features helped us launch 3 months ahead of schedule.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      role: "CEO",
      company: "StartupHub",
      text: "The perfect solution for our growing business. Scalable, reliable, and backed by exceptional customer support.",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ];


const TestimonialCarousel = () => {
  return (
    <>
      <section className="testimonial-section">
      <div className="container">
        <h2 className="section-title">What Our Clients Say</h2>
        <div className="testimonial-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-content">
                <div className="quote-icon">❝</div>
                <p className="testimonial-text">{testimonial.text}</p>
              </div>
              <div className="testimonial-author">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="author-avatar"
                />
                <div className="author-info">
                  <h4 className="author-name">{testimonial.name}</h4>
                  <p className="author-role">{testimonial.role}</p>
                  <p className="author-company">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

      {/* -------- Second Section (with Row/Col) -------- */}
    </>
  );
};

export default TestimonialCarousel;
