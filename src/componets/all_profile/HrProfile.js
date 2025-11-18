import React, { useEffect, useState, useContext, useRef } from "react";
import { Container, Row, Col, Form, Button, Image } from "react-bootstrap";
import "../../assets/css/Profile.css";
import SideNav from "../hr_dashboard/SideNav";
import HrHeader from "../hr_dashboard/HrHeader";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { FaCamera } from "react-icons/fa";

const HrProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const { user } = useContext(AuthContext); // contains emp_id
  const [empId, setEmpId] = useState(null);
  const fileInputRef = useRef(null);

  const BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";
  const [data, setData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);

  useEffect(() => {
    if (!user?.unique_id) return;

    axios
      .get(
        `${BASE_URL}/api/employee-details/?emp_id=${user.unique_id}`
      )
      .then((res) => {
        console.log("EMPLOYEE PROFILE API RESPONSE:", res.data);

        const empData = res.data;
        setData(empData);

        // Store emp_id
        setEmpId(empData.emp_id);

        if (empData.profile_photo) {
          setProfilePreview(getFullUrl(empData.profile_photo));
        }
      })
      .catch((err) => console.error("Error fetching EMPLOYEE details:", err));
  }, [user]);

  // Convert relative URL → Full
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}${path}`;
  };

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Profile Photo Upload
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePreview(URL.createObjectURL(file));
      setData((prev) => ({ ...prev, profile_photo: file }));
    }
  };

  // Save Data (PATCH)
  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("emp_id", empId); // IMPORTANT

      const editableFields = [
        "email",
        "alternate_phone",
        "emergency_contact_name",
        "emergency_contact_number",
        "profile_photo",
      ];

      editableFields.forEach((field) => {
        if (data[field]) {
          formData.append(field, data[field]);
        }
      });

      await axios.patch(
        `${BASE_URL}/api/employee-details/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update profile.");
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

  const toCamelLabel = (str) => {
    return str
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

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
                {/* LEFT PHOTO */}
                <Col md={3} className="mb-3">
                  <Form.Label>Profile Photo</Form.Label>

                  <div
                    className="profile-photo-wrapper"
                    style={{
                      position: "relative",
                      width: "150px",
                      height: "150px",
                      cursor: disableField("profile_photo") ? "not-allowed" : "pointer",
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

                {/* RIGHT FORM */}
                <Col md={9}>
                  <Row>
                    {/* EDIT BUTTONS */}
                    <Col lg={12} className="text-end my-3">
                      {!editMode ? (
                        <Button onClick={() => setEditMode(true)}>Edit</Button>
                      ) : (
                        <>
                          <Button variant="success" onClick={handleSave} className="me-2">
                            Update
                          </Button>
                          <Button variant="secondary" onClick={() => setEditMode(false)}>
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
                      <Col lg={6} key={field}>
                        <Form.Group className="mb-3">
                          <Form.Label>{toCamelLabel(field)}</Form.Label>
                          <Form.Control value={data[field] || ""} disabled />
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
                      <Col lg={6} key={field}>
                        <Form.Group className="mb-3">
                          <Form.Label>{toCamelLabel(field)}</Form.Label>
                          <Form.Control
                            name={field}
                            value={data[field] || ""}
                            disabled={disableField(field)}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    ))}

                    {/* DOCUMENT VIEW BOXES */}
                    {[
                      { label: "Resume", key: "resume_document" },
                      { label: "PAN Card Document", key: "pan_card_document" },
                      { label: "ID Proof Document", key: "id_proof_document" },
                      { label: "Offer Letter", key: "offer_letter" },
                    ].map((doc) => (
                      <Col lg={6} key={doc.key}>
                        <div className="br-doc-box text-center p-3">
                          <i className="bi bi-file-earmark-person fs-1 mb-2"></i>
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
