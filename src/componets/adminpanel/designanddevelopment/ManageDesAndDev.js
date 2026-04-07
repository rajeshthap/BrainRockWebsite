import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Alert,
  Modal,
  Spinner,
} from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { AiOutlineFileText } from "react-icons/ai"; // Default icon for design and development items

// Define base URL for your API
const API_BASE_URL = "https://brainrock.in/brainrock/backend";

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
    icon: null,
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
  const [searchTerm, setSearchTerm] = useState("");

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
        const response = await fetch(
          `${API_BASE_URL}/api/design-development-items/`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch design and development items");
        }
        const result = await response.json();
        const itemsData = result.data || result;

        // Process data to construct full icon URLs
        const processedItems = itemsData.map((item) => {
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
  const filteredItems =
    searchTerm.trim() === ""
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
        dataToSend.append("id", id);

        // Use base endpoint for DELETE
        const response = await fetch(
          `${API_BASE_URL}/api/design-development-items/`,
          {
            method: "DELETE",
            credentials: "include", // Credentials are necessary for DELETE
            body: dataToSend,
          },
        );

        if (!response.ok) {
          throw new Error("Failed to delete item");
        }

        // Update state to remove deleted item
        setItems((prevData) => prevData.filter((item) => item.id !== id));

        setMessage("Item deleted successfully!");
        setVariant("success");
        setShowAlert(true);

        setTimeout(() => setShowAlert(false), 3000);
      } catch (error) {
        console.error("Error deleting item:", error);
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
      icon: null,
    });
    // Use original icon without timestamp for preview
    const originalIconUrl = item.icon ? item.icon.split("?t=")[0] : null;
    setIconPreview(originalIconUrl);
    setHasIconChanged(false);
    setShowEditModal(true);
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "icon") {
      const file = files[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        setIconPreview(previewUrl);
        setHasIconChanged(true);
        setEditFormData((prev) => ({
          ...prev,
          [name]: file,
        }));
      }
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
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
    const originalItemData = items.find((i) => i.id === currentEditItem.id);

    // Update UI immediately with the new data
    setItems((prevData) =>
      prevData.map((item) =>
        item.id === currentEditItem.id
          ? {
              ...item,
              title: editFormData.title,
              description: editFormData.description,
              icon: hasIconChanged ? tempIconUrl : item.icon,
            }
          : item,
      ),
    );

    // Close modal immediately
    setShowEditModal(false);

    // Create FormData to send ID in payload as requested
    const dataToSend = new FormData();
    dataToSend.append("id", currentEditItem.id);
    dataToSend.append("title", editFormData.title);
    dataToSend.append("description", editFormData.description);

    if (hasIconChanged && editFormData.icon) {
      dataToSend.append("icon", editFormData.icon);
    }

    try {
      // Use base endpoint for PUT
      const response = await fetch(
        `${API_BASE_URL}/api/design-development-items/`,
        {
          method: "PUT",
          credentials: "include",
          body: dataToSend,
        },
      );

      if (!response.ok) {
        // If API fails, revert to the original data
        setItems((prevData) =>
          prevData.map((item) =>
            item.id === currentEditItem.id ? originalItemData : item,
          ),
        );
        throw new Error("Failed to update item");
      }

      const apiResponseData = await response.json();

      // Clean up temporary URL if we created one
      if (tempIconUrl) {
        URL.revokeObjectURL(tempIconUrl);
      }

      // Final update with permanent URL from API
      setItems((prevData) =>
        prevData.map((item) =>
          item.id === currentEditItem.id
            ? {
                ...item,
                title: editFormData.title,
                description: editFormData.description,
                icon:
                  hasIconChanged &&
                  apiResponseData.data &&
                  apiResponseData.data.icon
                    ? `${API_BASE_URL}${apiResponseData.data.icon}?t=${Date.now()}`
                    : item.icon,
              }
            : item,
        ),
      );

      // Show success message at the top
      setMessage("Item updated successfully!");
      setVariant("success");
      setShowAlert(true);

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error updating item:", error);
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
            <style>{`
              .items-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.875rem;
              }
              .items-table th {
                background-color: #2c3e50;
                color: white;
                font-weight: 600;
                padding: 6px 8px;
                text-align: left;
                white-space: nowrap;
                border: none;
              }
              .items-table td {
                padding: 6px 8px;
                vertical-align: middle;
                border-bottom: 1px solid #e9ecef;
              }
              .items-table tr:hover {
                background-color: #f8f9fa;
              }
              .items-table .item-title {
                font-weight: 500;
                font-size: 0.9rem;
              }
              .items-table .item-description {
                color: #6c757d;
                font-size: 0.8rem;
                line-height: 1.4;
                max-width: 300px;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
              }
              .items-table .item-icon {
                width: 50px;
                height: 50px;
                object-fit: cover;
                border-radius: 6px;
              }
              .items-table .btn-sm {
                padding: 0.15rem 0.4rem;
                font-size: 0.75rem;
              }
              .pagination-info {
                min-width: 140px;
                text-align: center;
                font-size: 0.875rem;
              }
              .action-buttons {
                display: flex;
                gap: 0.25rem;
                flex-wrap: wrap;
              }
              @media (max-width: 992px) {
                .table-responsive {
                  font-size: 0.85rem;
                }
                .items-table .item-description {
                  max-width: 200px;
                }
                .items-table th:nth-child(4) {
                  display: none;
                }
                .items-table td:nth-child(4) {
                  display: none;
                }
              }
              @media (max-width: 768px) {
                .items-table {
                  font-size: 0.75rem;
                }
                .items-table th {
                  padding: 4px 6px;
                  font-size: 0.75rem;
                }
                .items-table td {
                  padding: 4px 6px;
                }
                .items-table th:nth-child(3) {
                  display: none;
                }
                .items-table td:nth-child(3) {
                  display: none;
                }
                .items-table th:nth-child(4) {
                  display: none;
                }
                .items-table td:nth-child(4) {
                  display: none;
                }
                .items-table .item-icon {
                  width: 40px;
                  height: 40px;
                }
                .items-table .btn-sm {
                  padding: 0.2rem 0.3rem;
                  font-size: 0.65rem;
                }
                .action-buttons {
                  gap: 0.15rem;
                }
                .d-flex.justify-content-between {
                  flex-direction: column;
                  gap: 1rem;
                }
                .d-flex.justify-content-between > div {
                  width: 100% !important;
                }
                .form-control {
                  font-size: 0.875rem;
                }
              }
              @media (max-width: 576px) {
                .br-box-container {
                  padding: 0.5rem;
                }
                .items-table {
                  font-size: 0.7rem;
                }
                .items-table th {
                  padding: 3px 4px;
                  font-size: 0.65rem;
                }
                .items-table td {
                  padding: 3px 4px;
                }
                .items-table th:nth-child(1) {
                  width: 30px !important;
                }
                .items-table th:nth-child(2) {
                  width: 40px !important;
                }
                .items-table th:nth-child(5) {
                  width: 80px !important;
                }
                .items-table .item-title {
                  font-size: 0.8rem;
                }
                .items-table .item-icon {
                  width: 35px;
                  height: 35px;
                }
                .btn-sm {
                  padding: 0.15rem 0.25rem !important;
                  font-size: 0.6rem !important;
                }
                .action-buttons {
                  gap: 0.1rem;
                }
                h2 {
                  font-size: 1.25rem !important;
                }
              }
            `}</style>

            <div
              className="d-flex justify-content-between align-items-center mb-4"
              style={{
                
                alignItems: "flex-start",
                gap: "1rem",
              }}
            >
              <h2 className="mb-0">Manage Design & Development</h2>
              <div style={{ width: "100%", maxWidth: "300px" }}>
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
              <Alert
                variant={variant}
                className="mb-4"
                onClose={() => setShowAlert(false)}
                dismissible
              >
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
                {currentItems.length === 0 ? (
                  <div className="text-center my-5">
                    <p>
                      {searchTerm
                        ? "No items match your search."
                        : "No items found."}
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover table-striped align-middle items-table">
                      <thead className="table-dark">
                        <tr>
                          <th style={{ width: "60px" }}>#</th>
                          <th style={{ width: "80px" }}>Icon</th>
                          <th style={{ width: "25%" }}>Title</th>
                          <th style={{ width: "50%" }}>Description</th>
                          <th style={{ width: "120px" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((item, index) => {
                          const sequenceNumber =
                            (currentPage - 1) * itemsPerPage + index + 1;
                          return (
                            <tr key={item.id}>
                              <td>{sequenceNumber}</td>
                              <td>
                                {item.icon ? (
                                  <img
                                    src={item.icon}
                                    alt={item.title}
                                    className="item-icon"
                                  />
                                ) : (
                                  <AiOutlineFileText size={40} />
                                )}
                              </td>
                              <td>
                                <div className="item-title">{item.title}</div>
                              </td>
                              <td>
                                <div className="item-description">
                                  {item.description || "No description"}
                                </div>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <Button
                                    variant="primary"
                                    size="sm"
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
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination with arrows */}
                {totalPages > 1 && (
                  <div
                    className="d-flex justify-content-center align-items-center mt-4"
                    style={{ flexWrap: "wrap", gap: "1rem" }}
                  >
                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{ fontSize: "0.875rem" }}
                    >
                      ← Prev
                    </button>

                    <span
                      className="pagination-info fw-bold"
                      style={{ fontSize: "0.875rem", minWidth: "120px" }}
                    >
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      className="btn btn-outline-primary"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      style={{ fontSize: "0.875rem" }}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </Container>
      </div>

      {/* Edit Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
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
                    style={{ maxWidth: "100px", maxHeight: "100px" }}
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
