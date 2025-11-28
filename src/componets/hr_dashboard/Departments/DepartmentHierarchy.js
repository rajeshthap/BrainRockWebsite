import React, { useState, useEffect, useRef, useCallback } from "react";
import SideNav from "../SideNav";
import HrHeader from "../HrHeader";
import {
  Card,
  Collapse,
  Modal,
  Button,
  Form,
  Row,
  Col,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import "../../../assets/css/DepartmentHierarchy.css";

/*
  Big self-contained component:
  - Local state holds departments -> employees
  - API_* functions are placeholders (fetch/save/delete)
  - Drag & drop implemented with HTML5 DnD
  - SVG connector lines drawn using node bounding boxes
*/

const API_PLACEHOLDER_BASE = "https://example.com/api"; // replace with real base

// -------------------- API-READY placeholder functions --------------------
async function API_fetchDepartments() {
  // Replace with real fetch like: return fetch('/departments').then(r=>r.json())
  // Dummy seed data:
  return [
    {
      id: "dept-hr",
      name: "HR Department",
      employees: [
        { id: "e-hr-1", name: "HR Manager" },
        { id: "e-hr-2", name: "Recruiter" },
        { id: "e-hr-3", name: "HR Executive" },
      ],
    },
    {
      id: "dept-admin",
      name: "Admin Department",
      employees: [
        { id: "e-adm-1", name: "Admin Manager" },
        { id: "e-adm-2", name: "Office Admin" },
      ],
    },
    {
      id: "dept-it",
      name: "IT Department",
      employees: [
        { id: "e-it-1", name: "IT Head" },
        { id: "e-it-2", name: "Frontend Dev" },
        { id: "e-it-3", name: "Backend Dev" },
        { id: "e-it-4", name: "QA Engineer" },
        { id: "e-it-5", name: "Designer" },
      ],
    },
    {
      id: "dept-fin",
      name: "Finance Department",
      employees: [
        { id: "e-fin-1", name: "Finance Manager" },
        { id: "e-fin-2", name: "Accountant" },
      ],
    },
  ];
}

async function API_createDepartment(dept) {
  // POST to API; return created dept with id
  // Placeholder: just return dept with generated id
  return { ...dept, id: `dept-${Date.now()}` };
}

async function API_updateDepartment(id, updates) {
  // PATCH or PUT to API
  return { id, ...updates };
}

async function API_deleteDepartment(id) {
  // DELETE to API
  return { success: true };
}

// -------------------- Utilities --------------------
const uid = (prefix = "") => `${prefix}${Math.random().toString(36).slice(2, 9)}`;

// -------------------- Main Component --------------------
const DepartmentHierarchy = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [departments, setDepartments] = useState([]); // {id, name, employees: [{id,name}]}
  const [openDept, setOpenDept] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null); // null -> create
  const [modalName, setModalName] = useState("");
  const [svgLines, setSvgLines] = useState([]); // [{x1,y1,x2,y2, key}]
  const containerRef = useRef(null);
  const nodeRefs = useRef({}); // map nodeId -> ref

  // -------------------- INITIAL LOAD --------------------
  useEffect(() => {
    (async () => {
      const data = await API_fetchDepartments();
      setDepartments(data);
    })();
  }, []);

  // -------------------- SVG LINES CALC --------------------
  const recalcLines = useCallback(() => {
    // We'll draw lines: root -> each department, and department -> each visible employee
    const lines = [];
    const root = nodeRefs.current["root"];
    if (!root || !root.current) {
      setSvgLines([]);
      return;
    }
    const rootRect = root.current.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    const rootCenterX = (rootRect.left + rootRect.right) / 2 - containerRect.left;
    const rootBottomY = rootRect.bottom - containerRect.top;

    departments.forEach((dept) => {
      const deptNode = nodeRefs.current[dept.id];
      if (!deptNode || !deptNode.current) return;
      const deptRect = deptNode.current.getBoundingClientRect();
      const deptCenterX = (deptRect.left + deptRect.right) / 2 - containerRect.left;
      const deptTopY = deptRect.top - containerRect.top;

      // Root -> dept (curved line approximate with polyline)
      lines.push({
        key: `r-${dept.id}`,
        x1: rootCenterX,
        y1: rootBottomY + 8,
        x2: deptCenterX,
        y2: deptTopY - 8,
        type: "root-dept",
      });

      // Dept -> each employee (only if expanded)
      if (openDept === dept.id) {
        dept.employees.forEach((emp) => {
          const empNode = nodeRefs.current[emp.id];
          if (!empNode || !empNode.current) return;
          const empRect = empNode.current.getBoundingClientRect();
          const empCenterX = (empRect.left + empRect.right) / 2 - containerRect.left;
          const empTopY = empRect.top - containerRect.top;

          lines.push({
            key: `d-${dept.id}-e-${emp.id}`,
            x1: deptCenterX,
            y1: deptRect.bottom - containerRect.top + 6,
            x2: empCenterX,
            y2: empTopY - 6,
            type: "dept-emp",
          });
        });
      }
    });

    setSvgLines(lines);
  }, [departments, openDept]);

  // Recalculate on layout changes
  useEffect(() => {
    recalcLines();
    const ro = new ResizeObserver(() => recalcLines());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", recalcLines);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalcLines);
    };
  }, [recalcLines]);

  // Recalc when departments, openDept change
  useEffect(() => {
    // small delay to allow DOM to update
    const t = setTimeout(() => recalcLines(), 120);
    return () => clearTimeout(t);
  }, [departments, openDept, searchText, filterDept, recalcLines]);

  // -------------------- Search & Filter derived list --------------------
  const filteredDepartments = departments
    .map((d) => ({
      ...d,
      employees: d.employees.filter((e) =>
        e.name.toLowerCase().includes(searchText.toLowerCase())
      ),
    }))
    .filter((d) => (filterDept === "all" ? true : d.id === filterDept))
    .filter((d) => {
      // if searchText is used and dept has zero matching employees, show dept only if dept name matches
      if (searchText.trim() === "") return true;
      return (
        d.employees.length > 0 ||
        d.name.toLowerCase().includes(searchText.toLowerCase())
      );
    });

  // -------------------- Expand/Collapse --------------------
  const toggleDept = (id) => {
    setOpenDept(openDept === id ? null : id);
  };

  // -------------------- Add/Edit/Delete Dept --------------------
  const openCreateModal = () => {
    setEditingDept(null);
    setModalName("");
    setShowDeptModal(true);
  };
  const openEditModal = (dept) => {
    setEditingDept(dept);
    setModalName(dept.name);
    setShowDeptModal(true);
  };
  const handleSaveDept = async () => {
    const name = modalName.trim();
    if (!name) return;
    if (editingDept) {
      const updated = await API_updateDepartment(editingDept.id, { name });
      setDepartments((prev) =>
        prev.map((p) => (p.id === editingDept.id ? { ...p, name } : p))
      );
    } else {
      const newDept = { id: uid("dept-"), name, employees: [] };
      const created = await API_createDepartment(newDept);
      setDepartments((prev) => [...prev, created]);
    }
    setShowDeptModal(false);
  };
  const handleDeleteDept = async (deptId) => {
    if (!window.confirm("Delete this department? This cannot be undone.")) return;
    await API_deleteDepartment(deptId);
    setDepartments((prev) => prev.filter((d) => d.id !== deptId));
    if (openDept === deptId) setOpenDept(null);
  };

  // -------------------- Add/Edit/Delete Employee --------------------
  const handleAddEmployee = (deptId) => {
    const name = prompt("New employee name:");
    if (!name) return;
    const emp = { id: uid("e-"), name };
    setDepartments((prev) =>
      prev.map((d) => (d.id === deptId ? { ...d, employees: [...d.employees, emp] } : d))
    );
  };
  const handleEditEmployee = (deptId, emp) => {
    const name = prompt("Edit employee name:", emp.name);
    if (!name) return;
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === deptId
          ? { ...d, employees: d.employees.map((e) => (e.id === emp.id ? { ...e, name } : e)) }
          : d
      )
    );
  };
  const handleDeleteEmployee = (deptId, empId) => {
    if (!window.confirm("Delete this employee?")) return;
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === deptId ? { ...d, employees: d.employees.filter((e) => e.id !== empId) } : d
      )
    );
  };

  // -------------------- Drag & Drop --------------------
  // For simplicity:
  // - You can reorder departments by dragging department blocks
  // - You can move employees between departments by dragging employee items and dropping on dept block
  const onDeptDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", `dept:${index}`);
    e.currentTarget.classList.add("dragging");
  };
  const onDeptDragOver = (e) => {
    e.preventDefault();
  };
  const onDeptDrop = (e, targetIndex) => {
    e.preventDefault();
    const payload = e.dataTransfer.getData("text/plain");
    if (!payload) return;
    const [type, idx] = payload.split(":");
    if (type === "dept") {
      const from = Number(idx);
      if (from === targetIndex) return;
      setDepartments((prev) => {
        const arr = [...prev];
        const [moved] = arr.splice(from, 1);
        arr.splice(targetIndex, 0, moved);
        return arr;
      });
    } else if (type === "emp") {
      const [empId, fromDeptId] = idx.split("|");
      const fromDeptIndex = departments.findIndex((d) => d.id === fromDeptId);
      const toDeptIndex = targetIndex;
      if (fromDeptIndex === -1) return;
      if (fromDeptIndex === toDeptIndex) return;
      setDepartments((prev) => {
        const clone = JSON.parse(JSON.stringify(prev));
        const empIdx = clone[fromDeptIndex].employees.findIndex((x) => x.id === empId);
        if (empIdx === -1) return prev;
        const [moved] = clone[fromDeptIndex].employees.splice(empIdx, 1);
        clone[toDeptIndex].employees.push(moved);
        return clone;
      });
    }
    document.querySelectorAll(".dragging").forEach((el) => el.classList.remove("dragging"));
  };
  const onDeptDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging");
  };

  const onEmpDragStart = (e, empId, deptId) => {
    e.dataTransfer.setData("text/plain", `emp:${empId}|${deptId}`);
    e.currentTarget.classList.add("dragging-emp");
  };
  const onEmpDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging-emp");
  };

  // -------------------- Node refs helper --------------------
  const ensureNodeRef = (id) => {
    if (!nodeRefs.current[id]) {
      nodeRefs.current[id] = React.createRef();
    }
    return nodeRefs.current[id];
  };

  // Ensure root ref
  ensureNodeRef("root");

  // -------------------- Counts --------------------
  const totalEmployees = departments.reduce((s, d) => s + d.employees.length, 0);
  const totalDepartments = departments.length;

  return (
    <div className="dashboard-container">
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content">
        <HrHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <div className="dashboard-body p-4" ref={containerRef}>
          <Row className="mb-3 align-items-center">
            <Col md={6}>
              <h2>Department Hierarchy</h2>
              <div className="small text-muted">
                {totalDepartments} Departments • {totalEmployees} Employees
              </div>
            </Col>
            <Col md={6} className="text-md-end mt-3 mt-md-0">
              <InputGroup className="d-inline-flex w-50 me-2">
                <FormControl
                  placeholder="Search employees..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </InputGroup>

              <Form.Select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="d-inline-block w-auto me-2"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Form.Select>

              <Button variant="primary" onClick={openCreateModal}>
                + Add Department
              </Button>
            </Col>
          </Row>

          <Card className="p-3 shadow-sm position-relative">
            

            {/* ROOT */}
            <div className="root-row text-center" ref={ensureNodeRef("root")}>
              <div className="node-box root-box">CEO / Managing Director</div>
            </div>

            {/* Departments row */}
            <div className="departments-row">
              {filteredDepartments.map((dept, idx) => {
                const deptRef = ensureNodeRef(dept.id);
                return (
                  <div
                    key={dept.id}
                    className={`department-block full-graph-block`}
                    draggable
                    onDragStart={(e) => onDeptDragStart(e, departments.findIndex(d=>d.id===dept.id))}
                    onDragOver={onDeptDragOver}
                    onDrop={(e) => onDeptDrop(e, departments.findIndex(d=>d.id===dept.id))}
                    onDragEnd={onDeptDragEnd}
                    ref={deptRef}
                  >
                    <div className="dept-header d-flex align-items-center justify-content-between">
                      <div onClick={() => toggleDept(dept.id)} className="d-flex align-items-center dept-title">
                        <div className={`chev ${openDept === dept.id ? "open" : ""}`}>▾</div>
                        <div className="node-box dept-box">
                          {dept.name}
                          <div className="dept-sub small text-muted">
                            {dept.employees.length} employees
                          </div>
                        </div>
                      </div>

                      <div className="dept-actions">
                        <Button size="sm" variant="outline-success" onClick={() => handleAddEmployee(dept.id)} className="me-1">
                          +Emp
                        </Button>
                        <Button size="sm" variant="outline-primary" onClick={() => openEditModal(dept)} className="me-1">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDeleteDept(dept.id)}>
                          Del
                        </Button>
                      </div>
                    </div>

                    <Collapse in={openDept === dept.id}>
                      <div className="employees-list dept-employees">
                        {dept.employees.length === 0 && <div className="text-muted">No employees</div>}
                        <div className="employee-items">
                          {dept.employees.map((emp) => (
                            <div
                              key={emp.id}
                              className="employee-item node-box-emp"
                              draggable
                              onDragStart={(e) => onEmpDragStart(e, emp.id, dept.id)}
                              onDragEnd={onEmpDragEnd}
                              ref={ensureNodeRef(emp.id)}
                            >
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="emp-name">{emp.name}</div>
                                <div className="emp-actions">
                                  <Button size="sm" variant="link" onClick={() => handleEditEmployee(dept.id, emp)}>Edit</Button>
                                  <Button size="sm" variant="link" className="text-danger" onClick={() => handleDeleteEmployee(dept.id, emp.id)}>Del</Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Collapse>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Add / Edit Department Modal */}
        <Modal show={showDeptModal} onHide={() => setShowDeptModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>{editingDept ? "Edit Department" : "Create Department"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Department Name</Form.Label>
                <Form.Control
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder="e.g. Marketing"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeptModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveDept}>
              {editingDept ? "Save changes" : "Create Department"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default DepartmentHierarchy;
