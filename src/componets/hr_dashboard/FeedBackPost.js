import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import "../../assets/css/FeedPostCard.css";
import Profile from "../../assets/images/women.jpg";

const FeedBackPost = () => {
  return (
    <div> 
      <div className="post-container">
        <Card className="post-card">
          <Card.Body>
            {/* Header with author info */}
            <div className="d-flex align-items-center mb-3">
              <div className="author-avatar">
                <div className="avatar-placeholder">KH</div>
              </div>
              <div className="ms-3">
                <Card.Title className="mb-0 author-name">
                  Kamal Hassan
                </Card.Title>
                <Card.Subtitle className="text-muted author-info">
                  Human Resource HR Team
                </Card.Subtitle>
                <Card.Text className="text-muted post-time">
                  2 days ago
                </Card.Text>
              </div>
            </div>

            {/* Main content */}
            <Card.Text className="post-content">
              Let's change "MONDAY BLUES" to "MONDAY NEW" and keep a positive
              attitude!
            </Card.Text>

            {/* Illustration */}
           
            {/* Quote */}
            <div className="quote-container my-4 p-3 bg-light rounded">
              <div className="d-flex justify-content-between">
                  <div>
<img src={Profile} className="img-fluid br-post-img" alt="img"></img>
</div>
              <Card.Text className="quote-text fst-italic">
                "To be yourself in a world that is constantly trying to make you
                something else is the greatest accomplishment."
                 "To be yourself in a world that is constantly trying to make you
                something else is the greatest accomplishment."
                 "To be yourself in a world that is constantly trying to make you
                something else is the greatest accomplishment."
                 "To be yourself in a world that is constantly trying to make you
                something else is the greatest accomplishment."
              </Card.Text>
            
</div>
              <Card.Text className="quote-author text-end">
                - Ralph Waldo Emerson
              </Card.Text>
            </div>

            {/* Engagement metrics */}
            <div className="d-flex justify-content-between my-3">
              <div className="engagement-metrics">
                <Badge pill bg-light text-dark className="me-2">
                  <i className="bi bi-heart-fill text-danger me-1"></i> 90
                </Badge>
                <Badge pill bg-light text-dark>
                  <i className="bi bi-chat-fill text-primary me-1"></i> 10
                </Badge>
              </div>
            </div>

            {/* Action buttons */}
            <div className="d-flex justify-content-between border-top pt-3">
              <Button variant="light" className="action-button">
                <i className="bi bi-heart me-2"></i> Like
              </Button>
              <Button variant="light" className="action-button">
                <i className="bi bi-chat me-2"></i> Comment
              </Button>
              <Button variant="light" className="action-button">
                <i className="bi bi-share me-2"></i> Share
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default FeedBackPost;
