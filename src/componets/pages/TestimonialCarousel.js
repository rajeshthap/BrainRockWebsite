import React, { useState, useEffect } from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/css/section.css";
const TestimonialCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      position: "CEO, TechStart Inc.",
      content: "This product has completely transformed our business. The team's attention to detail and customer service is unmatched. I would highly recommend them to anyone looking for quality solutions.",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "Marketing Director",
      content: "Working with this team has been an absolute pleasure. They delivered beyond our expectations and helped us achieve our goals ahead of schedule. Truly professional and innovative.",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      position: "Product Manager",
      content: "The level of expertise and dedication shown by this team is exceptional. They understood our needs perfectly and provided solutions that exceeded our expectations.",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg"
    },
    {
      id: 4,
      name: "David Thompson",
      position: "CTO, InnovateCo",
      content: "I've worked with many teams over the years, but none have delivered the quality and reliability that this team consistently provides. They're now our go-to partner for all our technical needs.",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Autoplay functionality
  useEffect(() => {
    let interval;
    if (autoplay) {
      interval = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoplay]);

  // Pause autoplay when user interacts with the slider
  const handleInteraction = () => {
    setAutoplay(false);
    setTimeout(() => setAutoplay(true), 10000); // Resume after 10 seconds of inactivity
  };

  return (
    <div className="testimonial-container">
      <h2 className="testimonial-heading">What Our Clients Say</h2>
      
      <div 
        className="testimonial-slider"
        onMouseEnter={handleInteraction}
        onTouchStart={handleInteraction}
      >
        <div className="testimonial-wrapper">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className={`testimonial-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <div className="testimonial-content">
                <div className="testimonial-text">
                  <p>"{testimonial.content}"</p>
                </div>
                <div className="testimonial-author">
                  <img src={testimonial.avatar} alt={testimonial.name} className="author-avatar" />
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.position}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button className="testimonial-nav prev" onClick={() => { prevSlide(); handleInteraction(); }}>
          &lt;
        </button>
        <button className="testimonial-nav next" onClick={() => { nextSlide(); handleInteraction(); }}>
          &gt;
        </button>
        
        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => { goToSlide(index); handleInteraction(); }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCarousel;