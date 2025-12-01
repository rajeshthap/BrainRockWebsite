import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../../assets/css/Trainingregistration.css";

function TrainingRegistration() {
  const [courseData, setCourseData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableCourses, setAvailableCourses] = useState([]);

  const [formData, setFormData] = useState({
    application_for_course: "",
    candidate_name: "",
    guardian_name: "",
    address: "",
    date_of_birth: "",
    email: "",
    password: "",
    mobile_no: "",
    school_college_name: "",
    highest_education: "",
    profile_photo: null,
  });

  const [loading, setLoading] = useState(false);

  // Fetch Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(
          "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/course-list/"
        );

        setCourseData(Array.isArray(res.data?.courses) ? res.data.courses : []);
      } catch (err) {
        console.error(err);
        setCourseData([]);
      }
    };

    fetchCourses();
  }, []);

  // Category Change
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);

    const found = courseData.find((item) => item.category === category);
    setAvailableCourses(found ? found.courses : []);

    setFormData({
      ...formData,
      application_for_course: "",
    });
  };

  // Input Handler
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profile_photo") {
      setFormData({ ...formData, profile_photo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = new FormData();
    Object.keys(formData).forEach((key) => payload.append(key, formData[key]));

    try {
      const res = await axios.post(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/course-registration/",
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Registration Successful!");
    } catch (err) {
      console.error(err);
      alert("Registration Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="training-container">
      <div className="training-card">

        <h2 className="training-title">Training Registration Form</h2>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">

            {/* CATEGORY */}
            <div className="col-lg-6 col-md-6 col-sm-12">
              <label className="br-label">Select Category</label>
              <select
                className="br-form-control"
                value={selectedCategory}
                onChange={handleCategoryChange}
                required
              >
                <option value="">-- Select Category --</option>
                {courseData.map((item) => (
                  <option key={item.id} value={item.category}>
                    {item.category}
                  </option>
                ))}
              </select>
            </div>

            {/* COURSE */}
            <div className="col-lg-6 col-md-6 col-sm-12">
              <label className="br-label">Select Course</label>
              <select
                className="br-form-control"
                name="application_for_course"
                value={formData.application_for_course}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Course --</option>
                {availableCourses.map((course, i) => (
                  <option key={i} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* NAME */}
            <div className="col-lg-6 col-md-6 col-sm-12">
              <label className="br-label">Candidate Name</label>
              <input
                name="candidate_name"
                className="br-form-control"
                onChange={handleChange}
                required
              />
            </div>

            {/* GUARDIAN */}
            <div className="col-lg-6 col-md-6 col-sm-12">
              <label className="br-label">Guardian Name</label>
              <input
                name="guardian_name"
                className="br-form-control"
                onChange={handleChange}
                required
              />
            </div>

            {/* ADDRESS */}
            <div className="col-lg-6 col-md-6 col-sm-12">
              <label className="br-label">Address</label>
              <input
                name="address"
                className="br-form-control"
                onChange={handleChange}
                required
              />
            </div>

            {/* DOB */}
            <div className="col-lg-6 col-md-6 col-sm-12">
              <label className="br-label">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                className="br-form-control"
                onChange={handleChange}
                required
              />
            </div>

            {/* EMAIL */}
            <div className="col-lg-6 col-md-6 col-sm-12">
              <label className="br-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="br-form-control"
                onChange={handleChange}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="col-lg-6 col-md-6 col-sm-12">
              <label className="br-label">Password</label>
              <input
                type="password"
                name="password"
                className="br-form-control"
                onChange={handleChange}
                required
              />
            </div>

            {/* MOBILE */}
            <div className="col-lg-6 col-md-6 col-sm-12">
              <label className="br-label">Mobile Number</label>
              <input
                name="mobile_no"
                className="br-form-control"
                onChange={handleChange}
                required
              />
            </div>

            {/* SCHOOL */}
            <div className="col-lg-6 col-md-6 col-sm-12">
              <label className="br-label">School / College Name</label>
              <input
                name="school_college_name"
                className="br-form-control"
                onChange={handleChange}
                required
              />
            </div>

            {/* EDUCATION */}
            <div className="col-lg-6 col-md-6 col-sm-12">
              <label className="br-label">Highest Education</label>
              <input
                name="highest_education"
                className="br-form-control"
                onChange={handleChange}
                required
              />
            </div>

            {/* PHOTO */}
            <div className="col-lg-6 col-md-6 col-sm-12">
              <label className="br-label">Profile Photo</label>
              <input
                type="file"
                name="profile_photo"
                className="br-form-control"
                accept="image/*"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button className="training-submit-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Registration"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default TrainingRegistration;
