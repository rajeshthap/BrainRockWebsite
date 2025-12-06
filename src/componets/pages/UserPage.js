import React, { useState, useEffect } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import "../../assets/css/UserPage.css";
import PoorImg from "../../assets/images/poorimg.jpg";
import Carousel from "react-bootstrap/Carousel";
import { FaArrowRight } from "react-icons/fa6";
// Component

import Banner1 from "../../assets/images/banner-1.png";
import Banner2 from "../../assets/images/banner-2.png";

import "../../assets/css/slider.css";
import { LuBrainCircuit } from "react-icons/lu";

import { SiCircuitverse } from "react-icons/si";

import { SiAmazoncloudwatch } from "react-icons/si";

import TechImg from "../../assets/images/shield-bg.png";
import { TbSettingsCode } from "react-icons/tb";
import { GrShieldSecurity } from "react-icons/gr";
import { LuSearchCode } from "react-icons/lu";
import { AiOutlineFileDone } from "react-icons/ai";
import ServicesCarousel from "./ServicesCarousel";
import TestimonialCarousel from "./TestimonialCarousel";
import { GoCodeReview } from "react-icons/go";
import { MdEngineering } from "react-icons/md";
import { Link } from "react-router-dom";
import FooterPage from "../footer/FooterPage";

function UserPage() {
  const [carouselData, setCarouselData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for About Us data - now includes image
  const [aboutData, setAboutData] = useState({
    title: "Why Choose Brainrock Consulting Services?",
    description: "",
    image: null,
  });
  const [imageTimestamp, setImageTimestamp] = useState(Date.now()); // Add timestamp for cache busting

  // State for design and development data
  const [designDevData, setDesignDevData] = useState([]);
  const [designDevLoading, setDesignDevLoading] = useState(true);
  const [designDevError, setDesignDevError] = useState(null);

  // State for tech stack data
  const [techStackData, setTechStackData] = useState({
    title: "",
    description: "",
    image: null,
  });
  const [techStackLoading, setTechStackLoading] = useState(true);
  const [techStackError, setTechStackError] = useState(null);
  const [techImageTimestamp, setTechImageTimestamp] = useState(Date.now());

  // State for IT service data
  const [itServiceData, setItServiceData] = useState([]);
  const [itServiceLoading, setItServiceLoading] = useState(true);
  const [itServiceError, setItServiceError] = useState(null);

  useEffect(() => {
    // Function to fetch carousel data from API
    const fetchCarouselData = async () => {
      try {
        // Using the provided API endpoint
        const response = await fetch(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/carousel-items/"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch carousel data");
        }

        const result = await response.json();

        // Check if the API response is successful
        if (result.success) {
          // Extract the data array from the response
          const data = result.data.map((item) => ({
            ...item,
            // Construct full image URL if image path is provided
            image: item.image
              ? `https://mahadevaaya.com/brainrock.in/brainrock/backendbr${item.image}`
              : null,
          }));
          setCarouselData(data);
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (error) {
        console.error("Error fetching carousel data:", error);
        setError(error.message);
        // Fallback data if API fails
        setCarouselData([
          {
            id: 1,
            title: "Best It Solution Company",
            subtitle: "Professional it solution ~",
            description:
              "We deliver innovative IT solutions to help your business stay ahead in the digital world",
            image: Banner1,
            alt: "groupimage",
          },
          {
            id: 2,
            title: "Best It Solution Company",
            subtitle: "Professional it solution ~",
            description:
              "We deliver innovative IT solutions to help your business stay ahead in the digital world",
            image: Banner2,
            alt: "Banner2",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    // Function to fetch About Us data from API
    const fetchAboutData = async () => {
      try {
        const response = await fetch(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/aboutus-item/"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();

        // The API returns data in the format {success: true, data: [{...}]}
        if (result.success && result.data && result.data.length > 0) {
          // Get the first item from the array
          const item = result.data[0];

          // Process the data - construct full image URL if image path is provided
          const processedData = {
            title: item.title,
            description: item.description,
            image: item.image
              ? `https://mahadevaaya.com/brainrock.in/brainrock/backendbr${item.image}`
              : null,
          };

          setAboutData(processedData);
          // Update timestamp to force image refresh
          setImageTimestamp(Date.now());
        }
      } catch (err) {
        console.error("Error fetching About Us data:", err);
      }
    };

    // Function to fetch design and development data from API
    const fetchDesignDevData = async () => {
      try {
        const response = await fetch(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/design-development-items/"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch design and development data");
        }

        const result = await response.json();

        // Check if the API response is successful
        if (result.success) {
          // Extract the data array from the response
          const data = result.data.map((item) => ({
            ...item,
            // Construct full image URL if image path is provided
            icon: item.icon
              ? `https://mahadevaaya.com/brainrock.in/brainrock/backendbr${item.icon}`
              : null,
          }));
          setDesignDevData(data);
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (error) {
        console.error("Error fetching design and development data:", error);
        setDesignDevError(error.message);
      } finally {
        setDesignDevLoading(false);
      }
    };

    // Function to fetch tech stack data from API
    const fetchTechStackData = async () => {
      try {
        const response = await fetch(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/ourtechstack-item/"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch tech stack data");
        }

        const result = await response.json();

        // The API returns data in the format {success: true, data: [{...}]}
        if (result.success && result.data && result.data.length > 0) {
          // Get the first item from the array
          const item = result.data[0];

          // Process the data - construct full image URL if image path is provided
          const processedData = {
            title: item.title,
            description: item.description,
            image: item.image
              ? `https://mahadevaaya.com/brainrock.in/brainrock/backendbr${item.image}`
              : null,
          };

          setTechStackData(processedData);
          // Update timestamp to force image refresh
          setTechImageTimestamp(Date.now());
        }
      } catch (err) {
        console.error("Error fetching tech stack data:", err);
        setTechStackError(err.message);
      } finally {
        setTechStackLoading(false);
      }
    };

    // Function to fetch IT service data from API
    const fetchItServiceData = async () => {
      try {
        const response = await fetch(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/itservice-items/"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch IT service data");
        }

        const result = await response.json();

        // Check if the API response is successful
        if (result.success) {
          // Extract the data array from the response
          const data = result.data.map((item) => ({
            ...item,
            // Construct full image URL if image path is provided
            icon: item.icon
              ? `https://mahadevaaya.com/brainrock.in/brainrock/backendbr${item.icon}`
              : null,
          }));
          setItServiceData(data);
        } else {
          throw new Error("API returned unsuccessful response");
        }
      } catch (error) {
        console.error("Error fetching IT service data:", error);
        setItServiceError(error.message);
      } finally {
        setItServiceLoading(false);
      }
    };

    fetchCarouselData();
    fetchAboutData();
    fetchDesignDevData();
    fetchTechStackData();
    fetchItServiceData();
  }, []);

  // Create image URL with timestamp for cache busting
  const imageUrl = aboutData.image
    ? `${aboutData.image}?t=${imageTimestamp}`
    : null;
  const techImageUrl = techStackData.image
    ? `${techStackData.image}?t=${techImageTimestamp}`
    : TechImg;

  // Function to render icon component based on the icon from API
  const renderIcon = (iconUrl) => {
    if (iconUrl) {
      return (
        <img
          src={iconUrl}
          alt="Service Icon"
          className="img-fluid"
          style={{ width: "90px", height: "90px" }}
        />
      );
    }
    // Fallback to default icon if no icon is provided
    return <MdEngineering />;
  };

  return (
    <div className="container-fluid p-0">
      <div className="craousal-main" style={{ overflow: 'hidden' }}>
        <Carousel className="resorce-craousal" interval={3000} pause={false}>
          {loading ? (
            // Show loading state or fallback content while fetching data
            <>
              <Carousel.Item>
                <Row className="resorce-img">
                  <Col lg={6} md={6} sm={12}>
                    <div className=" d-flex flex-column h-100 align-items-start justify-content-center bottom-0 resorce-sub-title ">
                      <h1 className=" bg-opacity-50 user-left py-2">
                        <span class="hero-sub-title mb-20">
                          Professional it solution ~
                        </span>{" "}
                        <br></br>
                        <span className="br-span-title">
                          {" "}
                          Best It Solution Company
                        </span>{" "}
                      </h1>
                      <p className=" bg-opacity-50 py-2 user-left">
                        We deliver innovative IT solutions to help your business
                        stay ahead in the digital world
                      </p>
                    </div>
                  </Col>
                  <Col lg={6} md={6} sm={12}>
                    <div>
                      <i>
                        <img
                          src={Banner1}
                          alt="groupimage"
                          className="img-fluid"
                        ></img>
                      </i>
                    </div>
                  </Col>
                </Row>
                <Carousel.Caption></Carousel.Caption>
              </Carousel.Item>
            </>
          ) : (
            // Map over the carousel data to render items dynamically
            carouselData.map((item) => (
              <Carousel.Item key={item.id}>
                <Row className="resorce-img">
                  <Col lg={6} md={6} sm={12}>
                    <div className=" d-flex flex-column h-100 align-items-start justify-content-center bottom-0 resorce-sub-title ">
                      <h1 className=" bg-opacity-50 py-2 px-4">
                        <span class="hero-sub-title mb-20">
                          {item.subtitle}
                        </span>{" "}
                        <br></br>
                        <span className="br-span-title">{item.title}</span>{" "}
                      </h1>
                      <p className=" bg-opacity-50 py-2 px-4">
                        {item.description}
                      </p>
                    </div>
                  </Col>
                  <Col lg={6} md={6} sm={12} className="banner-img">
                    <div>
                      <i>
                        <img
                          src={item.image || Banner1} // Use fallback image if item.image is null
                          alt={item.alt || "Carousel image"}
                          className="img-fluid"
                        ></img>
                      </i>
                    </div>
                  </Col>
                </Row>
                <Carousel.Caption></Carousel.Caption>
              </Carousel.Item>
            ))
          )}
        </Carousel>
      </div>
      <div />
      <Container>
        <Row className="feature-area feature-minus">
          <Container>
            <div className="feature-wpr grid-3">
              {itServiceLoading ? (
                // Show loading state while fetching data
                Array(3)
                  .fill()
                  .map((_, index) => (
                    <div className="feature-box" key={index}>
                      <div className="feature-icon">
                        <i class="flaticon-cloud">
                          <div
                            className="spinner-border spinner-border-sm"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </i>
                      </div>
                      <div className="flaticon-cloud"></div>
                      <div className="feature-desc">
                        <h4>Loading...</h4>
                        <p>Loading content...</p>
                        <Link to="/service-single" className="feature-btn">
                          Read More
                          <i className="ti-arrow-right">
                            <FaArrowRight />
                          </i>
                        </Link>
                      </div>
                    </div>
                  ))
              ) : itServiceError ? (
                // Show error state if API call fails
                Array(3)
                  .fill()
                  .map((_, index) => (
                    <div className="feature-box" key={index}>
                      <div className="feature-icon">
                        <i class="flaticon-cloud">
                          <LuBrainCircuit />
                        </i>
                      </div>
                      <div className="flaticon-cloud"></div>
                      <div className="feature-desc">
                        <h4>Error Loading Data</h4>
                        <p>
                          Unable to load service information. Please try again
                          later.
                        </p>
                        <Link to="/service-single" className="feature-btn">
                          Read More
                          <i className="ti-arrow-right">
                            <FaArrowRight />
                          </i>
                        </Link>
                      </div>
                    </div>
                  ))
              ) : itServiceData.length > 0 ? (
                // Map over the IT service data to render items dynamically
                itServiceData.map((item, index) => (
                  <div className="feature-box" key={item.id}>
                    <div className="feature-icon">
                      <i class="flaticon-cloud">{renderIcon(item.icon)}</i>
                    </div>
                    <div className="flaticon-cloud"></div>
                    <div className="feature-desc">
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                      {/* Updated to use Link with state prop instead of button */}
                      <Link
                        to="/ServicesDetails"
                        state={{ serviceId: item.id }}
                        className="feature-btn"
                      >
                        Read More
                        <i className="ti-arrow-right">
                          <FaArrowRight />
                        </i>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                // Fallback to hardcoded data if no data is available
                <>
                  <div className="feature-box">
                    <div className="feature-icon">
                      <i class="flaticon-cloud">
                        <LuBrainCircuit />
                      </i>
                    </div>
                    <div className="flaticon-cloud"></div>
                    <div className="feature-desc">
                      <h4>It Solution</h4>
                      <p>
                        It Solution It is a long established fact that a reader
                        will be distracted by the readable content fact that a
                        reader will
                      </p>
                      <Link to="/service-single" className="feature-btn">
                        Read More
                        <i className="ti-arrow-right">
                          <FaArrowRight />
                        </i>
                      </Link>
                    </div>
                  </div>
                  <div className="feature-box">
                    <div className="feature-icon">
                      <i class="flaticon-cloud">
                        <SiCircuitverse />
                      </i>
                    </div>
                    <div className="flaticon-cloud"></div>
                    <div className="feature-desc">
                      <h4>It Management</h4>
                      <p>
                        It is a long established fact that a reader will be
                        distracted by the readable content fact that a reader
                        will
                      </p>
                      <Link to="/service-single" className="feature-btn">
                        Read More
                        <i className="ti-arrow-right">
                          <FaArrowRight />
                        </i>
                      </Link>
                    </div>
                  </div>
                  <div className="feature-box">
                    <div className="feature-icon">
                      <i class="flaticon-cloud">
                        <SiAmazoncloudwatch />
                      </i>
                    </div>
                    <div className="flaticon-cloud"></div>
                    <div className="feature-desc">
                      <h4>It Consultancy</h4>
                      <p>
                        It is a long established fact that a reader will be
                        distracted by the readable content fact that a reader
                        will
                      </p>
                      <Link to="/service-single" className="feature-btn">
                        Read More
                        <i className="ti-arrow-right">
                          <FaArrowRight />
                        </i>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Container>
        </Row>
      </Container>
      <Container fluid>
        <div className="about-wpr">
          <Row>
            <Col lg={6} md={6} sm={12} className="about-box p-2">
              <div className="about-left-content">
                <div className="about-phase-1">
                  <i>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="About Us"
                        className="img-fluid about-1 mt-30"
                        key={`img1-${imageTimestamp}`} // Add key to force re-render
                      />
                    ) : (
                      <div
                        className="img-fluid about-1 mt-30 d-flex align-items-center justify-content-center bg-light"
                        style={{ height: "200px" }}
                      >
                        <span className="text-muted">No image available</span>
                      </div>
                    )}
                  </i>
                  <i>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="About Us"
                        className="img-fluid about-2"
                        key={`img2-${imageTimestamp}`} // Add key to force re-render
                      />
                    ) : (
                      <div
                        className="img-fluid about-2 d-flex align-items-center justify-content-center bg-light"
                        style={{ height: "200px" }}
                      >
                        <span className="text-muted">No image available</span>
                      </div>
                    )}
                  </i>
                </div>
                <div className="about-pic-content">
                  <i>
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="About Us"
                        className="img-fluid about-3"
                        key={`img3-${imageTimestamp}`} // Add key to force re-render
                      />
                    ) : (
                      <div
                        className="img-fluid about-3 d-flex align-items-center justify-content-center bg-light"
                        style={{ height: "200px" }}
                      >
                        <span className="text-muted">No image available</span>
                      </div>
                    )}
                  </i>
                  <div className="about-yr-exp">
                    <p>18</p>
                    <h5>
                      <span>Year</span> Experience
                    </h5>
                  </div>
                </div>
              </div>
            </Col>
            <Col
              lg={6}
              md={6}
              sm={12}
              className="about-right pl-30 d-flex flex-column justify-content-center"
            >
              <span className="hero-sub-title">About Us</span>
              {/* Dynamic title from API */}
              <h2 className="heading-1">{aboutData.title}</h2>
              {/* Dynamic description from API - using p tag instead of ul */}
              <p>{aboutData.description}</p>
              {/* Static list items */}
            </Col>
          </Row>
        </div>
      </Container>

      <ServicesCarousel />
      <div className="resorce-main-section ">
        <Container>
          <div className="resorce-sub-list-design">
            <div class="text-center">
              <h1 class=" hero-sub-title">
                Our design and{" "}
                <span class="br-span-list1 mt-3">development approach</span>
              </h1>
            </div>

            <Row>
              {designDevLoading ? (
                // Show loading state while fetching data
                Array(6)
                  .fill()
                  .map((_, index) => (
                    <Col
                      lg={3}
                      md={3}
                      sm={12}
                      className={index < 4 ? "box-info" : " box-info"}
                      key={index}
                    >
                      <div className="service-box service-btm">
                        <div className="service-icon">
                          <i className="flaticon-cloud-service">
                            <div
                              className="spinner-border spinner-border-sm"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </div>
                          </i>
                        </div>
                        <div className="service-desc">
                          <h4 className="heading-5">Loading...</h4>
                          <p>Loading content...</p>
                          <button className="service-btn">
                            Read More
                            <i className="ti-arrow-right">
                              <FaArrowRight />
                            </i>
                          </button>
                        </div>
                      </div>
                    </Col>
                  ))
              ) : designDevError ? (
                // Show error state if API call fails
                Array(6)
                  .fill()
                  .map((_, index) => (
                    <Col
                      lg={3}
                      md={3}
                      sm={12}
                      className={index < 4 ? "box-info" : " box-info"}
                      key={index}
                    >
                      <div className="service-box ">
                        <div className="service-icon">
                          <i className="flaticon-cloud-service">
                            <MdEngineering />
                          </i>
                        </div>
                        <div className="service-desc">
                          <h4 className="heading-5">Error Loading Data</h4>
                          <p>
                            Unable to load service information. Please try again
                            later.
                          </p>
                          <button className="service-btn">
                            Read More
                            <i className="ti-arrow-right">
                              <FaArrowRight />
                            </i>
                          </button>
                        </div>
                      </div>
                    </Col>
                  ))
              ) : designDevData.length > 0 ? (
                // Map over the design and development data to render items dynamically
                designDevData.map((item, index) => (
                  <Col
                    lg={3}
                    md={3}
                    sm={12}
                    className={index < 4 ? "box-info" : " box-info mt-3"}
                    key={item.id}
                  >
                    <div className="service-box">
                      <div className="service-icon">
                        <i className="flaticon-cloud-service">
                          {renderIcon(item.icon)}
                        </i>
                      </div>
                      <div className="service-desc">
                        <h4 className="heading-5">{item.title}</h4>
                        <p>{item.description}</p>
                        <button className="service-btn">
                          Read More
                          <i className="ti-arrow-right">
                            <FaArrowRight />
                          </i>
                        </button>
                      </div>
                    </div>
                  </Col>
                ))
              ) : (
                // Fallback to hardcoded data if no data is available
                <>
                  <Col lg={3} md={3} sm={12} className="box-info">
                    <div className="service-box">
                      <div className="service-icon">
                        <i className="flaticon-cloud-service">
                          <MdEngineering />
                        </i>
                      </div>
                      <div className="service-desc">
                        <h4 className="heading-5">UX Driven Engineering</h4>
                        <p>
                          We combine user-centric design with robust engineering
                          to build digital solutions that are intuitive,
                          engaging, and highly functional. Our process ensures
                          that every line of code serves the user experience,
                          delivering products that people love to us
                        </p>
                        <button className="service-btn">
                          Read More
                          <i className="ti-arrow-right">
                            <FaArrowRight />
                          </i>
                        </button>
                      </div>
                    </div>
                  </Col>
                  <Col lg={3} md={3} sm={12} className="box-info">
                    <div className="service-box">
                      <div className="service-icon">
                        <i className="flaticon-cloud-service">
                          <GoCodeReview />
                        </i>
                      </div>
                      <div className="service-desc">
                        <h4 className="heading-5">
                          Developing Shared Understanding
                        </h4>
                        <p>
                          We bridge the gap between teams and stakeholders to
                          create a clear, common vision. By fostering
                          collaboration and aligning goals, we ensure seamless
                          communication and
                        </p>
                        <button className="service-btn">
                          Read More
                          <i className="ti-arrow-right">
                            <FaArrowRight />
                          </i>
                        </button>
                      </div>
                    </div>
                  </Col>
                  <Col lg={3} md={3} sm={12} className="box-info">
                    <div className="service-box">
                      <div className="service-icon">
                        <i className="flaticon-cloud-service">
                          <TbSettingsCode />
                        </i>
                      </div>
                      <div className="service-desc">
                        <h4 className="heading-5">
                          Proven Experience and Expertise
                        </h4>
                        <p>
                          With years of industry experience and a team of
                          skilled professionals, we deliver reliable solutions
                          that drive innovation and business growth.
                        </p>
                        <button className="service-btn">
                          Read More
                          <i className="ti-arrow-right">
                            <FaArrowRight />
                          </i>
                        </button>
                      </div>
                    </div>
                  </Col>
                  <Col lg={3} md={3} sm={12} className="box-info">
                    <div className="service-box">
                      <div className="service-icon">
                        <i className="flaticon-cloud-service">
                          <GrShieldSecurity />
                        </i>
                      </div>
                      <div className="service-desc">
                        <h4 className="heading-5">
                          Security & Intellectual Property (IP)
                        </h4>
                        <p>
                          We prioritize data security and safeguard your
                          intellectual property with strict confidentiality,
                          robust systems, and compliance with global standards.
                        </p>
                        <button className="service-btn">
                          Read More
                          <i className="ti-arrow-right">
                            <FaArrowRight />
                          </i>
                        </button>
                      </div>
                    </div>
                  </Col>
                  <Col lg={3} md={3} sm={12} className="mt-4 box-info">
                    <div className="service-box">
                      <div className="service-icon">
                        <i className="flaticon-cloud-service">
                          <LuSearchCode />
                        </i>
                      </div>
                      <div className="service-desc">
                        <h4 className="heading-5">Code Review</h4>
                        <p>
                          We ensure clean, efficient, and secure code through
                          rigorous reviews, fostering high-quality software and
                          seamless collaboration.
                        </p>
                        <button className="service-btn">
                          Read More
                          <i className="ti-arrow-right">
                            <FaArrowRight />
                          </i>
                        </button>
                      </div>
                    </div>
                  </Col>
                  <Col lg={3} md={3} sm={12} className="mt-4 box-info">
                    <div className="service-box">
                      <div className="service-icon">
                        <i className="flaticon-cloud-service">
                          <AiOutlineFileDone />
                        </i>
                      </div>
                      <div className="service-desc">
                        <h4 className="heading-5">
                          Quality Assurance & Testing
                        </h4>
                        <p>
                          We deliver flawless digital solutions through rigorous
                          QA processes and comprehensive testing to ensure
                          performance, reliability, and user satisfaction.
                        </p>
                        <button className="service-btn">
                          Read More
                          <i className="ti-arrow-right">
                            <FaArrowRight />
                          </i>
                        </button>
                      </div>
                    </div>
                  </Col>
                </>
              )}
            </Row>
          </div>
        </Container>
      </div>
      <div>
        <Container fluid className="testimonial-bg">
          <Container>
            <div className="resorce-sub-list text-center">
              <h1 className="text-center mt-3">
                Our
                <span className="resorce-about-list">Tech Stack</span>
              </h1>
            </div>
            <div>
              <Row className="d-flex justify-content-center br-tech-stack">
                <Col lg={6} md={6} sm={12} className="mb-3">
                  <h3>
                    <b>
                      {techStackData.title ||
                        "Brainrock Consulting – Technologies We Use as a Top Application Development Company"}
                    </b>
                  </h3>
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        techStackData.description ||
                        `
                    <p>At <b>Brainrock Consulting,</b> we leverage the most advanced and reliable technologies to deliver high-performance <b>Application Development and mobile applications.</b> As a top application development company, we follow agile methodologies to ensure smooth project execution—from initial ideation and UI/UX design to development, testing, deployment, and long-term maintenance.</p>
                    <p>Our expert developers work with a powerful and future-ready tech stack, including <b> React Native, Flutter, Kotlin, Swift, React.js, Next.js, Node.js, Laravel, </b> and other industry-leading tools. This enables us to build scalable, secure, and feature-rich applications tailored to your business needs.</p>
                  `,
                    }}
                  />
                </Col>
                <Col lg={6} md={6} sm={12} className="mb-3 text-center">
                  <div>
                    <img
                      src={techImageUrl}
                      alt="TechImg"
                      className="img-fluid mt-3"
                      key={`tech-img-${techImageTimestamp}`}
                    ></img>
                  </div>
                </Col>
              </Row>
            </div>
          </Container>
        </Container>
      </div>
      <div className="testimonial-section  py-5">
        {/* <h1 className="text-center">
            Why customers love <br></br>
            <span className="br-span-list mt-3">working with us</span>
          </h1> */}
        <TestimonialCarousel />
      </div>

      <Container fluid className="br-footer-box">
        <Container>
          <FooterPage />
        </Container>
      </Container>
    </div>
  );
}

export default UserPage;