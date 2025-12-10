import React, { useState, useEffect, useContext } from "react";
import { Container, Modal, Button, Form } from "react-bootstrap";
import "../../assets/css/trainingdashboard.css";

import TrainingHeader from "./TrainingHeader";
import TrainingLeftnav from "./TrainingLeftnav";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaCheckCircle } from "react-icons/fa";
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
  const [addingCourse, setAddingCourse] = useState(false); // State to track when adding a course
  const [showModulesModal, setShowModulesModal] = useState(false); // State to control modules modal
  const [selectedCourse, setSelectedCourse] = useState(null); // State to store selected course for modules
  const [completedModules, setCompletedModules] = useState({}); // State to track completed modules for each course
  const [courseProgress, setCourseProgress] = useState({}); // State to track course progress
 
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

  // Function to open modules modal
  const openModulesModal = (course) => {
    setSelectedCourse(course);
    setShowModulesModal(true);
    
    // Initialize completed modules for this course if not already done
    if (!completedModules[course.course_id]) {
      const initialModules = {};
      if (course.modules && Array.isArray(course.modules)) {
        course.modules.forEach((module, index) => {
          initialModules[index] = false;
        });
        setCompletedModules(prev => ({
          ...prev,
          [course.course_id]: initialModules
        }));
      }
    }
  };

  // Function to handle module checkbox change
  const handleModuleChange = (courseId, moduleIndex, isChecked) => {
    setCompletedModules(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [moduleIndex]: isChecked
      }
    }));
    
    // Update course progress
    const courseModules = completedModules[courseId] || {};
    const totalModules = Object.keys(courseModules).length;
    const completedCount = Object.values({
      ...courseModules,
      [moduleIndex]: isChecked
    }).filter(Boolean).length;
    
    const progress = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
    
    setCourseProgress(prev => ({
      ...prev,
      [courseId]: progress
    }));
  };

  // Function to check if all modules are completed
  const areAllModulesCompleted = (courseId) => {
    const courseModules = completedModules[courseId] || {};
    const totalModules = Object.keys(courseModules).length;
    const completedCount = Object.values(courseModules).filter(Boolean).length;
    return totalModules > 0 && totalModules === completedCount;
  };

  // Function to handle course completion
  const handleCompleteCourse = (courseId) => {
    // Here you can make an API call to mark the course as completed
    alert(`Course with ID ${courseId} has been marked as completed!`);
    
    // You might want to update the course status in your state or make an API call
    // to update the course status in the backend
  };

  // Add to Wishlist function
  const addToWishlist = (course) => {
    setWishlist((prev) => [...prev, course]);
  };

  // Add Course to Registration function
  const addCourseToRegistration = async (course) => {
    if (!applicantId) {
      console.error("Applicant ID not available");
      return;
    }

    setAddingCourse(true);
    
    try {
      // Get current registration data
      const currentRegistration = allRegistrations.find(reg => reg.applicant_id === applicantId);
      
      // Prepare the updated course arrays
      let updatedCourses = [];
      let updatedCourseIds = [];
      
      if (currentRegistration) {
        // If registration exists, add to existing arrays
        // Handle both string and array formats for application_for_course
        if (typeof currentRegistration.application_for_course === 'string') {
          updatedCourses = [currentRegistration.application_for_course];
        } else if (Array.isArray(currentRegistration.application_for_course)) {
          updatedCourses = [...currentRegistration.application_for_course];
        }
        
        // Handle both string and array formats for application_for_course_id
        if (typeof currentRegistration.application_for_course_id === 'string') {
          updatedCourseIds = [currentRegistration.application_for_course_id];
        } else if (Array.isArray(currentRegistration.application_for_course_id)) {
          updatedCourseIds = [...currentRegistration.application_for_course_id];
        }
        
        // Check if course is already registered
        if (updatedCourses.includes(course.title)) {
          alert("You have already registered for this course!");
          setAddingCourse(false);
          return;
        }
        
        // Add the new course
        updatedCourses.push(course.title);
        updatedCourseIds.push(course.course_id);
      } else {
        // If no registration exists, create new arrays
        updatedCourses = [course.title];
        updatedCourseIds = [course.course_id];
      }
      
      // Make the PUT request
      const response = await fetch(
        `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/course-registration/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({
            applicant_id: applicantId,
            application_for_course: updatedCourses,
            application_for_course_id: updatedCourseIds
          })
        }
      );
      
      const data = await response.json();
      console.log("Add Course API Response:", data);
      
      if (data.success) {
        alert("Course added successfully!");
        
        // Refresh the registrations data
        const fetchResponse = await fetch(
          `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/course-registration/`,
          {
            method: "GET",
            credentials: 'include'
          }
        );
        
        const fetchData = await fetchResponse.json();
        if (fetchData && fetchData.success && fetchData.data) {
          setAllRegistrations(fetchData.data);
          
          // Filter registrations for the current user
          const userRegistrations = fetchData.data.filter(registration => 
            registration.applicant_id === applicantId
          );
          
          if (userRegistrations.length > 0) {
            setUserRegistrationData(userRegistrations[0]);
          }
        }
      } else {
        alert("Failed to add course. Please try again.");
      }
    } catch (error) {
      console.error('Error adding course:', error);
      alert("An error occurred while adding the course. Please try again.");
    } finally {
      setAddingCourse(false);
    }
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
            credentials: 'include' // Include credentials in request
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
    if (courseItems.length > 0 && userRegistrationData) {
      console.log("User registration data:", userRegistrationData);
      console.log("Available course items:", courseItems);
      
      // Get the course names that the user has registered for
      // Handle both string and array formats for application_for_course
      let registeredCourseNames = [];
      let registeredCourseIds = [];
      
      if (typeof userRegistrationData.application_for_course === 'string') {
        registeredCourseNames = [userRegistrationData.application_for_course];
      } else if (Array.isArray(userRegistrationData.application_for_course)) {
        registeredCourseNames = [...userRegistrationData.application_for_course];
      }
      
      if (typeof userRegistrationData.application_for_course_id === 'string') {
        registeredCourseIds = [userRegistrationData.application_for_course_id];
      } else if (Array.isArray(userRegistrationData.application_for_course_id)) {
        registeredCourseIds = [...userRegistrationData.application_for_course_id];
      }
      
      console.log("Registered course names:", registeredCourseNames);
      console.log("Registered course IDs:", registeredCourseIds);
      
      // Find matching courses from the course-items API
      const matchedCourses = courseItems.filter(course => {
        console.log("Comparing course title:", course.title, "with registered names:", registeredCourseNames);
        console.log("Comparing course ID:", course.course_id, "with registered IDs:", registeredCourseIds);
        return registeredCourseNames.includes(course.title) || registeredCourseIds.includes(course.course_id);
      });
      
      console.log("Matched courses:", matchedCourses);
      
      // Enhance the matched courses with registration data
      const enhancedCourses = matchedCourses.map(course => {
        return {
          ...course,
          registration_id: userRegistrationData.id,
          applicant_id: userRegistrationData.applicant_id,
          course_status: userRegistrationData.course_status,
          candidate_name: userRegistrationData.candidate_name,
          guardian_name: userRegistrationData.guardian_name,
          address: userRegistrationData.address,
          date_of_birth: userRegistrationData.date_of_birth,
          profile_photo: userRegistrationData.profile_photo,
          email: userRegistrationData.email,
          mobile_no: userRegistrationData.mobile_no,
          school_college_name: userRegistrationData.school_college_name,
          highest_education: userRegistrationData.highest_education,
          created_at: userRegistrationData.created_at,
          updated_at: userRegistrationData.updated_at,
          // Add default values for properties not in the API response
          progress: courseProgress[course.course_id] || 0,
          rating: 0,
          duration: course.duration || "30 Days"
        };
      });
      
      console.log("Enhanced courses with registration data:", enhancedCourses);
      setUserCourses(enhancedCourses);
    } else {
      setUserCourses([]);
    }
  }, [courseItems, userRegistrationData, applicantId, courseProgress]);

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
            <div className="course-card-container" key={course.course_id} style={{ cursor: "pointer" }}>
              <div className="course-card">
                <div onClick={() => openModulesModal(course)}>
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
    </div>
  );

  // Recommended Courses UI Component
  const RecommendedCoursesUI = () => {
    // Add default properties to all courses from API
    const coursesWithDefaults = courseItems.map(course => ({
      ...course,
      title: course.title,
      poster: course.icon,
      progress: 0,
      rating: 4,
      // Use course_type from API or default to "basic"
      difficulty: course.course_type || "basic",
      price: course.price
    }));

    const isInWishlist = (courseId) => {
      return wishlist.some(item => item.course_id === courseId);
    };

    // Check if a course is already registered by the user
    const isCourseRegistered = (courseTitle) => {
      if (!userRegistrationData || !userRegistrationData.application_for_course) return false;
      
      // Handle both string and array formats
      if (typeof userRegistrationData.application_for_course === 'string') {
        return userRegistrationData.application_for_course === courseTitle;
      } else if (Array.isArray(userRegistrationData.application_for_course)) {
        return userRegistrationData.application_for_course.includes(courseTitle);
      }
      
      return false;
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
            <div className="recommended-course-card" key={course.course_id}>
              <div>
                <div className="recommended-course-video">
                  {/* Replaced VideoPlayer with img tag */}
                  <img 
                    src={course.icon ? `https://mahadevaaya.com/brainrock.in/brainrock/backendbr${course.icon}` : 
                        "https://i.ibb.co/4Y6HcRD/reactjs-banner.png"} 
                    alt={course.title}
                    style={{ width: "100%", height: "180px", objectFit: "cover" }}
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
                    <button
                      className={`add-course-btn ${isCourseRegistered(course.title) ? "registered" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isCourseRegistered(course.title)) {
                          addCourseToRegistration(course);
                        }
                      }}
                      disabled={addingCourse || isCourseRegistered(course.title)}
                    >
                      {isCourseRegistered(course.title) ? "Already Registered" : 
                       addingCourse ? "Adding..." : "Add Course"}
                    </button>
                  </div>
                </div>
              </div>
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

      {/* Modules Modal */}
      <Modal 
        show={showModulesModal} 
        onHide={() => setShowModulesModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedCourse?.title} - Course Modules</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCourse && selectedCourse.modules && Array.isArray(selectedCourse.modules) ? (
            <div>
              <div className="course-progress-container mb-4">
                <h5>Course Progress: {courseProgress[selectedCourse.course_id] || 0}%</h5>
                <div className="progress">
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ width: `${courseProgress[selectedCourse.course_id] || 0}%` }}
                    aria-valuenow={courseProgress[selectedCourse.course_id] || 0} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
              
              <div className="modules-list">
                {selectedCourse.modules.map((module, index) => (
                  <div key={index} className="module-item mb-3 p-3 border rounded">
                    <div className="d-flex align-items-start">
                      <Form.Check 
                        type="checkbox"
                        id={`module-${index}`}
                        className="me-3 mt-1"
                        checked={completedModules[selectedCourse.course_id]?.[index] || false}
                        onChange={(e) => handleModuleChange(selectedCourse.course_id, index, e.target.checked)}
                      />
                      <div className="flex-grow-1">
                        <h6>{module[0]}</h6>
                        <p className="mb-0 text-muted">{module[1]}</p>
                      </div>
                      {completedModules[selectedCourse.course_id]?.[index] && (
                        <FaCheckCircle className="text-success ms-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {areAllModulesCompleted(selectedCourse.course_id) && (
                <div className="text-center mt-4">
                  <Button 
                    variant="success" 
                    onClick={() => handleCompleteCourse(selectedCourse.course_id)}
                  >
                    Complete Course
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p>No modules available for this course.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModulesModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TrainingDashBoard;