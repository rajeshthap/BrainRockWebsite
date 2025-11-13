import React, { useEffect } from "react";
import "../custom/Alert.css";

const ModifyAlert = ({ message, show, setShow }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, setShow]);

  if (!show) return null;

  return (
    <div className="alert-toast">
      {message}
    </div>
  );
};

export default ModifyAlert;
