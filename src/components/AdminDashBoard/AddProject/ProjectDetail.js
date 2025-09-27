import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Badge, Dropdown } from "react-bootstrap";
import "../../../assets/css/AdminLeftNav.css";
import AdminLeftNav from "../admin_dashboard/AdminLeftNav";


// Days for custom multi-select
const DAYS = [
  { value: "Mon", label: "Monday" },
  { value: "Tue", label: "Tuesday" },
  { value: "Wed", label: "Wednesday" },
  { value: "Thu", label: "Thursday" },
  { value: "Fri", label: "Friday" },
  { value: "Sat", label: "Saturday" },
];

const ProjectDetail = () => {
  const [formData, setFormData] = useState({
    project_name: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    title_of_project: "",
    industry: "",
    project_start_date: "",
    project_end_date: "",
    manager_list: "",
    manager_email: "",
    manager_phone: "",
    project_add: "",
    working_days: [],
    working_hours: "",
    showDaysDropdown: false,
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Custom handler for working days
  const handleWorkingDayToggle = (dayValue) => {
    setFormData((prev) => {
      const alreadySelected = prev.working_days.includes(dayValue);
      return {
        ...prev,
        working_days: alreadySelected
          ? prev.working_days.filter((d) => d !== dayValue)
          : [...prev.working_days, dayValue],
      };
    });
  };

  // When manager is selected, auto-fill email and phone if available
  const handleManagerSelect = (e) => {
    const selectedId = e.target.value;
    const selectedManager = managers.find((m) => String(m.id) === String(selectedId));
    setFormData({
      ...formData,
      manager_list: selectedId,
      manager_email: selectedManager ? selectedManager.email : "",
      manager_phone: selectedManager ? selectedManager.phone : "",
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
                        name="project_name"
                        value={formData.project_name}
                        onChange={handleChange}
                        required
                        placeholder="Enter Project Name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        placeholder="Enter First Name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        placeholder="Enter Last Name"
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
                        placeholder="Enter Email Address"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        required
                        placeholder="Enter Phone Number"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Title Of Project</Form.Label>
                      <Form.Control
                        type="text"
                        name="title_of_project"
                        value={formData.title_of_project}
                        onChange={handleChange}
                        required
                        placeholder="Enter Project Title"
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
                        placeholder="Enter Industry"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Project Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="project_start_date"
                        value={formData.project_start_date}
                        onChange={handleChange}
                        required
                        placeholder="Enter Project Start Date"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Project End Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="project_end_date"
                        value={formData.project_end_date}
                        onChange={handleChange}
                        required
                        placeholder="Enter Project End Date"
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
                        name="manager_list"
                        value={formData.manager_list}
                        onChange={handleManagerSelect}
                        required
                        placeholder="Enter Manager Name"
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

                  {/* Custom Working Days MultiSelector */}
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Working Days</Form.Label>
                      <div style={{ position: "relative" }}>
                        <Dropdown show={formData.showDaysDropdown} onToggle={() => setFormData(f => ({ ...f, showDaysDropdown: !f.showDaysDropdown }))}>
                          <Dropdown.Toggle
                            variant="outline-secondary"
                            id="dropdown-working-days"
                            style={{ width: "100%", textAlign: "left" }}
                            onClick={e => {
                              e.preventDefault();
                              setFormData(f => ({ ...f, showDaysDropdown: !f.showDaysDropdown }));
                            }}
                          >
                            {formData.working_days.length === 0 ? "Select Working Days" :
                              DAYS.filter(d => formData.working_days.includes(d.value)).map(d => d.label).join(", ")}
                          </Dropdown.Toggle>
                          <Dropdown.Menu style={{ width: "100%", maxHeight: 200, overflowY: "auto" }}>
                            <Dropdown.Item disabled key="Sun">
                              <Form.Check type="checkbox" label="Sunday" checked={false} disabled />
                            </Dropdown.Item>
                            {DAYS.map(day => (
                              <Dropdown.Item as="span" key={day.value} style={{ cursor: "pointer" }}>
                                <Form.Check
                                  type="checkbox"
                                  label={day.label}
                                  checked={formData.working_days.includes(day.value)}
                                  onChange={() => handleWorkingDayToggle(day.value)}
                                />
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                        <div style={{ marginTop: 8 }}>
                          {formData.working_days.map(day => (
                            <Badge key={day} pill bg="info" style={{ marginRight: 4 }}>
                              {DAYS.find(d => d.value === day)?.label || day}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Form.Text className="text-muted">Click to select multiple days. Sunday is not selectable.</Form.Text>
                    </Form.Group>
                  </Col>

                  {/* Working Hours Time Picker */}
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Working Hours</Form.Label>
                      <Form.Control
                        type="time"
                        name="working_hours"
                        value={formData.working_hours}
                        onChange={handleChange}
                        required
                        placeholder="Enter Working Hours"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Manager Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="manager_email"
                        value={formData.manager_email}
                        onChange={handleChange}
                        required
                        readOnly
                        placeholder="Enter Manager Email"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Manager Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="manager_phone"
                        value={formData.manager_phone}
                        onChange={handleChange}
                        required
                        readOnly
                        placeholder="Enter Manager Phone"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>Project Add</Form.Label>
                      <Form.Control
                        type="text"
                        name="project_add"
                        value={formData.project_add}
                        onChange={handleChange}
                        required
                        placeholder="Enter Project Address"
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
