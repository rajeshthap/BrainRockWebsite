import React, { useState } from "react";
import { Container, Row, Col, Button, Form, Card, } from "react-bootstrap";
import { FaBars, FaSearch, FaTrash, FaCheckCircle, FaRegFile, FaIdCard } from "react-icons/fa";
import "../../assets/css/employeeregistration.css";
import { RiFolderImageLine } from "react-icons/ri";
import { GrDocumentText } from "react-icons/gr";
import { PiCertificate } from "react-icons/pi";
import SideNav from "../hr_dashboard/SideNav";
import HrHeader from "../hr_dashboard/HrHeader";

const EmployeeRegistration = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile] = useState(false);
  const [isTablet] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

//  Add this state along with your existing resume and aadhar states
 const [photo, setPhoto] = useState({
    fileSelected: false,
    fileName: "",
    fileURL: "",
    uploadProgress: 0,
    uploadComplete: false,
  });

  const [resume, setResume] = useState({
    fileSelected: false,
    fileName: "",
    fileURL: "",
    uploadProgress: 0,
    uploadComplete: false,
  });

  const [aadhar, setAadhar] = useState({
    fileSelected: false,
    fileName: "",
    fileURL: "",
    uploadProgress: 0,
    uploadComplete: false,
  });

const [offerLetter, setOfferLetter] = useState({
  fileSelected: false,
  fileName: "",
  fileURL: "",
  uploadProgress: 0,
  uploadComplete: false,
});

const [panCard, setPanCard] = useState({
  fileSelected: false,
  fileName: "",
  fileURL: "",
  uploadProgress: 0,
  uploadComplete: false,
});

  const [experienceFiles, setExperienceFiles] = useState([]);

  // ===================== FILE UPLOAD HANDLER =====================
  const handleFileUpload = (e, setter, multiple = false) => {
    const files = e.target.files;
    if (!files.length) return;

    if (multiple) {
      const uploadedFiles = Array.from(files).map((file) => ({
        fileName: file.name,
        fileURL: URL.createObjectURL(file),
        uploadProgress: 0,
        uploadComplete: false,
      }));

      setExperienceFiles((prev) => [...prev, ...uploadedFiles]);

      // Simulate Upload Progress
      uploadedFiles.forEach((file, index) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setExperienceFiles((prev) =>
            prev.map((f, i) =>
              i === prev.length - uploadedFiles.length + index
                ? { ...f, uploadProgress: progress }
                : f
            )
          );
          if (progress >= 100) {
            clearInterval(interval);
            setExperienceFiles((prev) =>
              prev.map((f, i) =>
                i === prev.length - uploadedFiles.length + index
                  ? { ...f, uploadComplete: true }
                  : f
              )
            );
          }
        }, 200);
      });
    } else {
      const file = files[0];
      const fileURL = URL.createObjectURL(file);
      setter({
        fileSelected: true,
        fileName: file.name,
        fileURL,
        uploadProgress: 0,
        uploadComplete: false,
      });

      // Simulate Upload Progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setter((prev) => ({ ...prev, uploadProgress: progress }));
        if (progress >= 100) {
          clearInterval(interval);
          setter((prev) => ({ ...prev, uploadComplete: true }));
        }
      }, 200);
    }
  };

  // ===================== DELETE HANDLER =====================
  const handleDelete = (setter, inputId) => {
    setter({
      fileSelected: false,
      fileName: "",
      fileURL: "",
      uploadProgress: 0,
      uploadComplete: false,
    });
    const input = document.getElementById(inputId);
    if (input) input.value = "";
  };

 

  // ===================== PREVIEW HANDLER =====================
  const handlePreview = (fileData) => {
    if (fileData.fileURL) window.open(fileData.fileURL, "_blank");
  };

// Multiple file upload handler
const handleMultipleFileUpload = (e) => {
  const files = Array.from(e.target.files);
  const newFiles = files.map((file) => ({
    fileName: file.name,
    fileSelected: true,
    fileURL: URL.createObjectURL(file),
    uploadProgress: 0,
    uploadComplete: false,
  }));

  setExperienceFiles((prev) => [...prev, ...newFiles]);

  // Simulate upload progress
  newFiles.forEach((file, idx) => {
    const uploadInterval = setInterval(() => {
      setExperienceFiles((prev) =>
        prev.map((f, i) => {
          if (prev.length - newFiles.length + idx === i) {
            const newProgress = Math.min(f.uploadProgress + 20, 100);
            return {
              ...f,
              uploadProgress: newProgress,
              uploadComplete: newProgress === 100,
            };
          }
          return f;
        })
      );
    }, 300);

    setTimeout(() => clearInterval(uploadInterval), 1600);
  });
};

// Delete a file
const handleDeleteFile = (index) => {
  setExperienceFiles((prev) => prev.filter((_, i) => i !== index));
};

// Preview file


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
       <HrHeader toggleSidebar={toggleSidebar} />

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



