import React, { useState } from "react";
import "../../assets/css/trainingvideoplayer.css";
import { VideoPlayer } from "@graphland/react-video-player";
import { useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaStar, FaChartLine, FaShareAlt, FaPlay, FaCheck } from "react-icons/fa";
import { Button } from "react-bootstrap";

const TrainingVideoPlayer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Remove this line that was causing immediate navigation
  // navigate("/TrainingDashBoard");

  const {
    title = "How to Make a Responsive Website in React JS",
    video = "https://www.w3schools.com/html/mov_bbb.mp4",
    poster = "https://i.ibb.co/4Y6HcRD/reactjs-banner.png",
    instructor = "John Doe",
    rating = 4.1,
    totalHours = "1.5",
    totalStudents = "2,456"
  } = location.state || {};

  const [activeIndex, setActiveIndex] = useState(0);

  const chapters = [
    { id: 1, title: "Introduction and Showcase", time: "19min", completed: true, isCurrent: true },
    { id: 2, title: "Together Section", time: "10min", completed: true, isCurrent: false },
    { id: 3, title: "Not Your Section", time: "14min", completed: false, isCurrent: false },
    { id: 4, title: "Membership", time: "12min", completed: false, isCurrent: false },
    { id: 5, title: "About", time: "7min", completed: false, isCurrent: false },
    { id: 6, title: "Footer", time: "9min", completed: false, isCurrent: false },
    { id: 7, title: "Desktop Responsive", time: "8min", completed: false, isCurrent: false },
    { id: 8, title: "Responsiveness in Tablet and Mobile", time: "14min", completed: false, isCurrent: false }
  ];

  const handleChapterClick = (index) => {
    setActiveIndex(index);
    // Here you would typically load the corresponding video
  };

  const handleGoToDashboard = () => {
    navigate("/TrainingDashBoard");
  };

  return (
    <div className="tvp-page tvp-with-margin">
      {/* TOP HEADER LIKE UDEMY */}
      <header className="tvp-header">
        <div className="tvp-left-section">
          <button className="tvp-dashboard-btn" onClick={handleGoToDashboard}>
            <FaHome /> Dashboard
          </button>
        </div>

        <h2 className="tvp-title">{title}</h2>

        <div className="tvp-right-buttons">
          <button className="tvp-btn">
            <FaStar /> Leave a rating
          </button>
          <button className="tvp-btn">
            <FaChartLine /> Your progress
          </button>
          <button className="tvp-btn">
            <FaShareAlt /> Share
          </button>
        </div>
      </header>

      {/* MAIN FULLSCREEN CONTENT */}
      <div className="tvp-main">
        {/* LEFT VIDEO PLAYER AREA */}
        <div className="tvp-video">
          <VideoPlayer
            src={video}
            poster={poster}
            primaryColor="#5624d0"
            height="100%"
            width="100%"
            style={{ marginTop: "130px" }}
            autoPlay={true}
          />
          
          {/* Blue button with margin-top 125px, centered */}
          <div className="tvp-button-container">
            <button className="tvp-blue-button">Complete Lecture & Continue</button>
          </div>
          

        </div>
       
        {/* RIGHT SIDEBAR CONTENT */}
        <aside className="tvp-sidebar">
          <div className="sidebar-header">
            <h3 className="sidebar-heading">Course content</h3>
            <span className="content-stats">8 lectures</span>
          </div>

          <div className="course-content">
            <div className="lecture-section">
              <div className="lecture-section-header">
                <div className="lecture-section-title">
                  <i className="expand-icon">▼</i>
                  <span>Introduction and Showcase</span>
                </div>
                <span className="lecture-section-time">19min</span>
              </div>
              
              <ul className="lecture-list">
                {chapters.map((item, index) => (
                  <li
                    key={item.id}
                    className={`lecture-item ${activeIndex === index ? "active" : ""}`}
                    onClick={() => handleChapterClick(index)}
                  >
                    <div className="lecture-left">
                      {item.completed ? (
                        <div className="lecture-checkbox completed">
                          <FaCheck />
                        </div>
                      ) : (
                        <div className="lecture-checkbox">
                          <div className="checkbox-inner"></div>
                        </div>
                      )}
                      <div className="lecture-content">
                        <div className="lecture-number">{index + 1}.</div>
                        <div className="lecture-title">{item.title}</div>
                      </div>
                    </div>
                    <div className="lecture-right">
                      {activeIndex === index ? (
                        <div className="current-lecture">
                          <span className="current-label">Current lecture</span>
                        </div>
                      ) : (
                        <span className="lecture-time">{item.time}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TrainingVideoPlayer;