import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner,Pagination } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { AiOutlineFileText } from 'react-icons/ai'; // Default icon for design and development items

// Define base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const ManageDesAndDev = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  
  // Data state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    icon: null
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

  // Fetch items on component mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        // No credentials needed for GET
        const response = await fetch(`${API_BASE_URL}/api/design-development-items/`);
        if (!response.ok) {
          throw new Error('Failed to fetch design and development items');
        }
        const result = await response.json();
        const itemsData = result.data || result;

        // Process data to construct full icon URLs
        const processedItems = itemsData.map(item => {
          // Create a new object with all original properties
          const processedItem = { ...item };
          
          // Format icon URL
          if (item.icon) {
            processedItem.icon = `${API_BASE_URL}${item.icon}?t=${Date.now()}`;
          }
          
          return processedItem;
        });

        setItems(processedItems);
        console.log("Processed items:", processedItems); // Debug log
      } catch (err) {
        setError(err.message);
        console.error("Error fetching items:", err); // Debug log
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Filter items based on search term
  const filteredItems = searchTerm.trim() === '' 
    ? items 
    : items.filter((item) => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          item.title?.toLowerCase().includes(lowerSearch) ||
          item.description?.toLowerCase().includes(lowerSearch)
        );
      });
  
  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        // Create FormData to send ID in payload as requested
        const dataToSend = new FormData();
        dataToSend.append('id', id);

        // Use base endpoint for DELETE
        const response = await fetch(`${API_BASE_URL}/api/design-development-items/`, {
          method: 'DELETE',
          credentials: 'include', // Credentials are necessary for DELETE
          body: dataToSend,
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete item');
        }
        
        // Update state to remove deleted item
        setItems(prevData => prevData.filter(item => item.id !== id));
        
        setMessage("Item deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        
        setTimeout(() => setShowAlert(false), 3000);
      } catch (error) {
        console.error('Error deleting item:', error);
        setMessage(error.message || "Failed to delete item");
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
      description: item.description,
      icon: null
    });
    // Use original icon without timestamp for preview
    const originalIconUrl = item.icon ? item.icon.split('?t=')[0] : null;
    setIconPreview(originalIconUrl);
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

  // Handle edit form submission with instant UI update
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Create a temporary object URL for new icon if it changed
    let tempIconUrl = null;
    if (hasIconChanged && editFormData.icon) {
      tempIconUrl = URL.createObjectURL(editFormData.icon);
    }
    
    // Store original item data for potential rollback
    const originalItemData = items.find(i => i.id === currentEditItem.id);
    
    // Update UI immediately with the new data
    setItems(prevData => 
      prevData.map(item => 
        item.id === currentEditItem.id 
          ? {
              ...item,
              title: editFormData.title,
              description: editFormData.description,
              icon: hasIconChanged ? tempIconUrl : item.icon
            } 
          : item
      )
    );
    
    // Close modal immediately
    setShowEditModal(false);
    
    // Create FormData to send ID in payload as requested
    const dataToSend = new FormData();
    dataToSend.append('id', currentEditItem.id); 
    dataToSend.append('title', editFormData.title);
    dataToSend.append('description', editFormData.description);
    
    if (hasIconChanged && editFormData.icon) {
      dataToSend.append('icon', editFormData.icon);
    }
    
    try {
      // Use base endpoint for PUT
      const response = await fetch(`${API_BASE_URL}/api/design-development-items/`, {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });
      
      if (!response.ok) {
        // If API fails, revert to the original data
        setItems(prevData => 
          prevData.map(item => 
            item.id === currentEditItem.id ? originalItemData : item
          )
        );
        throw new Error('Failed to update item');
      }
      
      const apiResponseData = await response.json();
      
      // Clean up temporary URL if we created one
      if (tempIconUrl) {
        URL.revokeObjectURL(tempIconUrl);
      }
      
      // Final update with permanent URL from API
      setItems(prevData => 
        prevData.map(item => 
          item.id === currentEditItem.id 
            ? {
                ...item,
                title: editFormData.title,
                description: editFormData.description,
                icon: hasIconChanged && apiResponseData.data && apiResponseData.data.icon
                    ? `${API_BASE_URL}${apiResponseData.data.icon}?t=${Date.now()}`
                    : item.icon
              } 
            : item
        )
      );
      
      // Show success message at the top
      setMessage("Item updated successfully!");
      setVariant("success");
      setShowAlert(true);
      
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error updating item:', error);
      setMessage(error.message || "Failed to update item");
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
              <h2 className="mb-0">Manage Design & Development</h2>
              <div style={{ width: '300px' }}>
                <input
                  type="text"
                  placeholder="Search by title or description..."
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
                    <p>{searchTerm ? 'No items match your search.' : 'No items found.'}</p>
                  </Col>
                ) : (
                  currentItems.map((item) => (
                    <Col lg={4} md={6} sm={12} className="mb-4" key={item.id}>
                      <Card className="h-100">
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            {/* Display the icon or a default icon */}
                            {item.icon ? (
                              <img 
                                src={item.icon} 
                                alt={item.title} 
                                style={{ width: '60px', height: '60px', marginRight: '15px', objectFit: 'cover', borderRadius: '50%' }} 
                              />
                            ) : (
                              <AiOutlineFileText size={60} style={{ marginRight: '15px' }} />
                            )}
                            <div>
                              <Card.Title className="managetitle">{item.title}</Card.Title>
                            </div>
                          </div>
                          <Card.Text className="mb-3">
                            {item.description && (
                              <p className="text-truncate" style={{ maxHeight: '100px', overflow: 'hidden' }}>
                                {item.description}
                              </p>
                            )}
                          </Card.Text>
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
          <Modal.Title>Edit Design & Development Item</Modal.Title>
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
            
            <Form.Group className="mb-3">
              <Form.Label>Icon</Form.Label>
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

export default ManageDesAndDev;