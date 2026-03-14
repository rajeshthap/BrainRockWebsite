import React from 'react';
import './UpdateNotification.css';

const UpdateNotification = ({ onRefresh }) => {
  return (
    <div className="update-notification">
      <div className="update-notification-content">
        <div className="update-notification-icon">🔄</div>
        <div className="update-notification-text">
          <h3>New update available!</h3>
          <p>A new version of the application is available. Please refresh to get the latest features and improvements.</p>
        </div>
        <button 
          className="update-notification-button"
          onClick={onRefresh}
        >
          Refresh Now
        </button>
      </div>
    </div>
  );
};

export default UpdateNotification;