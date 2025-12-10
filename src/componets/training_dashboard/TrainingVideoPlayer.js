import React, { useState } from "react";
import "../../assets/css/trainingvideoplayer.css";
import { VideoPlayer } from "@graphland/react-video-player";
import { useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaStar, FaChartLine, FaShareAlt, FaCheck } from "react-icons/fa";
import { FaGlobeAsia, FaClock, FaUserGraduate, FaCalendar } from "react-icons/fa";

const TrainingVideoPlayer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    title = "How to Make a Responsive Website in React JS with pure CSS",
    video = "https://www.w3schools.com/html/mov_bbb.mp4",
    poster = "https://i.ibb.co/4Y6HcRD/reactjs-banner.png",
  } = location.state || {};

  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview"); // ⭐ tab state
  const [chapters, setChapters] = useState([
    { id: 1, title: "Introduction and Showcase", time: "19min", completed: true },
    { id: 2, title: "Together Section", time: "10min", completed: true },
    { id: 3, title: "Not Your Section", time: "14min", completed: false },
    { id: 4, title: "Membership", time: "12min", completed: false },
    { id: 5, title: "About", time: "7min", completed: false },
    { id: 6, title: "Footer", time: "9min", completed: false },
    { id: 7, title: "Desktop Responsive", time: "8min", completed: false },
    { id: 8, title: "Responsiveness in Tablet and Mobile", time: "14min", completed: false },
  ]);
  const [courseCompleted, setCourseCompleted] = useState(false);

  // Calculate progress percentage
  const calculateProgress = () => {
    const totalChapters = chapters.length;
    const completedChapters = chapters.filter(c => c.completed).length;
    return Math.round((completedChapters / totalChapters) * 100);
  };

  const progress = calculateProgress();

  // Handle Complete Lecture button click
  const handleCompleteLecture = () => {
    const updatedChapters = [...chapters];
    if (activeIndex < updatedChapters.length && !updatedChapters[activeIndex].completed) {
      updatedChapters[activeIndex].completed = true;
      setChapters(updatedChapters);

      // Check if all lectures are completed
      if (updatedChapters.every(c => c.completed)) {
        setCourseCompleted(true);
      }

      // Move to next lecture if available
      if (activeIndex < updatedChapters.length - 1) {
        setActiveIndex(activeIndex + 1);
      }
    }
  };

  // Handle Submit button - mark course as fully completed
  const handleSubmitCourse = () => {
    console.log("Course submitted! Progress:", progress + "%");
    // API call to submit course completion can be added here
    alert(`Course completed and submitted! Progress: ${progress}%`);
    // Optionally navigate back or reset
  };

  const handleChapterClick = (index) => {
    setActiveIndex(index);
  };

  const handleGoToDashboard = () => {
    navigate("/TrainingDashBoard");
  };

  return (
    <div className="tvp-page tvp-with-margin">

      {/* HEADER */}
      <header className="tvp-header">
        <button className="tvp-dashboard-btn" onClick={handleGoToDashboard}>
          <FaHome /> Dashboard
        </button>

        <h2 className="tvp-title">{title}</h2>

        <div className="tvp-right-buttons">
          <button className="tvp-btn"><FaStar /> Leave a rating</button>
          <button className="tvp-btn"><FaChartLine /> Your progress</button>
          <button className="tvp-btn"><FaShareAlt /> Share</button>
        </div>
      </header>

      {/* MAIN */}
      <div className="tvp-main">

        {/* VIDEO SECTION */}
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

          {/* PROGRESS BAR */}
          <div className="tvp-progress-container">
            <div className="tvp-progress-label">
              <span>Course Progress: {progress}%</span>
            </div>
            <div className="tvp-progress-bar">
              <div className="tvp-progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          {/* COMPLETE BUTTON & SUBMIT BUTTON */}
          <div className="tvp-button-container">
            {!courseCompleted ? (
              <button className="tvp-blue-button" onClick={handleCompleteLecture}>
                Complete Lecture & Continue
              </button>
            ) : (
              <div className="tvp-completion-section">
                <p className="tvp-completion-message">✅ All lectures completed!</p>
                <button className="tvp-submit-button" onClick={handleSubmitCourse}>
                  Submit Course
                </button>
              </div>
            )}
          </div>

       
          {/* ⭐ TAB CONTENT AREA ⭐ */}
          <div className="tvp-tab-content">
   {/* ⭐ TABS LIKE UDEMY ⭐ */}
          <div className="tvp-tabs">
            <button
              className={`tvp-tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>

            <button
              className={`tvp-tab-btn ${activeTab === "notes" ? "active" : ""}`}
              onClick={() => setActiveTab("notes")}
            >
              Notes
            </button>

            <button
              className={`tvp-tab-btn ${activeTab === "announcements" ? "active" : ""}`}
              onClick={() => setActiveTab("announcements")}
            >
              Announcements
            </button>

            <button
              className={`tvp-tab-btn ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews
            </button>

            <button
              className={`tvp-tab-btn ${activeTab === "tools" ? "active" : ""}`}
              onClick={() => setActiveTab("tools")}
            >
              Learning tools
            </button>
          </div>

            {activeTab === "overview" && (
              <div>
                <h2 className="course-main-title">{title}</h2>

                <div className="course-meta-row">
                  <span className="rating">4.1 ⭐</span>
                  <span className="students"><FaUserGraduate /> 2,955 Students</span>
                  <span className="duration"><FaClock /> 1.5 hours</span>
                </div>

                <p className="update-info">
                  <FaCalendar /> Last updated January 2025
                </p>

                <p className="language-info">
                  <FaGlobeAsia /> English [Auto]
                </p>

                <div className="schedule-box">
                  <h4>📅 Schedule learning time</h4>
                  <p>
                    Learning a little each day adds up. Set reminders to stay consistent.
                  </p>
                  <button className="schedule-btn">Set Reminder</button>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div>
                <h3>Your Notes</h3>
                <p>You have not added any notes yet.</p>
              </div>
            )}

            {activeTab === "announcements" && (
              <div>
                <h3>Announcements</h3>
                <p>No announcements available.</p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h3>Student Reviews</h3>
                <p>No reviews yet.</p>
              </div>
            )}

            {activeTab === "tools" && (
              <div>
                <h3>Learning Tools</h3>
                <p>Tools and resources will appear here.</p>
              </div>
            )}

          </div>

        </div>

        {/* SIDEBAR */}
        <aside className="tvp-sidebar">
          <div className="sidebar-header">
            <h3 className="sidebar-heading">Course content</h3>
            <span className="content-stats">8 lectures</span>
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
                    <div className="lecture-checkbox completed"><FaCheck /></div>
                  ) : (
                    <div className="lecture-checkbox"><div className="checkbox-inner"></div></div>
                  )}

                  <div className="lecture-content">
                    <div className="lecture-number">{index + 1}.</div>
                    <div className="lecture-title">{item.title}</div>
                  </div>
                </div>

                <div className="lecture-right">
                  {activeIndex === index ? (
                    <span className="current-label">Current lecture</span>
                  ) : (
                    <span className="lecture-time">{item.time}</span>
                  )}
                </div>

              </li>
            ))}
          </ul>
        </aside>

      </div>
    </div>
  );
};

export default TrainingVideoPlayer;
