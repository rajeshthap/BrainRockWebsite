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
  // State to track original filenames for better UX
  const [originalCertificateNames, setOriginalCertificateNames] = useState({});

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

  // Convert relative → full URL with cache-busting
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    // Ensure path starts with slash
    let cleanPath = path.startsWith("/") ? path : `/${path}`;

    // If server returned a bare filename or a path missing the media prefix,
    // normalize it to the media folder used by other document URLs.
    if (!cleanPath.startsWith("/media")) {
      // Avoid duplicate // when joining
      cleanPath = `/media${cleanPath}`;
    }

    // Add cache-buster
    return `${BASE_URL}${cleanPath}?t=${Date.now()}`;
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
    // Append new files directly to the main experience_certificates array
    setData((prev) => ({
      ...prev,
      experience_certificates: [...(prev.experience_certificates || []), ...files],
    }));
  };

const normalizeCertificates = (certs) => {
  if (!certs) return [];

  return certs
    .map((item) => {
      if (!item) return null;

      if (typeof item === "string") {
        // Ensure leading slash and that the path lives under /media
        let pathStr = item.startsWith("/") ? item : `/${item}`;
        if (!pathStr.startsWith("/media")) {
          pathStr = `/media${pathStr}`;
        }
        return pathStr;
      }

      if (item instanceof File) return item;

      if (item?.fileURL) {
        return item.fileURL.startsWith("/") ? item.fileURL : `/${item.fileURL}`;
      }

      return null;
    })
    .filter(Boolean);
};

  const deleteCertificate = (index) => {
    const updated = [...data.experience_certificates];
    updated.splice(index, 1);
    setData((prev) => ({
      ...prev,
      experience_certificates: updated,
    }));
  };

  const deleteCertificateFromServer = async (index) => {
  try {
    const response = await axiosInstance.delete(
      `delete-experience-certificate/?emp_id=${empId}&index=${index}`
    );

    console.log("Delete Response:", response.data);

    // Remove successfully deleted certificate from UI
    const updated = [...data.experience_certificates];
    updated.splice(index, 1);

    setData((prev) => ({
      ...prev,
      experience_certificates: updated,
    }));

    alert("Certificate deleted successfully!");

  } catch (error) {
    console.error("Delete Error:", error);
    const serverMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;

    alert("Failed to delete certificate: " + serverMsg);
  }
};


  const replaceCertificate = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const updated = [...data.experience_certificates];
    updated[index] = file; // Replace the item at the specific index with the new File object
    
    setData((prev) => ({
      ...prev,
      experience_certificates: updated,
    }));
  };


 const handleSave = async () => {
  try {
    const formData = new FormData();

    // 1. Append the required Employee ID
    if (empId) {
      formData.append("emp_id", empId);
    }

    // 2. Define which fields are editable and which are integers
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
    
    const integerFields = ["salary", "account_number", "alternate_phone", "emergency_contact_number"];

    
    editableFields.forEach((field) => {
      const value = data[field];
      if (value !== null && value !== undefined && value !== "") {
        if (integerFields.includes(field)) {
          if (!isNaN(Number(value))) {
            formData.append(field, value);
          }
        } else {
          formData.append(field, value);
        }
      }
    });

    
    if (data.profile_photo instanceof File) {
      formData.append("profile_photo", data.profile_photo);
    }

    
    data.experience_certificates.forEach((cert, index) => {
      if (cert instanceof File) {
        formData.append(`experience_certificates[${index}]`, cert);
      }
    });

   
    const response = await axiosInstance.patch(`employee-details/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Update response:", response.data);
    alert("Updated successfully!");

    
    const updatedCertificatesFromServer = response.data.experience_certificates || [];

    // Normalize both old and updated paths so comparison & mapping is consistent.
    const normalizedUpdated = normalizeCertificates(updatedCertificatesFromServer);
    const normalizedOld = normalizeCertificates(
      (data.experience_certificates || []).filter((cert) => typeof cert === "string")
    );

    const newlyAddedPaths = normalizedUpdated.filter((path) => !normalizedOld.includes(path));
    
    const newFileMap = {};
    let newFileIndex = 0;
    data.experience_certificates.forEach((cert) => {
      if (cert instanceof File) {
        const newPath = newlyAddedPaths[newFileIndex];
        if (newPath) {
          newFileMap[newPath] = cert.name;
        }
        newFileIndex++;
      }
    });
    setOriginalCertificateNames(prev => ({ ...prev, ...newFileMap }));

   
    setData((prevData) => ({
      ...prevData,
      experience_certificates: normalizedUpdated,
    }));

    
    if (data.profile_photo instanceof File) {
    
      const timestamp = new Date().getTime();
      const refreshed = await axiosInstance.get(
        `employee-details/?emp_id=${user.unique_id}&_t=${timestamp}`
      );
      if (refreshed.data.profile_photo) {
        setProfilePreview(getFullUrl(refreshed.data.profile_photo));
      }
    }
    
    
    setEditMode(false);

  } catch (error) {
    console.error("Update error:", error);
    const serverError = error.response?.data?.error || error.response?.data?.message || error.message;
    alert("Update failed: " + serverError);
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

                    {/* REVERTED: NON EDITABLE FIELDS */}
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

                    {/* REVERTED: EDITABLE FIELDS */}
                    {[
                      "email",
                      "alternate_phone",
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
                      
                    )
                    )
                    } <Col lg={6} md={6} sm={12}>
                      <Form.Group className="mb-3">
                        <Form.Label className="br-label">
                          Emergency Contact Name{" "}
                          <span className="br-span-star">*</span>
                        </Form.Label>
                        <Form.Select
                          className="br-form-control"
                          name="emergency_contact_name"
                          value={data.emergency_contact_name || ""}
                          disabled={disableField("emergency_contact_name")}
                          onChange={handleChange}
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

                    {/* DOCUMENTS */}
                    {[
                      { label: "Resume", key: "resume_document", icon: <FaRegFile size={40} /> },
                      { label: "Aadhar Card", key: "id_proof_document", icon: <FaIdCard size={40} /> },
                      { label: "PAN Card", key: "pan_card_document", icon: <FaIdCard size={40} /> },
                      { label: "Offer Letter", key: "offer_letter", icon: <GrDocumentText size={40} /> },
                    ].map((doc) => (
                      <Col lg={6} md={6} sm={12} key={doc.key}>
                        <div className="br-doc-box text-center p-3">
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
                              {file instanceof File 
                                ? file.name 
                                : (originalCertificateNames[file] || file.split("/").pop())
                              }
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
                                  onClick={() => deleteCertificateFromServer(index)}

                                >
                                  Delete
                                </Button>
                                <div className="mt-2">
                                  <label className="btn btn-sm btn-outline-primary">
                                    Edit
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