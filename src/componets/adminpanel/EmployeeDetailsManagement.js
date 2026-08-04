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
import { FaEye, FaEdit, FaTrash, FaFilePdf } from "react-icons/fa";
import axios from "axios";
import BrainRockLogo from "../../assets/images/brainrock_logo.png";
import AdminHeader from "./AdminHeader";
import LeftNavManagement from "./LeftNavManagement";

const API_URL = "https://brainrock.in/brainrock/backend/api/employee-profile/";
const DOC_BASE_URL = "https://brainrock.in/brainrock/backend";
const DOC_DELETE_URL =
  "https://brainrock.in/brainrock/backend/api/delete-employee-document/";
const FIRM_OPTIONS = [
  "Brainrock Consulting Services",
  "ZEE -Zero Error Enterprises",
  "Diksha Enterprises",
  "U.S. Infotech",
];

const EmployeeDetailsManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

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
    firm_name: "Brainrock Consulting Services",
    govt_doc_type: "aadhaar",
    other_govt_doc_type: "",
  });

  // State for existing file previews in edit mode
  const [existingFiles, setExistingFiles] = useState({
    profile_pic: null,
    govt_document: null,
    educational_documents: [],
    experience_certificates: [],
    professional_certificates: [],
  });

  const [files, setFiles] = useState({
    profile_pic: null,
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
  const [selectedFirmFilter, setSelectedFirmFilter] = useState("all");

  // Helper functions for document paths and types
  const getDocumentUrl = (docPath) => {
    if (!docPath) return "";
    // Assuming docPath from backend already includes /media/employee_documents/...
    return `${DOC_BASE_URL}${docPath}`;
  };

  const getDocumentName = (docPath) => {
    if (!docPath) return "N/A";
    return docPath.split("/").pop();
  };

  const isImageDocument = (docPath) => {
    if (!docPath) return false;
    return /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(docPath);
  };

  const renderDocumentPreviewInModal = (docPath) => {
    if (!docPath) return "N/A";
    const fullUrl = getDocumentUrl(docPath);
    const label = getDocumentName(docPath);
    return isImageDocument(docPath) ? (
      <img src={fullUrl} alt="preview" className="file-preview-image-small" />
    ) : (
      <span>{label}</span>
    );
  };

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
  const fetchEmployees = async (firmName = selectedFirmFilter) => {
    setLoading(true);
    try {
      const params =
        firmName && firmName !== "all" ? { firm_name: firmName } : {};
      const response = await axios.get(API_URL, {
        params,
        withCredentials: true,
      });
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
    fetchEmployees(selectedFirmFilter);
  }, [selectedFirmFilter]);

  const handleFileChange = (e) => {
    const { name, files: inputFiles } = e.target;
    if (e.target.multiple) {
      setFiles((prev) => ({ ...prev, [name]: [...inputFiles] }));
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
      firm_name: "Brainrock Consulting Services",
      govt_doc_type: "aadhaar",
      other_govt_doc_type: "",
    });
    setFiles({
      profile_pic: null,
      govt_document: null,
      educational_documents: [],
      experience_certificates: [],
      professional_certificates: [],
    });
    setEditMode(false);
    setExistingFiles({
      profile_pic: null,
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
    if (files.profile_pic) payload.append("profile_pic", files.profile_pic);
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
      fetchEmployees(selectedFirmFilter); // Refresh the list
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
      firm_name: employee.firm_name || "Brainrock Consulting Services",
      govt_doc_type: employee.govt_doc_type,
      other_govt_doc_type: employee.other_govt_doc_type || "",
    });
    setExistingFiles({
      profile_pic: employee.profile_pic,
      govt_document: employee.govt_document,
      educational_documents: employee.educational_documents || [],
      experience_certificates: employee.experience_certificates || [],
      professional_certificates: employee.professional_certificates || [],
    });
    // Switch to the "Add/Edit" tab to show the form
    setActiveTab("add");
  };

  const handleDelete = async (id, firmName) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axios.delete(API_URL, {
          data: { id, firm_name: firmName },
          withCredentials: true,
        });
        setMessage("Employee deleted successfully.");
        setVariant("success");
        setShowAlert(true);
        fetchEmployees(selectedFirmFilter);
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
        fetchEmployees(); // Refresh data
        setShowModal(false); // Close modal
      } catch (error) {
        console.error("Doc delete error:", error);
        setMessage("Failed to delete document.");
        setVariant("danger");
        setShowAlert(true);
      }
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const generateEmployeePdfContent = (employee) => {
    const escapeHtml = (value) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const renderDocPreview = (docPath, title) => {
      if (!docPath) return `<tr><td class="key">${title}</td><td>N/A</td></tr>`;
      const fullUrl = `${DOC_BASE_URL}${docPath}`;
      const fileName = docPath.split("/").pop();
      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(docPath);

      if (isImage) {
        return `<tr><td class="key">${title}</td><td><img src="${fullUrl}" alt="${title}" class="doc-image" /></td></tr>`;
      }

      return `<tr><td class="key">${title}</td><td><a href="${fullUrl}" target="_blank">${escapeHtml(fileName)}</a></td></tr>`;
    };

    const renderDocListHtmlForPdf = (docs, title) => {
      if (!docs || docs.length === 0) {
        return `<tr><td class="key">${title}</td><td>No documents uploaded.</td></tr>`;
      }

      const rows = docs
        .map((doc) => {
          const fullUrl = `${DOC_BASE_URL}${doc}`;
          const fileName = doc.split("/").pop();
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc);

          if (isImage) {
            return `<div class="doc-card"><img src="${fullUrl}" alt="${title}" class="doc-image" /></div>`;
          }

          return `<div class="doc-card"><a href="${fullUrl}" target="_blank">${escapeHtml(fileName)}</a></div>`;
        })
        .join("");

      return `
        <tr>
          <td class="key">${title}</td>
          <td>
            <div class="doc-list-wrap">${rows}</div>
          </td>
        </tr>
      `;
    };

    const profileRows = [
      ["Employee ID", employee.emp_id || "N/A"],
      ["Name", employee.emp_name || "N/A"],
      ["Email", employee.email || "N/A"],
      ["Designation", employee.designation || "N/A"],
      ["Firm Name", employee.firm_name || "N/A"],
      ["Job Location", employee.job_location || "N/A"],
      ["Address", employee.address || "N/A"],
      ["Education Qualification", employee.education_qualification || "N/A"],
      ["Work Experience", employee.work_experience || "N/A"],
      ["Certificates / Rewards", employee.certificate_reward || "N/A"],
      ["Technical Skills", employee.technical_skills || "N/A"],
      ["Other Skills", employee.other_skills || "N/A"],
    ];

    const tableMarkup = profileRows
      .map(
        ([label, value]) => `
          <tr>
            <td class="key">${escapeHtml(label)}</td>
            <td>${escapeHtml(value)}</td>
          </tr>
        `,
      )
      .join("");

    return `
      <html>
      <head>
          <title>Employee Details - ${escapeHtml(employee.emp_name || "Employee")}</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 16px;
                  font-size: 12px;
                  background: #f5f7fb;
                  color: #1f2937;
              }
              .pdf-shell {
                  max-width: 900px;
                  margin: 40px auto;
                  background: #ffffff;
                  border: 1px solid #d9e2ef;
                  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.08);
                  border-radius: 12px;
                  overflow: hidden;
              }
              .pdf-header {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding: 16px 28px;
              }
              .pdf-brand {
                  display: flex;
                  flex-direction: column;
                  align-items: flex-start;
                  flex: 1;
              }
              .header-actions {
                  display: flex;
                  align-items: center;
                  justify-content: flex-end;
                  gap: 12px;
                  text-align: right;
                  flex: 1;
              }
              .profile-pic-header {
                  width: 60px;
                  height: 60px;
                  border-radius: 50%;
                  object-fit: cover;
                  border: 3px solid #e6edf7;
              }
              .profile-pic-placeholder-header {
                  width: 60px; height: 60px; border-radius: 50%; background-color: #e0e0e0;
                  display: inline-flex; align-items: center; justify-content: center;
                  color: #777; font-weight: bold; font-size: 10px;
                  border: 3px solid #e6edf7;
              }
              .pdf-brand img {
                  width: 60px;
                  height: 60px;
                  background: #ffffff;
                  padding: 4px;
              }
              .pdf-header-center {
                  flex: 2;
                  text-align: center;
              }
                  .pdf-header-center h1{
                  margin-top:30px;
                  }
              .pdf-title {
                  margin: 0;
                  font-size: 20px;
                  color: #0b3d91;
                  font-weight: 700;
              }
              .pdf-subtitle {
                  margin: 4px 0 0;
                  font-size: 10px;
                  color: #555;
              }
              .pdf-body {
                  padding: 24px 28px 28px;
              }
              .section-title {
                  margin: 0 0 12px;
                  font-size: 14px;
                  color: #0b3d91;
                  font-weight: 700;
                  border-bottom: 2px solid #e6edf7;
                  padding-bottom: 8px;
              }
              table {
                  width: 100%;
                  border-collapse: collapse;
                  table-layout: fixed;
              }
              td {
                  border: 1px solid #d7e1f0;
                  padding: 10px 12px;
                  vertical-align: top;                  font-size: 12px;
                  word-wrap: break-word;
              }
              .key {
                  width: 32%;
                  background: #f4f8ff;
                  font-weight: 700;
                  color: #0b3d91;
              }
              .doc-list-wrap {
                  display: flex;
                  flex-direction: column;
                  gap: 8px;
              }
              .doc-card {
                  border: 1px solid #d7e1f0;
                  border-radius: 6px;
                  padding: 8px;
                  background: #fbfdff;
              }
              .doc-image {
                  max-width: 100%;
                  max-height: 200px;
                  display: block;
                  margin: 0 auto;
                  border: 1px solid #d7e1f0;
                  border-radius: 6px;
                  background: #ffffff;
              }
              a {
                  color: #0b3d91;
                  text-decoration: none;
              }
              .print-btn {
                  background-color: #ffffff;
                  color: #0b3d91;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 6px;
                  font-weight: 700;
                  cursor: pointer;
                  margin-top: 8px;
                  transition: background-color 0.2s;
              }
              .print-btn:hover {
                  background-color: #f0f0f0;
              }
              @media print {
                  body { background: #ffffff; padding: 0; }
                  .pdf-shell { box-shadow: none; border: none; }
                  .print-btn { display: none; }
              }
          </style>
      </head>
      <body>
          <div class="pdf-shell">
              <div class="pdf-header">
                  <div class="pdf-brand">
                      <img src="${BrainRockLogo}" alt="BrainRock Logo" />
                      <p class="pdf-subtitle" style="margin-top: 5px;">Brainrock Consulting Services</p>
                  </div>
                  <div class="pdf-header-center">
                      <h1 class="pdf-title">Employee Details Report</h1>
                  </div>
                  <div class="header-actions">
                      <div>
                          <div class="pdf-subtitle">Generated for ${escapeHtml(employee.emp_name || "Employee")}</div>
                          <button class="print-btn" onclick="window.print()">Print Report</button>
                      </div>
                      ${
                        employee.profile_pic
                          ? `<img src="${DOC_BASE_URL}${employee.profile_pic}" alt="Profile Picture" class="profile-pic-header" />`
                          : '<div class="profile-pic-placeholder-header">No Photo</div>'
                      }
                  </div>
              </div>
              <div class="pdf-body">
                  <h2 class="section-title">Profile Information</h2>
                  <table>
                      ${tableMarkup}
                      ${renderDocPreview(employee.govt_document, `${escapeHtml(employee.govt_doc_type ? employee.govt_doc_type.toUpperCase() : "GOVT")} Document`)}
                      ${renderDocListHtmlForPdf(employee.educational_documents, "Educational Documents")}
                      ${renderDocListHtmlForPdf(employee.experience_certificates, "Experience Certificates")}
                      ${renderDocListHtmlForPdf(employee.professional_certificates, "Professional Certificates")}
                  </table>
              </div>
          </div>
      </body>
      </html>
    `;
  };

  const handleDownloadPdf = (employee) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(generateEmployeePdfContent(employee));
    printWindow.document.close();
    printWindow.focus();
  };

  const uniqueFirmNames = [
    "all",
    ...new Set(
      employees
        .map((emp) => emp.firm_name)
        .filter(Boolean)
        .concat(FIRM_OPTIONS),
    ),
  ];

  const filteredEmployees = employees;

  const renderDocumentListWithDelete = (docs, fieldName) => {
    if (!docs || docs.length === 0) return <p>No documents uploaded.</p>;
    return (
      <ul>
        {docs.map((doc, index) => (
          <li
            key={index}
            className="d-flex justify-content-between align-items-center"
          >
            {renderDocumentPreviewInModal(doc)}
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

  const renderFilePreview = (filePath) => {
    if (!filePath) return null;
    const fullUrl = `https://brainrock.in/brainrock/backend${filePath}`;
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(filePath);

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
                        <Form.Label>Firm Name</Form.Label>
                        <Form.Select
                          name="firm_name"
                          value={formData.firm_name}
                          onChange={handleChange}
                          required
                        >
                          {FIRM_OPTIONS.map((firm) => (
                            <option key={firm} value={firm}>
                              {firm}
                            </option>
                          ))}
                        </Form.Select>
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
                        <Form.Label>Profile Picture</Form.Label>
                        {editMode && existingFiles.profile_pic && (
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            {renderFilePreview(existingFiles.profile_pic)}
                          </div>
                        )}
                        <Form.Control
                          type="file"
                          name="profile_pic"
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                      </Form.Group>
                    </Col>
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
                          existingFiles.educational_documents.length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {existingFiles.educational_documents.map(
                                (doc, i) => renderFilePreview(doc),
                              )}
                            </div>
                          )}
                        <Form.Control
                          type="file"
                          name="educational_documents"
                          onChange={handleFileChange}
                          multiple
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Experience Certificates</Form.Label>
                        {editMode &&
                          existingFiles.experience_certificates.length > 0 && (
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {existingFiles.experience_certificates.map(
                                (doc, i) => renderFilePreview(doc),
                              )}
                            </div>
                          )}
                        <Form.Control
                          type="file"
                          name="experience_certificates"
                          onChange={handleFileChange}
                          multiple
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Professional Certificates</Form.Label>
                        {editMode &&
                          existingFiles.professional_certificates.length >
                            0 && (
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {existingFiles.professional_certificates.map(
                                (doc, i) => renderFilePreview(doc),
                              )}
                            </div>
                          )}
                        <Form.Control
                          type="file"
                          name="professional_certificates"
                          onChange={handleFileChange}
                          multiple
                        />
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
                <Row className="mb-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Filter by Firm</Form.Label>
                      <Form.Select
                        value={selectedFirmFilter}
                        onChange={(e) => setSelectedFirmFilter(e.target.value)}
                      >
                        <option value="all">All Firms</option>
                        {uniqueFirmNames
                          .filter((firm) => firm !== "all")
                          .map((firm) => (
                            <option key={firm} value={firm}>
                              {firm}
                            </option>
                          ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
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
                      {filteredEmployees.map((emp, index) => (
                        <tr key={emp.id}>
                          <td>{index + 1}</td>
                          <td>{emp.emp_id}</td>
                          <td>{emp.emp_name}</td>
                          <td>{emp.email}</td>
                          <td>{emp.designation}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => handleView(emp)}
                                title="View Details"
                              >
                                <FaEye />
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleDownloadPdf(emp)}
                                title="Download PDF"
                              >
                                <FaFilePdf />
                              </Button>
                              <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleEdit(emp)}
                                title="Edit Employee"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  handleDelete(emp.id, emp.firm_name)
                                }
                                title="Delete Employee"
                              >
                                <FaTrash />
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
              <div className="text-center mb-4">
                {selectedEmployee.profile_pic ? (
                  <img
                    src={`${DOC_BASE_URL}${selectedEmployee.profile_pic}`}
                    alt="Profile"
                    className="rounded-circle"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                      border: "3px solid #eee",
                    }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-light d-flex justify-content-center align-items-center"
                    style={{ width: "120px", height: "120px" }}
                  >
                    No Photo
                  </div>
                )}
              </div>
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
                  <div className="d-flex justify-content-between align-items-center">
                    {renderDocumentPreviewInModal(
                      selectedEmployee.govt_document,
                    )}
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
          .file-preview-image-small {
              width: 60px;
              height: 60px;
              object-fit: cover;
              border: 1px solid #ddd;
              border-radius: 4px;
              background-color: #f8f9fa;
              margin-right: 5px;
          }
          .file-preview-link {
            display: inline-block;
            text-decoration: none;
            color: #007bff;
          }
        `}
      </style>
    </div>
  );
};

export default EmployeeDetailsManagement;
