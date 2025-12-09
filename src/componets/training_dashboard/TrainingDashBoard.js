import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import "../../assets/css/trainingdashboard.css";

import TrainingHeader from "./TrainingHeader";
import TrainingLeftnav from "./TrainingLeftnav";
import { VideoPlayer } from "@graphland/react-video-player";
import { useNavigate } from "react-router-dom";
import { FaHeart } from "react-icons/fa";

const TrainingDashBoard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [wishlist, setWishlist] = useState([]); // ⭐ Wishlist state added
  const [difficultyFilter, setDifficultyFilter] = useState("all"); // Filter for difficulty levels

  const navigate = useNavigate();

  // ⭐ Redirect Function
  const openVideoPage = (course) => {
    navigate("/TrainingVideoPlayer", {
      state: {
        title: course.title,
        video: course.video,
        poster: course.poster
      }
    });
  };

  // ⭐ Add to Wishlist function
  const addToWishlist = (course) => {
    setWishlist((prev) => [...prev, course]);
  };

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

      {/* COURSE CARD CLICKABLE */}
      <div className="course-card-container"  style={{ cursor: "pointer" }} >
        <div className="course-card" >
          <div onClick={() => openVideoPage({
            title: "How to Make a Responsive Website in React JS",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            poster: "https://i.ibb.co/4Y6HcRD/reactjs-banner.png"
          })}>
            <div className="course-video">
              {/* Replaced VideoPlayer with just the poster image */}
              <img 
                src="https://i.ibb.co/4Y6HcRD/reactjs-banner.png" 
                alt="How to Make a Responsive Website in React JS"
                style={{ width: "100%", height: "220px", objectFit: "cover" }}
              />
            </div>

            <div className="course-info-text">
              <h3 className="course-title">How to Make a Responsive Website in React JS</h3>
              <p className="course-instructor">Software Engineer</p>
              <button
                className="wishlist-btn-show" style={{ cursor: "pointer",}}
                onClick={(e) => {
                  e.stopPropagation();
                  addToWishlist({
                    title: "How to Make a Responsive Website in React JS",
                    video: "https://www.w3schools.com/html/mov_bbb.mp4",
                    poster: "https://i.ibb.co/4Y6HcRD/reactjs-banner.png"
                  });
                }}
              >
                <i className="">
                  <FaHeart />
                </i>
              </button>
              <div className="course-meta">
                <span className="progress-text">88% complete</span>
                <div className="rating">⭐⭐⭐☆☆</div>
              </div>

              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "88%" }}></div>
              </div>

              <div className="course-footer">
                <span className="rate-text">Leave a rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ⭐ Recommended Courses UI Component
  const RecommendedCoursesUI = () => {
    const recommendedCourses = [
      {
        id: 1,
        title: "Advanced React Patterns",
        instructor: "React Expert",
        video: "https://www.w3schools.com/html/mov_bbb.mp4",
        poster: "https://i.ibb.co/4Y6HcRD/reactjs-banner.png",
        progress: 65,
        rating: 4,
        difficulty: "advanced",
        mrp: 2999,
        discountPrice: 999
      },
      {
        id: 2,
        title: "Node.js Complete Guide",
        instructor: "Backend Developer",
        video: "https://www.w3schools.com/html/mov_bbb.mp4",
        poster: "https://i.ibb.co/4Y6HcRD/reactjs-banner.png",
        progress: 30,
        rating: 5,
        difficulty: "medium",
        mrp: 1999,
        discountPrice: 699
      },
      {
        id: 3,
        title: "CSS Grid and Flexbox",
        instructor: "UI/UX Designer",
        video: "https://www.w3schools.com/html/mov_bbb.mp4",
        poster: "https://i.ibb.co/4Y6HcRD/reactjs-banner.png",
        progress: 0,
        rating: 4,
        difficulty: "basic",
        mrp: 1499,
        discountPrice: 499
      },
     
    ];

    const isInWishlist = (courseId) => {
      return wishlist.some(item => item.id === courseId);
    };

    // Filter courses based on difficulty
    const filteredCourses = difficultyFilter === "all" 
      ? recommendedCourses 
      : recommendedCourses.filter(course => course.difficulty === difficultyFilter);

    // Function to get difficulty badge styling
    const getDifficultyBadgeClass = (difficulty) => {
      switch(difficulty) {
        case "basic":
          return "difficulty-badge basic";
        case "medium":
          return "difficulty-badge medium";
        case "advanced":
          return "difficulty-badge advanced";
        default:
          return "difficulty-badge";
      }
    };

    return (
      <div className="recommended-courses-wrapper">
        <div className="recommended-courses-header">
          <h2>Recommended Courses</h2>
          <p>Based on your interests and learning history</p>
        </div>
        
        {/* Difficulty Filter */}
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
            className={`filter-btn ${difficultyFilter === "advanced" ? "active" : ""}`}
            onClick={() => setDifficultyFilter("advanced")}
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
                    <span className={getDifficultyBadgeClass(course.difficulty)}>
                      {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                    </span>
                  </div>
                  <p className="recommended-course-instructor">{course.instructor}</p>
                  
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
                    <span className="discount-price">₹{course.discountPrice}</span>
                    <span className="mrp-price">₹{course.mrp}</span>
                    <span className="discount-percentage">
                      {Math.round((1 - course.discountPrice/course.mrp) * 100)}% OFF
                    </span>
                  </div>

                  <div className="recommended-course-footer">
                    <span className="recommended-continue-btn">
                      {course.progress > 0 ? "Continue Learning" : "Start Course"}
                    </span>
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
    </div>
  );
};

export default TrainingDashBoard;