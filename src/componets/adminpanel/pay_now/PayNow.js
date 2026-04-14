import React from 'react';
import '../../../assets/css/PayNow.css';

function PayNow() {

  const handlePayment = () => {
    alert("Proceeding to Payment...");
    // यहाँ आप payment API call कर सकते हो (Razorpay / Stripe etc.)
  };

  return (
    <div className="paynow-container">
      <button className="paynow-btn" onClick={handlePayment}>
        💳 Pay Now
      </button>
    </div>
  );
}

export default PayNow;