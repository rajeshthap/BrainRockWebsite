import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner, Pagination } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { AiOutlineFileDone, AiOutlineDelete } from 'react-icons/ai';

// Define the base URL for your API
const API_BASE_URL = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

const ManageAwards = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  // Data state
  const [awardsData, setAwardsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageTimestamps, setImageTimestamps] = useState({});
  const [forceRefresh, setForceRefresh] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    image: null,
    modules: []
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [hasImageChanged, setHasImageChanged] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState('');

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");

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

  // Fetch awards data on component mount (no authentication needed)
  useEffect(() => {
    const fetchAwardsData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/award-items/`);

        if (!response.ok) {
          throw new Error('Failed to fetch awards data');
        }

        const result = await response.json();

        // The API returns data in the format {success: true, data: [{...}]}
        if (result.success && result.data && result.data.length > 0) {
          // Process the data - construct full image URL if image path is provided
          const processedData = result.data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            image: item.image ? `${API_BASE_URL}${item.image}` : null,
            modules: item.modules || []
          }));

          setAwardsData(processedData);

          // Create timestamps for each item to force image refresh
          const timestamps = {};
          processedData.forEach(item => {
            timestamps[item.id] = Date.now();
          });
          setImageTimestamps(timestamps);
        } else {
          throw new Error('No awards data found');
        }
      } catch (err) {
        console.error('Error fetching awards data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAwardsData();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Filter awards based on search term
  const filteredAwards = searchTerm.trim() === ''
    ? awardsData
    : awardsData.filter((item) => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        item.title?.toLowerCase().includes(lowerSearch) ||
        item.description?.toLowerCase().includes(lowerSearch)
      );
    });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAwards.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAwards.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Handle edit
  const handleEdit = (item) => {
    setCurrentEditItem(item);
    setEditFormData({
      title: item.title,
      description: item.description,
      image: null,
      modules: item.modules || []
    });
    // Use the original image without timestamp for preview
    const originalImageUrl = item.image ? item.image.split('?t=')[0] : null;
    setImagePreview(originalImageUrl);
    setHasImageChanged(false);
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/award-items/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: itemToDelete.id }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || 'Failed to delete award');
      }

      // Update state by removing the deleted item
      setAwardsData(prevData => prevData.filter(item => item.id !== itemToDelete.id));

      setMessage("Award deleted successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowDeleteModal(false);

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error deleting award:', error);
      setMessage(error.message || "Failed to delete award");
      setVariant("danger");
      setShowAlert(true);

      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setDeleting(false);
      setItemToDelete(null);
    }
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image') {
      const file = files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setHasImageChanged(true);
        setEditFormData(prev => ({
          ...prev,
          [name]: file
        }));
      }
    } else if (name.startsWith('moduletitle')) {
      // Handle module title (first element)
      const moduleIndex = parseInt(name.split('-')[1]);
      setEditFormData(prev => {
        const newModules = [...prev.modules];
        newModules[moduleIndex][0] = value;
        return { ...prev, modules: newModules };
      });
    } else if (name.startsWith('moduledesc')) {
      // Handle module description (element index 1 or more)
      const [_, moduleIndex, descIndex] = name.split('-');
      const mIndex = parseInt(moduleIndex);
      const dIndex = parseInt(descIndex);
      setEditFormData(prev => {
        const newModules = [...prev.modules];
        newModules[mIndex][dIndex + 1] = value; // dIndex + 1 because index 0 is title
        return { ...prev, modules: newModules };
      });
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Add a new module in edit form
  const addModuleToEdit = () => {
    setEditFormData(prev => ({
      ...prev,
      modules: [...prev.modules, [""]]
    }));
  };

  // Remove a module in edit form
  const removeModuleFromEdit = (index) => {
    setEditFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  // Add a description to a module in edit form
  const addDescriptionToModuleEdit = (moduleIndex) => {
    setEditFormData(prev => {
      const newModules = [...prev.modules];
      newModules[moduleIndex].push("");
      return { ...prev, modules: newModules };
    });
  };

  // Remove a description from a module in edit form
  const removeDescriptionFromModuleEdit = (moduleIndex, descIndex) => {
    setEditFormData(prev => {
      const newModules = [...prev.modules];
      newModules[moduleIndex].splice(descIndex + 1, 1); // descIndex + 1 because index 0 is title
      return { ...prev, modules: newModules };
    });
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const dataToSend = new FormData();
    // Send the ID in the payload as requested
    dataToSend.append('id', currentEditItem.id);
    dataToSend.append('title', editFormData.title);
    dataToSend.append('description', editFormData.description);

    if (hasImageChanged && editFormData.image) {
      dataToSend.append('image', editFormData.image);
    }

    // Send modules as JSON string (array where first element is title, rest are descriptions)
    dataToSend.append('modules', JSON.stringify(editFormData.modules));

    try {
      // Use the base endpoint for PUT
      const response = await fetch(`${API_BASE_URL}/api/award-items/`, {
        method: 'PUT',
        credentials: 'include',
        body: dataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Server error' }));
        throw new Error(errorData.message || 'Failed to update award');
      }

      const apiResponseData = await response.json();

      // Create a unique timestamp to force image refresh
      const newTimestamp = Date.now();

      // Update the timestamp for the specific item
      setImageTimestamps(prev => ({
        ...prev,
        [currentEditItem.id]: newTimestamp
      }));

      // Force a refresh
      setForceRefresh(prev => !prev);

      // Update state with the new data
      setAwardsData(prevData =>
        prevData.map(item =>
          item.id === currentEditItem.id
            ? {
              ...item,
              title: editFormData.title,
              description: editFormData.description,
              image: hasImageChanged && apiResponseData.image
                ? `${API_BASE_URL}${apiResponseData.image}`
                : item.image,
              modules: editFormData.modules
            }
            : item
        )
      );

      // If the image was updated, also update the preview in the modal
      if (hasImageChanged && apiResponseData.image) {
        setImagePreview(`${API_BASE_URL}${apiResponseData.image}?t=${newTimestamp}`);
      }

      setMessage("Award updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error updating award:', error);
      setMessage(error.message || "Failed to update award");
      setVariant("danger");
      setShowAlert(true);

      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setUpdating(false);
    }
  };

  // Create image URL with timestamp for cache busting
  const getImageUrl = (item) => {
    if (!item.image) return null;
    const timestamp = imageTimestamps[item.id] || Date.now();
    return `${item.image}?t=${timestamp}&r=${forceRefresh ? '1' : '0'}`;
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
              <h2 className="mb-0">Manage Awards</h2>
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
            ) : error ? (
              <Col xs={12} className="text-center my-5">
                <Alert variant="danger">{error}</Alert>
              </Col>
            ) : awardsData.length === 0 ? (
              <Col xs={12} className="text-center my-5">
                <p>No awards data found.</p>
              </Col>
            ) : (
              <>
                <Row>
                  {currentItems.map((item) => (
                    <Col lg={6} md={12} sm={12} className="mb-4" key={item.id}>
                      <Card>
                        <Card.Body>
                          <div className="d-flex align-items-center mb-3">
                            {/* Display the image or a default icon */}
                            {getImageUrl(item) ? (
                              <img
                                src={getImageUrl(item)}
                                alt={item.title}
                                style={{ width: '120px', height: '120px', marginRight: '15px', objectFit: 'cover' }}
                                key={`${getImageUrl(item)}-${forceRefresh}`}
                              />
                            ) : (
                              <AiOutlineFileDone size={120} style={{ marginRight: '15px' }} />
                            )}
                            <div className="flex-grow-1">
                              <Card.Title className="managetitle">{item.title}</Card.Title>
                            </div>
                            <div className="d-flex gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                disabled={updating}
                              >
                                {updating ? 'Updating...' : 'Edit'}
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(item)}
                                disabled={deleting}
                              >
                                <AiOutlineDelete />
                              </Button>
                            </div>
                          </div>
                          <Card.Text style={{ whiteSpace: "pre-line" }}>
                            {item.description}
                          </Card.Text>
                          {item.modules && item.modules.length > 0 && (
                            <div className="mt-3" style={{ fontSize: '0.9rem' }}>
                              <strong>Modules:</strong>
                              {item.modules.map((module, idx) => (
                                <div key={idx} style={{ marginTop: '8px', paddingLeft: '10px', borderLeft: '3px solid #007bff' }}>
                                  <strong>{module[0] || `Module ${idx + 1}`}</strong>
                                  {module.slice(1).map((desc, descIdx) => (
                                    <p key={descIdx} style={{ marginTop: '5px', marginBottom: '0', fontSize: '0.85rem' }}>
                                      {desc}
                                    </p>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
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
          <Modal.Title>Edit Award</Modal.Title>
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
                rows={5}
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Award Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                onChange={handleEditChange}
                accept="image/*"
              />
              {imagePreview && (
                <div className="mt-3">
                  <img
                    src={imagePreview}
                    alt="Image Preview"
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                </div>
              )}
            </Form.Group>

            {/* Modules Section in Edit Modal */}
            <Form.Group className="mb-3">
              <Form.Label>Award Modules/Details</Form.Label>
              <div className="modules-container">
                {editFormData.modules && editFormData.modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} className="mb-3 p-3 border rounded" style={{ backgroundColor: '#f9f9f9' }}>
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div style={{ flex: 1 }}>
                        <Form.Group className="mb-3">
                          <Form.Label className="small"><strong>Module {moduleIndex + 1} Title</strong></Form.Label>
                          <Form.Control
                            type="text"
                            size="sm"
                            placeholder={`Enter module ${moduleIndex + 1} title`}
                            name={`moduletitle-${moduleIndex}`}
                            value={module[0] || ""}
                            onChange={handleEditChange}
                            required
                          />
                        </Form.Group>

                        {/* Descriptions for this module */}
                        {module.map((description, descIndex) => (
                          descIndex > 0 && (
                            <div key={descIndex} className="mb-2 p-2 bg-white border rounded">
                              <div className="d-flex justify-content-between align-items-start gap-2">
                                <div style={{ flex: 1 }}>
                                  <Form.Label className="small"><strong>Description {descIndex}</strong></Form.Label>
                                  <Form.Control
                                    as="textarea"
                                    rows={2}
                                    size="sm"
                                    placeholder={`Enter description ${descIndex}`}
                                    name={`moduledesc-${moduleIndex}-${descIndex - 1}`}
                                    value={description}
                                    onChange={handleEditChange}
                                  />
                                </div>
                                {module.length > 1 && (
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => removeDescriptionFromModuleEdit(moduleIndex, descIndex - 1)}
                                    className="align-self-start"
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            </div>
                          )
                        ))}

                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => addDescriptionToModuleEdit(moduleIndex)}
                          className="mt-2"
                        >
                          Add Description
                        </Button>
                      </div>
                      {editFormData.modules.length > 1 && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => removeModuleFromEdit(moduleIndex)}
                          className="align-self-start"
                        >
                          Remove Module
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={addModuleToEdit}
                  className="mt-2"
                >
                  Add Another Module
                </Button>
              </div>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)} disabled={updating}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={updating}>
              {updating ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Deleting...</span>
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageAwards;
