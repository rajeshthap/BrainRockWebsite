import React, { useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { FaBars, FaSearch, FaTrash, FaCheckCircle } from "react-icons/fa";
import "../../assets/css/employeeregistration.css";
import { RiFolderImageLine } from "react-icons/ri";
import { FaCircleCheck } from "react-icons/fa6";
import SideNav from "../hr_dashboard/SideNav";

const EmployeeRegistration = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile] = useState(false);
  const [isTablet] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileSelected, setFileSelected] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
//  Add this state along with your existing resume and aadhar states
const [photo, setPhoto] = useState({
  fileSelected: false,
  fileName: "",
  uploadProgress: 0,
  uploadComplete: false,
});

  const [resume, setResume] = useState({
  fileSelected: false,
  fileName: "",
  fileURL: "",
  uploadProgress: 0,
  uploadComplete: false,
  showSuccess: false,
});

const [aadhar, setAadhar] = useState({
  fileSelected: false,
  fileName: "",
  fileURL: "",
  uploadProgress: 0,
  uploadComplete: false,
  showSuccess: false,
});

// ================= FILE UPLOAD HANDLER =================
const handleFileUpload = (e, setter) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileURL = URL.createObjectURL(file); // For preview
  setter({
    fileSelected: true,
    fileName: file.name,
    fileURL,
    uploadProgress: 0,
    uploadComplete: false,
    showSuccess: false,
  });

  // Simulate Upload Progress
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    setter((prev) => ({ ...prev, uploadProgress: progress }));
    if (progress >= 100) {
      clearInterval(interval);
      setter((prev) => ({
        ...prev,
        uploadComplete: true,
        showSuccess: true,
      }));
    }
  }, 200);
};

// ================= DELETE HANDLER =================
const handleDelete = (setter, inputId) => {
  setter({
    fileSelected: false,
    fileName: "",
    fileURL: "",
    uploadProgress: 0,
    uploadComplete: false,
    showSuccess: false,
  });

  const input = document.getElementById(inputId);
  if (input) input.value = "";
};

// ================= PREVIEW HANDLER =================
const handlePreview = (fileData) => {
  if (fileData.fileURL) window.open(fileData.fileURL, "_blank");
};
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
        <header className="dashboard-header">
          <Container fluid>
            <Row className="align-items-center">
              <Col xs="auto">
                <Button
                  variant="light"
                  className="sidebar-toggle"
                  onClick={toggleSidebar}
                >
                  <FaBars />
                </Button>
              </Col>
              <Col>
                <div className="search-bar">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="search-input"
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </header>

        {/* Dashboard Body */}
        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            <Row>
           

              {/* Employee ID */}
             

              <div className="br-basic-info">
  <h1>1. Basic Information</h1>
</div>

