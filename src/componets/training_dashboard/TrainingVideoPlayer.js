import React, { useState } from "react";
import "../../assets/css/trainingvideoplayer.css";
import { VideoPlayer } from "@graphland/react-video-player";
import { useLocation } from "react-router-dom";

const TrainingVideoPlayer = () => {
  const location = useLocation();

  const {
    title = "Course Title",
    video = "https://www.w3schools.com/html/mov_bbb.mp4",
    poster = "https://i.ibb.co/4Y6HcRD/reactjs-banner.png",
  } = location.state || {};

  const [activeIndex, setActiveIndex] = useState(0);

  const chapters = [
    { title: "Introduction and Showcase", time: "19min" },
    { title: "Together Section", time: "10min" },
    { title: "Not Your Section", time: "14min" },
    { title: "Membership", time: "12min" },
    { title: "About", time: "7min" },
    { title: "Footer", time: "9min" },
    { title: "Desktop Responsive", time: "8min" },
    { title: "Responsiveness in Tablet and Mobile", time: "14min" }
  ];

  return (
    <div className="tvp-page">

      {/* TOP HEADER LIKE UDEMY */}
      <header className="tvp-header">
        <h2 className="tvp-title">{title}</h2>

        <div className="tvp-right-buttons">
          <button className="tvp-btn">Leave a rating</button>
          <button className="tvp-btn">Your progress</button>
          <button className="tvp-btn">Share</button>
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
            autoPlay={true}
          />
        </div>

        {/* RIGHT SIDEBAR CONTENT */}
        <aside className="tvp-sidebar">
          <h3 className="sidebar-heading">Course content</h3>

          <ul className="chapter-list">
            {chapters.map((item, index) => (
              <li
                key={index}
                className={`chapter-item ${activeIndex === index ? "active" : ""}`}
                onClick={() => setActiveIndex(index)}
              >
                <div className="chapter-left">
                  <input type="checkbox" defaultChecked />
                  <span className="chapter-title">{item.title}</span>
                </div>

                <span className="chapter-time">{item.time}</span>
              </li>
            ))}
          </ul>
        </aside>

      </div>
    </div>
  );
};

export default TrainingVideoPlayer;
