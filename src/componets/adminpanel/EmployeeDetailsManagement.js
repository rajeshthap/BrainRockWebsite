import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Tabs,
  Tab,
  Table,
  Modal,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminHeader from "./AdminHeader";
import LeftNavManagement from "./LeftNavManagement";

const API_URL = "https://brainrock.in/brainrock/backend/api/employee-profile/";
const DOC_BASE_URL = "https://brainrock.in/brainrock/backend";
const DOC_DELETE_URL =
  "https://brainrock.in/brainrock/backend/api/delete-employee-document/";

const EmployeeDetailsManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  // Form state for adding/editing employee
  const [formData, setFormData] = useState({
    emp_name: "",
    education_qualification: "",
    certificate_reward: "",
    designation: "",
    work_experience: "",
    technical_skills: "",
    other_skills: "",
    email: "",
    job_location: "",
    address: "",
    govt_doc_type: "aadhaar",
    other_govt_doc_type: "",
  });

  // State for existing file previews in edit mode
  const [existingFiles, setExistingFiles] = useState({
    govt_document: null,
    educational_documents: [],
    experience_certificates: [],
    professional_certificates: [],
  });

  const [files, setFiles] = useState({
    govt_document: null,
    educational_documents: [],
    experience_certificates: [],
    professional_certificates: [],
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success"); // 'success' or 'danger'
  const [showAlert, setShowAlert] = useState(false);

  // Manage tab state
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("manage");
  const [editMode, setEditMode] = useState(false);

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

  // Fetch employees for the "Manage" tab
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, { withCredentials: true });
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setMessage("Failed to fetch employee data.");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleFileChange = (e) => {
    const { name, files: inputFiles } = e.target;
    if (e.target.multiple) {
      const selectedDocs = Array.from(inputFiles);
      setFiles((prev) => ({
        ...prev,
        [name]: [...(prev[name] || []), ...selectedDocs],
      }));
    } else {
      setFiles((prev) => ({ ...prev, [name]: inputFiles[0] }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      emp_name: "",
      education_qualification: "",
      certificate_reward: "",
      designation: "",
      work_experience: "",
      technical_skills: "",
      other_skills: "",
      email: "",
      job_location: "",
      address: "",
      govt_doc_type: "aadhaar",
      other_govt_doc_type: "",
    });
    setFiles({
      govt_document: null,
      educational_documents: [],
      experience_certificates: [],
      professional_certificates: [],
    });
    setEditMode(false);
    setExistingFiles({
      govt_document: null,
      educational_documents: [],
      experience_certificates: [],
      professional_certificates: [],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false);

    const payload = new FormData();
    // Append form data
    for (const key in formData) {
      payload.append(key, formData[key]);
    }

    // Append files
    if (files.govt_document)
      payload.append("govt_document", files.govt_document);
    files.educational_documents.forEach((file) =>
      payload.append("educational_documents", file),
    );
    files.experience_certificates.forEach((file) =>
      payload.append("experience_certificates", file),
    );
    files.professional_certificates.forEach((file) =>
      payload.append("professional_certificates", file),
    );

    try {
      let response;
      if (editMode && selectedEmployee) {
        payload.append("id", selectedEmployee.id);
        response = await axios.put(API_URL, payload, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage("Employee updated successfully!");
        setActiveTab("manage"); // Redirect to manage tab on successful update
      } else {
        response = await axios.post(API_URL, payload, {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        });
        setMessage("Employee added successfully!");
      }

      setVariant("success");
      setShowAlert(true);
      resetForm();
      fetchEmployees(); // Refresh the list
    } catch (error) {
      console.error("Submission error:", error.response?.data || error.message);
      setMessage(error.response?.data?.message || "An error occurred.");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const handleEdit = (employee) => {
    setEditMode(true);
    setSelectedEmployee(employee);
    setFormData({
      emp_name: employee.emp_name,
      education_qualification: employee.education_qualification,
      certificate_reward: employee.certificate_reward,
      designation: employee.designation,
      work_experience: employee.work_experience,
      technical_skills: employee.technical_skills,
      other_skills: employee.other_skills,
      email: employee.email,
      job_location: employee.job_location,
      address: employee.address,
      govt_doc_type: employee.govt_doc_type,
      other_govt_doc_type: employee.other_govt_doc_type || "",
    });
    setExistingFiles({
      govt_document: employee.govt_document,
      educational_documents: employee.educational_documents || [],
      experience_certificates: employee.experience_certificates || [],
      professional_certificates: employee.professional_certificates || [],
    });
    // Switch to the "Add/Edit" tab to show the form
    setActiveTab("add");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(API_URL, { data: { id }, withCredentials: true });
        setMessage("Employee deleted successfully.");
        setVariant("success");
        setShowAlert(true);
        fetchEmployees();
      } catch (error) {
        console.error("Delete error:", error);
        setMessage("Failed to delete employee.");
        setVariant("danger");
        setShowAlert(true);
      }
    }
  };

  const handleDeleteDoc = async (employeeId, field, index) => {
    if (window.confirm(`Are you sure you want to delete this document?`)) {
      try {
        await axios.delete(
          `${DOC_DELETE_URL}?id=${employeeId}&field=${field}&index=${index}`,
          {
            withCredentials: true,
          },
        );
        setMessage("Document deleted successfully.");
        setVariant("success");
        setShowAlert(true);

        const updatedEmployees = employees.map((emp) => {
          if (emp.id !== employeeId) return emp;

          if (field === "govt_document") {
            return { ...emp, [field]: null };
          }

          const existingDocs = Array.isArray(emp[field])
            ? emp[field].filter(Boolean)
            : emp[field]
              ? [emp[field]]
              : [];
          const newDocs = existingDocs.filter(
            (_, docIndex) => docIndex !== index,
          );
          return { ...emp, [field]: newDocs };
        });

        setEmployees(updatedEmployees);
        setSelectedEmployee(
          updatedEmployees.find((emp) => emp.id === employeeId),
        );
        fetchEmployees();
        setShowModal(false);
      } catch (error) {
        console.error("Doc delete error:", error);
        setMessage("Failed to delete document.");
        setVariant("danger");
        setShowAlert(true);
      }
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const normalizeDocList = (docs) => {
    if (!docs) return [];
    if (Array.isArray(docs)) return docs.filter(Boolean);
    if (typeof docs === "string") return [docs].filter(Boolean);
    if (typeof docs === "object" && docs.path)
      return [docs.path].filter(Boolean);
    return [];
  };

  const getDocumentName = (docPath) => {
    if (!docPath) return "N/A";
    const pathString =
      typeof docPath === "string"
        ? docPath
        : docPath.path || docPath.name || "";
    return pathString.split("/").pop() || pathString;
  };

  const getDocumentUrl = (docPath) => {
    if (!docPath) return "";
    const pathString =
      typeof docPath === "string"
        ? docPath
        : docPath.path || docPath.name || "";
    if (/^https?:\/\//i.test(pathString)) return pathString;
    return `${DOC_BASE_URL}${pathString}`;
  };

  const isImageDocument = (docPath) => {
    if (!docPath) return false;
    const fileName = getDocumentName(docPath);
    return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName);
  };

  const renderDocumentLink = (docPath) => {
    if (!docPath) return "N/A";
    return (
      <a
        href={getDocumentUrl(docPath)}
        target="_blank"
        rel="noopener noreferrer"
        title={getDocumentName(docPath)}
      >
        View Document
      </a>
    );
  };

  const renderDocumentPreview = (docPath) => {
    if (!docPath) return "N/A";
    const fullUrl = getDocumentUrl(docPath);

    if (isImageDocument(docPath)) {
      return (
        <a
          href={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={getDocumentName(docPath)}
        >
          View Document
        </a>
      );
    }

    return renderDocumentLink(docPath);
  };

  const generateEmployeePdfContent = (employee) => {
    const renderDocHtmlForPdf = (docPath, title) => {
      const docList = normalizeDocList(docPath);
      if (docList.length === 0)
        return `<p><strong>${title}:</strong> No documents uploaded.</p>`;

      let html = `<p><strong>${title}:</strong></p><ul>`;
      docList.forEach((doc, index) => {
        const fullUrl = getDocumentUrl(doc);
        const label = getDocumentName(doc);
        const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(label);

        if (isImage) {
          html += `
            <li>
              <img src="${fullUrl}" alt="${title} ${index + 1}" style="max-width: 100%; height: auto; display: block; margin-bottom: 5px;" />
            </li>
          `;
        } else {
          html += `<li><a href="${fullUrl}" target="_blank">${label}</a></li>`;
        }
      });
      html += `</ul>`;
      return html;
    };

    const renderDocListHtmlForPdf = (docs, title) => {
      return renderDocHtmlForPdf(docs, title);
    };

    return `
      <html>
      <head>
          <title>Employee Details - ${employee.emp_name}</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { text-align: center; color: #333; }
              h2 { border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px; color: #555; }
              p { margin-bottom: 5px; }
              strong { font-weight: bold; }
              ul { list-style-type: none; padding: 0; }
              li { margin-bottom: 5px; }
              img { border: 1px solid #ddd; padding: 5px; border-radius: 4px; }
          </style>
      </head>
      <body>
          <h1>Employee Details: ${employee.emp_name}</h1>
          <p><strong>Employee ID:</strong> ${employee.emp_id || "N/A"}</p>
          <p><strong>Name:</strong> ${employee.emp_name || "N/A"}</p>
          <p><strong>Email:</strong> ${employee.email || "N/A"}</p>
          <p><strong>Designation:</strong> ${employee.designation || "N/A"}</p>
          <p><strong>Job Location:</strong> ${employee.job_location || "N/A"}</p>
          <p><strong>Address:</strong> ${employee.address || "N/A"}</p>
          <p><strong>Education Qualification:</strong> ${employee.education_qualification || "N/A"}</p>
          <p><strong>Work Experience:</strong> ${employee.work_experience || "N/A"}</p>
          <p><strong>Certificates/Rewards:</strong> ${employee.certificate_reward || "N/A"}</p>
          <p><strong>Technical Skills:</strong> ${employee.technical_skills || "N/A"}</p>
          <p><strong>Other Skills:</strong> ${employee.other_skills || "N/A"}</p>

          <h2>Documents</h2>
          ${renderDocHtmlForPdf(employee.govt_document, `${employee.govt_doc_type.toUpperCase()} Document`)}
          ${renderDocListHtmlForPdf(employee.educational_documents, "Educational Documents")}
          ${renderDocListHtmlForPdf(employee.experience_certificates, "Experience Certificates")}
          ${renderDocListHtmlForPdf(employee.professional_certificates, "Professional Certificates")}
      </body>
      </html>
    `;
  };

  const handleDownloadPdf = (employee) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(generateEmployeePdfContent(employee));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const renderDocumentListWithDelete = (docs, fieldName) => {
    const docList = normalizeDocList(docs);
    if (docList.length === 0) return <p>No documents uploaded.</p>;
    return (
      <ul>
        {docList.map((doc, index) => (
          <li
            key={`${fieldName}-${index}`}
            className="d-flex justify-content-between align-items-center mb-2 gap-3"
          >
            {renderDocumentPreview(doc)}
            <Button
              variant="danger"
              size="sm"
              onClick={() =>
                handleDeleteDoc(selectedEmployee.id, fieldName, index)
              }
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    );
  };

  const renderSelectedFiles = (fieldName) => {
    const selectedFiles = files[fieldName] || [];
    if (!selectedFiles.length) return null;

    return (
      <div className="small text-muted mt-2">
        Selected:
        <ul className="mb-0 ps-3">
          {selectedFiles.map((file, index) => (
            <li key={`${fieldName}-${index}`}>
              {file.name || getDocumentName(file)}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderFilePreview = (filePath) => {
    if (!filePath) return null;
    const fullUrl = getDocumentUrl(filePath);
    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(
      getDocumentName(filePath),
    );

    return (
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="file-preview-box"
      >
        {isImage ? (
          <img src={fullUrl} alt="preview" className="file-preview-image" />
        ) : (
          <div className="file-preview-icon">📄</div>
        )}
      </a>
    );
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
        <Container fluid className="dashboard-body ">
          <h2 className="mb-4">Employee Management</h2>
          <div className="br-box-container mt-3">
            <Tabs
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
              id="employee-tabs"
              className="mb-3"
            >
              <Tab
                eventKey="add"
                title={editMode ? "Edit Employee" : "Add Employee"}
              >
                <h4 className="mb-4">
                  {editMode ? "Edit Employee Details" : "Add New Employee"}
                </h4>
                {showAlert && (
                  <Alert
                    variant={variant}
                    onClose={() => setShowAlert(false)}
                    dismissible
                  >
                    {message}
                  </Alert>
                )}
                <Form onSubmit={handleSubmit} className="p-3">
                  <Row>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Employee Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="emp_name"
                          value={formData.emp_name}
                          onChange={handleChange}
                          placeholder="Enter full name"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter email address"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Designation</Form.Label>
                        <Form.Control
                          type="text"
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          placeholder="e.g., Software Engineer"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Job Location</Form.Label>
                        <Form.Control
                          type="text"
                          name="job_location"
                          value={formData.job_location}
                          onChange={handleChange}
                          placeholder="e.g., Dehradun"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Enter employee's current address"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Education Qualification</Form.Label>
                        <Form.Control
                          type="text"
                          name="education_qualification"
                          value={formData.education_qualification}
                          onChange={handleChange}
                          placeholder="e.g., MCA, B.Tech"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Work Experience</Form.Label>
                        <Form.Control
                          type="text"
                          name="work_experience"
                          value={formData.work_experience}
                          onChange={handleChange}
                          placeholder="e.g., 5 Years"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Certificate/Reward</Form.Label>
                        <Form.Control
                          type="text"
                          name="certificate_reward"
                          value={formData.certificate_reward}
                          onChange={handleChange}
                          placeholder="e.g., OCP, J2EE"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Technical Skills</Form.Label>
                        <textarea
                          className="form-control"
                          rows="4"
                          name="technical_skills"
                          value={formData.technical_skills}
                          onChange={handleChange}
                          placeholder="e.g., React.js, JavaScript, HTML, CSS, Node.js"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Other Skills</Form.Label>
                        <Form.Control
                          type="text"
                          name="other_skills"
                          value={formData.other_skills}
                          onChange={handleChange}
                          placeholder="e.g., Digital Marketing, SEO"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Govt. Doc Type</Form.Label>
                        <Form.Select
                          name="govt_doc_type"
                          value={formData.govt_doc_type}
                          onChange={handleChange}
                        >
                          <option value="aadhaar">Aadhaar</option>
                          <option value="pan">PAN</option>
                          <option value="passport">Passport</option>
                          <option value="voter_id">Voter ID</option>
                          <option value="driving_license">
                            Driving License
                          </option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {formData.govt_doc_type === "other" && (
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            Please specify other document type
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="other_govt_doc_type"
                            value={formData.other_govt_doc_type}
                            onChange={handleChange}
                            placeholder="Enter document type"
                            required
                          />
                        </Form.Group>
                      </Col>
                    )}

                    <h5 className="mt-4">Upload Documents</h5>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Government Document</Form.Label>
                        {editMode && existingFiles.govt_document && (
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            {renderFilePreview(existingFiles.govt_document)}
                          </div>
                        )}
                        <Form.Control
                          type="file"
                          name="govt_document"
                          onChange={handleFileChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Educational Documents</Form.Label>
                        {editMode &&
                          normalizeDocList(existingFiles.educational_documents)
                            .length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {normalizeDocList(
                                existingFiles.educational_documents,
                              ).map((doc, i) => (
                                <div key={`educational-${i}`}>
                                  {renderFilePreview(doc)}
                                </div>
                              ))}
                            </div>
                          )}
                        <div className="d-flex gap-2 align-items-center">
                          <Form.Control
                            id="educational-documents-input"
                            type="file"
                            name="educational_documents"
                            onChange={handleFileChange}
                            multiple
                          />
                          <Button
                            type="button"
                            variant="outline-primary"
                            size="sm"
                            onClick={() =>
                              document
                                .getElementById("educational-documents-input")
                                ?.click()
                            }
                          >
                            Add More
                          </Button>
                        </div>
                        {renderSelectedFiles("educational_documents")}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Experience Certificates</Form.Label>
                        {editMode &&
                          normalizeDocList(
                            existingFiles.experience_certificates,
                          ).length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {normalizeDocList(
                                existingFiles.experience_certificates,
                              ).map((doc, i) => (
                                <div key={`experience-${i}`}>
                                  {renderFilePreview(doc)}
                                </div>
                              ))}
                            </div>
                          )}
                        <div className="d-flex gap-2 align-items-center">
                          <Form.Control
                            id="experience-certificates-input"
                            type="file"
                            name="experience_certificates"
                            onChange={handleFileChange}
                            multiple
                          />
                          <Button
                            type="button"
                            variant="outline-primary"
                            size="sm"
                            onClick={() =>
                              document
                                .getElementById("experience-certificates-input")
                                ?.click()
                            }
                          >
                            Add More
                          </Button>
                        </div>
                        {renderSelectedFiles("experience_certificates")}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Professional Certificates</Form.Label>
                        {editMode &&
                          normalizeDocList(
                            existingFiles.professional_certificates,
                          ).length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {normalizeDocList(
                                existingFiles.professional_certificates,
                              ).map((doc, i) => (
                                <div key={`professional-${i}`}>
                                  {renderFilePreview(doc)}
                                </div>
                              ))}
                            </div>
                          )}
                        <div className="d-flex gap-2 align-items-center">
                          <Form.Control
                            id="professional-certificates-input"
                            type="file"
                            name="professional_certificates"
                            onChange={handleFileChange}
                            multiple
                          />
                          <Button
                            type="button"
                            variant="outline-primary"
                            size="sm"
                            onClick={() =>
                              document
                                .getElementById(
                                  "professional-certificates-input",
                                )
                                ?.click()
                            }
                          >
                            Add More
                          </Button>
                        </div>
                        {renderSelectedFiles("professional_certificates")}
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Submitting..."
                      : editMode
                        ? "Update Employee"
                        : "Add Employee"}
                  </Button>
                  {editMode && (
                    <Button
                      variant="secondary"
                      className="ms-2"
                      onClick={resetForm}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </Form>
              </Tab>
              <Tab eventKey="manage" title="Manage Employees">
                <h4 className="mb-4">Existing Employees</h4>
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" />
                  </div>
                ) : (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Emp ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Designation</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, index) => (
                        <tr key={emp.id}>
                          <td>{index + 1}</td>
                          <td>{emp.emp_id}</td>
                          <td>{emp.emp_name}</td>
                          <td>{emp.email}</td>
                          <td>{emp.designation}</td>
                          <td>
                            <div className="employee-action-buttons">
                              <Button
                                variant="info"
                                size="sm"
                                onClick={() => handleView(emp)}
                              >
                                View
                              </Button>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleDownloadPdf(emp)}
                              >
                                Download PDF
                              </Button>
                              <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleEdit(emp)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(emp.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Tab>
            </Tabs>
          </div>
        </Container>
      </div>

      {/* View Employee Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Employee Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <div>
              <Row>
                <Col md={6}>
                  <strong>Emp ID:</strong> <p>{selectedEmployee.emp_id}</p>
                </Col>
                <Col md={6}>
                  <strong>Name:</strong> <p>{selectedEmployee.emp_name}</p>
                </Col>
                <Col md={6}>
                  <strong>Email:</strong> <p>{selectedEmployee.email}</p>
                </Col>
                <Col md={6}>
                  <strong>Designation:</strong>{" "}
                  <p>{selectedEmployee.designation}</p>
                </Col>
                <Col md={6}>
                  <strong>Job Location:</strong>{" "}
                  <p>{selectedEmployee.job_location}</p>
                </Col>
                <Col md={6}>
                  <strong>Work Experience:</strong>{" "}
                  <p>{selectedEmployee.work_experience}</p>
                </Col>
                <Col md={12}>
                  <strong>Address:</strong> <p>{selectedEmployee.address}</p>
                </Col>
                <Col md={12}>
                  <strong>Education:</strong>{" "}
                  <p>{selectedEmployee.education_qualification}</p>
                </Col>
                <Col md={12}>
                  <strong>Certificates/Rewards:</strong>{" "}
                  <p>{selectedEmployee.certificate_reward}</p>
                </Col>
                <Col md={12}>
                  <strong>Technical Skills:</strong>{" "}
                  <p>{selectedEmployee.technical_skills}</p>
                </Col>
                <Col md={12}>
                  <strong>Other Skills:</strong>{" "}
                  <p>{selectedEmployee.other_skills}</p>
                </Col>
              </Row>
              <hr />
              <h4>Documents</h4>
              <Row>
                <Col md={12} className="mb-3">
                  <strong>
                    {selectedEmployee.govt_doc_type.toUpperCase()} Document:
                  </strong>
                  <div className="d-flex justify-content-between align-items-center gap-3">
                    {renderDocumentPreview(selectedEmployee.govt_document)}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        handleDeleteDoc(selectedEmployee.id, "govt_document", 0)
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </Col>
                <Col md={12} className="mt-3">
                  <strong>Educational Documents:</strong>
                  {renderDocumentListWithDelete(
                    selectedEmployee.educational_documents,
                    "educational_documents",
                  )}
                </Col>
                <Col md={12} className="mt-3">
                  <strong>Experience Certificates:</strong>
                  {renderDocumentListWithDelete(
                    selectedEmployee.experience_certificates,
                    "experience_certificates",
                  )}
                </Col>
                <Col md={12} className="mt-3">
                  <strong>Professional Certificates:</strong>
                  {renderDocumentListWithDelete(
                    selectedEmployee.professional_certificates,
                    "professional_certificates",
                  )}
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <style type="text/css">
        {`
          .employee-action-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            align-items: center;
          }

          .employee-action-buttons .btn {
            white-space: nowrap;
          }

          .file-preview-box {
            display: inline-block;
            width: 80px;
            height: 80px;
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
            text-align: center;
            background-color: #f8f9fa;
          }
          .file-preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .file-preview-icon {
            font-size: 40px;
            line-height: 80px;
          }

          @media (max-width: 767px) {
            .employee-action-buttons {
              flex-direction: column;
              align-items: stretch;
            }

            .employee-action-buttons .btn {
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
};

export default EmployeeDetailsManagement;
