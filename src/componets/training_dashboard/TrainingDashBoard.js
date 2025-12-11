import React, { useState, useEffect, useContext } from "react";
import { Container, Modal, Button, Form } from "react-bootstrap";
import "../../assets/css/trainingdashboard.css";

import TrainingHeader from "./TrainingHeader";
import TrainingLeftnav from "./TrainingLeftnav";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaCheckCircle, FaDownload } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const TrainingDashBoard = () => {
  const { user } = useContext(AuthContext);
  const applicantId = user?.unique_id; // Get applicant ID from AuthContext
  
  // debug logs removed
  
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
  const [employeeDetails, setEmployeeDetails] = useState(null); // State to store employee details
  const [completedCourses, setCompletedCourses] = useState([]); // State to store completed courses from certificate API
  const [certificateData, setCertificateData] = useState({}); // State to store certificate data for each course
  const [completingCourse, setCompletingCourse] = useState(false); // State to track course completion process
 
  const navigate = useNavigate();
  const BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";

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

  // Function to check if a course is completed
  const isCourseCompleted = (courseId, courseTitle) => {
    // Check if there's a certificate for this course
    return completedCourses.some(cert => {
      // Check if the program name matches the course title
      const programMatches = cert.program === courseTitle;
      
      // If the API response includes course_id, check that too
      const courseIdMatches = cert.course_id === courseId;
      
      // Return true if either condition is met
      return programMatches || courseIdMatches;
    });
  };

  // Function to get certificate data for a course
  const getCertificateData = (courseId, courseTitle) => {
    return completedCourses.find(cert => {
      // Check if the program name matches the course title
      const programMatches = cert.program === courseTitle;
      
      // If the API response includes course_id, check that too
      const courseIdMatches = cert.course_id === courseId;
      
      // Return true if either condition is met
      return programMatches || courseIdMatches;
    });
  };

  // Function to view certificate in new tab
  const viewCertificate = (courseId, courseTitle) => {
    const cert = getCertificateData(courseId, courseTitle);
    if (cert && cert.pdf_file) {
      // Open the PDF in a new tab
      const certificateUrl = `${BASE_URL}${cert.pdf_file}`;
      window.open(certificateUrl, '_blank');
    } else {
      alert("Certificate not available.");
    }
  };

  // Function to calculate start date based on course duration
  const calculateStartDate = (course) => {
    if (!course || !course.duration) return null;
    
    const today = new Date();
    let durationInDays = 30; // Default duration
    
    // Try to extract duration in days from the duration string
    if (typeof course.duration === 'string') {
      const durationMatch = course.duration.match(/(\d+)/);
      if (durationMatch) {
        durationInDays = parseInt(durationMatch[1]);
      }
    } else if (typeof course.duration === 'number') {
      durationInDays = course.duration;
    }
    
    // Calculate start date by subtracting duration from today
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - durationInDays);
    
    // Format as YYYY-MM-DD
    return startDate.toISOString().split('T')[0];
  };

  // Function to handle course completion
  const handleCompleteCourse = async (courseId) => {
    // Prevent multiple clicks
    if (completingCourse) return;
    
    setCompletingCourse(true);
    
    // debug logs removed
    
    // Use user?.unique_id directly instead of applicantId to ensure we have the latest value
    const currentApplicantId = user?.unique_id;
    
    if (!currentApplicantId || !selectedCourse) {
      alert("Applicant ID or course details not available. Please try again.");
      setCompletingCourse(false);
      return;
    }
    
    try {
      // Get current date for to_date
      const today = new Date();
      const toDate = today.toISOString().split('T')[0];
      
      // Calculate start date based on course duration
      const fromDate = calculateStartDate(selectedCourse);
      
      // Prepare certificate data with course_id and applicant_id (using unique_id from AuthContext)
      const certificateData = {
        full_name: employeeDetails?.candidate_name || "",
        father_name: employeeDetails?.guardian_name || "",
        from_date: fromDate,
        to_date: toDate,
        program: selectedCourse.title,
        course_id: selectedCourse.course_id, // Add course_id
        applicant_id: currentApplicantId // Add applicant_id (using unique_id from AuthContext)
      };
      
      // Make POST request to certificate API
      const response = await fetch(
        `${BASE_URL}/api/certificate/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify(certificateData)
        }
      );
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get response text first to check if it's valid JSON
      const responseText = await response.text();
      
      let responseData; // Renamed to avoid conflict with outer scope
      try {
        responseData = JSON.parse(responseText);
      } catch (error) {
        alert("Invalid response from server. Please try again.");
        setCompletingCourse(false);
        return;
      }
      
      if (responseData && responseData.success) {
        alert("Course completed successfully! Certificate generated.");
        // Close the modal
        setShowModulesModal(false);
        
        // Refresh completed courses
        fetchCompletedCourses();
      } else {
        alert("Failed to generate certificate. Please try again.");
      }
    } catch (error) {
      alert("An error occurred while completing the course. Please try again.");
    } finally {
      setCompletingCourse(false);
    }
  };

  // Function to fetch completed courses
  const fetchCompletedCourses = async () => {
    // Use user?.unique_id directly instead of applicantId to ensure we have the latest value
    const currentApplicantId = user?.unique_id;
    
    if (!currentApplicantId) {
      return;
    }
    
    try {
      const response = await fetch(
        `${BASE_URL}/api/certificate/?applicant_id=${currentApplicantId}`,
        {
          method: "GET",
          credentials: 'include'
        }
      );

      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        
        setCompletedCourses([]);
        return;
      }
      
      
      
      // Check if the API returned a successful response with data
      if (data && data.success && data.data) {
        // Check if data is an array or object
        if (Array.isArray(data.data)) {
          setCompletedCourses(data.data);
        } else if (typeof data.data === 'object' && data.data !== null) {
          setCompletedCourses([data.data]);
        } else {
          setCompletedCourses([]);
        }
      } else {
        setCompletedCourses([]);
      }
    } catch (error) {
      setCompletedCourses([]);
    }
  };

  // Add to Wishlist function
  const addToWishlist = (course) => {
    setWishlist((prev) => [...prev, course]);
  };

  // Add Course to Registration function
  const addCourseToRegistration = async (course) => {
    // Use user?.unique_id directly instead of applicantId to ensure we have the latest value
    const currentApplicantId = user?.unique_id;
    
    if (!currentApplicantId) {
      return;
    }

    setAddingCourse(true);
    
    try {
      // Get current registration data
      const currentRegistration = allRegistrations.find(reg => reg.applicant_id === currentApplicantId);
      
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
        `${BASE_URL}/api/course-registration/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({
            applicant_id: currentApplicantId,
            application_for_course: updatedCourses,
            application_for_course_id: updatedCourseIds
          })
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        alert("Course added successfully!");
        
        // Refresh the registrations data
        const fetchResponse = await fetch(
          `${BASE_URL}/api/course-registration/`,
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
            registration.applicant_id === currentApplicantId
          );
          
          if (userRegistrations.length > 0) {
            setUserRegistrationData(userRegistrations[0]);
          }
        }
      } else {
        alert("Failed to add course. Please try again.");
      }
    } catch (error) {
      alert("An error occurred while adding the course. Please try again.");
    } finally {
      setAddingCourse(false);
    }
  };

  // Fetch employee details
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      // Use user?.unique_id directly instead of applicantId to ensure we have the latest value
      const currentApplicantId = user?.unique_id;
      
      if (!currentApplicantId) {
        return;
      }
      
      try {
        const response = await fetch(
          `${BASE_URL}/api/course-registration/?applicant_id=${currentApplicantId}`,
          {
            method: "GET",
            credentials: 'include'
          }
        );

        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const responseText = await response.text();
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (error) {
          setEmployeeDetails(null);
          return;
        }
        // Check if the API returned a successful response with data
        if (data && data.success && data.data) {
          // Check if data is an array or object
          if (Array.isArray(data.data) && data.data.length > 0) {
            setEmployeeDetails(data.data[0]);
          } else if (typeof data.data === 'object' && data.data !== null) {
            setEmployeeDetails(data.data);
          } else {
            setEmployeeDetails(null);
          }
        } else {
          setEmployeeDetails(null);
        }
      } catch (error) {
        setEmployeeDetails(null);
      }
    };

    fetchEmployeeDetails();
  }, [user]); // Depend on user instead of applicantId

  // Fetch completed courses
  useEffect(() => {
    fetchCompletedCourses();
  }, [user]); // Depend on user instead of applicantId

  // Fetch course items from API
  useEffect(() => {
    const fetchCourseItems = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/course-items/`);
        const data = await response.json();
        if (data.success) {
          setCourseItems(data.data);
        }
      } catch (error) {
        
      }
    };

    fetchCourseItems();
  }, []);

  // Fetch all course registrations
  useEffect(() => {
    // Use user?.unique_id directly instead of applicantId to ensure we have the latest value
    const currentApplicantId = user?.unique_id;
    
    
    const fetchAllRegistrations = async () => {
      
      try {
        const response = await fetch(
          `${BASE_URL}/api/course-registration/`,
          {
            method: "GET",
            credentials: 'include' // Include credentials in request
          }
        );

        const data = await response.json();
        
        // Check if the API returned a successful response with data
        if (data && data.success && data.data) {
          // Store all registrations
          setAllRegistrations(data.data);
          
          // Filter registrations for the current user
          const userRegistrations = data.data.filter(registration => registration.applicant_id === currentApplicantId);
          
          // If user has registrations, update the state
          if (userRegistrations.length > 0) {
            // Set the registration data to the first registration
            setUserRegistrationData(userRegistrations[0]);
          } else {
            setUserRegistrationData(null);
          }
        } else {
          // If no data is returned, set empty states
          setUserRegistrationData(null);
          setAllRegistrations([]);
        }
      } catch (error) {
        setUserRegistrationData(null);
        setAllRegistrations([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentApplicantId) {
      fetchAllRegistrations();
    } else {
      setLoading(false);
    }
  }, [user]); // Depend on user instead of applicantId

  // Match user registrations with course details
  useEffect(() => {
    // Use user?.unique_id directly instead of applicantId to ensure we have the latest value
    const currentApplicantId = user?.unique_id;
    
    if (courseItems.length > 0 && userRegistrationData) {
      
      
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
      
      
      
      // Find matching courses from the course-items API
      const matchedCourses = courseItems.filter(course => registeredCourseNames.includes(course.title) || registeredCourseIds.includes(course.course_id));
      
      
      // Enhance the matched courses with registration data
      const enhancedCourses = matchedCourses.map(course => {
        // Check if the course is completed by checking both course_id and title
        const isCompleted = isCourseCompleted(course.course_id, course.title);
        
        // Get certificate data for this course
        const certData = getCertificateData(course.course_id, course.title);
        
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
          progress: isCompleted ? 100 : (courseProgress[course.course_id] || 0),
          rating: 0,
          duration: course.duration || "30 Days",
          isCompleted: isCompleted, // Add a flag to indicate if the course is completed
          certificateData: certData // Store certificate data for this course
        };
      });
      
      setUserCourses(enhancedCourses);
    } else {
      setUserCourses([]);
    }
  }, [courseItems, userRegistrationData, user, courseProgress, completedCourses]); // Depend on user instead of applicantId

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
              <div className={`course-card ${course.isCompleted ? 'completed' : ''}`}>
                <div onClick={() => !course.isCompleted && openModulesModal(course)}>
                  <div className="course-video">
                    {/* Using course icon if available, otherwise use profile photo, then default poster */}
                    <img 
                      src={course.icon ? `${BASE_URL}${course.icon}` : 
                          course.profile_photo ? `${BASE_URL}${course.profile_photo}` : 
                          "https://i.ibb.co/4Y6HcRD/reactjs-banner.png"} 
                      alt={course.title}
                      style={{ width: "100%", height: "220px", objectFit: "cover" }}
                    />
                    {course.isCompleted && (
                      <div className="completed-badge">
                        <FaCheckCircle /> Completed
                      </div>
                    )}
                  </div>

                  <div className="course-info-text">
                    <h3 className="course-title">{course.title}</h3>
                    <p className="course-instructor">
                      {course.isCompleted ? "Status: Completed" : 
                       course.course_status ? `Status: ${course.course_status}` : 
                       "Duration: " + (course.duration || "N/A")}
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
                      {course.isCompleted && course.certificateData && (
                        <button
                          className="download-certificate-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewCertificate(course.course_id, course.title);
                          }}
                          title="View Certificate"
                        >
                          <FaDownload /> View Certificate
                        </button>
                      )}
                      {!course.isCompleted && (
                        <span className="rate-text">Leave a rating</span>
                      )}
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
    const coursesWithDefaults = courseItems.map(course => {
      // Check if the course is completed by checking both course_id and title
      const isCompleted = isCourseCompleted(course.course_id, course.title);
      
      // Get certificate data for this course
      const certData = getCertificateData(course.course_id, course.title);
      
      return {
        ...course,
        title: course.title,
        poster: course.icon,
        progress: isCompleted ? 100 : 0,
        rating: 4,
        // Use course_type from API or default to "basic"
        difficulty: course.course_type || "basic",
        price: course.price,
        isCompleted: isCompleted, // Add a flag to indicate if the course is completed
        certificateData: certData // Store certificate data for this course
      };
    });

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
            <div className={`recommended-course-card ${course.isCompleted ? 'completed' : ''}`} key={course.course_id}>
              <div>
                <div className="recommended-course-video">
                  {/* Replaced VideoPlayer with img tag */}
                  <img 
                    src={course.icon ? `${BASE_URL}${course.icon}` : 
                        "https://i.ibb.co/4Y6HcRD/reactjs-banner.png"} 
                    alt={course.title}
                    style={{ width: "100%", height: "180px", objectFit: "cover" }}
                  />
                  {course.isCompleted && (
                    <div className="completed-badge">
                      <FaCheckCircle /> Completed
                    </div>
                  )}
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
                      {course.isCompleted ? "Completed" : 
                       course.progress > 0 ? `${course.progress}% complete` : "Not started"}
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
                    {course.isCompleted && course.certificateData && (
                      <button
                        className="download-certificate-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          viewCertificate(course.course_id, course.title);
                        }}
                        title="View Certificate"
                      >
                        <FaDownload /> View Certificate
                      </button>
                    )}
                    {!course.isCompleted && (
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
                    )}
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
    <div className="dashboard-container  full-width">
      {/* <TrainingLeftnav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
      /> */}

      <div className="main-content full-width">
        <TrainingHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body full-width">
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
        onHide={() => {
          setShowModulesModal(false);
          setCompletingCourse(false); // Reset completingCourse state when modal is closed
        }}
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
                    disabled={completingCourse}
                  >
                    {completingCourse ? 'Processing...' : 'Complete Course'}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p>No modules available for this course.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowModulesModal(false);
            setCompletingCourse(false); // Reset completingCourse state when modal is closed
          }}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        /* Download Certificate Button Styles */
        .download-certificate-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .download-certificate-btn:hover {
          background: linear-gradient(135deg, #218838, #1ea085);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(40, 42, 167, 0.3);
        }

        .download-certificate-btn:active {
          transform: translateY(0);
        }

        .download-certificate-btn svg {
          font-size: 16px;
        }

        /* Completed Badge Styles */
        .completed-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(40, 167, 69, 0.9);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          backdrop-filter: blur(4px);
          z-index: 2;
        }

        .completed-badge svg {
          font-size: 14px;
        }

        /* Course Card Completed State */
        .course-card.completed,
        .recommended-course-card.completed {
          position: relative;
          border: 2px solid #28a745;
          box-shadow: 0 0 15px rgba(40, 167, 69, 0.2);
        }

        .course-card.completed::before,
        .recommended-course-card.completed::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #28a745, #20c997);
        }

        /* Course Footer Adjustments */
        .course-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #eee;
        }

        .recommended-course-footer {
          display: flex;
          justify-content: center;
          margin-top: 12px;
        }

        /* Progress Bar for Completed Courses */
        .course-card.completed .progress-fill,
        .recommended-course-card.completed .recommended-progress-fill {
          background: linear-gradient(90deg, #28a745, #20c997);
        }

        /* Hover Effects for Completed Courses */
        .course-card.completed:hover,
        .recommended-course-card.completed:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
        }
      `}</style>
    </div>
  );
};

export default TrainingDashBoard;