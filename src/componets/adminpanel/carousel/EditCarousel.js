import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal,Pagination } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

// Define the base URL as a constant to avoid repetition
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const EditCarousel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Data state
  const [carouselData, setCarouselData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    alt: ""
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

  // Fetch carousel data
  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/carousel-items/`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch carousel data');
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Construct full image URLs
          const data = result.data.map(item => ({
            ...item,
            image: item.image ? `${API_BASE_URL}${item.image}?t=${Date.now()}` : null
          }));
          setCarouselData(data);
        } else {
          throw new Error('API returned unsuccessful response');
        }
      } catch (error) {
        console.error('Error fetching carousel data:', error);
        setMessage(error.message || "Failed to fetch carousel data");
        setVariant("danger");
        setShowAlert(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselData();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // Filter carousel data based on search term
  const filteredCarouselData = searchTerm.trim() === '' 
    ? carouselData 
    : carouselData.filter((item) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          item.title?.toLowerCase().includes(lowerSearch) ||
          item.subtitle?.toLowerCase().includes(lowerSearch) ||
          item.description?.toLowerCase().includes(lowerSearch)
        );
      });
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCarouselData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCarouselData.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this carousel item?")) {
      try {
        const dataToSend = new FormData();
        dataToSend.append('id', id);

        const response = await fetch(`${API_BASE_URL}/api/carousel-items/`, {
          method: 'DELETE',
          credentials: 'include',
          body: dataToSend,
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete carousel item');
        }
        
        setCarouselData(prevData => prevData.filter(item => item.id !== id));
        
        setMessage("Carousel item deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        setTimeout(() => setShowAlert(false), 3000);
      } catch (error) {
        console.error('Error deleting carousel item:', error);
        setMessage(error.message || "Failed to delete carousel item");
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
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      alt: item.alt
    });
    // Use the original image without the timestamp for the preview
    const originalImageUrl = item.image ? item.image.split('?t=')[0] : null;
    setEditImagePreview(originalImageUrl);
    setHasImageChanged(false);
    setShowEditModal(true);
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
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
    dataToSend.append('id', currentEditItem.id); 
    dataToSend.append('title', editFormData.title);
    dataToSend.append('subtitle', editFormData.subtitle);
    dataToSend.append('description', editFormData.description);
    
    if (hasImageChanged && e.target.image.files[0]) {
      dataToSend.append('image', e.target.image.files[0]);
    }
    
    dataToSend.append('alt', editFormData.alt);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/carousel-items/`, {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || `Failed to update carousel item (Status: ${response.status})`);
      }
      
      const apiResponseData = await response.json();

      // --- INSTANT UI UPDATE WITH CORRECT PATH ---
      setCarouselData(prevData => 
        prevData.map(item => 
          item.id === currentEditItem.id 
            ? {
                ...item,
                title: editFormData.title,
                subtitle: editFormData.subtitle,
                description: editFormData.description,
                alt: editFormData.alt,
                // CORRECTED: Construct the full URL using the base URL constant and the new path from the API response
                image: hasImageChanged && apiResponseData.data && apiResponseData.data.image
                    ? `${API_BASE_URL}${apiResponseData.data.image}?t=${Date.now()}`
                    : item.image // Keep the old image URL if no new one was uploaded
              } 
            : item
        )
      );
      // --- END INSTANT UI UPDATE ---
      
      setMessage("Carousel item updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);
      
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error updating carousel item:', error);
      setMessage(error.message || "Failed to update carousel item");
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
              <h2 className="mb-0">Manage Carousel Items</h2>
              <div style={{ width: '300px' }}>
                <input
                  type="text"
                  placeholder="Search by title, subtitle, or description..."
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
                    <p>{searchTerm ? 'No carousel items match your search.' : 'No carousel items found.'}</p>
                  </Col>
                ) : (
                  currentItems.map((item) => (
                    <Col lg={4} md={6} sm={12} className="mb-4" key={item.id}>
                      <Card className="h-100">
                        {item.image && (
                          <Card.Img 
                            variant="top" 
                            src={item.image} 
                            alt={item.alt || "Carousel image"}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        )}
                        <Card.Body>
                          <Card.Title>{item.title}</Card.Title>
                          <Card.Subtitle className="mb-2 text-muted">{item.subtitle}</Card.Subtitle>
                          <Card.Text>{item.description}</Card.Text>
                          <div className="d-flex justify-content-end">
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
                              onClick={() => handleDelete(item.id)}
                            >
                              Delete
                            </Button>
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
          <Modal.Title>Edit Carousel Item</Modal.Title>
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
              <Form.Label>Subtitle</Form.Label>
              <Form.Control
                type="text"
                name="subtitle"
                value={editFormData.subtitle}
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
            
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                onChange={handleEditChange}
                accept="image/*"
              />
              {editImagePreview && (
                <div className="mt-3">
                  <img 
                    src={editImagePreview} 
                    alt="Preview" 
                    style={{ maxWidth: '200px', maxHeight: '150px' }} 
                  />
                </div>
              )}
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Alt Text</Form.Label>
              <Form.Control
                type="text"
                name="alt"
                value={editFormData.alt}
                onChange={handleEditChange}
                required
              />
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

export default EditCarousel;