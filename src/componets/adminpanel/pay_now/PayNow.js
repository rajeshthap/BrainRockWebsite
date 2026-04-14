import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../../../assets/css/PayNow.css';

function PayNow() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;
  const retryDelay = 2000;

  const orderId = searchParams.get('order_id');

  const fetchPaymentUrl = async (attempt = 0) => {
    try {
      setLoading(true);
      setError(null);
        
      if (!orderId) {
        throw new Error('Order ID not found in URL');
      }

      const apiUrl = `https://brainrock.in/brainrock/backend/api/start-payment/${orderId}/`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include',
      });
        
      if (!response.ok) {
        if (response.status === 500 && attempt < maxRetries - 1) {
          console.log(`Retrying... attempt ${attempt + 2}`);
          setRetryCount(attempt + 1);
          setTimeout(() => fetchPaymentUrl(attempt + 1), retryDelay);
          return;
        }
        throw new Error(`Failed to fetch payment details: ${response.status}`);
      }

      const data = await response.json();
        
      if (data.success && data.payment_url) {
        setPaymentUrl(data.payment_url);
      } else {
        throw new Error(data.message || 'Payment URL not found');
      }
    } catch (err) {
      if (err.message.includes('Retrying')) {
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchPaymentUrl();
    } else {
      setError('Invalid order ID');
      setLoading(false);
    }
  }, [orderId]);

  const handlePayment = () => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    fetchPaymentUrl(0);
  };

  if (loading && retryCount === 0) {
    return (
      <div className="paynow-container">
        <div className="paynow-loading">
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="paynow-container">
        <div className="paynow-error">
          <p>Error: {error}</p>
          <button className="paynow-retry-btn" onClick={handleRetry}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (retryCount > 0 && loading) {
    return (
      <div className="paynow-container">
        <div className="paynow-loading">
          <p>Preparing payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="paynow-container">
      <button className="paynow-btn" onClick={handlePayment}>
        💳 Pay Now
      </button>
    </div>
  );
}

export default PayNow;