{/* Emergency Contact Number */}
<Col lg={4} md={6} sm={12}>
    <Form.Group className="mb-3" controlId="emergencyRelationship">
      <Form.Label className="br-label">
        Emergency Contact Name <span className="br-span-star">*</span>
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
        <option value="Cousin">Cousin</option>
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

{/* ================= Documents ================= */}
<div className="br-basic-info mt-4">
  <h1>6. Documents</h1>
</div>

{/* Resume Upload */}
<Col lg={3} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="resumeUpload">
    <Form.Label className="br-label">Resume / CV</Form.Label>
    <div className="br-doc-box text-center">
      {!resume.fileSelected ? (
        <>
          <div className="upload-icon">
           <FaRegFile />
          </div>
          <p className="doc-text">Drag your resume here</p>
          <p className="upload-or">or</p>
          <Form.Label htmlFor="resumeFile" className="upload-browse">
            Browse your computer
          </Form.Label>
          <Form.Control
            type="file"
            id="resumeFile"
            accept=".pdf,.jpg,.jpeg,.png"
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

          {resume.uploadComplete && (
            <div className="text-success mt-2 fw-bold br-card-success">
              File uploaded successfully!
            </div>
          )}
        </div>
      )}
    </div>
  </Form.Group>
</Col>

{/* Aadhar Card */}
<Col lg={3} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="aadharUpload">
    <Form.Label className="br-label">Aadhar Card</Form.Label>

    <div className="br-doc-box text-center">
      {!aadhar.fileSelected ? (
        <>
          <div className="upload-icon">
           <FaIdCard />
          </div>
          <p className="doc-text">Drag your Aadhar card file here</p>
          <p className="upload-or">or</p>
          <Form.Label htmlFor="aadharFile" className="upload-browse">
            Browse your computer
          </Form.Label>
          <Form.Control
            type="file"
            id="aadharFile"
            accept=".pdf,.jpg,.jpeg,.png"
            className="d-none"
            onChange={(e) => handleFileUpload(e, setAadhar)}
          />
        </>
      ) : (
        <div className="upload-progress-box">
          <div className="progress-info d-flex justify-content-between align-items-center">
            <div>
              {aadhar.uploadComplete ? (
                <FaCheckCircle color="green" className="me-2" />
              ) : (
                <i className="bi bi-file-earmark-text-fill progress-icon me-2"></i>
              )}
              <span className="progress-filename">{aadhar.fileName}</span>
            </div>
            <div>
              {aadhar.fileURL && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handlePreview(aadhar)}
                  className="me-2"
                  title="Preview File"
                >
                  <i className="bi bi-eye"></i>
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(setAadhar, "aadharFile")}
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
              style={{ width: `${aadhar.uploadProgress}%` }}
            >
              {aadhar.uploadProgress}%
            </div>
          </div>

          {aadhar.uploadComplete && (
            <div className="text-success mt-2 fw-bold br-card-success">
              File uploaded successfully!
            </div>
          )}
        </div>
      )}
    </div>
  </Form.Group>
</Col>

{/* Offer Letter */}
<Col lg={3} md={3} sm={12}>
  <Form.Group className="mb-3" controlId="offerLetterUpload">
    <Form.Label className="br-label">Offer Letter</Form.Label>
    <div className="br-doc-box text-center">
      {!offerLetter.fileSelected ? (
        <>
          <div className="upload-icon">
            <GrDocumentText />
          </div>
          <p className="doc-text">Drag your Offer Letter here</p>
          <p className="upload-or">or</p>
          <Form.Label htmlFor="offerLetterFile" className="upload-browse">
            Browse your computer
          </Form.Label>
          <Form.Control
            type="file"
            id="offerLetterFile"
            accept=".pdf,.jpg,.jpeg,.png"
            className="d-none"
            onChange={(e) => handleFileUpload(e, setOfferLetter)}
          />
        </>
      ) : (
        <div className="upload-progress-box">
          <div className="progress-info d-flex justify-content-between align-items-center">
            <div>
              {offerLetter.uploadComplete ? (
                <FaCheckCircle color="green" className="me-2" />
              ) : (
                <i className="bi bi-file-earmark-text-fill progress-icon me-2"></i>
              )}
              <span className="progress-filename">{offerLetter.fileName}</span>
            </div>
            <div>
              {offerLetter.fileURL && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handlePreview(offerLetter)}
                  className="me-2"
                  title="Preview File"
                >
                  <i className="bi bi-eye"></i>
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(setOfferLetter, "offerLetterFile")}
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
              style={{ width: `${offerLetter.uploadProgress}%` }}
            ></div>
          </div>

          {offerLetter.uploadComplete && (
            <div className="text-success mt-2 fw-bold br-card-success">
              File uploaded successfully!
            </div>
          )}
        </div>
      )}
    </div>
  </Form.Group>
</Col>

