import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner, Pagination } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { AiOutlineFileDone } from 'react-icons/ai'; // Default icon
import { FaPlus, FaTrash } from 'react-icons/fa'; // Icons for module management

// Define the base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const EditCourses = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  // Data state
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    price: "",
    offer_price: "", // Added offer_price field
    duration: "",
    course_type: "basic", // Added course_type with default value
    icon: null,
    modules: [] // Add modules to form data
  });
  const [iconPreview, setIconPreview] = useState(null);
  const [hasIconChanged, setHasIconChanged] = useState(false);

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/course-items/`);
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const result = await response.json();
        const coursesData = result.data || result;

        // Process the data to construct full icon URLs and format prices
        const processedCourses = coursesData.map(course => ({
          ...course,
          icon: course.icon ? `${API_BASE_URL}${course.icon}?t=${Date.now()}` : null,
          formattedPrice: new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
          }).format(course.price),
          // Add formatted offer price if it exists
          formattedOfferPrice: course.offer_price ? new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
          }).format(course.offer_price) : null
        }));

        setCourses(processedCourses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Filter courses based on search term
  const filteredCourses = searchTerm.trim() === ''
    ? courses
    : courses.filter((course) => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        course.title?.toLowerCase().includes(lowerSearch) ||
        course.description?.toLowerCase().includes(lowerSearch) ||
        course.duration?.toLowerCase().includes(lowerSearch)
      );
    });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        // Create FormData to send the ID in the payload as requested
        const dataToSend = new FormData();
        dataToSend.append('id', id);

        // Use the base endpoint for DELETE
        const response = await fetch(`${API_BASE_URL}/api/course-items/`, {
          method: 'DELETE',
          credentials: 'include',
          body: dataToSend,
        });

        if (!response.ok) {
          throw new Error('Failed to delete course');
        }

        // Update the state to remove the deleted item
        setCourses(prevData => prevData.filter(item => item.id !== id));

        setMessage("Course deleted successfully!");
        setVariant("success");
        setShowAlert(true);

        setTimeout(() => setShowAlert(false), 3000);
      } catch (error) {
        console.error('Error deleting course:', error);
        setMessage(error.message || "Failed to delete course");
        setVariant("danger");
        setShowAlert(true);

        setTimeout(() => setShowAlert(false), 5000);
      }
    }
  };

  // Handle edit
  const handleEdit = (course) => {
    setCurrentEditItem(course);
    setEditFormData({
      title: course.title,
      description: course.description,
      price: course.price,
      offer_price: course.offer_price || "", // Add offer_price from course data
      duration: course.duration,
      course_type: course.course_type || "basic", // Get course_type from course or default to "basic"
      icon: null,
      modules: course.modules || [] // Initialize modules from course data
    });
    // Use the original image without the timestamp for the preview
    const originalImageUrl = course.icon ? course.icon.split('?t=')[0] : null;
    setIconPreview(originalImageUrl);
    setHasIconChanged(false);
    setShowEditModal(true);
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'icon') {
      const file = files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setIconPreview(previewUrl);
        setHasIconChanged(true);
        setEditFormData(prev => ({
          ...prev,
          [name]: file
        }));
      }
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle module changes
  const handleModuleChange = (index, field, value) => {
    const updatedModules = [...editFormData.modules];
    if (!updatedModules[index]) {
      updatedModules[index] = ["", ""];
    }
    updatedModules[index][field === 'name' ? 0 : 1] = value;
    setEditFormData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  // Add a new module
  const addModule = () => {
    setEditFormData(prev => ({
      ...prev,
      modules: [...prev.modules, ["", ""]]
    }));
  };

  // Remove a module
  const removeModule = (index) => {
    const updatedModules = [...editFormData.modules];
    updatedModules.splice(index, 1);
    setEditFormData(prev => ({
      ...prev,
      modules: updatedModules
    }));
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = new FormData();
    // MANDATORY: Send the ID in the payload
    dataToSend.append('id', currentEditItem.id);
    dataToSend.append('title', editFormData.title);
    dataToSend.append('description', editFormData.description);
    dataToSend.append('price', editFormData.price);
    dataToSend.append('offer_price', editFormData.offer_price); // Add offer_price to form data
    dataToSend.append('duration', editFormData.duration);
    dataToSend.append('course_type', editFormData.course_type); // Add course_type to form data

    // Add modules as JSON string
    dataToSend.append('modules', JSON.stringify(editFormData.modules));

    // Store the current preview URL before submission
    const currentPreviewUrl = iconPreview;

    if (hasIconChanged && editFormData.icon) {
      dataToSend.append('icon', editFormData.icon);
    }

    try {
      // Use the base endpoint for PUT
      const response = await fetch(`${API_BASE_URL}/api/course-items/`, {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `Failed to update course (Status: ${response.status})`);
      }

      const apiResponseData = await response.json();

      // --- INSTANT UI UPDATE WITH CORRECT PATH ---
      setCourses(prevData =>
        prevData.map(item =>
          item.id === currentEditItem.id
            ? {
              ...item,
              title: editFormData.title,
              description: editFormData.description,
              price: editFormData.price,
              offer_price: editFormData.offer_price, // Update offer_price
              duration: editFormData.duration,
              course_type: editFormData.course_type, // Update course_type
              modules: editFormData.modules,
              // Update formatted prices
              formattedPrice: new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0
              }).format(editFormData.price),
              formattedOfferPrice: editFormData.offer_price ? new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0
              }).format(editFormData.offer_price) : null,
              // Use the preview URL immediately if icon was changed
              // This ensures the new image shows up instantly
              icon: hasIconChanged
                ? currentPreviewUrl
                : (apiResponseData.data && apiResponseData.data.icon
                  ? `${API_BASE_URL}${apiResponseData.data.icon}?t=${Date.now()}`
                  : item.icon)
            }
            : item
        )
      );

      setMessage("Course updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);

      setTimeout(() => setShowAlert(false), 3000);

      // If icon was changed, fetch the updated course data after a short delay
      // This will replace the temporary preview URL with the actual server URL
      if (hasIconChanged) {
        setTimeout(async () => {
          try {
            const refreshResponse = await fetch(`${API_BASE_URL}/api/course-items/`);
            if (refreshResponse.ok) {
              const refreshResult = await refreshResponse.json();
              const refreshCoursesData = refreshResult.data || refreshResult;

              const updatedCourse = refreshCoursesData.find(c => c.id === currentEditItem.id);
              if (updatedCourse && updatedCourse.icon) {
                setCourses(prevData =>
                  prevData.map(item =>
                    item.id === currentEditItem.id
                      ? {
                        ...item,
                        icon: `${API_BASE_URL}${updatedCourse.icon}?t=${Date.now()}`
                      }
                      : item
                  )
                );
              }
            }
          } catch (refreshError) {
            console.error('Error refreshing course data:', refreshError);
          }
        }, 2000); // Wait 2 seconds for the server to process the image
      }
    } catch (error) {
      console.error('Error updating course:', error);
      setMessage(error.message || "Failed to update course");
      setVariant("danger");
      setShowAlert(true);

      setTimeout(() => setShowAlert(false), 5000);
    }
  };

  return (
    <div className="dashboard-container">
      <LeftNavManagement
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      <div className="main-content">
        <AdminHeader toggleSidebar={toggleSidebar} />
        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">Manage Courses</h2>
              <div style={{ width: '300px' }}>
                <input
                  type="text"
                  placeholder="Search by title, description, or duration..."
                  className="form-control"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {showAlert && (
              <Alert variant={variant} className="mb-4" onClose={() => setShowAlert(false)} dismissible>
                {message}
              </Alert>
            )}

            {loading ? (
              <div className="text-center my-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <>
                <Row>
                  {currentItems.length === 0 ? (
                    <Col xs={12} className="text-center my-5">
                      <p>{searchTerm ? 'No courses match your search.' : 'No courses found.'}</p>
                    </Col>
                  ) : (
                    currentItems.map((course) => (
                      <Col lg={4} md={6} sm={12} className="mb-4" key={course.id}>
                        <Card className="h-100">
                          <Card.Body>
                            <div className="d-flex align-items-center mb-3">
                              {/* Display the icon or a default */}
                              {course.icon ? (
                                <img
                                  src={course.icon}
                                  alt={course.title}
                                  style={{ width: '60px', height: '60px', marginRight: '15px' }}
                                />
                              ) : (
                                <AiOutlineFileDone size={60} style={{ marginRight: '15px' }} />
                              )}
                              <div>
                                <Card.Title className="managetitle">{course.title}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                  Duration: {course.duration}
                                  {course.course_type && (
                                    <span className="ms-2 badge bg-info">
                                      {course.course_type.charAt(0).toUpperCase() + course.course_type.slice(1)}
                                    </span>
                                  )}
                                </Card.Subtitle>
                              </div>
                            </div>
                            <Card.Text>{course.description}</Card.Text>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <div className="fw-bold">Price: {course.formattedPrice}</div>
                                {course.formattedOfferPrice && (
                                  <div className="text-success">Offer Price: {course.formattedOfferPrice}</div>
                                )}
                              </div>
                              <div>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleEdit(course)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDelete(course.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))
                  )}
                </Row>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                      {[...Array(totalPages).keys()].map(page => (
                        <Pagination.Item
                          key={page + 1}
                          active={page + 1 === currentPage}
                          onClick={() => handlePageChange(page + 1)}
                        >
                          {page + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </Container>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Course</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            <Row>
              <Col lg={4} md={6} sm={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="price"
                    value={editFormData.price}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col lg={4} md={6} sm={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Offer Price ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="offer_price"
                    value={editFormData.offer_price}
                    onChange={handleEditChange}
                  />
                </Form.Group>
              </Col>
              <Col lg={4} md={6} sm={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration</Form.Label>
                  <Form.Control
                    type="text"
                    name="duration"
                    value={editFormData.duration}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col lg={4} md={6} sm={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Type</Form.Label>
                  <Form.Select
                    name="course_type"
                    value={editFormData.course_type}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="basic">Basic</option>
                    <option value="medium">Medium</option>
                    <option value="advance">Advance</option>
                  </Form.Select>
                </Form.Group>
              </Col>
           

              <Col lg={4} md={6} sm={12}>
            <Form.Group className="mb-3">
              <Form.Label>Course Icon</Form.Label>
              <Form.Control
                type="file"
                name="icon"
                onChange={handleEditChange}
                accept="image/*"
              />
              {iconPreview && (
                <div className="mt-3">
                  <img
                    src={iconPreview}
                    alt="Icon Preview"
                    style={{ maxWidth: '100px', maxHeight: '100px' }}
                  />
                </div>
              )}
            </Form.Group>
            </Col>
             </Row>

            {/* Modules Section */}
            <Form.Group className="mb-3">
              <Form.Label className="d-flex justify-content-between align-items-center">
                <span>Course Modules</span>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={addModule}
                  type="button"
                >
                  <FaPlus className="me-1" /> Add Module
                </Button>
              </Form.Label>

              {editFormData.modules.length === 0 ? (
                <Card className="text-center p-3 bg-light">
                  <p className="text-muted mb-0">No modules added yet. Click "Add Module" to get started.</p>
                </Card>
              ) : (
                <div className="modules-container">
                  {editFormData.modules.map((module, index) => (
                    <Card key={index} className="mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h5 className="mb-0">Module {index + 1}</h5>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeModule(index)}
                            type="button"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-2">
                              <Form.Label>Module Name</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="e.g., Module 1"
                                value={module[0]}
                                onChange={(e) => handleModuleChange(index, 'name', e.target.value)}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-2">
                              <Form.Label>Module Description</Form.Label>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="e.g., Basic Introduction"
                                value={module[1]}
                                onChange={(e) => handleModuleChange(index, 'description', e.target.value)}
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default EditCourses;