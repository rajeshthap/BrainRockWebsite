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

  const navigate = useNavigate();

  // ⭐ Redirect Function
  const openVideoPage = () => {
    navigate("/TrainingVideoPlayer", {
      state: {
        title: "How to Make a Responsive Website in React JS",
        video: "https://www.w3schools.com/html/mov_bbb.mp4",
        poster: "https://i.ibb.co/4Y6HcRD/reactjs-banner.png"
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
        return { title: "All Courses", desc: "Browse your enrolled courses." };
      case "lists":
        return { title: "My Lists", desc: "Your saved course collections." };
      case "wishlist":
        return { title: "Wishlist", desc: "Your favourite saved courses." };
      case "archived":
        return { title: "Archived", desc: "Courses you have archived." };
      case "tools":
        return { title: "Learning Tools", desc: "Improve your learning habits." };
      default:
        return { title: "My Learning", desc: "Keep learning & growing." };
    }
  };

  const banner = getBannerContent();

  const AllCoursesUI = () => (
    <div className="all-courses-wrapper">

      <div className="weekly-streak-card">
        <h3 className="ws-title">Start a weekly streak</h3>
        <p className="ws-sub">Watch 5 minutes of video per day to reach your goals.</p>

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

      {/* ⭐ COURSE CARD CLICKABLE */}
      <div className="course-card-container">
        <div className="course-card" >

          {/* ⭐ Wishlist Heart Button */}
         

          <div onClick={openVideoPage}>
            <div className="course-video">
              <VideoPlayer
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                poster="https://i.ibb.co/4Y6HcRD/reactjs-banner.png"
                primaryColor="#5624d0"
                height={220}
                width={"100%"}
                autoPlay={false}
              />
            </div>

            <div className="course-info">
              <h3 className="course-title">How to Make a Responsive Website in React JS</h3>
              <p className="course-instructor">Software Engineer</p>
 <button
            className="wishlist-btn-show" style={{ cursor: "pointer",}}
          
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "all":
        return <AllCoursesUI />;

      case "wishlist":
        return (
          <div className="wishlist-section">
            <h2>Wishlist</h2>
            {wishlist.length === 0 ? (
              <p>No courses added yet.</p>
            ) : (
              wishlist.map((item, index) => (
                <div key={index} className="wishlist-item">
                  <img src={item.poster} alt="" width="120" />
                  <div>
                    <h4>{item.title}</h4>
                    <button
                      onClick={() =>
                        navigate("/TrainingVideoPlayer", { state: item })
                      }
                    >
                      Watch Now →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case "lists":
        return <h2>My Lists</h2>;

      case "archived":
        return <h2>Archived Courses</h2>;

      case "tools":
        return <h2>Learning Tools</h2>;

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
            <button className={`tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>All courses</button>
            <button className={`tab-btn ${activeTab === "lists" ? "active" : ""}`} onClick={() => setActiveTab("lists")}>My Lists</button>
            <button className={`tab-btn ${activeTab === "wishlist" ? "active" : ""}`} onClick={() => setActiveTab("wishlist")}>Wishlist</button>
            <button className={`tab-btn ${activeTab === "archived" ? "active" : ""}`} onClick={() => setActiveTab("archived")}>Archived</button>
            <button className={`tab-btn ${activeTab === "tools" ? "active" : ""}`} onClick={() => setActiveTab("tools")}>Learning tools</button>
          </div>

          <div className="tab-content-wrapper">{renderTabContent()}</div>

        </Container>
      </div>
    </div>
  );
};

export default TrainingDashBoard;
