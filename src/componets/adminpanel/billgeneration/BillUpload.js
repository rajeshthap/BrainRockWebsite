import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Table, Modal } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

const BillUpload = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    regards: "",
    gstNumber: "",
    firmName: "",
    billDate: new Date().toISOString().split("T")[0],
    file: null,
  });

  const [uploadedBills, setUploadedBills] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBillId, setEditingBillId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all"); // all, title, gst_number, firm_name
  const [financialYearFilter, setFinancialYearFilter] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Fetch uploaded bills
  useEffect(() => {
    fetchUploadedBills();
  }, []);

  const fetchUploadedBills = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/bill-upload/",
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        // Handle different response formats
        let bills = [];
        if (responseData.success && responseData.data) {
          // API returns { success: true, data: [...] }
          bills = Array.isArray(responseData.data) ? responseData.data : [];
        } else if (Array.isArray(responseData)) {
          // API returns array directly
          bills = responseData;
        } else if (responseData.results) {
          // API returns { results: [...] }
          bills = responseData.results;
        }
        setUploadedBills(bills);
      } else {
        setUploadedBills([]);
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      setUploadedBills([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Generate financial year options (current and previous year)
  const generateFinancialYears = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // If before April, current FY started in previous calendar year
    const fyStartYear = currentMonth < 3 ? currentYear - 1 : currentYear;
    
    const years = [];
    for (let i = 0; i < 2; i++) {
      const startYear = fyStartYear - i;
      const endYear = startYear + 1;
      years.push({
        label: `${startYear}-${String(endYear).slice(-2)}`,
        start: `${startYear}-04-01`,
        end: `${endYear}-03-31`,
      });
    }
    return years;
  };

  // Check if bill date falls within a financial year
  const isInFinancialYear = (billDate, fy) => {
    if (!fy) return true;
    const yearData = generateFinancialYears().find((y) => y.label === fy);
    if (!yearData) return true;
    const billDateObj = new Date(billDate);
    const startDate = new Date(yearData.start);
    const endDate = new Date(yearData.end);
    return billDateObj >= startDate && billDateObj <= endDate;
  };

  // Filter bills based on search term and financial year
  const filteredBills = uploadedBills.filter((bill) => {
    // Financial year filter
    if (financialYearFilter && !isInFinancialYear(bill.bill_date, financialYearFilter)) {
      return false;
    }

    // Search filter
    if (!searchTerm) return true;

    const lowerSearchTerm = searchTerm.toLowerCase();

    switch (searchField) {
      case "title":
        return bill.title.toLowerCase().includes(lowerSearchTerm);
      case "gst_number":
        return bill.gst_number.toLowerCase().includes(lowerSearchTerm);
      case "firm_name":
        return bill.firm_name.toLowerCase().includes(lowerSearchTerm);
      case "all":
      default:
        return (
          bill.title.toLowerCase().includes(lowerSearchTerm) ||
          bill.gst_number.toLowerCase().includes(lowerSearchTerm) ||
          bill.firm_name.toLowerCase().includes(lowerSearchTerm)
        );
    }
  });

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, searchField, financialYearFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBills = filteredBills.slice(startIndex, endIndex);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Optional: Add file size validation
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setMessage("File size exceeds 10MB limit");
        setVariant("danger");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
        return;
      }

      // Optional: Add file type validation
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ];

      if (!allowedTypes.includes(file.type)) {
        setMessage("Please upload a valid file type (PDF, JPG, PNG, DOC, DOCX)");
        setVariant("danger");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        file: file,
      }));
    }
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false);

    try {
      // Validation
      if (
        !formData.title ||
        !formData.regards ||
        !formData.gstNumber ||
        !formData.firmName ||
        !formData.billDate
      ) {
        throw new Error("Please fill in all required fields");
      }

      // For create, file is required
      if (!editingBillId && !formData.file) {
        throw new Error("Please select a file");
      }

      // Create FormData object for file upload
      const uploadFormData = new FormData();
      if (editingBillId) {
        uploadFormData.append("id", editingBillId);
      }
      uploadFormData.append("title", formData.title);
      uploadFormData.append("regards", formData.regards);
      uploadFormData.append("gst_number", formData.gstNumber);
      uploadFormData.append("firm_name", formData.firmName);
      uploadFormData.append("bill_date", formData.billDate);
      if (formData.file) {
        uploadFormData.append("file", formData.file);
      }

      // Send to API
      const method = editingBillId ? "PUT" : "POST";
      const response = await fetch(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/bill-upload/",
        {
          method: method,
          credentials: "include",
          body: uploadFormData,
        }
      );

      const responseText = await response.text();

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        throw new Error(
          `Server Error (${response.status}): ${responseText.substring(0, 300)}`
        );
      }

      if (!response.ok) {
        // Handle error response with errors object (field validation errors)
        if (responseData.errors && typeof responseData.errors === "object") {
          const errorMessages = [];
          for (const field in responseData.errors) {
            const fieldErrors = responseData.errors[field];
            if (Array.isArray(fieldErrors)) {
              errorMessages.push(...fieldErrors);
            } else {
              errorMessages.push(fieldErrors);
            }
          }
          const errorMessage = errorMessages.join(", ");
          throw new Error(errorMessage);
        }

        // Handle other error formats
        const errorMessage =
          responseData.message || responseData.error || responseData.detail || "Failed to upload bill";
        throw new Error(errorMessage);
      }

      // Check if success flag is false
      if (responseData.success === false) {
        const errorMessage = responseData.message || "Failed to upload bill";
        throw new Error(errorMessage);
      }

      // SUCCESS
      const successMsg = editingBillId ? "Bill updated successfully!" : "Bill uploaded successfully!";
      setMessage(successMsg);
      setVariant("success");
      setShowAlert(true);

      // Reset form and editing state
      setFormData({
        title: "",
        regards: "",
        gstNumber: "",
        firmName: "",
        billDate: new Date().toISOString().split("T")[0],
        file: null,
      });
      setEditingBillId(null);
      setShowEditModal(false);

      // Reset file input
      if (document.getElementById("fileInput")) {
        document.getElementById("fileInput").value = "";
      }

      // Refresh the bills list
      fetchUploadedBills();

      // Hide alert after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error uploading bill:", error);
      setMessage(error.message || "An error occurred while uploading the bill");
      setVariant("danger");
      setShowAlert(true);

      // Hide alert after 5 seconds
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit bill
  const handleEditBill = (bill) => {
    setEditingBillId(bill.id);
    setFormData({
      title: bill.title,
      regards: bill.regards,
      gstNumber: bill.gst_number,
      firmName: bill.firm_name,
      billDate: bill.bill_date,
      file: null,
    });
    setShowEditModal(true);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingBillId(null);
    setShowEditModal(false);
    setFormData({
      title: "",
      regards: "",
      gstNumber: "",
      firmName: "",
      billDate: new Date().toISOString().split("T")[0],
      file: null,
    });
    if (document.getElementById("fileInput")) {
      document.getElementById("fileInput").value = "";
    }
  };

  // Handle delete bill
  const handleDeleteBill = async (billId) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        const deletePayload = new FormData();
        deletePayload.append("id", billId);

        const response = await fetch(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/bill-upload/",
          {
            method: "DELETE",
            credentials: "include",
            body: deletePayload,
          }
        );

        const responseText = await response.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          throw new Error(
            `Server Error (${response.status}): ${responseText.substring(0, 300)}`
          );
        }

        if (!response.ok) {
          const errorMessage =
            responseData.message || responseData.error || responseData.detail || "Failed to delete bill";
          throw new Error(errorMessage);
        }

        // Check if success flag is false
        if (responseData.success === false) {
          const errorMessage = responseData.message || "Failed to delete bill";
          throw new Error(errorMessage);
        }

        setMessage("Bill deleted successfully!");
        setVariant("success");
        setShowAlert(true);
        fetchUploadedBills();
        setTimeout(() => setShowAlert(false), 3000);
      } catch (error) {
        console.error("Error deleting bill:", error);
        setMessage(error.message || "An error occurred while deleting the bill");
        setVariant("danger");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
      }
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <LeftNavManagement
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <AdminHeader toggleSidebar={toggleSidebar} />

        {/* Dashboard Body */}
        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            {/* Alert */}
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

            {/* Upload Form Section */}
            <div className="bg-light p-2 rounded mb-3">
              <h4 className="mb-2" style={{ fontSize: "1.1rem" }}>Upload New Bill</h4>

              <Form onSubmit={handleSubmit}>
                <Row className="g-2">
                  <Col lg={4}>
                    <Form.Group className="mb-2">
                      <Form.Label style={{ fontSize: "0.85rem" }}>
                        Title <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter bill title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={4}>
                    <Form.Group className="mb-2">
                      <Form.Label style={{ fontSize: "0.85rem" }}>
                        Regards <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter regards/reference"
                        name="regards"
                        value={formData.regards}
                        onChange={handleChange}
                        required
                        style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={4}>
                    <Form.Group className="mb-2">
                      <Form.Label style={{ fontSize: "0.85rem" }}>
                        Bill Date <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="billDate"
                        value={formData.billDate}
                        onChange={handleChange}
                        required
                        style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-2">
                  <Col lg={4}>
                    <Form.Group className="mb-2">
                      <Form.Label style={{ fontSize: "0.85rem" }}>
                        GST Number <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter GST number"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        required
                        style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={4}>
                    <Form.Group className="mb-2">
                      <Form.Label style={{ fontSize: "0.85rem" }}>
                        Firm Name <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter firm name"
                        name="firmName"
                        value={formData.firmName}
                        onChange={handleChange}
                        required
                        style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={4}>
                    <Form.Group className="mb-2">
                      <Form.Label style={{ fontSize: "0.85rem" }}>
                        File Upload <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="file"
                        id="fileInput"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        required
                        style={{ fontSize: "0.9rem", padding: "0.3rem 0.6rem" }}
                      />
                      <Form.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                        Allowed formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>



                {formData.file && (
                  <Row className="mb-2">
                    <Col lg={12}>
                      <Alert variant="info" style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                        <strong>Selected File:</strong> {formData.file.name}
                      </Alert>
                    </Col>
                  </Row>
                )}

                <div className="d-grid gap-2 d-sm-flex" style={{ gap: "0.5rem" }}>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-grow-1"
                    style={{ fontSize: "0.9rem", padding: "0.4rem 0.8rem" }}
                  >
                    {isSubmitting ? "Uploading..." : "Upload Bill"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setFormData({
                        title: "",
                        regards: "",
                        gstNumber: "",
                        firmName: "",
                        billDate: new Date().toISOString().split("T")[0],
                        file: null,
                      });
                      if (document.getElementById("fileInput")) {
                        document.getElementById("fileInput").value = "";
                      }
                    }}
                    className="flex-grow-1"
                    style={{ fontSize: "0.9rem", padding: "0.4rem 0.8rem" }}
                  >
                    Clear
                  </Button>
                </div>
              </Form>
            </div>

            {/* Uploaded Bills Table Section */}
            <div>
              <h4 className="mb-2" style={{ fontSize: "1.1rem" }}>Uploaded Bills</h4>

              {/* Filters Section */}
              <div className="bg-light p-2 rounded mb-3">
                <Row className="g-2">
                  <Col lg={3}>
                    <Form.Group className="mb-2">
                      <Form.Label style={{ fontSize: "0.85rem" }}>Search Field</Form.Label>
                      <Form.Select
                        size="sm"
                        value={searchField}
                        onChange={(e) => setSearchField(e.target.value)}
                        style={{ fontSize: "0.85rem" }}
                      >
                        <option value="all">All Fields</option>
                        <option value="title">Title</option>
                        <option value="gst_number">GST Number</option>
                        <option value="firm_name">Firm Name</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col lg={3}>
                    <Form.Group className="mb-2">
                      <Form.Label style={{ fontSize: "0.85rem" }}>Search</Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ fontSize: "0.85rem" }}
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={3}>
                    <Form.Group className="mb-2">
                      <Form.Label style={{ fontSize: "0.85rem" }}>Financial Year</Form.Label>
                      <Form.Select
                        size="sm"
                        value={financialYearFilter}
                        onChange={(e) => setFinancialYearFilter(e.target.value)}
                        style={{ fontSize: "0.85rem" }}
                      >
                        <option value="">All Years</option>
                        {generateFinancialYears().map((fy) => (
                          <option key={fy.label} value={fy.label}>
                            {fy.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col lg={3}>
                    <Form.Group className="mb-2">
                      <Form.Label style={{ fontSize: "0.85rem" }}>&nbsp;</Form.Label>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => {
                          setSearchTerm("");
                          setSearchField("all");
                          setFinancialYearFilter("");
                        }}
                        style={{ fontSize: "0.85rem", width: "100%" }}
                      >
                        Clear Filters
                      </Button>
                    </Form.Group>
                  </Col>
                </Row>
                <p style={{ fontSize: "0.75rem", color: "#6c757d", marginBottom: 0 }}>
                  Showing {filteredBills.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredBills.length)} of {filteredBills.length} bill(s)
                </p>
              </div>

              {isLoading ? (
                <div className="text-center py-5">
                  <p>Loading bills...</p>
                </div>
              ) : filteredBills.length === 0 ? (
                <Alert variant="info">
                  {uploadedBills.length === 0
                    ? "No bills uploaded yet."
                    : "No bills match the current filters."}
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table striped bordered hover className="mb-0" style={{ fontSize: "0.85rem" }}>
                    <thead className="bg-light">
                      <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Regards</th>
                        <th>GST Number</th>
                        <th>Firm Name</th>
                        <th>Bill Date</th>
                        <th>File</th>
                        <th>Uploaded On</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBills.map((bill, index) => (
                        <tr key={bill.id}>
                          <td>{startIndex + index + 1}</td>
                          <td>{bill.title}</td>
                          <td>{bill.regards}</td>
                          <td>{bill.gst_number}</td>
                          <td>{bill.firm_name}</td>
                          <td>
                            {new Date(bill.bill_date).toLocaleDateString(
                              "en-IN"
                            )}
                          </td>
                          <td>
                            {bill.file ? (
                              <a
                                href={bill.file.startsWith('http') ? bill.file : `https://mahadevaaya.com/brainrock.in/brainrock/backendbr${bill.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary"
                              >
                                Download
                              </a>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            {new Date(bill.uploaded_at || bill.created_at).toLocaleDateString(
                              "en-IN"
                            )}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "0.3rem" }}>
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleEditBill(bill)}
                                style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteBill(bill.id)}
                                style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {/* Pagination Controls */}
              {filteredBills.length > 0 && totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "1rem",
                    padding: "0.5rem",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "0.25rem",
                  }}
                >
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{ fontSize: "0.85rem" }}
                  >
                    Previous
                  </Button>
                  <span style={{ fontSize: "0.85rem", color: "#6c757d" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{ fontSize: "0.85rem" }}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

            {/* Edit Bill Modal */}
            <Modal show={showEditModal} onHide={handleCancelEdit} size="lg">
              <Modal.Header closeButton>
                <Modal.Title style={{ fontSize: "1.1rem" }}>Edit Bill</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form onSubmit={handleSubmit}>
                  <Row className="g-2">
                    <Col lg={4}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: "0.85rem" }}>
                          Title <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter bill title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                        />
                      </Form.Group>
                    </Col>
                    <Col lg={4}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: "0.85rem" }}>
                          Regards <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter regards/reference"
                          name="regards"
                          value={formData.regards}
                          onChange={handleChange}
                          required
                          style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                        />
                      </Form.Group>
                    </Col>
                    <Col lg={4}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: "0.85rem" }}>
                          Bill Date <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="billDate"
                          value={formData.billDate}
                          onChange={handleChange}
                          required
                          style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="g-2">
                    <Col lg={4}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: "0.85rem" }}>
                          GST Number <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter GST number"
                          name="gstNumber"
                          value={formData.gstNumber}
                          onChange={handleChange}
                          required
                          style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                        />
                      </Form.Group>
                    </Col>
                    <Col lg={4}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: "0.85rem" }}>
                          Firm Name <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter firm name"
                          name="firmName"
                          value={formData.firmName}
                          onChange={handleChange}
                          required
                          style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                        />
                      </Form.Group>
                    </Col>
                    <Col lg={4}>
                      <Form.Group className="mb-2">
                        <Form.Label style={{ fontSize: "0.85rem" }}>
                          File Upload <span className="text-muted">(Optional)</span>
                        </Form.Label>
                        <Form.Control
                          type="file"
                          id="fileInput"
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          style={{ fontSize: "0.9rem", padding: "0.3rem 0.6rem" }}
                        />
                        <Form.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                          Allowed formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                        </Form.Text>
                      </Form.Group>
                    </Col>
                  </Row>

                  {formData.file && (
                    <Row className="mb-2">
                      <Col lg={12}>
                        <Alert variant="info" style={{ marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                          <strong>Selected File:</strong> {formData.file.name}
                        </Alert>
                      </Col>
                    </Row>
                  )}
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={handleCancelEdit}
                  style={{ fontSize: "0.9rem", padding: "0.4rem 0.8rem" }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{ fontSize: "0.9rem", padding: "0.4rem 0.8rem" }}
                >
                  {isSubmitting ? "Updating..." : "Update Bill"}
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default BillUpload;
