import React, { useEffect, useState, useContext, useRef } from "react";
import { Container, Row, Col, Form, Button, Image } from "react-bootstrap";
import "../../assets/css/Profile.css";
import SideNav from "../hr_dashboard/SideNav";
import HrHeader from "../hr_dashboard/HrHeader";
import { AuthContext } from "../context/AuthContext";
import { FaCamera } from "react-icons/fa";
import axios from "axios";
import { FaRegFile, FaIdCard } from "react-icons/fa";
import { GrDocumentText } from "react-icons/gr";
import { PiCertificate } from "react-icons/pi";

const HrProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";

  const [data, setData] = useState({});
  const [empId, setEmpId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [newCertificates, setNewCertificates] = useState([]);
  const [deletedCertificates, setDeletedCertificates] = useState([]);
  const [replacedCertificates, setReplacedCertificates] = useState({});

  // FIXED axios instance – must send cookies
  const axiosInstance = axios.create({
    baseURL: `${BASE_URL}/api/`,
    withCredentials: true,
  });

  // FETCH EMPLOYEE DETAILS
  useEffect(() => {
    if (!user || !user.unique_id) {
      console.log("user.unique_id not available yet");
      return;
    }

    console.log("Fetching with emp_id:", user.unique_id);

    axiosInstance
      .get(`employee-details/?emp_id=${user.unique_id}`)
      .then((res) => {
        console.log("EMPLOYEE PROFILE RESPONSE:", res.data);

        const empData = res.data;
        setData({
          ...empData,
          experience_certificates: normalizeCertificates(empData.experience_certificates),
          originalExperience: empData.experience_certificates || [],
        });

        setEmpId(empData.emp_id);

        if (empData.profile_photo) {
          setProfilePreview(getFullUrl(empData.profile_photo));
        }
      })
      .catch((err) => {
        console.error("Error fetching EMPLOYEE details:", err);
      });
  }, [user]);

  // Convert relative → full URL
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}${path}`;
  };

  // Input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // Photo upload
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePreview(URL.createObjectURL(file));
      setData((prev) => ({ ...prev, profile_photo: file }));
    }
  };

  const handleExperienceUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewCertificates((prev) => [...prev, ...files]);
  };

  const normalizeCertificates = (certs) => {
    if (!certs) return [];
    return certs.map((item) => {
      if (!item) return null;
      if (typeof item === "string") return item;
      if (item?.file instanceof File) return item.file;
      if (item?.fileURL) return item.fileURL;
      return null;
    }).filter(Boolean);
  };

  const deleteCertificate = (index, isNew = false) => {
    if (isNew) {
      setNewCertificates((prev) => prev.filter((_, i) => i !== index));
    } else {
      const certToDelete = data.experience_certificates[index];
      
      // Add to deleted list if it's a string (existing certificate)
      if (typeof certToDelete === "string") {
        setDeletedCertificates((prev) => [...prev, certToDelete]);
      }
      
      // Update the data state
      const updated = [...data.experience_certificates];
      updated.splice(index, 1);
      setData((prev) => ({
        ...prev,
        experience_certificates: updated
      }));
    }
  };

  const replaceCertificate = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const updated = [...data.experience_certificates];
    const originalPath = updated[index];
    
    // If replacing an existing certificate (string), add it to deleted list
    if (typeof originalPath === "string") {
      setDeletedCertificates((prev) => [...prev, originalPath]);
    }
    
    // Replace with new file
    updated[index] = file;
    
    setData((prev) => ({
      ...prev,
      experience_certificates: updated,
    }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      
      // Employee ID
      formData.append("emp_id", empId);
      
      // BASIC FIELDS
      const editableFields = [
        "email",
        "alternate_phone",
        "emergency_contact_name",
        "emergency_contact_number",
        "address",
        "designation",
        "department",
        "reporting_manager",
        "work_location",
        "salary",
        "ifsc_code",
        "bank_name",
        "account_number",
      ];
      
      editableFields.forEach((field) => {
        if (data[field]) {
          formData.append(field, data[field]);
        }
      });
      
      // PROFILE PHOTO
      if (data.profile_photo instanceof File) {
        formData.append("profile_photo", data.profile_photo);
      }
      
      // EXPERIENCE CERTIFICATES
      
      // 1. Existing certificates (only the ones that are still strings and not deleted)
      const existingCerts = data.experience_certificates.filter(
        (cert) => typeof cert === "string" && !deletedCertificates.includes(cert)
      );
      
      existingCerts.forEach((cert) => {
        formData.append("existing_experience_certificates[]", cert);
      });
      
      // 2. Deleted certificates
      deletedCertificates.forEach((cert) => {
        formData.append("deleted_experience_certificates[]", cert);
      });
      
      // 3. New certificates (files that were added)
      newCertificates.forEach((file) => {
        formData.append("experience_certificates[]", file);
      });
      
      // 4. Replaced certificates (files that replaced existing ones)
      data.experience_certificates.forEach((cert) => {
        if (cert instanceof File) {
          formData.append("experience_certificates[]", cert);
        }
      });
      
      console.log("Sending form data:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }
      
      const response = await axiosInstance.patch(
        `employee-details/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      
      console.log("Update response:", response.data);
      
      alert("Updated successfully!");
      
      // REFRESH DATA
      const refreshed = await axiosInstance.get(
        `employee-details/?emp_id=${user.unique_id}`
      );
      
      const empData = refreshed.data;
      
      setData({
        ...empData,
        experience_certificates: normalizeCertificates(empData.experience_certificates),
        originalExperience: empData.experience_certificates || [],
      });
      
      if (empData.profile_photo) {
        setProfilePreview(getFullUrl(empData.profile_photo));
      }
      
      // Reset state
      setNewCertificates([]);
      setDeletedCertificates([]);
      setReplacedCertificates({});
      setEditMode(false);
      
    } catch (error) {
      console.error("Update error:", error);
      console.log("SERVER:", error.response?.data);
      alert("Update failed: " + (error.response?.data?.error || error.message));
    }
  };

  const disableField = (fieldName) => {
    const editable = [
      "email",
      "alternate_phone",
      "emergency_contact_name",
      "emergency_contact_number",
      "profile_photo",
    ];
    return !editable.includes(fieldName) || !editMode;
  };

  const toCamelLabel = (str) =>
    str.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="dashboard-container">
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            <h2>My Profile</h2>

            <Form>
              <Row>
                {/* LEFT SIDE PHOTO */}
                <Col md={3} className="mb-3">
                  <Form.Label>Profile Photo</Form.Label>

                  <div
                    className="profile-photo-wrapper"
                    style={{
                      position: "relative",
                      width: "150px",
                      height: "150px",
                    }}
                    onClick={() => {
                      if (!disableField("profile_photo")) {
                        fileInputRef.current.click();
                      }
                    }}
                  >
                    <Image
                      src={
                        profilePreview ||
                        `${BASE_URL}/media/defaults/default-user.png`
                      }
                      roundedCircle
                      width="150"
                      height="150"
                      style={{ border: "2px solid #ddd", objectFit: "cover" }}
                    />

                    {!disableField("profile_photo") && (
                      <div className="profile-photo-overlay">
                        <FaCamera size={24} />
                        <span>Change Photo</span>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      onChange={handlePhoto}
                    />
                  </div>
                </Col>

                {/* RIGHT SIDE FORM */}
                <Col md={9}>
                  <Row>
                    {/* EDIT BUTTONS */}
                    <Col lg={12} className="text-end my-3">
                      {!editMode ? (
                        <Button onClick={() => setEditMode(true)}>Edit</Button>
                      ) : (
                        <>
                          <Button
                            variant="success"
                            onClick={handleSave}
                            className="me-2"
                          >
                            Update
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => setEditMode(false)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </Col>

                    {/* NON EDITABLE FIELDS */}
                    {[
                      "first_name",
                      "last_name",
                      "gender",
                      "date_of_birth",
                      "phone",
                      "address",
                      "country",
                      "state",
                      "city",
                      "department",
                      "designation",
                      "employee_type",
                      "joining_date",
                      "reporting_manager",
                      "work_location",
                      "salary",
                      "bank_name",
                      "account_number",
                      "ifsc_code",
                      "tax_id",
                      "username",
                      "branch_name",
                    ].map((field) => (
                      <Col lg={6} md={6} sm={12} key={field}>
                        <Form.Group className="mb-3">
                          <Form.Label className="br-label">{toCamelLabel(field)}</Form.Label>
                          <Form.Control
                            className="br-form-control"
                            value={data[field] || ""} 
                            disabled 
                          />
                        </Form.Group>
                      </Col>
                    ))}

                    {/* EDITABLE FIELDS */}
                    {[
                      "email",
                      "alternate_phone",
                      "emergency_contact_name",
                      "emergency_contact_number",
                    ].map((field) => (
                      <Col lg={6} md={6} sm={12} key={field}>
                        <Form.Group className="mb-3">
                          <Form.Label className="br-label">{toCamelLabel(field)}</Form.Label>
                          <Form.Control
                            className="br-form-control"
                            name={field}
                            value={data[field] || ""}
                            disabled={disableField(field)}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    ))}

                    {/* DOCUMENTS */}
                    {[
                      { label: "Resume", key: "resume_document", icon: <FaRegFile size={40} /> },
                      { label: "Aadhar Card", key: "id_proof_document", icon: <FaIdCard size={40} /> },
                      { label: "PAN Card", key: "pan_card_document", icon: <FaIdCard size={40} /> },
                      { label: "Offer Letter", key: "offer_letter", icon: <GrDocumentText size={40} /> },
                    ].map((doc) => (
                      <Col lg={6} md={6} sm={12} key={doc.key}>
                        <div className="br-doc-box text-center p-3">
                          {/* ICON */}
                          <div className="mb-2">{doc.icon}</div>
                          <h6 className="fw-bold">{doc.label}</h6>
                          <p className="small text-muted">
                            {data[doc.key] ? data[doc.key].split("/").pop() : "No file uploaded"}
                          </p>
                          {data[doc.key] && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => window.open(getFullUrl(data[doc.key]), "_blank")}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </Col>
                    ))}

                    {/* EXPERIENCE CERTIFICATES */}
                    <Col lg={12} className="mt-4">
                      <h5 className="fw-bold">Experience Certificates</h5>
                    </Col>

                    {data.experience_certificates && data.experience_certificates.length > 0 ? (
                      data.experience_certificates.map((file, index) => (
                        <Col lg={6} key={index}>
                          <div className="br-doc-box text-center p-3">
                            <PiCertificate size={40} className="mb-2" />
                            <h6 className="fw-bold">Certificate {index + 1}</h6>
                            <p className="small text-muted">
                              {file instanceof File ? file.name : file.split("/").pop()}
                            </p>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                file instanceof File
                                  ? window.open(URL.createObjectURL(file), "_blank")
                                  : window.open(getFullUrl(file), "_blank")
                              }
                            >
                              View
                            </Button>
                            {editMode && (
                              <>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  className="ms-2"
                                  onClick={() => deleteCertificate(index, false)}
                                >
                                  Delete
                                </Button>
                                <div className="mt-2">
                                  <label className="btn btn-sm btn-outline-primary">
                                    Replace
                                    <input
                                      type="file"
                                      style={{ display: "none" }}
                                      onChange={(e) => replaceCertificate(e, index)}
                                    />
                                  </label>
                                </div>
                              </>
                            )}
                          </div>
                        </Col>
                      ))
                    ) : (
                      <Col lg={12}>
                        <p className="text-muted">No Experience Certificates Uploaded</p>
                      </Col>
                    )}

                    {/* NEWLY ADDED CERTIFICATES (Preview before Save) */}
                    {newCertificates.map((file, index) => (
                      <Col lg={6} key={`new-${index}`}>
                        <div className="br-doc-box text-center p-3">
                          <PiCertificate size={40} className="mb-2" />
                          <h6 className="fw-bold">New Certificate</h6>
                          <p className="small text-muted">{file.name}</p>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteCertificate(index, true)}
                          >
                            Remove
                          </Button>
                        </div>
                      </Col>
                    ))}

                    {/* UPLOAD BUTTON */}
                    {editMode && (
                      <Col lg={12} className="mt-3">
                        <label className="btn btn-outline-primary w-100">
                          Add New Certificates
                          <input
                            type="file"
                            multiple
                            style={{ display: "none" }}
                            onChange={handleExperienceUpload}
                          />
                        </label>
                      </Col>
                    )}
                  </Row>
                </Col>
              </Row>
            </Form>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default HrProfile;