import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import "../../../assets/css/AdminLeftNav.css";
import AdminLeftNav from "../admin_dashboard/AdminLeftNav";

const ProjectDetail = () => {
  const [formData, setFormData] = useState({
    projectName: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    titleOfProject: "",
    industry: "",
    projectStartDate: "",
    projectEndDate: "",
    managerList: "",
    managerEmail: "",
    managerPhone: "",
    projectAdd: "",
  });
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    // Replace with your actual API endpoint for fetching managers
    fetch("https://brjobsedu.com/Attendence_portal/api/ManagerList/")
      .then((res) => res.json())
      .then((data) => setManagers(data))
      .catch((err) => setManagers([]));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // When manager is selected, auto-fill email and phone if available
  const handleManagerSelect = (e) => {
    const selectedId = e.target.value;
    const selectedManager = managers.find((m) => String(m.id) === String(selectedId));
    setFormData({
      ...formData,
      managerList: selectedId,
      managerEmail: selectedManager ? selectedManager.email : "",
      managerPhone: selectedManager ? selectedManager.phone : "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic here
    alert("Project details submitted!\n" + JSON.stringify(formData, null, 2));
  };

  return (
    <>
      {/* Main Wrapper */}
      <div className="dashboard-wrapper">
        {/* Sidebar */}
        <aside className="sidebar">
          <AdminLeftNav />
        </aside>

        {/* Right-hand Main Container */}
        <main className="main-container">
          <div className="content-box">

            <Container className="mt-4">
              <h2 className="mb-4">Add Project Details</h2>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Project Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Title Of Project</Form.Label>
                      <Form.Control
                        type="text"
                        name="titleOfProject"
                        value={formData.titleOfProject}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Industry</Form.Label>
                      <Form.Control
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Project Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="projectStartDate"
                        value={formData.projectStartDate}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Project End Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="projectEndDate"
                        value={formData.projectEndDate}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Assign Manager Section */}
                <h4 className="mt-4 mb-3">Assign Manager</h4>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Manager List</Form.Label>
                      <Form.Select
                        name="managerList"
                        value={formData.managerList}
                        onChange={handleManagerSelect}
                        required
                      >
                        <option value="">Select Manager</option>
                        {managers.map((manager) => (
                          <option key={manager.id} value={manager.id}>
                            {manager.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Manager Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="managerEmail"
                        value={formData.managerEmail}
                        onChange={handleChange}
                        required
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Manager Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="managerPhone"
                        value={formData.managerPhone}
                        onChange={handleChange}
                        required
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Project Add</Form.Label>
                      <Form.Control
                        type="text"
                        name="projectAdd"
                        value={formData.projectAdd}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" type="submit">
                  Submit
                </Button>
              </Form>
            </Container>

          </div>
        </main>
      </div>
    </>
  );
};

export default ProjectDetail;
