import React, { useEffect, useState, useContext, forwardRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Modal,
  InputGroup,
} from "react-bootstrap";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { FaCalendar } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-datepicker/dist/react-datepicker.css";
import "../../../assets/css/Profile.css";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import { AuthContext } from "../../context/AuthContext"; // Adjust the import path as needed

const CreateTeam = () => {
  const { user } = useContext(AuthContext); // Get user from auth context
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // API data states
  const [teams, setTeams] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filteredTeamLeaders, setFilteredTeamLeaders] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Control when to show success message

  // Form states
  const [selectedTeamLeader, setSelectedTeamLeader] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]); // This will now hold option objects
  const [teamName, setTeamName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Date picker states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const today = new Date();
  const minTime = new Date();
  minTime.setHours(9, 0, 0);
  const maxTime = new Date();
  maxTime.setHours(18, 0, 0);

  // Toggle Sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Function to check if an employee is a team leader
  const isTeamLeader = (employee) => {
    // Check if role field exists and matches team leader
    if (employee.role === "Team Leader" || employee.role === "team_leader") {
      return true;
    }

    // Check if designation field contains "Team Leader"
    if (employee.designation && employee.designation.includes("Team Leader")) {
      return true;
    }

    // Check if any field contains "Team Leader" string
    for (const key in employee) {
      if (
        typeof employee[key] === "string" &&
        employee[key].includes("Team Leader")
      ) {
        return true;
      }
    }

    return false;
  };

  // Function to clear all form fields
  const clearForm = () => {
    setTeamName("");
    setSelectedTeamLeader("");
    setSelectedProject("");
    setSelectedEmployees([]); // Reset to empty array
    setStartDate(null);
    setEndDate(null);
    setError(null);
    setShowSuccessMessage(false); // Hide success message
  };

  // Function to fetch teams data
  const fetchTeamsData = async () => {
    try {
      const teamsResponse = await fetch(
        "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/all-teams/",
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!teamsResponse.ok) {
        throw new Error("Failed to fetch teams data");
      }

      const teamsData = await teamsResponse.json();
      
      // Process and set teams data
      let teamsList = [];
      if (teamsData.success && Array.isArray(teamsData.data)) {
        teamsList = teamsData.data;
      } else if (Array.isArray(teamsData)) {
        teamsList = teamsData;
      }
      setTeams(teamsList);
      
      return teamsList;
    } catch (err) {
      console.error("Failed to fetch teams data:", err);
      throw err;
    }
  };

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data
        const [teamsResponse, employeesResponse, projectsResponse] =
          await Promise.all([
            fetch(
              "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/all-teams/",
              {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
              }
            ),
            fetch(
              "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee-list/",
              {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
              }
            ),
            fetch(
              "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/project-list/",
              {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
              }
            ),
          ]);

        // Check if all responses are OK
        if (
          !teamsResponse.ok ||
          !employeesResponse.ok ||
          !projectsResponse.ok
        ) {
          throw new Error("One or more API requests failed");
        }

        const teamsData = await teamsResponse.json();
        const employeesData = await employeesResponse.json();
        const projectsData = await projectsResponse.json();

        // Process and set teams data
        let teamsList = [];
        if (teamsData.success && Array.isArray(teamsData.data)) {
          teamsList = teamsData.data;
        } else if (Array.isArray(teamsData)) {
          teamsList = teamsData;
        }
        setTeams(teamsList);

        // Process and set employees data
        let employeesList = [];
        if (Array.isArray(employeesData)) {
          employeesList = employeesData;
        } else if (employeesData && Array.isArray(employeesData.results)) {
          employeesList = employeesData.results;
        }
        setAllEmployees(employeesList);

        // Filter team leaders using isTeamLeader function
        const leaders = employeesList.filter((emp) => isTeamLeader(emp));
        setTeamLeaders(leaders);

        // Process and set projects data
        if (projectsData.success && Array.isArray(projectsData.data)) {
          setProjects(projectsData.data);
        } else {
          console.error("Unexpected project data format:", projectsData);
          setProjects([]);
        }
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter team leaders, projects, and employees based on existing assignments
  useEffect(() => {
    if (
      teamLeaders.length > 0 &&
      projects.length > 0 &&
      allEmployees.length > 0
    ) {
      // Get all team leader IDs that are already assigned
      const assignedLeaderIds = teams
        .map((team) => team.team_leader)
        .filter(Boolean);

      // === PROJECT FILTERING LOGIC ===
      // Step 1: Create an array of all project IDs that are already assigned to a team.
      const assignedProjectIds = teams
        .map((team) => team.project)
        .filter(Boolean);

      // Step 2: Filter master list of all projects.
      // Only keep projects whose ID is NOT in the assignedProjectIds array.
      const availableProjects = projects.filter(
        (project) => !assignedProjectIds.includes(project.project_id)
      );
      // Step 3: Set the state with the list of available (unassigned) projects.
      setFilteredProjects(availableProjects);
      // === END OF PROJECT FILTERING LOGIC ===

      // Filter out team leaders who are already assigned
      const availableTeamLeaders = teamLeaders.filter(
        (leader) => !assignedLeaderIds.includes(leader.emp_id)
      );
      setFilteredTeamLeaders(availableTeamLeaders);

      // --- MODIFICATION START ---
      // Filter out ONLY team leaders. All other employees are now available for selection.
      const availableEmployees = allEmployees.filter((emp) => {
        // Only skip team leaders
        return !isTeamLeader(emp);
      });
      // --- MODIFICATION END ---

      setAvailableEmployees(availableEmployees);

      // Create options for React Select with enhanced search capability
      const options = availableEmployees.map((emp) => ({
        value: emp.emp_id,
        label: `${emp.first_name} ${emp.last_name}`,
        subLabel: `ID: ${emp.emp_id} | Designation: ${emp.designation}`,
        // Add search terms for better filtering
        searchTerms:
          `${emp.first_name} ${emp.last_name} ${emp.emp_id} ${emp.designation}`.toLowerCase(),
      }));
      setEmployeeOptions(options);
    }
  }, [teams, teamLeaders, projects, allEmployees]);

 // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  if (
    !selectedTeamLeader ||
    !selectedProject ||
    selectedEmployees.length === 0 ||
    !teamName ||
    !startDate ||
    !endDate
  ) {
    setError("Please fill all fields and select at least one employee");
    return;
  }

  // Validate that end date is after start date
  if (endDate <= startDate) {
    setError("End date must be after start date");
    return;
  }

  // Get manager ID from auth context
  const managerId = user?.uniqueId || user?.id || user?.emp_id;

  // Extract employee IDs from selected option objects
  const employeeIds = selectedEmployees.map((option) => option.value);

  // *** KEY CHANGE: Format dates to YYYY-MM-DD as required by the server ***
  const formatDateForServer = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Create team data object with the correct date format
  const teamData = {
    team_name: teamName,
    team_leader_id: selectedTeamLeader,
    project_id: selectedProject,
    employee_ids: employeeIds,
    manager_id: managerId,
    start_date: formatDateForServer(startDate), // e.g., "2023-10-27"
    end_date: formatDateForServer(endDate),       // e.g., "2023-11-15"
  };

  // Log the data being sent for debugging
  console.log("Sending team data:", teamData);

  try {
    const response = await fetch(
      "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/all-teams/",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamData),
      }
    );

    if (!response.ok) {
      // *** IMPROVEMENT: Parse the specific error from the server response ***
      const errorData = await response.json();
      let errorMessage = `HTTP error! Status: ${response.status}`;

      // If the server sent a detailed error object, use it
      if (errorData.errors) {
        // Join all validation error messages into one string
        errorMessage = Object.values(errorData.errors).flat().join(' ');
      } else if (errorData.message) {
        // Fallback for a generic message
        errorMessage = errorData.message;
      }
      
      setError(errorMessage);
      return; // Stop execution
    }

    const result = await response.json();

    if (result.success) {
      // *** NEW: Refresh teams data after successful creation ***
      await fetchTeamsData();
      
      // Set success message and show success modal
      setShowSuccessMessage(true); // Show success message at the top
      setShowSuccessModal(true);
      clearForm();
    } else {
      setError(result.message || "Failed to create team");
    }
  } catch (err) {
    // This will catch network errors, not the 400 validation errors now
    setError(err.message || "An unexpected error occurred.");
    console.error("Failed to create team:", err);
  }
};

  // Handle closing success modal
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  // --- FIXES FOR MULTI-SELECT START HERE ---

  // Custom filter function for React Select
  // FIX 1: Show all options when there's no input
  const filterOption = (option, rawInput) => {
    if (!rawInput || rawInput.trim() === "") {
      return true;
    }
    const words = rawInput.toLowerCase().split(/\s+/);
    return words.every(word =>
      option.data.searchTerms.includes(word)
    );
  };

  // FIX 2: Properly implement the custom option component
  const OptionComponent = (props) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div ref={innerRef} {...innerProps} style={{ cursor: 'pointer' }}>
        <div style={{ fontWeight: "bold" }}>{data.label}</div>
        <div style={{ fontSize: "0.8em", color: "#666" }}>{data.subLabel}</div>
      </div>
    );
  };

  // FIX 3: Handle selection change
  const handleEmployeeChange = (selectedOptions) => {
    setSelectedEmployees(selectedOptions || []);
  };

  // --- FIXES FOR MULTI-SELECT END HERE ---

  // Custom DatePicker Input Component
  const CustomDatePickerInput = forwardRef(
    ({ value, onClick, placeholder }, ref) => (
      <InputGroup>
        <Form.Control
          ref={ref}
          value={value}
          onClick={onClick}
          placeholder={placeholder}
          className="temp-form-control-option"
          readOnly
        />
        <InputGroup.Text onClick={onClick} style={{ cursor: "pointer" }}>
          <FaCalendar />
        </InputGroup.Text>
      </InputGroup>
    )
  );

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} />

        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            

            <h2>Create Team</h2>

            {loading && (
              <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" />
              </div>
            )}
            {/* Success Message at the top - Similar to ManageTeam */}
            {showSuccessMessage && (
              <Alert variant="success" className="mb-4">
                Team created successfully!
              </Alert>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && !error && (
              <Form onSubmit={handleSubmit}>
                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group controlId="teamName">
                      <Form.Label>Team Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter team name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group controlId="teamLeader">
                      <Form.Label>Select Team Leader</Form.Label>
                      <Form.Select
                        value={selectedTeamLeader}
                        onChange={(e) => setSelectedTeamLeader(e.target.value)}
                        required
                      >
                        <option value="">Select Team Leader</option>
                        {filteredTeamLeaders.map((leader) => (
                          <option key={leader.emp_id} value={leader.emp_id}>
                            {leader.first_name} {leader.last_name} (
                            {leader.emp_id})
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="project">
                      <Form.Label>Select Project</Form.Label>
                      {/* The dropdown below uses 'filteredProjects', which contains only unassigned projects. */}
                      <Form.Select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        required
                      >
                        <option value="">Select Project</option>
                        {filteredProjects.map((project) => (
                          <option
                            key={project.project_id}
                            value={project.project_id}
                          >
                            {project.project_name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={6}>
                    <Form.Group controlId="startDate">
                      <Form.Label className="temp-label">
                        Start Date <span className="temp-span-star">*</span>
                      </Form.Label>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={30}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="form-control temp-form-control-option w-100"
                        customInput={
                          <CustomDatePickerInput placeholder="Select Start Date and Time" />
                        }
                        minDate={today}
                        minTime={minTime}
                        maxTime={maxTime}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group controlId="endDate">
                      <Form.Label className="temp-label">
                        End Date <span className="temp-span-star">*</span>
                      </Form.Label>
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        showTimeSelect
                        timeFormat="hh:mm aa"
                        timeIntervals={30}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="form-control temp-form-control-option w-100"
                        customInput={
                          <CustomDatePickerInput placeholder="Select End Date and Time" />
                        }
                        minDate={startDate || today}
                        minTime={startDate ? startDate : minTime}
                        maxTime={maxTime}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={12}>
                    <Form.Label className="temp-label">
                      Select Team Members{" "}
                      <span className="temp-span-star">*</span>
                    </Form.Label>
                    <Form.Text className="text-muted mb-2 d-block">
                      Search for all employees by name, ID, or designation.
                    </Form.Text>
                    <Select
                      isMulti
                      options={employeeOptions}
                      placeholder="Search for employees..."
                      closeMenuOnSelect={false}
                      className="temp-form-control-input basic-multi-select"
                      classNamePrefix="basic-multi-select"
                      value={selectedEmployees}
                      onChange={handleEmployeeChange}
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          border: "1px solid #ced4da",
                          borderRadius: "0.25rem",
                          minHeight: "38px",
                        }),
                        multiValue: (provided) => ({
                          ...provided,
                          backgroundColor: "#e9ecef",
                        }),
                        multiValueLabel: (provided) => ({
                          ...provided,
                          color: "#495057",
                        }),
                        multiValueRemove: (provided) => ({
                          ...provided,
                          color: "#495057",
                          ":hover": {
                            backgroundColor: "#adb5bd",
                            color: "#495057",
                          },
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          padding: "10px 12px",
                          borderBottom: "1px solid #eee",
                        }),
                        noOptionsMessage: (provided) => ({
                          ...provided,
                          color: "#6c757d",
                        }),
                      }}
                      noOptionsMessage={() => "No employees match your search"}
                      filterOption={filterOption}
                      components={{ Option: OptionComponent }}
                      isClearable={true}
                    />
                  </Col>
                </Row>

                <div className="d-flex justify-content-between">
                  <Button variant="outline-danger" onClick={clearForm}>
                    Clear Form
                  </Button>
                  <div>
                    <Button variant="primary" type="submit">
                      Create Team
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </div>
        </Container>
      </div>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={handleCloseSuccessModal}>
        <Modal.Header closeButton>
          <Modal.Title>Team Created Successfully</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="success" className="mb-0">
            <p className="mb-0">
              The team has been created and assigned to the selected project.
            </p>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSuccessModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateTeam;