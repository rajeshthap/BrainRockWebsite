import React from "react";
import "../../assets/css/recommended.css";
import { useNavigate } from "react-router-dom";

const RecommendedCourses = () => {
  const navigate = useNavigate();

  const recommendedList = [
    {
      title: "React - The Complete Guide 2025",
      instructor: "Maximilian Schwarzmüller",
      rating: "4.7",
      price: "₹529",
      img: "https://i.ibb.co/4Y6HcRD/reactjs-banner.png",
    },
    {
      title: "Next.js & React 2025 Complete Guide",
      instructor: "Academind",
      rating: "4.6",
      price: "₹789",
      img: "https://i.ibb.co/bKnDKbP/nextjs.png",
    },
    {
      title: "React 18 / 19 Fast Track Course",
      instructor: "Jannick Leismann",
      rating: "4.7",
      price: "₹479",
      img: "https://i.ibb.co/4Y6HcRD/reactjs-banner.png",
    },
    {
      title: "Advanced TypeScript & React Projects",
      instructor: "Janis Smilga",
      rating: "4.7",
      price: "₹709",
      img: "https://i.ibb.co/3MZfsSS/ts-react.png",
    },
  ];

  return (
    <div className="recommended-container">
      <h1 className="rec-heading">Recommended Courses</h1>
      <p className="rec-sub">Based on your learning activity</p>

      <div className="rec-grid">
        {recommendedList.map((item, index) => (
          <div key={index} className="rec-card">
            <img src={item.img} className="rec-img" alt={item.title} />

            <div className="rec-info">
              <h3 className="rec-title">{item.title}</h3>
              <p className="rec-inst">{item.instructor}</p>

              <div className="rec-meta">
                <span className="rec-rating">⭐ {item.rating}</span>
                <span className="rec-price">{item.price}</span>
              </div>

              <button
                className="rec-btn"
                onClick={() =>
                  navigate("/TrainingVideoPlayer", {
                    state: {
                      title: item.title,
                      video: "https://www.w3schools.com/html/mov_bbb.mp4",
                      poster: item.img,
                    },
                  })
                }
              >
                Watch Now →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendedCourses;
