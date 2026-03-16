import React, { useContext, useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Dropdown,
  Image,
} from "react-bootstrap";
import {
  FaBars,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { AuthContext } from "../context/AuthContext";
import { FaUser } from "react-icons/fa6";

const API_BASE_URL = 'https://brainrock.in/brainrock/backend/api';

function UserHeader({ toggleSidebar, searchTerm, setSearchTerm }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // State for user details
  const [userDetails, setUserDetails] = useState({
    full_name: "",
    profile_photo: null,
  });

  // State for wallet amount
  const [walletAmount, setWalletAmount] = useState(0);

  // Fetch wallet amount and user details
  useEffect(() => {
    const fetchData = async () => {
      if (user && user.unique_id) {
        try {
          // Fetch wallet amount
          const walletResponse = await axios.get(
            `${API_BASE_URL}/test-winner-cashback/?user_id=${user.unique_id}`,
            { withCredentials: true }
          );
          
          if (walletResponse.data.status) {
            setWalletAmount(walletResponse.data.cashback || 0);
          }

          // Fetch user profile details
          const profileResponse = await axios.get(
            `${API_BASE_URL}/test-winners/?user_id=${user.unique_id}`,
            { withCredentials: true }
          );

          if (profileResponse.data.status && profileResponse.data.data.student_profile) {
            setUserDetails({
              full_name: profileResponse.data.data.student_profile.full_name || "",
              profile_photo: profileResponse.data.data.student_profile.profile_photo || null,
            });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setWalletAmount(0);
        }
      }
    };

    fetchData();
  }, [user]);

  // Get user display name
  const getDisplayName = () => {
    return userDetails.full_name || "User";
  };

  // Get user photo URL
  const getUserPhotoUrl = () => {
    if (userDetails.profile_photo) {
      return `https://brainrock.in/brainrock/backend${userDetails.profile_photo}`;
    }
    // Fallback to a default avatar
    return `https://ui-avatars.com/api/?name=ADMIN&background=0d6efd&color=fff&size=40`;
  };

  return (
    <header className="dashboard-header">
      <Container fluid>
        <Row className="align-items-center">
          <Col xs="auto">
            <Button
              variant="light"
              className="sidebar-toggle"
              onClick={toggleSidebar}
            >
              <FaBars />
            </Button>
          </Col>

          <Col className="d-flex align-items-center justify-content-end">
            <div className="wallet-info d-flex align-items-center bg-light px-3 py-2 rounded-pill me-3">
              <span className="wallet-label me-2 text-muted">Wallet:</span>
              <span className="wallet-amount fw-bold text-primary">₹{walletAmount.toFixed(2)}</span>
            </div>

            <div className="header-actions">
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" className="user-profile-btn">
                  <Image
                    src={getUserPhotoUrl()}
                    roundedCircle
                    className="user-avatar"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=ADMIN&background=0d6efd&color=fff&size=40`;
                    }}
                  />
                  <span className="user-name d-none d-md-inline">{getDisplayName()}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => navigate('/UserProfile')}>
      <FaUser className="me-2" /> My Profile
    </Dropdown.Item>
                  <Dropdown.Item onClick={logout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </Col>
        </Row>
      </Container>
    </header>
  );
}

export default UserHeader;