{/* Pan Card */}
<Col lg={3} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="panCardUpload">
    <Form.Label className="br-label">Pan Card</Form.Label>
    <div className="br-doc-box text-center">
      {!panCard.fileSelected ? (
        <>
          <div className="upload-icon">
           <FaIdCard />
          </div>
          <p className="doc-text">Drag your Pan Card here</p>
          <p className="upload-or">or</p>
          <Form.Label htmlFor="panCardFile" className="upload-browse">
            Browse your computer
          </Form.Label>
          <Form.Control
            type="file"
            id="panCardFile"
            accept=".pdf,.jpg,.jpeg,.png"
            className="d-none"
            onChange={(e) => handleFileUpload(e, setPanCard)}
          />
        </>
      ) : (
        <div className="upload-progress-box">
          <div className="progress-info d-flex justify-content-between align-items-center">
            <div>
              {panCard.uploadComplete ? (
                <FaCheckCircle color="green" className="me-2" />
              ) : (
                <i className="bi bi-file-earmark-text-fill progress-icon me-2"></i>
              )}
              <span className="progress-filename">{panCard.fileName}</span>
            </div>
            <div>
              {panCard.fileURL && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => handlePreview(panCard)}
                  className="me-2"
                  title="Preview File"
                >
                  <i className="bi bi-eye"></i>
                </Button>
              )}
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(setPanCard, "panCardFile")}
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
              style={{ width: `${panCard.uploadProgress}%` }}
            ></div>
          </div>

          {panCard.uploadComplete && (
            <div className="text-success mt-2 fw-bold br-card-success">
              File uploaded successfully!
            </div>
          )}
        </div>
      )}
    </div>
  </Form.Group>
</Col>

{/* Experience Certificates (Multiple) */}
<Col lg={6} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="experienceUpload">
    <Form.Label className="br-label">Experience Certificates</Form.Label>
    <Row>
      <Col lg={6}>
        <div className="br-doc-box text-center">
          <div className="upload-icon">
           <PiCertificate />
          </div>
          <p className="doc-text">Drag your Experience Certificates here</p>
          <p className="upload-or">or</p>
          <Form.Label htmlFor="experienceFiles" className="upload-browse">
            Browse your computer
          </Form.Label>
          <Form.Control
            type="file"
            id="experienceFiles"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            className="d-none"
            onChange={(e) => handleMultipleFileUpload(e)}
          />
        </div>
      </Col>

      <Col lg={6}>
        {experienceFiles.length > 0 && (
          <div className="uploaded-files">
            {experienceFiles.map((file, index) => (
              <Card key={index} className="shadow-sm mb-2 border-0">
                <Card.Body className="p-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      {file.uploadComplete ? (
                        <FaCheckCircle color="green" className="me-2" />
                      ) : (
                        <i className="bi bi-file-earmark-text-fill text-secondary me-2"></i>
                      )}
                      <span
                        className="fw-semibold text-truncate"
                        style={{ maxWidth: "150px" }}
                      >
                        {file.fileName}
                      </span>
                    </div>
                    <div>
                      {file.fileURL && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handlePreview(file)}
                          className="me-2"
                          title="Preview File"
                        >
                          <i className="bi bi-eye"></i>
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteFile(index)}
                        title="Delete File"
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>

                  <div className="progress mt-2" style={{ height: "6px" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${file.uploadProgress}%` }}
                    ></div>
                  </div>

                  {file.uploadComplete && (
                    <div className="text-success mt-1 small fw-bold">
                      Uploaded successfully!
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Col>
    </Row>
  </Form.Group>
</Col>



<div className="br-basic-info mt-4">
  <h1>6. System Access & Role (if using admin panel)</h1>
</div>
    {/* User Role */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="userRole">
    <Form.Label className="br-label">
      User Role <span className="br-span-star">*</span>
    </Form.Label>
    <Form.Select
      className="br-form-control"
      name="user_role"
      required
    >
      <option value="">Select Role</option>
      <option value="Admin">Admin</option>
      <option value="Manager">Manager</option>
      <option value="Employee">Employee</option>
    </Form.Select>
  </Form.Group>
</Col>

{/* Username */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="username">
    <Form.Label className="br-label">
      Username <span className="br-span-star">*</span>
    </Form.Label>
    <Form.Control
      type="text"
      placeholder="Enter or auto-generate username"
      className="br-form-control"
      name="username"
      required
    />
  </Form.Group>
</Col>

{/* Password */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="password">
    <Form.Label className="br-label">
      Password <span className="br-span-star">*</span>
    </Form.Label>
    <Form.Control
      type="password"
      placeholder="Enter or auto-generate password"
      className="br-form-control"
      name="password"
      required
    />
  </Form.Group>
</Col>

 <div className="br-btn-submit">
  <Button variant="primary" type="submit" className="br-submit-btn">
    Register Employee
  </Button>
 </div>



            </Row>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default EmployeeRegistration;