<Row>
  {/* ========= LEFT SIDE: Basic Fields ========= */}
  <Col lg={10} md={6} sm={12}>
    <Row>
      {/* Employee ID */}
      <Col lg={6} md={6} sm={12}>
        <Form.Group className="mb-3" controlId="employeeId">
          <Form.Label className="br-label">
            Employee ID <span className="br-span-star">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Auto-generated"
            className="br-form-control"
            name="employee_id"
          />
        </Form.Group>
      </Col>

      {/* First Name */}
      <Col lg={6} md={6} sm={12}>
        <Form.Group className="mb-3" controlId="firstName">
          <Form.Label className="br-label">
            First Name <span className="br-span-star">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter First Name"
            className="br-form-control"
            name="first_name"
            required
          />
        </Form.Group>
      </Col>

      {/* Last Name */}
      <Col lg={6} md={6} sm={12}>
        <Form.Group className="mb-3" controlId="lastName">
          <Form.Label className="br-label">
            Last Name <span className="br-span-star">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter Last Name"
            className="br-form-control"
            name="last_name"
            required
          />
        </Form.Group>
      </Col>

      {/* Gender */}
      <Col lg={6} md={6} sm={12}>
        <Form.Group className="mb-3" controlId="gender">
          <Form.Label className="br-label">Gender</Form.Label>
          <Form.Select className="br-form-control" name="gender">
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Form.Select>
        </Form.Group>
      </Col>

      {/* Date of Birth */}
      <Col lg={6} md={6} sm={12}>
        <Form.Group className="mb-3" controlId="dob">
          <Form.Label className="br-label">
            Date of Birth <span className="br-span-star">*</span>
          </Form.Label>
          <Form.Control
            type="date"
            className="br-form-control"
            name="dob"
            required
          />
        </Form.Group>
      </Col>
    </Row>
  </Col>

  {/* ========= RIGHT SIDE: Photo Upload ========= */}
 <Col lg={2} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="photoUpload">
    <Form.Label className="br-label">Photo / Profile Picture</Form.Label>

    <div className="br-upload-box text-center">
      {!photo.fileSelected ? (
        <>
          <div className="upload-icon">
           <RiFolderImageLine />
          </div>
          <p className="upload-text">Drag your photo here</p>
          <p className="upload-or">or</p>
          <Form.Label htmlFor="photoInput" className="upload-browse">
            Browse your computer
          </Form.Label>
          <Form.Control
            type="file"
            id="photoInput"
            accept="image/*"
            className="d-none"
            name="photo"
            onChange={(e) => handleFileUpload(e, setPhoto)}
          />
        </>
      ) : (
        <div className="upload-progress-box">
          <div className="progress-info d-flex justify-content-between align-items-center">
            <div>
              {photo.uploadComplete ? (
                <FaCheckCircle color="green" className="me-2 br-check-icon" />
              ) : (
              <FaCheckCircle color="green" className=" br-check-icon"/> 
              )}
              <span className="progress-filename">{photo.fileName}</span>
            </div>

            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(setPhoto, "photoInput")}
              className="ms-2 br-btn-delete"
              title="Delete File"
            >
              <FaTrash />
            </Button>
          </div>

          <div className="progress mt-2">
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${photo.uploadProgress}%` }}
            >
              {photo.uploadProgress}%
            </div>
          </div>
        </div>
      )}
    </div>
  </Form.Group>
</Col>

</Row>

              {/*  2. Contact Details */}
<div className="br-basic-info">
  <h1>2. Contact Details</h1>
</div>

{/* Email Address */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="email">
    <Form.Label className="br-label">
      Email Address <span className="br-span-star">*</span>
    </Form.Label>
    <Form.Control
      type="email"
      placeholder="Enter Email Address"
      className="br-form-control"
      name="email"
      required
    />
  </Form.Group>
</Col>

{/* Phone Number */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="phone">
    <Form.Label className="br-label">
      Phone Number <span className="br-span-star">*</span>
    </Form.Label>
    <Form.Control
      type="number"
      placeholder="Enter Phone Number"
      className="br-form-control"
      name="phone_number"
      required
    />
  </Form.Group>
</Col>

{/* Alternate Phone */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="alternatePhone">
    <Form.Label className="br-label">Alternate Phone</Form.Label>
    <Form.Control
      type="number"
      placeholder="Enter Alternate Phone"
      className="br-form-control"
      name="alternate_phone"
    />
  </Form.Group>
</Col>

{/* Address */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="address">
    <Form.Label className="br-label">
      Address <span className="br-span-star">*</span>
    </Form.Label>
    <Form.Control
      as="textarea"
      rows={3}
      placeholder="Enter Address"
      className="br-form-control"
      name="address"
      required
    />
  </Form.Group>
</Col>

{/* Emergency Contact Name */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="emergencyName">
    <Form.Label className="br-label">Emergency Contact Name</Form.Label>
    <Form.Control
      type="text"
      placeholder="Enter Emergency Contact Name"
      className="br-form-control"
      name="emergency_contact_name"
    />
  </Form.Group>
</Col>

{/* Emergency Contact Number */}
<Col lg={4} md={6} sm={12}>
    <Form.Group className="mb-3" controlId="emergencyRelationship">
      <Form.Label className="br-label">
        Relationship <span className="br-span-star">*</span>
      </Form.Label>
      <Form.Select
        className="br-form-control"
        name="emergency_relationship"
        required
      >
        <option value="">Select Relationship</option>
        <option value="Father">Father</option>
        <option value="Mother">Mother</option>
        <option value="Spouse">Spouse</option>
        <option value="Relative">Relative</option>
      </Form.Select>
    </Form.Group>
  </Col>

  {/* Emergency Contact Number */}
  <Col lg={4} md={6} sm={12}>
    <Form.Group className="mb-3" controlId="emergencyNumber">
      <Form.Label className="br-label">
        Emergency Contact Number <span className="br-span-star">*</span>
      </Form.Label>
      <Form.Control
        type="number"
        placeholder="Enter Emergency Contact Number"
        className="br-form-control"
        name="emergency_contact_number"
        required
      />
    </Form.Group>
  </Col>
{/* ================= Job Details Section ================= */}
<div className="br-basic-info mt-4">
  <h1>3. Job Details</h1>
</div>

{/* Department */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="department">
    <Form.Label className="br-label">
      Department <span className="br-span-star">*</span>
    </Form.Label>
    <Form.Select
      className="br-form-control"
      name="department"
      required
    >
      <option value="">Select Department</option>
      <option value="HR">HR</option>
      <option value="IT">IT</option>
      <option value="Finance">Finance</option>
      <option value="Sales">Sales</option>
      <option value="Marketing">Marketing</option>
      <option value="Operations">Operations</option>
    </Form.Select>
  </Form.Group>
</Col>

{/* Designation / Job Title */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="designation">
    <Form.Label className="br-label">
      Designation / Job Title <span className="br-span-star">*</span>
    </Form.Label>
    <Form.Control
      type="text"
      placeholder="Enter job title"
      className="br-form-control"
      name="designation"
      required
    />
  </Form.Group>
</Col>

{/* Employment Type */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="employmentType">
    <Form.Label className="br-label">
      Employment Type <span className="br-span-star">*</span>
    </Form.Label>
    <Form.Select
      className="br-form-control"
      name="employment_type"
      required
    >
      <option value="">Select Type</option>
      <option value="Full-Time">Full-Time</option>
      <option value="Part-Time">Part-Time</option>
      <option value="Contract">Contract</option>
      <option value="Intern">Intern</option>
    </Form.Select>
  </Form.Group>
</Col>

{/* Joining Date */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="joiningDate">
    <Form.Label className="br-label">
      Joining Date <span className="br-span-star">*</span>
    </Form.Label>
    <Form.Control
      type="date"
      className="br-form-control"
      name="joining_date"
      required
    />
  </Form.Group>
</Col>

{/* Reporting Manager */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="reportingManager">
    <Form.Label className="br-label">
      Reporting Manager
    </Form.Label>
    <Form.Select
      className="br-form-control"
      name="reporting_manager"
    >
      <option value="">Select Manager</option>
      <option value="John Doe">John Doe</option>
      <option value="Jane Smith">Jane Smith</option>
      <option value="Michael Brown">Michael Brown</option>
      <option value="Priya Sharma">Priya Sharma</option>
    </Form.Select>
  </Form.Group>
</Col>

{/* Work Location */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="workLocation">
    <Form.Label className="br-label">
      Work Location <span className="br-span-star">*</span>
    </Form.Label>
    <Form.Select
      className="br-form-control"
      name="work_location"
      required
    >
      <option value="">Select Location</option>
      <option value="Office">Office</option>
      <option value="Remote">Remote</option>
      <option value="Hybrid">Hybrid</option>
    </Form.Select>
  </Form.Group>
</Col>

{/* ================= Payroll & Salary Details Section ================= */}
<div className="br-basic-info mt-4">
  <h1>4. Payroll & Salary Details</h1>
</div>

{/* Salary (Monthly / Annual) */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="salary">
    <Form.Label className="br-label">
      Salary (Monthly / Annual) <span className="br-span-star">*</span>
    </Form.Label>
    <Form.Control
      type="number"
      placeholder="Enter salary amount"
      className="br-form-control"
      name="salary"
      required
    />
  </Form.Group>
</Col>

{/* Bank Name */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="bankName">
    <Form.Label className="br-label">
      Bank Name <span className="br-span-star">*</span>
    </Form.Label>
    <Form.Control
      type="text"
      placeholder="Enter bank name"
      className="br-form-control"
      name="bank_name"
      required
    />
  </Form.Group>
</Col>

{/* Account Number */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="accountNumber">
    <Form.Label className="br-label">
      Account Number <span className="br-span-star">*</span>
    </Form.Label>
    <Form.Control
      type="text"
      placeholder="Enter account number"
      className="br-form-control"
      name="account_number"
      required
    />
  </Form.Group>
</Col>

{/* IFSC / SWIFT Code */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="ifscCode">
    <Form.Label className="br-label">
      IFSC / SWIFT Code <span className="br-span-star">*</span>
    </Form.Label>
    <Form.Control
      type="text"
      placeholder="Enter IFSC or SWIFT code"
      className="br-form-control"
      name="ifsc_code"
      required
    />
  </Form.Group>
</Col>

{/* PAN / Tax ID */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="panNumber">
    <Form.Label className="br-label">
      PAN / Tax ID <span className="br-span-star">*</span>
    </Form.Label>
    <Form.Control
      type="text"
      placeholder="Enter PAN or Tax ID"
      className="br-form-control"
      name="pan_number"
      required
    />
  </Form.Group>
</Col>
{/* ================= Documets ================= */}
<div className="br-basic-info mt-4">
  <h1>6. Documents</h1>
</div>
  <Col lg={4} md={4} sm={12}>
  <Form.Group className="mb-3" controlId="resumeUpload">
    <Form.Label className="br-label">Resume / CV</Form.Label>

    <div className="br-doc-box text-center">
      {!resume.fileSelected ? (
        <>
          <div className="upload-icon">
            <i className="bi bi-folder-fill"></i>
          </div>
          <p className="doc-text">Drag your resume here</p>
          <p className="upload-or">or</p>
          <Form.Label htmlFor="resumeFile" className="upload-browse">
            Browse your computer
          </Form.Label>
          <Form.Control
            type="file"
            id="resumeFile"
            accept=".pdf,.doc,.docx"
            className="d-none"
            onChange={(e) => handleFileUpload(e, setResume)}
          />
        </>
      ) : (
        <div className="upload-progress-box">
          <div className="progress-info d-flex justify-content-between align-items-center">
            <div>
              {resume.uploadComplete ? (
                <FaCheckCircle color="green" className="me-2" />
              ) : (
                <i className="bi bi-file-earmark-text-fill progress-icon me-2"></i>
              )}
              <span className="progress-filename">{resume.fileName}</span>
            </div>
            <div>
              {resume.fileURL && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handlePreview(resume)}
                  className="me-2"
                  title="Preview File"
                >
                  <i className="bi bi-eye"></i>
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(setResume, "resumeFile")}
                title="Delete File"
              >
                <FaTrash />
              </Button>
            </div>
          </div>

          <div className="progress mt-2">
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${resume.uploadProgress}%` }}
            >
              {resume.uploadProgress}%
            </div>
          </div>

          {resume.showSuccess && (
            <div className="text-success mt-2 fw-bold br-card-success">
               File uploaded successfully!
            </div>
          )}
        </div>
      )}
    </div>
  </Form.Group>
</Col>


    


            </Row>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default EmployeeRegistration;
