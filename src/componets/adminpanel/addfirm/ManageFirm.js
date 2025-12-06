import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Pagination } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { FaBuilding } from 'react-icons/fa'; // Building icon for firms

// Define the base URL as a constant to avoid repetition
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const ManageFirm = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Data state
  const [firmData, setFirmData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firm_name: "",
    firm_logo: null
  });
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [hasImageChanged, setHasImageChanged] = useState(false);
  
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

  // Fetch firm data
  useEffect(() => {
    const fetchFirmData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/firm/`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch firm data');
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Construct full image URLs
          const data = result.data.map(item => ({
            ...item,
            firm_logo: item.firm_logo ? `${API_BASE_URL}${item.firm_logo}?t=${Date.now()}` : null
          }));
          setFirmData(data);
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (error) {
        console.error('Error fetching firm data:', error);
        setMessage(error.message || "Failed to fetch firm data");
        setVariant("danger");
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFirmData();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Filter firm data based on search term
  const filteredFirmData = searchTerm.trim() === '' 
    ? firmData 
    : firmData.filter((item) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          item.firm_name?.toLowerCase().includes(lowerSearch) ||
          item.firm_id?.toLowerCase().includes(lowerSearch)
        );
      });
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFirmData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFirmData.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Handle delete
  const handleDelete = async (id, firm_id) => {
    if (window.confirm("Are you sure you want to delete this firm?")) {
      try {
        const dataToSend = new FormData();
        // Send firm_id in the payload as requested
        dataToSend.append('firm_id', firm_id);

        const response = await fetch(`${API_BASE_URL}/api/firm/`, {
          method: 'DELETE',
          credentials: 'include',
          body: dataToSend,
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete firm');
        }
        
        setFirmData(prevData => prevData.filter(item => item.id !== id));
        
        setMessage("Firm deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        setTimeout(() => setShowAlert(false), 3000);
      } catch (error) {
        console.error('Error deleting firm:', error);
        setMessage(error.message || "Failed to delete firm");
        setVariant("danger");
        setShowAlert(true);
        
        setTimeout(() => setShowAlert(false), 5000);
      }
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setCurrentEditItem(item);
    setEditFormData({
      firm_name: item.firm_name,
      firm_logo: null
    });
    // Use the original image without the timestamp for the preview
    const originalImageUrl = item.firm_logo ? item.firm_logo.split('?t=')[0] : null;
    setEditImagePreview(originalImageUrl);
    setHasImageChanged(false);
    setShowEditModal(true);
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'firm_logo') {
      const file = files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setEditImagePreview(previewUrl);
        setHasImageChanged(true);
      }
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    const dataToSend = new FormData();
    // Send firm_id in the payload as requested
    dataToSend.append('firm_id', currentEditItem.firm_id);
    dataToSend.append('firm_name', editFormData.firm_name);
    
    if (hasImageChanged && e.target.firm_logo.files[0]) {
      dataToSend.append('firm_logo', e.target.firm_logo.files[0]);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/firm/`, {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `Failed to update firm (Status: ${response.status})`);
      }
      
      const apiResponseData = await response.json();

      // Generate a unique timestamp for cache busting
      const timestamp = Date.now();
      
      // Instant UI update with correct path
      setFirmData(prevData =>
        prevData.map(item =>
          item.id === currentEditItem.id
            ? {
                ...item,
                firm_name: editFormData.firm_name,
                // Always update the image URL with a new timestamp to force refresh
                firm_logo: hasImageChanged
                  ? (editImagePreview && editImagePreview.startsWith('blob:')
                      ? editImagePreview // Use the blob URL for immediate preview
                      : `${API_BASE_URL}${apiResponseData.data.firm_logo || item.firm_logo?.split('?t=')[0]}?t=${timestamp}`)
                  : `${item.firm_logo?.split('?t=')[0]}?t=${timestamp}` // Add timestamp to existing image
              }
            : item
        )
      );
      
      setMessage("Firm updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);
      
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error updating firm:', error);
      setMessage(error.message || "Failed to update firm");
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
              <h2 className="mb-0">Manage Firms</h2>
              <div style={{ width: '300px' }}>
                <input
                  type="text"
                  placeholder="Search by firm name or ID..."
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
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
              <Row>
                {currentItems.length === 0 ? (
                  <Col xs={12} className="text-center my-5">
                    <p>{searchTerm ? 'No firms match your search.' : 'No firms found.'}</p>
                  </Col>
                ) : (
                  currentItems.map((item) => (
                    <Col lg={4} md={6} sm={12} className="mb-4" key={item.id}>
                      <Card className="h-100">
                        {item.firm_logo ? (
                          <Card.Img
                            variant="top"
                            src={item.firm_logo}
                            alt={item.firm_name || "Firm logo"}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="d-flex justify-content-center align-items-center" style={{ height: '200px', backgroundColor: '#f8f9fa' }}>
                            <FaBuilding size={60} color="#6c757d" />
                          </div>
                        )}
                        <Card.Body>
                          <Card.Title className="managetitle">{item.firm_name}</Card.Title>
                          <Card.Subtitle className="mb-2 text-muted">ID: {item.firm_id}</Card.Subtitle>
                          <div className="d-flex justify-content-between align-items-center">
                            
                            <div>
                              <Button
                                variant="primary"
                                size="sm"
                                className="me-2"
                                onClick={() => handleEdit(item)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(item.id, item.firm_id)}
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
          <Modal.Title>Edit Firm</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Firm ID</Form.Label>
              <Form.Control
                type="text"
                value={currentEditItem?.firm_id || ""}
                disabled
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Firm Name</Form.Label>
              <Form.Control
                type="text"
                name="firm_name"
                value={editFormData.firm_name}
                onChange={handleEditChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Firm Logo</Form.Label>
              <Form.Control
                type="file"
                name="firm_logo"
                onChange={handleEditChange}
                accept="image/*"
              />
              {editImagePreview && (
                <div className="mt-3">
                  <img
                    src={editImagePreview}
                    alt="Logo Preview"
                    style={{ maxWidth: '200px', maxHeight: '150px' }}
                  />
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

export default ManageFirm;