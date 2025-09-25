import axios from "axios";
import React, { useState, useEffect } from "react";
import { Form, Button, Card, Row, Container, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; //  for navigation
//import { verifyOTP, resendOTP } from "../../../api/auth";
 
const UserVerifyOtp = () => {
    //const [otp, setOtp] = useState("");
    const [countdown, setCountdown] = useState(60);
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [getotp, setotp] = useState("");
 
    const navigate = useNavigate();
 
    //  Get phone number from localStorage on mount
    useEffect(() => {
        const storedPhone = localStorage.getItem('phone');
           setPhone(storedPhone)
 
        if (storedPhone) {
            setPhone(storedPhone);
        }
    }, []);
 
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);
 
    const handleVerify = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
 
        if (!getotp || getotp.length < 4) {
            setError("Please enter a valid 4 or 6 digit OTP.");
            return;
        }
 
 
 
        try {
            const data = await axios.post("https://brjobsedu.com/Attendence_portal/api/Verifyotp/",
                { "phone": phone, "otp": getotp });
 
            setSuccess("OTP verified successfully!");
 
 
 
            navigate("/", { replace: true });
 
        } catch (err) {
            console.error("OTP Error:", err);
            setError("Invalid OTP. Please try again.");
        }
    };
const handleResend = async () => {
  setError("");
  setSuccess("");
 
  try {
    const response = await axios.post(
      "https://brjobsedu.com/Attendence_portal/api/Sendotp/",
      { phone }
    );
 
    setSuccess("OTP resent successfully!");
    setCountdown(60); // restart countdown
 
    //  If backend returns OTP in response (for testing)
    if (response.data?.otp) {
      setotp(response.data.otp); // auto-fill field with new OTP
 
      // 🔄 Auto verify OTP right after resend
      try {
        const verifyRes = await axios.post(
          "https://brjobsedu.com/Attendence_portal/api/Verifyotp/",
          { phone, otp: response.data.otp }
        );
 
        setSuccess("OTP verified successfully!");
       navigate("UserLogin", { replace: true }); // redirect to login page
      } catch (verifyErr) {
        console.error("Auto-verify after resend failed:", verifyErr);
        setError("Failed to auto-verify OTP. Please try manually.");
      }
    }
 
  } catch (err) {
    console.error("Resend OTP Error:", err);
    setError("Failed to resend OTP. Try again.");
  }
};
 
 
 
    //     setError("");
    //     setSuccess("");
    //     try {
    //       await resendOTP(phone);
    //       setSuccess("OTP resent successfully!");
    //       setCountdown(60); // Restart countdown
    //     } catch (err) {
    //       console.error("Resend OTP Error:", err);
    //       setError("Failed to resend OTP. Try again.");
    //     }
    //   };
 
    return (
        <Container className="nd-user-reg mt-4">
            <Row className="justify-content-center">
                <Col md={12}>
                    <Card className="user-verfy-otp p-4">
                        <Form onSubmit={handleVerify}>
                            <div className="text-center mb-3">
                                <h5>Verify OTP</h5>
                                <small>Time remaining: {countdown} sec</small>
                            </div>
 
                            {/* Phone Field */}
                            <Form.Group className="mb-3">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={phone}
                                    disabled
                                    readOnly
                                />
                            </Form.Group>
 
                            {/* OTP Field */}
                            <Form.Group className="mb-3">
                                <Form.Label>Enter OTP</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={getotp}
                                    onChange={(e) => setotp(e.target.value)}
                                    required
                                    maxLength={6}
                                />
                            </Form.Group>
 
                            {/* Error and Success Reason_querys */}
                            {error && <div className="text-danger mb-2">{error}</div>}
                            {success && <div className="text-success mb-2">{success}</div>}
 
                            {/* Buttons */}
                            <Button variant="primary" type="submit" className="w-100">
                                Verify OTP
                            </Button>
 
                            {<Button
                                    variant="link"
                                    className="w-100 mt-2"
                                    onClick={handleResend}
                                    disabled={countdown > 0} >
                                    Resend OTP
                            </Button> }
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};
 
export default UserVerifyOtp;