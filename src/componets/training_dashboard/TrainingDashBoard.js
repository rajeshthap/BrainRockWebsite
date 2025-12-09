import React, { useState, useEffect, useContext } from "react";
import { Container } from "react-bootstrap";
import "../../assets/css/trainingdashboard.css";

import TrainingHeader from "./TrainingHeader";
import TrainingLeftnav from "./TrainingLeftnav";
import { VideoPlayer } from "@graphland/react-video-player";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const TrainingDashBoard = () => {
  const { user } = useContext(AuthContext);
  const applicantId = user?.unique_id; // Get applicant ID from AuthContext
  
  // Console log to track unique ID after login
  console.log("TrainingDashBoard Component - User object:", user);
  console.log("TrainingDashBoard Component - Unique ID (applicantId):", applicantId);
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [wishlist, setWishlist] = useState([]);
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [userCourses, setUserCourses] = useState([]); // State to store user's registered courses with details
  const [courseItems, setCourseItems] = useState([]); // State to store course items from new API
  const [userRegistrationData, setUserRegistrationData] = useState(null); // State to store user registration data
  const [allRegistrations, setAllRegistrations] = useState([]); // State to store all registrations
  const [loading, setLoading] = useState(true); // Loading state
 
  const navigate = useNavigate();

  // Redirect Function
  const openVideoPage = (course) => {
    navigate("/TrainingVideoPlayer", {
      state: {
        title: course.title || course.course_name,
        video: course.video || "https://www.w3schools.com/html/mov_bbb.mp4",
        poster: course.icon || course.poster || "https://i.ibb.co/4Y6HcRD/reactjs-banner.png"
      }
    });
  };

  // Add to Wishlist function
  const addToWishlist = (course) => {
    setWishlist((prev) => [...prev, course]);
  };

  // Fetch course items from API
  useEffect(() => {
    const fetchCourseItems = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/course-items/');
        const data = await response.json();
        console.log("Course Items API Response:", data);
        if (data.success) {
          setCourseItems(data.data);
        }
      } catch (error) {
        console.error('Error fetching course items:', error);
      }
    };

    fetchCourseItems();
  }, []);

  // Fetch all course registrations
  useEffect(() => {
    console.log("useEffect triggered - applicantId:", applicantId);
    
    const fetchAllRegistrations = async () => {
      console.log("fetchAllRegistrations called - applicantId:", applicantId);
      
      try {
        const response = await fetch(
          `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/course-registration/`,
          {
            method: "GET",
            credentials: 'include' // Include credentials in the request
          }
        );

        const data = await response.json();
        console.log("All Registrations API Response:", data); // Log the response for debugging
        
        // Check if the API returned a successful response with data
        if (data && data.success && data.data) {
          // Store all registrations
          setAllRegistrations(data.data);
          
          // Filter registrations for the current user
          const userRegistrations = data.data.filter(registration => {
            console.log("Comparing:", registration.applicant_id, "with:", applicantId);
            return registration.applicant_id === applicantId;
          });
          
          console.log("Filtered user registrations:", userRegistrations);
          
          // If user has registrations, update the state
          if (userRegistrations.length > 0) {
            // Log the application_for_course field for each matching registration
            userRegistrations.forEach(registration => {
              console.log("Matched applicant_id:", registration.applicant_id, "with application_for_course:", registration.application_for_course);
            });
            
            // Set the registration data to the first registration
            setUserRegistrationData(userRegistrations[0]);
          } else {
            // If no registrations for the user, set empty states
            console.log("No registrations found for applicantId:", applicantId);
            setUserRegistrationData(null);
          }
        } else {
          // If no data is returned, set empty states
          console.log("API response invalid or no data");
          setUserRegistrationData(null);
          setAllRegistrations([]);
        }
      } catch (error) {
        console.error('Error fetching user courses:', error);
        setUserRegistrationData(null);
        setAllRegistrations([]);
      } finally {
        setLoading(false);
      }
    };

    if (applicantId) {
      fetchAllRegistrations();
    } else {
      console.log("applicantId is not available yet");
      setLoading(false);
    }
  }, [applicantId]);

  // Match user registrations with course details
  useEffect(() => {
    if (courseItems.length > 0 && allRegistrations.length > 0) {
      // Filter registrations for the current user
      const userRegistrations = allRegistrations.filter(registration => 
        registration.applicant_id === applicantId
      );
      
      console.log("User registrations for matching:", userRegistrations);
      console.log("Available course items:", courseItems);
      
      if (userRegistrations.length > 0) {
        // Get the course names that the user has registered for
        const registeredCourseNames = userRegistrations.map(reg => {
          console.log("Registration application_for_course:", reg.application_for_course);
          return reg.application_for_course;
        });
        console.log("Registered course names:", registeredCourseNames);
        
        // Find matching courses from the course-items API
        const matchedCourses = courseItems.filter(course => {
          console.log("Comparing course title:", course.title, "with registered names:", registeredCourseNames);
          return registeredCourseNames.includes(course.title);
        });
        
        console.log("Matched courses:", matchedCourses);
        
        // Enhance the matched courses with registration data
        const enhancedCourses = matchedCourses.map(course => {
          const registration = userRegistrations.find(reg => reg.application_for_course === course.title);
          return {
            ...course,
            registration_id: registration.id,
            applicant_id: registration.applicant_id,
            course_status: registration.course_status,
            candidate_name: registration.candidate_name,
            guardian_name: registration.guardian_name,
            address: registration.address,
            date_of_birth: registration.date_of_birth,
            profile_photo: registration.profile_photo,
            email: registration.email,
            mobile_no: registration.mobile_no,
            school_college_name: registration.school_college_name,
            highest_education: registration.highest_education,
            created_at: registration.created_at,
            updated_at: registration.updated_at,
            // Add default values for properties not in the API response
            progress: 0,
            rating: 0,
            duration: course.duration || "30 Days"
          };
        });
        
        console.log("Enhanced courses with registration data:", enhancedCourses);
        setUserCourses(enhancedCourses);
      } else {
        setUserCourses([]);
      }
    }
  }, [courseItems, allRegistrations, applicantId]);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setSidebarOpen(width >= 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const getBannerContent = () => {
    switch (activeTab) {
      case "all":
        return { title: "My Lists ", desc: "Your saved course collections." };
      case "lists":
        return { title: "All Courses", desc: "Browse our recommended courses." };
      default:
        return { title: "My Lists ", desc: "Your saved course collections." };
    }
  };

  const banner = getBannerContent();

  const AllCoursesUI = () => (
    <div className="all-courses-wrapper">
      <div className="weekly-streak-card">
        <div className="ws-row">
          <div className="ws-col">
            <strong>0 weeks</strong>
            <p className="ws-label">Current streak</p>
          </div>

          <div className="ws-col ws-right">
            <div className="ws-progress-circle"></div>

            <div className="ws-progress-info">
              <p className="ws-line">
                <span className="dot dot-orange"></span>
                0/30 course min
              </p>

              <p className="ws-line">
                <span className="dot dot-green"></span>
                1/1 visit
              </p>

              <p className="ws-date">Dec 1 – 8</p>
            </div>
          </div>
        </div>
      </div>

      {/* USER'S REGISTERED COURSES */}
      <div className="course-cards-container">
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : userCourses.length > 0 ? (
          userCourses.map(course => (
            <div className="course-card-container" key={course.id} style={{ cursor: "pointer" }}>
              <div className="course-card">
                <div onClick={() => openVideoPage(course)}>
                  <div className="course-video">
                    {/* Using course icon if available, otherwise use profile photo, then default poster */}
                    <img 
                      src={course.icon ? `https://mahadevaaya.com/brainrock.in/brainrock/backendbr${course.icon}` : 
                          course.profile_photo ? `https://mahadevaaya.com/brainrock.in/brainrock/backendbr${course.profile_photo}` : 
                          "https://i.ibb.co/4Y6HcRD/reactjs-banner.png"} 
                      alt={course.title}
                      style={{ width: "100%", height: "220px", objectFit: "cover" }}
                    />
                  </div>

                  <div className="course-info-text">
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-instructor">
                      {course.course_status ? `Status: ${course.course_status}` : "Duration: " + (course.duration || "N/A")}
                    </p>
                    {course.price && (
                      <p className="course-instructor">Price: ₹{course.price}</p>
                    )}
                    {course.course_type && (
                      <p className="course-instructor">Type: {course.course_type}</p>
                    )}
                    <button
                      className="wishlist-btn-show" style={{ cursor: "pointer",}}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWishlist(course);
                      }}
                    >
                      <i className="">
                        <FaHeart />
                      </i>
                    </button>
                    <div className="course-meta">
                      <span className="progress-text">
                        {course.progress ? `${course.progress}% complete` : "0% complete"}
                      </span>
                      <div className="rating">
                        {course.rating ? "⭐".repeat(course.rating) + "☆".repeat(5-course.rating) : "⭐⭐⭐☆☆"}
                      </div>
                    </div>

                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: course.progress ? `${course.progress}%` : "0%" }}
                      ></div>
                    </div>

                    <div className="course-footer">
                      <span className="rate-text">Leave a rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-courses-message">
            <p>No courses registered yet. Browse our recommended courses to get started!</p>
          </div>
        )}
      </div>
      
      {/* USER REGISTRATION DETAILS */}
      {userRegistrationData && (
        <div className="user-registration-details" style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h3>Your Registration Details</h3>
          <div className="registration-info" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px" }}>
            <div>
              <strong>Applicant ID:</strong> {userRegistrationData.applicant_id}
            </div>
            <div>
              <strong>Course:</strong> {userRegistrationData.application_for_course}
            </div>
            <div>
              <strong>Status:</strong> {userRegistrationData.course_status}
            </div>
            <div>
              <strong>Name:</strong> {userRegistrationData.candidate_name}
            </div>
            <div>
              <strong>Guardian Name:</strong> {userRegistrationData.guardian_name}
            </div>
            <div>
              <strong>Address:</strong> {userRegistrationData.address}
            </div>
            <div>
              <strong>Date of Birth:</strong> {userRegistrationData.date_of_birth}
            </div>
            <div>
              <strong>Email:</strong> {userRegistrationData.email}
            </div>
            <div>
              <strong>Mobile:</strong> {userRegistrationData.mobile_no}
            </div>
            <div>
              <strong>School/College:</strong> {userRegistrationData.school_college_name}
            </div>
            <div>
              <strong>Education:</strong> {userRegistrationData.highest_education}
            </div>
            <div>
              <strong>Registration Date:</strong> {new Date(userRegistrationData.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Recommended Courses UI Component
  const RecommendedCoursesUI = () => {
    // Add default properties to all courses from API
    const coursesWithDefaults = courseItems.map(course => ({
      ...course,
      title: course.title,
      video: "https://www.w3schools.com/html/mov_bbb.mp4",
      poster: course.icon,
      progress: 0,
      rating: 4,
      // Use course_type from API or default to "basic"
      difficulty: course.course_type || "basic",
      price: course.price
    }));

    const isInWishlist = (courseId) => {
      return wishlist.some(item => item.id === courseId);
    };

    // Filter courses based on course_type from API
    const filteredCourses = difficultyFilter === "all" 
      ? coursesWithDefaults 
      : coursesWithDefaults.filter(course => course.course_type === difficultyFilter);

    // Function to get difficulty badge styling
    const getDifficultyBadgeClass = (courseType) => {
      switch(courseType) {
        case "basic":
          return "difficulty-badge basic";
        case "medium":
          return "difficulty-badge medium";
        case "advance": // Changed from "advanced" to "advance" to match API
          return "difficulty-badge advanced";
        default:
          return "difficulty-badge";
      }
    };

    return (
      <div className="recommended-courses-wrapper">
        <div className="recommended-courses-header">
          <h2>All Courses</h2>
          <p>Explore our wide range of courses</p>
        </div>
        
        {/* Difficulty Filter - Updated to match API values */}
        <div className="difficulty-filter">
          <button 
            className={`filter-btn ${difficultyFilter === "all" ? "active" : ""}`}
            onClick={() => setDifficultyFilter("all")}
          >
            All Levels
          </button>
          <button 
            className={`filter-btn ${difficultyFilter === "basic" ? "active" : ""}`}
            onClick={() => setDifficultyFilter("basic")}
          >
            Basic
          </button>
          <button 
            className={`filter-btn ${difficultyFilter === "medium" ? "active" : ""}`}
            onClick={() => setDifficultyFilter("medium")}
          >
            Medium
          </button>
          <button 
            className={`filter-btn ${difficultyFilter === "advance" ? "active" : ""}`} // Changed from "advanced" to "advance"
            onClick={() => setDifficultyFilter("advance")}
          >
            Advanced
          </button>
        </div>
        
        <div className="recommended-courses-grid">
          {filteredCourses.map(course => (
            <div className="recommended-course-card" key={course.id}>
              <div>
                <div className="recommended-course-video">
                  <VideoPlayer
                    src={course.video}
                    poster={course.poster}
                    primaryColor="#5624d0"
                    height={180}
                    width={"100%"}
                    autoPlay={false}
                  />
                </div>

                <div className="recommended-course-info">
                  <div className="course-header">
                    <h3 className="recommended-course-title">{course.title}</h3>
                    {/* Use course_type from API for badge */}
                    <span className={getDifficultyBadgeClass(course.course_type)}>
                      {course.course_type ? course.course_type.charAt(0).toUpperCase() + course.course_type.slice(1) : "Basic"}
                    </span>
                  </div>
                  <p className="recommended-course-instructor">
                    {course.description || `Duration: ${course.duration}`}
                  </p>
                  
                  <div className="recommended-course-meta">
                    <span className="recommended-progress-text">
                      {course.progress > 0 ? `${course.progress}% complete` : "Not started"}
                    </span>
                    <div className="recommended-rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < course.rating ? "star-filled" : "star-empty"}>★</span>
                      ))}
                    </div>
                  </div>

                  {course.progress > 0 && (
                    <div className="recommended-progress-bar">
                      <div className="recommended-progress-fill" style={{ width: `${course.progress}%` }}></div>
                    </div>
                  )}

                  <div className="course-pricing">
                    <span className="price">₹{course.price}</span>
                  </div>

                  <div className="recommended-course-footer">
                    <span className="recommended-continue-btn">
                      {course.progress > 0 ? "Continue Learning" : "Start Course"}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* <button
                className={`recommended-wishlist-btn ${isInWishlist(course.id) ? "in-wishlist" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isInWishlist(course.id)) {
                    setWishlist(prev => prev.filter(item => item.id !== course.id));
                  } else {
                    addToWishlist(course);
                  }
                }}
              >
                <FaHeart />
              </button> */}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "all":
        return <AllCoursesUI />;
      case "lists":
        return <RecommendedCoursesUI />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <TrainingLeftnav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
      />

      <div className="main-content">
        <TrainingHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
          <div className="top-banner">
            <h1 className="td-heading">{banner.title}</h1>
            <p className="td-subtext">{banner.desc}</p>
          </div>

          <div className="td-tabs">
            <button className={`tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>My Lists</button>
            <button className={`tab-btn ${activeTab === "lists" ? "active" : ""}`} onClick={() => setActiveTab("lists")}>All courses</button>
          </div>

          <div className="tab-content-wrapper">{renderTabContent()}</div>
        </Container>
      </div>
    </div>
  );
};

export default TrainingDashBoard;