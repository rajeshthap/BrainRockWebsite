import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Form,
  Card,
  Alert,
} from "react-bootstrap";
import { FaTrash, FaCheckCircle, FaRegFile, FaIdCard } from "react-icons/fa";
import "../../assets/css/employeeregistration.css";
import "../custom/style.css";
import { RiFolderImageLine } from "react-icons/ri";
import { GrDocumentText } from "react-icons/gr";
import { PiCertificate } from "react-icons/pi";
import ModifyAlert from "../alerts/ModifyAlert";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const HrRegistration = () => {
  const CustomDatePickerInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
  <div className="input-group">
    <Form.Control
      ref={ref}
      onClick={onClick}
      value={value}
      placeholder={placeholder}
      className="br-date-picker"
      readOnly
    />
    <span className="input-group-text" onClick={onClick}>
      <i className="bi bi-calendar3"></i>
    </span>
  </div>
));
  const [showModifyAlert, setShowModifyAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Add state to track drag over status for each upload area
  const [dragOverStates, setDragOverStates] = useState({
    profilePhoto: false,
    resume: false,
    idProof: false,
    offerLetter: false,
    panCard: false,
    experienceCertificates: false,
  });

  // Create refs for form fields that might have errors
  const formRefs = {
    first_name: useRef(null),
    last_name: useRef(null),
    gender: useRef(null),
    date_of_birth: useRef(null),
    profile_photo: useRef(null),
    email: useRef(null),
    phone: useRef(null),
    alternate_phone: useRef(null),
    address: useRef(null),
    emergency_contact_name: useRef(null),
    emergency_contact_number: useRef(null),
    department: useRef(null),
    designation: useRef(null),
    employee_type: useRef(null),
    joining_date: useRef(null),
    reporting_manager: useRef(null),
    work_location: useRef(null),
    salary: useRef(null),
    bank_name: useRef(null),
    account_number: useRef(null),
    ifsc_code: useRef(null),
    tax_id: useRef(null),
    resume: useRef(null),
    panCard: useRef(null),
    id_proof: useRef(null),
    offer_letter: useRef(null),
    //experienceCertificates: useRef(null),
    username: useRef(null),
    password: useRef(null),
  };

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",
    email: "",
    phone: "",
    alternate_phone: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
    department: "",
    designation: "",
    employee_type: "",
    joining_date: "",
    reporting_manager: "",
    work_location: "",
    salary: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    tax_id: "",
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: null,
    error: null,
  });

  const [profilePhoto, setProfilePhoto] = useState({
    fileSelected: false,
    fileName: "",
    fileURL: "",
    uploadProgress: 0,
    uploadComplete: false,
    file: null,
  });

  const [resume, setResume] = useState({
    fileSelected: false,
    fileName: "",
    fileURL: "",
    uploadProgress: 0,
    uploadComplete: false,
    file: null,
  });

  const [idProof, setIdProof] = useState({
    fileSelected: false,
    fileName: "",
    fileURL: "",
    uploadProgress: 0,
    uploadComplete: false,
    file: null,
  });

  const [offerLetter, setOfferLetter] = useState({
    fileSelected: false,
    fileName: "",
    fileURL: "",
    uploadProgress: 0,
    uploadComplete: false,
    file: null,
  });

  const [panCard, setPanCard] = useState({
    fileSelected: false,
    fileName: "",
    fileURL: "",
    uploadProgress: 0,
    uploadComplete: false,
    file: null,
  });

  const [experienceFiles, setExperienceFiles] = useState([]);
  const [validated, setValidated] = useState(false);

  const [, setBankDetails] = useState({
    bank_name: "",
    branch: "",
    account_type: "",
    ifsc_code: "",
  });

  const [bankDetailsFetched, setBankDetailsFetched] = useState(false);

  const fetchBankDetails = async (ifscCode) => {
    try {
      const response = await fetch(
        `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/get-bank-details/?ifsc_code=${ifscCode}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch bank details");
        setBankDetailsFetched(false); 
        return null;
      }

      const data = await response.json();
      console.log("Bank details fetched:", data);

      if (data && data.Bank) {
        const bankName = data.Bank;

        setBankDetails({
          bank_name: bankName,
          branch: data.BRANCH || "",
          account_type: data.ACCOUNT_TYPE || "",
        });

        setFormData((prev) => ({ ...prev, bank_name: bankName }));

        setErrors((prev) => ({ ...prev, bank_name: "" }));

        setBankDetailsFetched(true);

        return data;
      }

      setBankDetailsFetched(false);
      setFormData((prev) => ({ ...prev, bank_name: "" }));
      return null;
    } catch (error) {
      console.error("Error fetching bank details:", error);
      setBankDetailsFetched(false); 
      return null;
    }
  };

 const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  let formattedValue = value;
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    formattedValue = `${year}-${month}-${day}`;
  }
  
  if (name === "bank_name" && bankDetailsFetched) {
    return;
  }
  setFormData((prev) => ({ ...prev, [name]: formattedValue }));

  const errorMessage = validateField(name, formattedValue);
  setErrors((prev) => ({ ...prev, [name]: errorMessage }));
};

  // Validation function
  const validateField = (name, value) => {
    switch (name) {
      case "first_name":
      case "last_name":
      case "gender":
      case "address":
      case "department":
      case "designation":
      case "bank_name":
      case "account_number":
      case "tax_id":
      case "password":
      case "username":
        const fieldName = name.replace(/_/g, " ");
        const capitalizedName =
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
        return !value.trim() ? `${capitalizedName} is required` : "";
      case "date_of_birth":
        return !value ? "Date of birth is required" : "";
      case "reporting_manager":
        return !value ? "Reporting manager is required" : "";
      case "emergency_contact_name":
        return !value ? "Emergency contact name is required" : "";
      case "employee_type":
        return !value ? "Employment type is required" : "";
      case "alternate_phone":
        if (!value) return "Alternate Phone is required";
        if (!/^\d{10}$/.test(value)) return "Phone number must be 10 digits";
        return "";
      case "work_location":
        return !value ? "Work location is required" : "";
      case "ifsc_code":
        return !value.trim() ? "IFSC code is required" : "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Email is invalid";
        return "";
      case "phone":
      case "emergency_contact_number":
        if (!value.trim()) return "Phone number is required";
        if (!/^\d{10}$/.test(value)) return "Phone number must be 10 digits";
        return "";
      case "salary":
        if (!value || value <= 0) return "Salary must be a positive number";
        return "";
      case "joining_date":
        return !value ? "Joining date is required" : "";
      default:
        return "";
    }
  };

  const simulateUploadProgress = (fileToUpdate, setter) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setter((prev) => {
        if (Array.isArray(prev)) {
          return prev.map((f) =>
            f.fileName === fileToUpdate.fileName
              ? {
                  ...f,
                  uploadProgress: progress,
                  uploadComplete: progress >= 100,
                }
              : f
          );
        } else {
          return {
            ...prev,
            uploadProgress: progress,
            uploadComplete: progress >= 100,
          };
        }
      });

      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  };

  // File upload handler
  const handleFileUpload = (e, setter, multiple = false) => {
    const files = e.target.files;
    if (!files.length) return;

    if (multiple) {
      const newFiles = Array.from(files).map((file) => ({
        fileName: file.name,
        fileURL: URL.createObjectURL(file),
        file: file, 
        uploadProgress: 0,
        uploadComplete: false,
      }));

      setter((prev) => [...prev, ...newFiles]);

      newFiles.forEach((fileObj) => {
        simulateUploadProgress(fileObj, setter);
      });
    } else {
      const file = files[0];
      const newFileState = {
        fileSelected: true,
        fileName: file.name,
        fileURL: URL.createObjectURL(file),
        file: file, 
        uploadProgress: 0,
        uploadComplete: false,
      };

      setter(newFileState);
      simulateUploadProgress(newFileState, setter);
    }
  };

  const handleDragEnter = (e, uploadType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverStates((prev) => ({ ...prev, [uploadType]: true }));
  };

  const handleDragOver = (e, uploadType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverStates((prev) => ({ ...prev, [uploadType]: true }));
  };

  const handleDragLeave = (e, uploadType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverStates((prev) => ({ ...prev, [uploadType]: false }));
  };

  const handleDrop = (e, uploadType, setter, multiple = false) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverStates((prev) => ({ ...prev, [uploadType]: false }));

    const files = e.dataTransfer.files;
    if (!files.length) return;

    const syntheticEvent = {
      target: {
        files: files,
      },
    };

    handleFileUpload(syntheticEvent, setter, multiple);

    if (uploadType === "profilePhoto" && fileErrors.profile_photo) {
      setFileErrors((prev) => ({ ...prev, profile_photo: "" }));
    } else if (uploadType === "resume" && fileErrors.resume) {
      setFileErrors((prev) => ({ ...prev, resume: "" }));
    } else if (uploadType === "idProof" && fileErrors.id_proof) {
      setFileErrors((prev) => ({ ...prev, id_proof: "" }));
    } else if (uploadType === "offerLetter" && fileErrors.offer_letter) {
      setFileErrors((prev) => ({ ...prev, offer_letter: "" }));
    } else if (uploadType === "panCard" && fileErrors.panCard) {
      setFileErrors((prev) => ({ ...prev, panCard: "" }));
    } else if (
      uploadType === "experienceCertificates" &&
      fileErrors.experienceCertificates
    ) {
      setFileErrors((prev) => ({ ...prev, experienceCertificates: "" }));
    }
  };

  // Delete handler for single files
  const handleDelete = (fileState, setter, inputId) => {
    if (fileState.fileURL) {
      URL.revokeObjectURL(fileState.fileURL);
    }

    setter({
      fileSelected: false,
      fileName: "",
      fileURL: "",
      file: null,
      uploadProgress: 0,
      uploadComplete: false,
    });

    // Clear the file input value
    const input = document.getElementById(inputId);
    if (input) input.value = "";
  };

  // Delete a file from the multiple experience files list
  const handleDeleteFile = (index) => {
    setExperienceFiles((prev) => {
      const fileToDelete = prev[index];
      if (fileToDelete?.fileURL) {
        URL.revokeObjectURL(fileToDelete.fileURL);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Preview handler
  const handlePreview = (fileData) => {
    if (fileData.fileURL) window.open(fileData.fileURL, "_blank");
  };

  // Multiple file upload handler
  const handleMultipleFileUpload = (e) => {
    handleFileUpload(e, setExperienceFiles, true);
    if (fileErrors.experienceCertificates) {
      setFileErrors((prev) => ({ ...prev, experienceCertificates: "" }));
    }
  };

  const handleIfscCodeChange = (e) => {
    const { value } = e.target;

    setErrors((prev) => ({ ...prev, ifsc_code: "" }));

    setFormData((prev) => ({ ...prev, ifsc_code: value }));

    if (!value || value.length < 11) {
      setBankDetailsFetched(false);
      setFormData((prev) => ({ ...prev, bank_name: "" }));
    }
    if (value.length === 11) {
      fetchBankDetails(value);
    } else {
      setBankDetails({
        bank_name: "",
        branch: "",
        account_type: "",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      gender: "",
      date_of_birth: "",
      email: "",
      phone: "",
      alternate_phone: "",
      address: "",
      emergency_contact_name: "",
      emergency_contact_number: "",
      department: "",
      designation: "",
      employee_type: "",
      joining_date: "",
      reporting_manager: "",
      work_location: "",
      salary: "",
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      tax_id: "",
      username: "",
      password: "",
    });

    setProfilePhoto({
      fileSelected: false,
      fileName: "",
      fileURL: "",
      uploadProgress: 0,
      uploadComplete: false,
      file: null,
    });

    setResume({
      fileSelected: false,
      fileName: "",
      fileURL: "",
      uploadProgress: 0,
      uploadComplete: false,
      file: null,
    });

    setIdProof({
      fileSelected: false,
      fileName: "",
      fileURL: "",
      uploadProgress: 0,
      uploadComplete: false,
      file: null,
    });

    setOfferLetter({
      fileSelected: false,
      fileName: "",
      fileURL: "",
      uploadProgress: 0,
      uploadComplete: false,
      file: null,
    });

    setPanCard({
      fileSelected: false,
      fileName: "",
      fileURL: "",
      uploadProgress: 0,
      uploadComplete: false,
      file: null,
    });

    setExperienceFiles([]);

    setErrors({});
    setFileErrors({});
    setValidated(false);
    setBankDetailsFetched(false);
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    setSubmitStatus({ loading: true, success: null, error: null });

    // Validate all text fields
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const errorMessage = validateField(key, formData[key]);
      if (errorMessage) {
        newErrors[key] = errorMessage;
      }
    });
    setErrors(newErrors);

    const newFileErrors = {};

    if (!profilePhoto.fileSelected) {
      newFileErrors.profile_photo = "Profile photo is required";
    }
    if (!resume.fileSelected) {
      newFileErrors.resume = "Resume is required";
    }
    if (!idProof.fileSelected) {
      newFileErrors.id_proof = "ID proof is required";
    }
    if (!panCard.fileSelected) {
      newFileErrors.panCard = "PAN card is required";
    }
    if (!offerLetter.fileSelected) {
      newFileErrors.offer_letter = "Offer letter is required";
    }
    // if (experienceFiles.length === 0) {
    //   newFileErrors.experienceCertificates =
    //     "At least one experience certificate is required";
    // }

    setFileErrors(newFileErrors);

    if (
      Object.keys(newErrors).length > 0 ||
      Object.keys(newFileErrors).length > 0
    ) {
      setSubmitStatus({
        loading: false,
        success: null,
        error: "Please fix errors in the form.",
      });

      let firstErrorField = Object.keys(newErrors)[0];

      if (!firstErrorField) {
        firstErrorField = Object.keys(newFileErrors)[0];
      }

      if (
        firstErrorField &&
        formRefs[firstErrorField] &&
        formRefs[firstErrorField].current
      ) {
        formRefs[firstErrorField].current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setTimeout(() => {
          formRefs[firstErrorField].current.focus();
        }, 500);
      }

      return;
    }

    const payload = new FormData();

    payload.append("first_name", formData.first_name);
    payload.append("last_name", formData.last_name);
    payload.append("gender", formData.gender);
    payload.append("date_of_birth", formData.date_of_birth);
    payload.append("email", formData.email);
    payload.append("phone", formData.phone);
    payload.append("alternate_phone", formData.alternate_phone);
    payload.append("address", formData.address);
    payload.append("emergency_contact_name", formData.emergency_contact_name);
    payload.append(
      "emergency_contact_number",
      formData.emergency_contact_number
    );
    payload.append("department", formData.department);
    payload.append("designation", formData.designation);
    payload.append("employee_type", formData.employee_type);
    payload.append("joining_date", formData.joining_date);
    payload.append("reporting_manager", formData.reporting_manager);
    payload.append("work_location", formData.work_location);
    payload.append("salary", formData.salary);
    payload.append("bank_name", formData.bank_name);
    payload.append("account_number", formData.account_number);
    payload.append("ifsc_code", formData.ifsc_code);
    payload.append("tax_id", formData.tax_id);
    payload.append("username", formData.username);
    payload.append("password", formData.password);

    if (profilePhoto.file) payload.append("profile_photo", profilePhoto.file);
    if (resume.file) payload.append("resume_document", resume.file);
    if (panCard.file) payload.append("pan_card_document", panCard.file);
    if (idProof.file) payload.append("id_proof_document", idProof.file);
    if (offerLetter.file) payload.append("offer_letter", offerLetter.file);

    experienceFiles.forEach((fileObj) => {
      if (fileObj.file) {
        payload.append("experience_certificates", fileObj.file);
      }
    });

    try {
      const response = await fetch(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/hr-register/",
        {
          method: "POST",
          body: payload,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          setSubmitStatus({
            loading: false,
            success: null,
            error: "Server error. Please try again.",
          });
          return;
        }

        if (errorData && errorData.errors) {
          const fieldErrors = {};

          Object.keys(errorData.errors).forEach((field) => {
            let frontendField = field;

            if (errorData.errors[field] && errorData.errors[field].length > 0) {
              fieldErrors[frontendField] = errorData.errors[field][0];
            }
          });

          setErrors((prevErrors) => ({ ...prevErrors, ...fieldErrors }));

          const firstErrorField = Object.keys(fieldErrors)[0];
          if (
            firstErrorField &&
            formRefs[firstErrorField] &&
            formRefs[firstErrorField].current
          ) {
            formRefs[firstErrorField].current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            setTimeout(() => {
              formRefs[firstErrorField].current.focus();
            }, 500);
          }

          setSubmitStatus({
            loading: false,
            success: null,
            error: "Please fix the highlighted errors in the form.",
          });
        } else {
          setSubmitStatus({
            loading: false,
            success: null,
            error:
              errorData.message ||
              errorData.error ||
              "Server error. Please try again.",
          });
        }

        return;
      }

      // const data = await response.json();
      setSubmitStatus({
        loading: false,
        success: "HR registered successfully!",
        error: null,
      });
      setSubmitStatus({
        loading: false,
        success: "HR registered successfully!",
        error: null,
      });

      setAlertMessage("HR registered successfully!");
      setShowModifyAlert(true);

      resetForm();
    } catch (err) {
      console.error("Network error:", err);
      setSubmitStatus({
        loading: false,
        success: null,
        error: "Network error. Please try again.",
      });
    }
  };

  useEffect(() => {
    return () => {
      [profilePhoto, resume, idProof, offerLetter, panCard].forEach(
        (fileState) => {
          if (fileState.fileURL) {
            URL.revokeObjectURL(fileState.fileURL);
          }
        }
      );

      experienceFiles.forEach((fileState) => {
        if (fileState.fileURL) {
          URL.revokeObjectURL(fileState.fileURL);
        }
      });
    };
  }, [profilePhoto, resume, idProof, offerLetter, panCard, experienceFiles]);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      {/* Main Content */}
      {/* Header */}

      {/* Dashboard Body */}
      <Container className="dashboard-body">
        <div className="br-box-container">
          {/* Display submission status */}
          {submitStatus.success && (
            <Alert variant="success" className="mb-3">
              {submitStatus.success}
            </Alert>
          )}
          {submitStatus.error && (
            <Alert variant="danger" className="mb-3">
              {submitStatus.error}
            </Alert>
          )}

          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              {/* Employee ID */}
              <div className="br-basic-info">
                <h1>1. Basic Information</h1>
              </div>

              <Row>
                <Col lg={10} md={6} sm={12}>
                  <Row>
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
                          value={formData.first_name}
                          onChange={handleInputChange}
                          isInvalid={!!errors.first_name}
                          required
                          ref={formRefs.first_name}
                        />
                        <Form.Control.Feedback type="br-alert">
                          {errors.first_name}
                        </Form.Control.Feedback>
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
                          value={formData.last_name}
                          onChange={handleInputChange}
                          isInvalid={!!errors.last_name}
                          required
                          ref={formRefs.last_name}
                        />
                        <Form.Control.Feedback type="br-alert">
                          {errors.last_name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Gender */}
                    <Col lg={6} md={6} sm={12}>
                      <Form.Group className="mb-3" controlId="gender">
                        <Form.Label className="br-label">
                          Gender <span className="br-span-star">*</span>
                        </Form.Label>
                        <Form.Select
                          className="br-form-control"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          isInvalid={!!errors.gender}
                          required
                          ref={formRefs.gender}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Form.Select>
                        <Form.Control.Feedback type="br-alert">
                          {errors.gender}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Date of Birth */}
<Col lg={6} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="dateOfBirth">
    <Form.Label className="br-label">
      Date of Birth <span className="br-span-star">*</span>
    </Form.Label>
      <DatePicker
      className="br-date-picker"
        selected={formData.date_of_birth ? new Date(formData.date_of_birth) : null}
        onChange={(date) => handleInputChange({ target: { name: 'date_of_birth', value: date } })}
        dateFormat="yyyy-MM-dd"
        placeholderText="Select Date of Birth"
        customInput={<CustomDatePickerInput placeholder="Select Date of Birth" />}
        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={100}
      />
    {errors.date_of_birth && (
      <small className="br-alert-feedback">
        {errors.date_of_birth}
      </small>
    )}
  </Form.Group>
</Col>
                  </Row>
                </Col>

                {/* ========= RIGHT SIDE: Profile Photo Upload ========= */}
                <Col lg={2} md={6} sm={12}>
                  <Form.Group className="mb-3" ref={formRefs.profile_photo}>
                    <Form.Label className="br-label">
                      Profile Photo <span className="br-span-star">*</span>
                    </Form.Label>

                    <div
                      className={`br-upload-box text-center ${
                        fileErrors.profile_photo ? "is-invalid" : ""
                      } ${dragOverStates.profilePhoto ? "drag-over" : ""}`}
                      onDragEnter={(e) => handleDragEnter(e, "profilePhoto")}
                      onDragOver={(e) => handleDragOver(e, "profilePhoto")}
                      onDragLeave={(e) => handleDragLeave(e, "profilePhoto")}
                      onDrop={(e) =>
                        handleDrop(e, "profilePhoto", setProfilePhoto)
                      }
                    >
                      {!profilePhoto.fileSelected ? (
                        <>
                          <div className="upload-icon">
                            <RiFolderImageLine />
                          </div>
                          <p className="upload-text">Drag your photo here</p>
                          <p className="upload-or">or</p>
                          <Form.Label
                            htmlFor="profilePhotoInput"
                            className="upload-browse"
                          >
                            Browse your computer
                          </Form.Label>
                          <Form.Control
                            type="file"
                            id="profilePhotoInput"
                            accept="image/*"
                            className="d-none"
                            name="profile_photo"
                            onChange={(e) => {
                              handleFileUpload(e, setProfilePhoto);
                              if (fileErrors.profile_photo) {
                                setFileErrors((prev) => ({
                                  ...prev,
                                  profile_photo: "",
                                }));
                              }
                            }}
                          />
                        </>
                      ) : (
                        <div className="upload-progress-box">
                          <div className="progress-info d-flex justify-content-between align-items-center">
                            <div>
                              {profilePhoto.uploadComplete ? (
                                <FaCheckCircle
                                  color="green"
                                  className="me-2 br-check-icon"
                                />
                              ) : (
                                <FaCheckCircle
                                  color="green"
                                  className=" br-check-icon"
                                />
                              )}
                              <span className="progress-filename">
                                {profilePhoto.fileName}
                              </span>
                            </div>

                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                handleDelete(
                                  profilePhoto,
                                  setProfilePhoto,
                                  "profilePhotoInput"
                                )
                              }
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
                              style={{
                                width: `${profilePhoto.uploadProgress}%`,
                              }}
                            >
                              {profilePhoto.uploadProgress}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {fileErrors.profile_photo && (
                      <div className="br-alert-feedback">
                        {fileErrors.profile_photo}
                      </div>
                    )}
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
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                    required
                    ref={formRefs.email}
                  />
                  <Form.Control.Feedback type="br-alert">
                    {errors.email}
                  </Form.Control.Feedback>
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
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    isInvalid={!!errors.phone}
                    required
                    ref={formRefs.phone}
                  />
                  <Form.Control.Feedback type="br-alert">
                    {errors.phone}
                  </Form.Control.Feedback>
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
                    value={formData.alternate_phone}
                    onChange={handleInputChange}
                    isInvalid={!!errors.alternate_phone}
                    ref={formRefs.alternate_phone}
                    required
                  />
                  <Form.Control.Feedback type="br-alert">
                    {errors.alternate_phone}
                  </Form.Control.Feedback>
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
                    value={formData.address}
                    onChange={handleInputChange}
                    isInvalid={!!errors.address}
                    required
                    ref={formRefs.address}
                  />
                  <Form.Control.Feedback type="br-alert">
                    {errors.address}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Emergency Contact Number */}
              <Col lg={4} md={6} sm={12}>
                <Form.Group className="mb-3" controlId="emergencyRelationship">
                  <Form.Label className="br-label">
                    Emergency Contact Name{" "}
                    <span className="br-span-star">*</span>
                  </Form.Label>
                  <Form.Select
                    className="br-form-control"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.emergency_contact_name}
                    required
                    ref={formRefs.emergency_contact_name}
                  >
                    <option value="">Select Relationship</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Cousin">Cousin</option>
                  </Form.Select>
                  <Form.Control.Feedback type="br-alert">
                    {errors.emergency_contact_name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Emergency Contact Number */}
              <Col lg={4} md={6} sm={12}>
                <Form.Group className="mb-3" controlId="emergencyNumber">
                  <Form.Label className="br-label">
                    Emergency Contact Number{" "}
                    <span className="br-span-star">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter Emergency Contact Number"
                    className="br-form-control"
                    name="emergency_contact_number"
                    value={formData.emergency_contact_number}
                    onChange={handleInputChange}
                    isInvalid={!!errors.emergency_contact_number}
                    required
                    ref={formRefs.emergency_contact_number}
                  />
                  <Form.Control.Feedback type="br-alert">
                    {errors.emergency_contact_number}
                  </Form.Control.Feedback>
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
                    value={formData.department}
                    onChange={handleInputChange}
                    isInvalid={!!errors.department}
                    required
                    ref={formRefs.department}
                  >
                    <option value="">Select Department</option>
                    <option value="HR">HR</option>
                    <option value="IT">IT</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </Form.Select>
                  <Form.Control.Feedback type="br-alert">
                    {errors.department}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Designation / Job Title */}
              <Col lg={4} md={6} sm={12}>
                <Form.Group className="mb-3" controlId="designation">
                  <Form.Label className="br-label">
                    Designation / Job Title{" "}
                    <span className="br-span-star">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter job title"
                    className="br-form-control"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    isInvalid={!!errors.designation}
                    required
                    ref={formRefs.designation}
                  />
                  <Form.Control.Feedback type="br-alert">
                    {errors.designation}
                  </Form.Control.Feedback>
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
                    name="employee_type"
                    value={formData.employee_type}
                    onChange={handleInputChange}
                    isInvalid={!!errors.employee_type}
                    required
                    ref={formRefs.employee_type}
                  >
                    <option value="">Select Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </Form.Select>
                  <Form.Control.Feedback type="br-alert">
                    {errors.employee_type}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Joining Date */}
<Col lg={4} md={6} sm={12}>
  <Form.Group className="mb-3" controlId="joiningDate">
    <Form.Label className="br-label">
      Joining Date <span className="br-span-star">*</span>
    </Form.Label>
    {/* This wrapper helps prevent the calendar from being cut off */}
    
      <DatePicker
        selected={formData.joining_date ? new Date(formData.joining_date) : null}
        onChange={(date) => handleInputChange({ target: { name: 'joining_date', value: date } })}
        dateFormat="yyyy-MM-dd"
        placeholderText="Select Joining Date"
        customInput={<CustomDatePickerInput placeholder="Select Joining Date" />}
        minDate={new Date()}
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={100}        
      />
    {errors.joining_date && (
      <small className="br-alert-feedback">
        {errors.joining_date}
      </small>
    )}
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
                    value={formData.reporting_manager}
                    onChange={handleInputChange}
                    isInvalid={!!errors.reporting_manager}
                    required
                  >
                    <option value="">Select Manager</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Jane Smith">Jane Smith</option>
                    <option value="Michael Brown">Michael Brown</option>
                    <option value="Priya Sharma">Priya Sharma</option>
                  </Form.Select>
                  <Form.Control.Feedback type="br-alert">
                    {errors.reporting_manager}
                  </Form.Control.Feedback>
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
                    value={formData.work_location}
                    onChange={handleInputChange}
                    isInvalid={!!errors.work_location}
                    required
                    ref={formRefs.work_location}
                  >
                    <option value="">Select Location</option>
                    <option value="Office">Office</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </Form.Select>
                  <Form.Control.Feedback type="br-alert">
                    {errors.work_location}
                  </Form.Control.Feedback>
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
                    Salary (Monthly / Annual){" "}
                    <span className="br-span-star">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter salary amount"
                    className="br-form-control"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    isInvalid={!!errors.salary}
                    required
                    ref={formRefs.salary}
                  />
                  <Form.Control.Feedback type="br-alert">
                    {errors.salary}
                  </Form.Control.Feedback>
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
                    value={formData.ifsc_code}
                    onChange={handleIfscCodeChange}
                    isInvalid={!!errors.ifsc_code}
                    required
                    ref={formRefs.ifsc_code}
                  />
                  <Form.Control.Feedback type="br-alert">
                    {errors.ifsc_code}
                  </Form.Control.Feedback>
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
                    placeholder={
                      bankDetailsFetched
                        ? "Bank name fetched from IFSC"
                        : "Enter bank name or IFSC code"
                    }
                    className="br-form-control"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.bank_name}
                    required
                    disabled={bankDetailsFetched}
                    ref={formRefs.bank_name}
                  />

                  <Form.Control.Feedback type="br-alert">
                    {errors.bank_name}
                  </Form.Control.Feedback>
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
                    value={formData.account_number}
                    onChange={handleInputChange}
                    isInvalid={!!errors.account_number}
                    required
                    ref={formRefs.account_number}
                  />
                  <Form.Control.Feedback type="br-alert">
                    {errors.account_number}
                  </Form.Control.Feedback>
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
                    name="tax_id"
                    value={formData.tax_id}
                    onChange={handleInputChange}
                    isInvalid={!!errors.tax_id}
                    required
                    ref={formRefs.tax_id}
                  />
                  <Form.Control.Feedback type="br-alert">
                    {errors.tax_id}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* ================= Documents ================= */}
              <div className="br-basic-info mt-4">
                <h1>5. Documents</h1>
              </div>

              {/* Resume Upload */}
              <Col lg={3} md={6} sm={12}>
                <Form.Group className="mb-3" ref={formRefs.resume}>
                  <Form.Label className="br-label">
                    Resume / CV <span className="br-span-star">*</span>
                  </Form.Label>
                  <div
                    className={`br-doc-box text-center ${
                      fileErrors.resume ? "is-invalid" : ""
                    } ${dragOverStates.resume ? "drag-over" : ""}`}
                    onDragEnter={(e) => handleDragEnter(e, "resume")}
                    onDragOver={(e) => handleDragOver(e, "resume")}
                    onDragLeave={(e) => handleDragLeave(e, "resume")}
                    onDrop={(e) => handleDrop(e, "resume", setResume)}
                  >
                    {!resume.fileSelected ? (
                      <>
                        <div className="upload-icon">
                          <FaRegFile />
                        </div>
                        <p className="doc-text">Drag your resume here</p>
                        <p className="upload-or">or</p>
                        <Form.Label
                          htmlFor="resumeFile"
                          className="upload-browse"
                        >
                          Browse your computer
                        </Form.Label>
                        <Form.Control
                          type="file"
                          id="resumeFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="d-none"
                          onChange={(e) => {
                            handleFileUpload(e, setResume);
                            if (fileErrors.resume) {
                              setFileErrors((prev) => ({
                                ...prev,
                                resume: "",
                              }));
                            }
                          }}
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
                            <span className="progress-filename">
                              {resume.fileName}
                            </span>
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
                              onClick={() =>
                                handleDelete(resume, setResume, "resumeFile")
                              }
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
                  {fileErrors.resume && (
                    <div className="br-alert-feedback">
                      {fileErrors.resume}
                    </div>
                  )}
                </Form.Group>
              </Col>

              {/* ID Proof */}
              <Col lg={3} md={6} sm={12}>
                <Form.Group className="mb-3" ref={formRefs.id_proof}>
                  <Form.Label className="br-label">
                    ID Proof <span className="br-span-star">*</span>
                  </Form.Label>
                  <div
                    className={`br-doc-box text-center ${
                      fileErrors.id_proof ? "is-invalid" : ""
                    } ${dragOverStates.idProof ? "drag-over" : ""}`}
                    onDragEnter={(e) => handleDragEnter(e, "idProof")}
                    onDragOver={(e) => handleDragOver(e, "idProof")}
                    onDragLeave={(e) => handleDragLeave(e, "idProof")}
                    onDrop={(e) => handleDrop(e, "idProof", setIdProof)}
                  >
                    {!idProof.fileSelected ? (
                      <>
                        <div className="upload-icon">
                          <FaIdCard />
                        </div>
                        <p className="doc-text">Drag your ID proof file here</p>
                        <p className="upload-or">or</p>
                        <Form.Label
                          htmlFor="idProofFile"
                          className="upload-browse"
                        >
                          Browse your computer
                        </Form.Label>
                        <Form.Control
                          type="file"
                          id="idProofFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="d-none"
                          onChange={(e) => {
                            handleFileUpload(e, setIdProof);
                            if (fileErrors.id_proof) {
                              setFileErrors((prev) => ({
                                ...prev,
                                id_proof: "",
                              }));
                            }
                          }}
                        />
                      </>
                    ) : (
                      <div className="upload-progress-box">
                        <div className="progress-info d-flex justify-content-between align-items-center">
                          <div>
                            {idProof.uploadComplete ? (
                              <FaCheckCircle color="green" className="me-2" />
                            ) : (
                              <i className="bi bi-file-earmark-text-fill progress-icon me-2"></i>
                            )}
                            <span className="progress-filename">
                              {idProof.fileName}
                            </span>
                          </div>
                          <div>
                            {idProof.fileURL && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handlePreview(idProof)}
                                className="me-2"
                                title="Preview File"
                              >
                                <i className="bi bi-eye"></i>
                              </Button>
                            )}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() =>
                                handleDelete(idProof, setIdProof, "idProofFile")
                              }
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
                            style={{ width: `${idProof.uploadProgress}%` }}
                          >
                            {idProof.uploadProgress}%
                          </div>
                        </div>

                        {idProof.uploadComplete && (
                          <div className="text-success mt-2 fw-bold br-card-success">
                            File uploaded successfully!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {fileErrors.id_proof && (
                    <div className="br-alert-feedback">
                      {fileErrors.id_proof}
                    </div>
                  )}
                </Form.Group>
              </Col>

              {/* Offer Letter */}
              <Col lg={3} md={3} sm={12}>
                <Form.Group className="mb-3" ref={formRefs.offer_letter}>
                  <Form.Label className="br-label">
                    Offer Letter <span className="br-span-star">*</span>
                  </Form.Label>
                  <div
                    className={`br-doc-box text-center ${
                      fileErrors.offer_letter ? "is-invalid" : ""
                    } ${dragOverStates.offerLetter ? "drag-over" : ""}`}
                    onDragEnter={(e) => handleDragEnter(e, "offerLetter")}
                    onDragOver={(e) => handleDragOver(e, "offerLetter")}
                    onDragLeave={(e) => handleDragLeave(e, "offerLetter")}
                    onDrop={(e) => handleDrop(e, "offerLetter", setOfferLetter)}
                  >
                    {!offerLetter.fileSelected ? (
                      <>
                        <div className="upload-icon">
                          <GrDocumentText />
                        </div>
                        <p className="doc-text">Drag your Offer Letter here</p>
                        <p className="upload-or">or</p>
                        <Form.Label
                          htmlFor="offerLetterFile"
                          className="upload-browse"
                        >
                          Browse your computer
                        </Form.Label>
                        <Form.Control
                          type="file"
                          id="offerLetterFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="d-none"
                          onChange={(e) => {
                            handleFileUpload(e, setOfferLetter);
                            if (fileErrors.offer_letter) {
                              setFileErrors((prev) => ({
                                ...prev,
                                offer_letter: "",
                              }));
                            }
                          }}
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
                            <span className="progress-filename">
                              {offerLetter.fileName}
                            </span>
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
                              onClick={() =>
                                handleDelete(
                                  offerLetter,
                                  setOfferLetter,
                                  "offerLetterFile"
                                )
                              }
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
                  {fileErrors.offer_letter && (
                    <div className="br-alert-feedback">
                      {fileErrors.offer_letter}
                    </div>
                  )}
                </Form.Group>
              </Col>

              {/* Pan Card */}
              <Col lg={3} md={6} sm={12}>
                <Form.Group className="mb-3" ref={formRefs.panCard}>
                  <Form.Label className="br-label">
                    Pan Card <span className="br-span-star">*</span>
                  </Form.Label>
                  <div
                    className={`br-doc-box text-center ${
                      fileErrors.panCard ? "is-invalid" : ""
                    } ${dragOverStates.panCard ? "drag-over" : ""}`}
                    onDragEnter={(e) => handleDragEnter(e, "panCard")}
                    onDragOver={(e) => handleDragOver(e, "panCard")}
                    onDragLeave={(e) => handleDragLeave(e, "panCard")}
                    onDrop={(e) => handleDrop(e, "panCard", setPanCard)}
                  >
                    {!panCard.fileSelected ? (
                      <>
                        <div className="upload-icon">
                          <FaIdCard />
                        </div>
                        <p className="doc-text">Drag your Pan Card here</p>
                        <p className="upload-or">or</p>
                        <Form.Label
                          htmlFor="panCardFile"
                          className="upload-browse"
                        >
                          Browse your computer
                        </Form.Label>
                        <Form.Control
                          type="file"
                          id="panCardFile"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="d-none"
                          onChange={(e) => {
                            handleFileUpload(e, setPanCard);
                            if (fileErrors.panCard) {
                              setFileErrors((prev) => ({
                                ...prev,
                                panCard: "",
                              }));
                            }
                          }}
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
                            <span className="progress-filename">
                              {panCard.fileName}
                            </span>
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
                              onClick={() =>
                                handleDelete(panCard, setPanCard, "panCardFile")
                              }
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
                  {fileErrors.panCard && (
                    <div className="br-alert-feedback">
                      {fileErrors.panCard}
                    </div>
                  )}
                </Form.Group>
              </Col>

              {/* Experience Certificates (Multiple) */}
              <Col lg={6} md={6} sm={12}>
                <Form.Group
                  className="mb-3"
                  ref={formRefs.experienceCertificates}
                >
                  <Form.Label className="br-label">
                    Experience Certificates{" "}
                    <span className="br-span-star">*</span>
                  </Form.Label>
                  <Row>
                    <Col lg={6}>
                      <div
                        className={`br-doc-box text-center ${
                          dragOverStates.experienceCertificates
                            ? "drag-over"
                            : ""
                        }`}
                        onDragEnter={(e) =>
                          handleDragEnter(e, "experienceCertificates")
                        }
                        onDragOver={(e) =>
                          handleDragOver(e, "experienceCertificates")
                        }
                        onDragLeave={(e) =>
                          handleDragLeave(e, "experienceCertificates")
                        }
                        onDrop={(e) =>
                          handleDrop(
                            e,
                            "experienceCertificates",
                            setExperienceFiles,
                            true
                          )
                        }
                      >
                        <div className="upload-icon">
                          <PiCertificate />
                        </div>
                        <p className="doc-text">
                          Drag your Experience Certificates here
                        </p>
                        <p className="upload-or">or</p>
                        <Form.Label
                          htmlFor="experienceFiles"
                          className="upload-browse"
                        >
                          Browse your computer
                        </Form.Label>
                        <Form.Control
                          type="file"
                          id="experienceFiles"
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                          className="d-none"
                          onChange={handleMultipleFileUpload}
                        />
                      </div>
                    </Col>

                    <Col lg={6}>
                      {experienceFiles.length > 0 && (
                        <div className="uploaded-files">
                          {experienceFiles.map((file, index) => (
                            <Card
                              key={index}
                              className="shadow-sm mb-2 border-0"
                            >
                              <Card.Body className="p-2">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="d-flex align-items-center">
                                    {file.uploadComplete ? (
                                      <FaCheckCircle
                                        color="green"
                                        className="me-2"
                                      />
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

                                <div
                                  className="progress mt-2"
                                  style={{ height: "6px" }}
                                >
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
                  {/* {fileErrors.experienceCertificates && (
                    <div className="invalid-feedback d-block">
                      {fileErrors.experienceCertificates}
                    </div>
                  )} */}
                </Form.Group>
              </Col>
              <Row>
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
                      value={formData.username}
                      onChange={handleInputChange}
                      isInvalid={!!errors.username}
                      required
                      ref={formRefs.username}
                    />
                    <Form.Control.Feedback type="br-alert">
                      {errors.username}
                    </Form.Control.Feedback>
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
                      value={formData.password}
                      onChange={handleInputChange}
                      isInvalid={!!errors.password}
                      required
                      ref={formRefs.password}
                    />
                    <Form.Control.Feedback type="br-alert">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <div className="br-btn-submit">
                <Button
                  variant="primary"
                  type="submit"
                  className="br-submit-btn"
                  disabled={submitStatus.loading}
                >
                  {submitStatus.loading ? "Submitting..." : "Register Employee"}
                </Button>
              </div>
            </Row>
          </Form>
        </div>
      </Container>
      <ModifyAlert
        message={alertMessage}
        show={showModifyAlert}
        setShow={setShowModifyAlert}
      />
    </div>
  );
};

export default HrRegistration;
