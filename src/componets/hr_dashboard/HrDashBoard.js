import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, Table, Modal, Form, Badge, InputGroup } from "react-bootstrap";
import {
  FaTachometerAlt,
  FaUsers,
  FaPlus,
  FaGift,
  FaUserCheck,
  FaTimes,
  FaHeart,
  FaRegHeart,
  FaSearch,
} from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Tooltip, ResponsiveContainer } from "recharts";
import "../../assets/css/emp_dashboard.css";
import SideNav from "./SideNav";
import LeaveCalendar from "./hr_iinerpage/LeaveCalendar";
import FeedBackPost from "./FeedBackPost";
import { CiEdit } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import TeamMember from "./hr_iinerpage/TeamMember";
import HrHeader from "./HrHeader";
import LeaveBalance from "./hr_iinerpage/LeaveBalance";
import { BsFillFilePostFill } from "react-icons/bs";
import { GiImpactPoint } from "react-icons/gi";
import { LuFileBadge2 } from "react-icons/lu";

const HrDashBoard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [birthdays, setBirthdays] = useState([]);
  const [birthdayLoading, setBirthdayLoading] = useState(true);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [employeeCount, setEmployeeCount] = useState({
    total_employees: 0,
    total_active: 0,
    total_inactive: 0
  });
  const [attendanceSummary, setAttendanceSummary] = useState({
    total_employees: 0,
    present_today: 0,
    on_leave_today: 0,
    absent_today: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const navigate = useNavigate();

  // Post related states
  const [showPostModal, setShowPostModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [postLoading, setPostLoading] = useState(true);
  const [postError, setPostError] = useState("");
  const [postSuccess, setPostSuccess] = useState("");
  const [postAuthor, setPostAuthor] = useState(""); // Removed static "Kamal Hassan"
  const [postDepartment] = useState("Human Resource HR Team");
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postQuote, setPostQuote] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Employee data state
  const [employees, setEmployees] = useState({});
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null); // Added to store current user info
  const baseUrl = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/";

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${baseUrl}api/current-user/`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setCurrentUser(data);
        setPostAuthor(data.full_name || data.username || "User");
      } catch (error) {
        // If we can't fetch user data, just use a generic value
        setPostAuthor("User");
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch employee data
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${baseUrl}api/employee-list/`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Create a mapping of employee IDs to employee data
        const employeeMap = {};
        data.forEach(emp => {
          employeeMap[emp.emp_id] = {
            fullName: `${emp.first_name} ${emp.last_name}`,
            profilePhoto: emp.profile_photo ? `${baseUrl}${emp.profile_photo}` : null,
            designation: emp.designation,
            department: emp.department
          };
        });
        
        setEmployees(employeeMap);
      } catch (error) {
        // Removed console.error
      } finally {
        setEmployeesLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Fetch employee count data
  useEffect(() => {
    const fetchEmployeeCount = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/get-employees-count/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setEmployeeCount(data);
      } catch (error) {
        // Removed console.error
      }
    };

    fetchEmployeeCount();
  }, []);

  // Fetch attendance summary data
  useEffect(() => {
    const fetchAttendanceSummary = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/today-attendance-summary/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success) {
          setAttendanceSummary({
            total_employees: data.total_employees,
            present_today: data.present_today,
            on_leave_today: data.on_leave_today,
            absent_today: data.absent_today
          });
        }
      } catch (error) {
        // Removed console.error
      } finally {
        setStatsLoading(false);
      }
    };

    fetchAttendanceSummary();
  }, []);

  // Fetch birthday data
  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/get-birthday-list/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.birthdays_today) {
          setBirthdays(data.birthdays_today);
        }
      } catch (error) {
        // Removed console.error
      } finally {
        setBirthdayLoading(false);
      }
    };

    fetchBirthdays();
  }, []);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/all-post/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Ensure liked_by_users is always an array
          const processedPosts = data.data.map(post => ({
            ...post,
            liked_by_users: post.liked_by_users || []
          }));
          
          setPosts(processedPosts);
        }
      } catch (error) {
        // Removed console.error
        setPostError("Failed to load posts. Please try again.");
      } finally {
        setPostLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Responsive check
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setSidebarOpen(width >= 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Get first 2 birthdays and remaining count
  const displayBirthdays = birthdays.slice(0, 1);
  const remainingCount = birthdays.length > 1 ? birthdays.length - 1 : 0;

  // Function to determine button color based on status
  const getButtonColor = (status) => {
    if (!status) return "btn-secondary";
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes("active")) return "btn-primary";
    if (statusLower.includes("approved")) return "btn-success";
    if (statusLower.includes("processed")) return "btn-info";
    if (statusLower.includes("present")) return "btn-warning";
    if (statusLower.includes("absent")) return "btn-danger btn-br-dgr";
    if (statusLower.includes("rejected")) return "btn-danger";
    
    return "btn-secondary";
  };

  // Handle post submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setPostError("");
    setPostSuccess("");
    
    try {
      // Create post data according to API format
      const postData = {
        content: postContent,
        image: postImage
      };
      
      const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/all-post/', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setPostSuccess("Post created successfully!");
        setPostContent("");
        setPostImage(null);
        setImagePreview(null);
        setPostTitle("");
        setPostDescription("");
        setPostQuote("");
        
        // Refresh posts
        const fetchPosts = async () => {
          try {
            const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/all-post/', {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
              // Ensure liked_by_users is always an array
              const processedPosts = data.data.map(post => ({
                ...post,
                liked_by_users: post.liked_by_users || []
              }));
              
              setPosts(processedPosts);
            }
          } catch (error) {
            // Removed console.error
          }
        };
        
        fetchPosts();
        
        setTimeout(() => {
          setShowPostModal(false);
        }, 1500);
      } else {
        setPostError(data.message || "Failed to create post. Please try again.");
      }
    } catch (error) {
      // Removed console.error
      setPostError("Failed to create post. Please try again.");
    }
  };

  // Handle like/unlike - Updated to update UI immediately
  const handleLike = async (postId) => {
    // Find the post to check if it's already liked
    const post = posts.find(p => p.post_id === postId);
    if (!post) return;
    
    // Check if user has already liked this post
    const isLiked = post.liked_by_users && post.liked_by_users.includes(postAuthor);
    
    // Update UI immediately
    setPosts(prevPosts => 
      prevPosts.map(p => {
        if (p.post_id === postId) {
          const likedByUsers = p.liked_by_users || [];
          
          // If user liked the post
          if (!isLiked) {
            return {
              ...p,
              like_count: (p.like_count || 0) + 1,
              liked_by_users: [...likedByUsers, postAuthor]
            };
          } 
          // If user unliked the post
          else {
            return {
              ...p,
              like_count: Math.max((p.like_count || 0) - 1, 0),
              liked_by_users: likedByUsers.filter(id => id !== postAuthor)
            };
          }
        }
        return p;
      })
    );
    
    try {
      let response;
      
      if (isLiked) {
        // Use DELETE method for unlike with post_id in payload
        response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/post-like/', {
          method: 'DELETE',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            post_id: postId
          })
        });
      } else {
        // Use POST method for like with post_id in payload
        response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/post-like/', {
          method: 'POST',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            post_id: postId
          })
        });
      }
      
      if (!response.ok) {
        // If API call fails, revert the UI change
        setPosts(prevPosts => 
          prevPosts.map(p => {
            if (p.post_id === postId) {
              const likedByUsers = p.liked_by_users || [];
              
              // If user liked the post (revert)
              if (!isLiked) {
                return {
                  ...p,
                  like_count: Math.max((p.like_count || 0) - 1, 0),
                  liked_by_users: likedByUsers.filter(id => id !== postAuthor)
                };
              } 
              // If user unliked the post (revert)
              else {
                return {
                  ...p,
                  like_count: (p.like_count || 0) + 1,
                  liked_by_users: [...likedByUsers, postAuthor]
                };
              }
            }
            return p;
          })
        );
      }
    } catch (error) {
      // If there's an exception, revert the UI change
      setPosts(prevPosts => 
        prevPosts.map(p => {
          if (p.post_id === postId) {
            const likedByUsers = p.liked_by_users || [];
            
            // If user liked the post (revert)
            if (!isLiked) {
              return {
                ...p,
                like_count: Math.max((p.like_count || 0) - 1, 0),
                liked_by_users: likedByUsers.filter(id => id !== postAuthor)
              };
            } 
            // If user unliked the post (revert)
            else {
              return {
                ...p,
                like_count: (p.like_count || 0) + 1,
                liked_by_users: [...likedByUsers, postAuthor]
              };
            }
          }
          return p;
        })
      );
    }
  };

  // Filter posts based on search term
  const filteredPosts = posts.filter(post => {
    if (!searchTerm) return true;
    
    // Search by content or author name
    const authorData = employees[post.created_by] || {};
    const authorName = authorData.fullName || "";
    
    return (
      (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      authorName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // HR Stats Data - using API data
  const statsData = [
    {
      title: "Employee Overview",
      value: "Total Employees:",
      number: ` ${employeeCount.total_employees}`,
      change: "Active",
      leavnumber: ` ${employeeCount.total_active}`,
      Leavechange: "On Leave:",
      onleave: `${attendanceSummary.on_leave_today}`,
      resign: "Inactive:",
      resignumber: `${employeeCount.total_inactive}`,
      icon: <FaUsers />,
    },
    {
      title: "Attendance Summary",
      value: "Absent:",
      number: ` ${attendanceSummary.absent_today}`,
      change: "Present",
      leavnumber: ` ${attendanceSummary.present_today}`,
      icon: <FaTachometerAlt />,
    },
    {
      title: "Leave Requests",
      value: "Pending:",
      number: " 5",
      change: "Approved",
      leavnumber: " 1",
      resign: "Rejected:",
      resignumber: "5",
      icon: <FaTachometerAlt />,
    },
    {
      title: "Payroll Summary",
      value: "Current Month Processed:",
      number: " ₹24,00,000",
      change: "Processed",
      icon: <FaTachometerAlt />,
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <SideNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <HrHeader toggleSidebar={toggleSidebar} />

        {/* Dashboard Body */}
        <Container fluid className="dashboard-body">
          <Row className="align-items-center mb-4">
            <Col lg={6} md={12} sm={12}>
              <h1 className="page-title">Dashboard</h1>
              <Col lg={4} md={12} sm={12}>
                <div className="quick-actions">
                  <Button
                    variant="primary"
                    className="w-100 btn-emp mb-2"
                    onClick={() => navigate("/EmployeeRegistration")}
                    style={{ cursor: "pointer" }}
                  >
                    <FaPlus className="me-2" /> Add Employee
                  </Button>
                </div>
              </Col>
            </Col>

            <Col
              lg={6}
              md={12}
              sm={12}
              className="d-flex gap-2 br-post-top-btn align-items-center"
            >
              <span onClick={() => setShowPostModal(true)} style={{cursor:"pointer"}}>
                <BsFillFilePostFill className="br-post-top-icon" />
                Post
              </span>

              <span className="border-start ps-2">
                <LuFileBadge2 className="br-post-top-icon" />
                Badge
              </span>
              <span className="border-start ps-2">
                <GiImpactPoint className="br-post-top-icon" />
                Reward points
              </span>
              <span className="border-start ps-2">
                <FaUserCheck className="br-post-top-icon" />
                Endorse
              </span>
            </Col>
          </Row>

          <Row>
            <Col lg={3} md={12} sm={12} xm={12} className="mb-3">
              <Row>
                {" "}
                {statsData.map((stat, index) => (
                  <Col
                    lg={12}
                    md={6}
                    sm={6}
                    xm={6}
                    className="mb-3"
                    key={index}
                  >
                    <Card className="stat-card">
                      <Card.Body>
                        <div className="stat-content">
                          <div className="stat-icon">{stat.icon}</div>

                          <div className="stat-info">
                            <h6 className="stat-title">{stat.title}</h6>
                            <h3 className="stat-value">
                              {stat.value}
                              <span className="stat-number">{stat.number}</span>
                            </h3>

                            <h3 className="stat-value">
                              {stat.Leavechange}
                              <span className="stat-leave-num">
                                {stat.onleave}
                              </span>
                            </h3>
                            <h3 className="stat-value">
                              {stat.change}
                              <span className="stat-change-num">
                                {stat.leavnumber}
                              </span>
                            </h3>
                            <h3 className="stat-value">
                              {stat.resign}
                              <span className="stat-resign-num">
                                {stat.resignumber}
                              </span>
                            </h3>
                          </div>
                          <div className="br-stat-info ">
                            <Button
                              className={`br-stat-btn ${getButtonColor(stat.change)}`}
                            >
                              {stat.change}
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
            <Col lg={5} md={12} sm={12} className="mb-3">
              {/* POST MODAL */}
              <Modal
                show={showPostModal}
                onHide={() => setShowPostModal(false)}
                centered
                size="lg"
              >
                <Modal.Header closeButton>
                  <Modal.Title>Create New Post</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                  {postError && <div className="alert alert-danger">{postError}</div>}
                  {postSuccess && <div className="alert alert-success">{postSuccess}</div>}
                  
                  {/* Post Author Section - Using dynamic user data */}
                  <div className="d-flex align-items-center mb-4">
                    <div
                      style={{
                        width: "55px",
                        height: "55px",
                        borderRadius: "50%",
                        backgroundColor: "#e0e0e0",
                        overflow: "hidden",
                      }}
                    >
                      {/* Profile Image - using user data if available */}
                      {currentUser && currentUser.profile_photo ? (
                        <img
                          src={`${baseUrl}${currentUser.profile_photo}`}
                          alt="profile"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div 
                          className="d-flex align-items-center justify-content-center h-100"
                          style={{ backgroundColor: "#007bff", color: "white" }}
                        >
                          {postAuthor ? postAuthor.substring(0, 2).toUpperCase() : "U"}
                        </div>
                      )}
                    </div>

                    <div className="ms-3">
                      <h6 className="fw-bold mb-0">{postAuthor || "User"}</h6>
                      <small className="text-muted">{postDepartment}</small>
                    </div>
                  </div>

                  <Form onSubmit={handlePostSubmit}>
                    {/* Title */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Post Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter title"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Description</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Write something..."
                        value={postDescription}
                        onChange={(e) => setPostDescription(e.target.value)}
                      ></textarea>
                    </div>

                    {/* Quote Field */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Quote (Optional)</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder='e.g. "To be yourself in a world..."'
                        value={postQuote}
                        onChange={(e) => setPostQuote(e.target.value)}
                      ></textarea>
                    </div>

                    {/* Image Upload */}
                    <div className="mb-3">
                      <label className="form-label fw-bold">Upload Image</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setPostImage(file);
                          if (file) setImagePreview(URL.createObjectURL(file));
                        }}
                      />
                    </div>

                    {/* Preview */}
                    {imagePreview && (
                      <div className="mb-3 text-center">
                        <img
                          src={imagePreview}
                          alt="preview"
                          style={{
                            width: "250px",
                            height: "auto",
                            borderRadius: "10px",
                            border: "1px solid #ddd",
                          }}
                        />
                      </div>
                    )}

                    <div className="d-flex justify-content-end gap-2">
                      <Button variant="secondary" onClick={() => setShowPostModal(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handlePostSubmit}
                      >
                        Submit Post
                      </Button>
                    </div>
                  </Form>
                </Modal.Body>
              </Modal>

              {/* Posts Section with Custom Scrollbar */}
              <Card className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Posts</h5>
                  <InputGroup className="w-50">
                    <InputGroup.Text>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search by content or author..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Card.Header>
                <Card.Body className="p-0" style={{ height: "500px", overflow: "hidden" }}>
                  {postLoading || employeesLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : filteredPosts.length > 0 ? (
                    <div className="posts-container" style={{ height: "100%", overflowY: "auto", paddingRight: "10px" }}>
                      {filteredPosts.map((post) => {
                        // Ensure liked_by_users is always an array
                        const likedByUsers = post.liked_by_users || [];
                        const isLiked = likedByUsers.includes(postAuthor);
                        
                        // Get employee data for the post author
                        const authorData = employees[post.created_by] || {};
                        const authorName = authorData.fullName || "Unknown User";
                        const authorProfilePhoto = authorData.profilePhoto;
                        
                        // Fix the post image URL
                        const postImageUrl = post.image ? 
                          (post.image.startsWith('http') ? post.image : `${baseUrl}${post.image}`) : 
                          null;
                        
                        return (
                          <div key={post.id} className="post-item p-3 border-bottom">
                            <div className="d-flex align-items-start gap-3">
                              {/* Author Avatar */}
                              <div
                                style={{
                                  width: "45px",
                                  height: "45px",
                                  borderRadius: "50%",
                                  backgroundColor: "#e0e0e0",
                                  overflow: "hidden",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {authorProfilePhoto ? (
                                  <img
                                    src={authorProfilePhoto}
                                    alt={authorName}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  />
                                ) : (
                                  <span style={{ color: "white", fontWeight: "bold" }}>
                                    {authorName.split(' ').map(n => n[0]).join('')}
                                  </span>
                                )}
                              </div>

                              {/* Post Content */}
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <h6 className="mb-1 fw-bold">{authorName}</h6>
                                    <small className="text-muted">
                                      Posted • {formatDate(post.created_at)}
                                    </small>
                                  </div>
                                </div>

                                {/* Post Image First */}
                                {postImageUrl && (
                                  <div className="mt-2">
                                    <img
                                      src={postImageUrl}
                                      alt="Post"
                                      style={{
                                        maxWidth: "100%",
                                        maxHeight: "300px",
                                        borderRadius: "8px",
                                        objectFit: "cover",
                                      }}
                                    />
                                  </div>
                                )}

                                {/* Post Content After Image */}
                                <p className="mt-2">{post.content}</p>

                                {/* Like Button with Count in Front */}
                                <div className="d-flex align-items-center gap-2 mt-3">
                                  <Button
                                    variant="link"
                                    className="p-0 d-flex align-items-center gap-1"
                                    onClick={() => handleLike(post.post_id)}
                                  >
                                    {post.like_count > 0 && (
                                      <span className={post.like_count > 0 ? "text-danger me-1" : "me-1"}>
                                        {post.like_count}
                                      </span>
                                    )}
                                    {isLiked ? (
                                      <FaHeart className="text-danger" />
                                    ) : (
                                      <FaRegHeart />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">
                        {searchTerm ? "No posts found matching your search." : "No posts available."}
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>

              <FeedBackPost />
            </Col>
            <Col lg={4} md={12} sm={12} className="mb-3">
              {/* Dynamic Birthday Card */}
              {birthdayLoading ? (
                <Card className="birthday-card d-flex justify-content-between">
                  <div className="birthday-left d-flex align-items-center gap-3">
                    <FaGift className="birthday-icon" />
                    <div className="birthday-text">
                      <h6 className="birthday-title">Loading Birthdays...</h6>
                    </div>
                  </div>
                </Card>
              ) : birthdays.length > 0 ? (
                <Card className="birthday-card d-flex flex-column">
                  <div className="birthday-left d-flex align-items-center gap-3">
                    <FaGift className="birthday-icon" />
                    <div className="birthday-text">
                      <h6 className="birthday-title">Happy Birthday!</h6>
                      <p className="birthday-subtext mb-0">
                        <FaUsers className="me-1 br-birthday" /> {birthdays.length} {birthdays.length === 1 ? 'person has' : 'people have'} birthday today
                      </p>
                      <small className="birthday-date">Today</small>
                    </div>
                  </div>
                  
                  {/* Display first 2 birthdays */}
                  <div className="birthday-list mt-3">
                    {displayBirthdays.map((birthday, index) => (
                      <div key={index} className="birthday-item d-flex align-items-center gap-2 mb-2">
                        <div className="birthday-avatar bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '30px', height: '30px', color: 'white', fontSize: '0.7rem'}}>
                          {birthday.full_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="birthday-details">
                          <p className="mb-0 fw-bold">{birthday.full_name}</p>
                          <small className="text-muted">{birthday.designation}, {birthday.department}</small>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show +X more link if there are more birthdays */}
                    {remainingCount > 0 && (
                      <Button 
                        variant="link" 
                        className="birthday-more-link p-0 text-primary"
                        onClick={() => setShowBirthdayModal(true)}
                      >
                        +{remainingCount} more
                      </Button>
                    )}
                  </div>
                </Card>
              ) : (
                <Card className="birthday-card d-flex justify-content-between">
                  <div className="birthday-left d-flex align-items-center gap-3">
                    <FaGift className="birthday-icon" />
                    <div className="birthday-text">
                      <h6 className="birthday-title">No Birthdays Today</h6>
                      <p className="birthday-subtext mb-0">
                        <FaUsers className="me-1 br-birthday" /> Check back tomorrow
                      </p>
                      <small className="birthday-date">Today</small>
                    </div>
                  </div>
                </Card>
              )}
              <TeamMember />
              <LeaveCalendar />
              <LeaveBalance />
            </Col>
          </Row>
          {/* Stats Cards */}

          <Row>
            {/* Pie Chart */}

            {/* Leave Announcements */}

            <Col lg={4} md={12} sm={12}></Col>
          </Row>

          {/* Existing Table + Quick Actions (same layout) */}
        </Container>
      </div>

      {/* Birthday Modal */}
      <Modal 
        show={showBirthdayModal} 
        onHide={() => setShowBirthdayModal(false)}
        centered
        size="lg"
        className="birthday-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaGift className="text-primary" />
            Today's Birthdays ({birthdays.length})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="birthday-modal-list">
            {birthdays.map((birthday, index) => (
              <div key={index} className="birthday-modal-item d-flex align-items-center gap-3 p-3 border-bottom">
                <div className="birthday-modal-avatar bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px', color: 'white', fontSize: '1rem'}}>
                  {birthday.full_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="birthday-modal-details flex-grow-1">
                  <h6 className="mb-1 fw-bold">{birthday.full_name}</h6>
                  <p className="mb-1 text-muted">{birthday.designation}</p>
                  <p className="mb-0 text-muted">{birthday.department}</p>
                </div>
                
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBirthdayModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HrDashBoard;