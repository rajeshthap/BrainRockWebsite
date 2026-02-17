import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Table } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";

const GenerateBill = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  // Generate financial year and month prefix for bill number
  const generateBillNumberPrefix = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentMonthNumber = new Date().getMonth() + 1; // Get month as 1-12
    
    // If before April, current FY started in previous calendar year
    const fyStartYear = currentMonth < 3 ? currentYear - 1 : currentYear;
    const fyEndYear = fyStartYear + 1;
    const fyPrefix = `${fyStartYear}-${String(fyEndYear).slice(-2)}`;
    
    // Format month as 2 digits
    const monthPadded = String(currentMonthNumber).padStart(2, '0');
    
    return `${fyPrefix}/${monthPadded}/`;
  };

  const billNumberPrefix = generateBillNumberPrefix();

  // Bill type selection state
  const [selectedBillType, setSelectedBillType] = useState(null);

  // BrainRock specific state
  const [ukssoMFormData, setUkssoMFormData] = useState({
    billDate: new Date().toISOString().split("T")[0],
    billNumber: billNumberPrefix,
    billTo: "",
    natureOfWork: "",
    natureOfWorkDescription: "service",
    servicesAmount: 0,
    items: [
      {
        productName: "",
        description: "",
        quantity: 1,
        rate: 0,
      }
    ],
  });

  // Zee bill specific state
  const [zeeFormData, setZeeFormData] = useState({
    invoiceDate: new Date().toISOString().split("T")[0],
    billNo: billNumberPrefix,
    billTo: "",
    natureOfWork: "",
    servicesAmount: 0,
    items: [
      {
        product: "",
        description: "",
        phase: "",
        price: 0,
      }
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");
  const [showAlert, setShowAlert] = useState(false);

  // Responsive check
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setSidebarOpen(width >= 1024);
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Calculate totals for BrainRock
  const calculateUkssoVMTotals = () => {
    // Calculate raw subtotal from items
    const itemsSubtotal = ukssoMFormData.items.reduce((sum, item) => {
      const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
      return sum + itemTotal;
    }, 0);

    // Add services amount to subtotal
    const servicesAmount = parseFloat(ukssoMFormData.servicesAmount) || 0;
    const rawSubtotal = itemsSubtotal + servicesAmount;

    // Round subtotal first
    const subtotal = parseFloat(rawSubtotal.toFixed(2));

    // Calculate GST based on rounded subtotal and round to nearest whole number
    const cgstAmount = parseFloat(Math.round(subtotal * 0.09).toFixed(2));
    const sgstAmount = parseFloat(Math.round(subtotal * 0.09).toFixed(2));

    // Calculate total as sum of rounded values
    const totalPaid = parseFloat((subtotal + cgstAmount + sgstAmount).toFixed(2));

    return {
      subtotal,
      cgstAmount,
      sgstAmount,
      totalPaid,
    };
  };

  // Calculate totals for Zee bills (phase is treated as quantity)
  const calculateZeeTotals = () => {
    // Calculate subtotal from items and services
    const itemsSubtotal = zeeFormData.items.reduce((sum, item) => {
      const quantity = parseFloat(item.phase) || 0; // treat 'phase' as quantity
      const price = parseFloat(item.price) || 0;
      return sum + (quantity * price);
    }, 0);

    const servicesAmount = parseFloat(zeeFormData.servicesAmount) || 0;
    const rawSubtotal = itemsSubtotal + servicesAmount;
    const subtotal = parseFloat(rawSubtotal.toFixed(2));

    // Calculate GST (9% each)
    const cgst = parseFloat(Math.round(subtotal * 0.09).toFixed(2));
    const sgst = parseFloat(Math.round(subtotal * 0.09).toFixed(2));

    // Calculate total paid
    const totalPaidAmount = parseFloat((subtotal + cgst + sgst).toFixed(2));

    return {
      subtotal,
      cgst,
      sgst,
      totalPaidAmount,
    };
  };

  // Handle BrainRock form changes
  const handleUkssoVMChange = (e) => {
    const { name, value } = e.target;
    setUkssoMFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle item changes for BrainRock
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...ukssoMFormData.items];
    updatedItems[index][field] = value;
    setUkssoMFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // Add new item row
  const addItemRow = () => {
    setUkssoMFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { productName: "", description: "", quantity: 1, rate: 0 }
      ],
    }));
  };

  // Remove item row
  const removeItemRow = (index) => {
    setUkssoMFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Handle Zee form changes
  const handleZeeChange = (e) => {
    const { name, value } = e.target;
    setZeeFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle item changes for Zee
  const handleZeeItemChange = (index, field, value) => {
    const updatedItems = [...zeeFormData.items];
    updatedItems[index][field] = value;
    setZeeFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // Add new Zee item row
  const addZeeItemRow = () => {
    setZeeFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { product: "", description: "", phase: "", price: 0 }
      ],
    }));
  };

  // Remove Zee item row
  const removeZeeItemRow = (index) => {
    setZeeFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowAlert(false);

    try {
      let dataToSend;

      if (selectedBillType === "ukssovm") {
        // BrainRock validation
        if (!ukssoMFormData.billNumber || !ukssoMFormData.billTo) {
          throw new Error("Please fill in all required fields");
        }
        if (ukssoMFormData.items.length === 0 || !ukssoMFormData.items[0].productName) {
          throw new Error("Please add at least one item");
        }

        const totals = calculateUkssoVMTotals();

        // Format items with total field
        const formattedItems = ukssoMFormData.items.map(item => ({
          product_name: item.productName,
          description: item.description,
          quantity: parseFloat(item.quantity) || 1,
          rate: parseFloat(item.rate) || 0,
          total: (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)
        }));

        dataToSend = {
          bill_date: ukssoMFormData.billDate,
          bill_number: ukssoMFormData.billNumber,
          bill_to: ukssoMFormData.billTo,
          nature_of_work: ukssoMFormData.natureOfWork,
          nature_of_work_description: ukssoMFormData.natureOfWorkDescription,
          services_amount: parseFloat(ukssoMFormData.servicesAmount) || 0,
          items: formattedItems,
          subtotal: totals.subtotal,
          cgst_amount: totals.cgstAmount,
          sgst_amount: totals.sgstAmount,
          total_paid: totals.totalPaid,
        };
      } else if (selectedBillType === "zee") {
        // Zee bill validation
        if (!zeeFormData.billNo || !zeeFormData.billTo) {
          throw new Error("Please fill in all required fields");
        }
        if (zeeFormData.items.length === 0 || !zeeFormData.items[0].product) {
          throw new Error("Please add at least one item");
        }

        const totals = calculateZeeTotals();

        dataToSend = {
          bill_no: zeeFormData.billNo,
          bill_to: zeeFormData.billTo,
          invoice_date: zeeFormData.invoiceDate,
          nature_of_work: zeeFormData.natureOfWork,
          services_amount: parseFloat(zeeFormData.servicesAmount) || 0,
          items: zeeFormData.items.map(item => ({
            product: item.product,
            description: item.description,
            phase: item.phase, // backend expects 'phase', but treat as quantity in UI
            price: parseFloat(item.price) || 0
          })),
          subtotal: totals.subtotal,
          cgst: totals.cgst,
          sgst: totals.sgst,
          total_paid_amount: totals.totalPaidAmount,
        };
      }

      // Send to API
      const apiUrl = selectedBillType === "ukssovm" 
        ? "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/bill-brainrock/"
        : "https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/bill-zee/";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(dataToSend),
      });

      const responseText = await response.text();

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        // Response is not JSON (probably HTML error page)
        throw new Error(`Server Error (${response.status}): ${responseText.substring(0, 300)}`);
      }

      if (!response.ok) {
        // Handle error response with errors object (field validation errors)
        if (responseData.errors && typeof responseData.errors === 'object') {
          const errorMessages = [];
          for (const field in responseData.errors) {
            const fieldErrors = responseData.errors[field];
            if (Array.isArray(fieldErrors)) {
              errorMessages.push(...fieldErrors);
            } else {
              errorMessages.push(fieldErrors);
            }
          }
          const errorMessage = errorMessages.join(", ");
          throw new Error(errorMessage);
        }
        
        // Handle other error formats
        const errorMessage = responseData.message || responseData.error || "Failed to generate bill";
        throw new Error(errorMessage);
      }

      // SUCCESS
      setMessage("Bill generated successfully!");
      setVariant("success");
      setShowAlert(true);

      // Clear form
      if (selectedBillType === "ukssovm") {
        setUkssoMFormData({
          billDate: new Date().toISOString().split("T")[0],
          billNumber: billNumberPrefix,
          billTo: "",
          natureOfWork: "",
          natureOfWorkDescription: "service",
          servicesAmount: 0,
          items: [{ productName: "", description: "", quantity: 1, rate: 0 }],
        });
      } else if (selectedBillType === "zee") {
        setZeeFormData({
          invoiceDate: new Date().toISOString().split("T")[0],
          billNo: billNumberPrefix,
          billTo: "",
          natureOfWork: "",
          servicesAmount: 0,
          items: [{ product: "", description: "", phase: "", price: 0 }],
        });
      }

      // Hide alert after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error("Error generating bill:", error);
      setMessage(error.message || "An error occurred while generating the bill");
      setVariant("danger");
      setShowAlert(true);

      // Hide alert after 5 seconds
      setTimeout(() => setShowAlert(false), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToSelection = () => {
    setSelectedBillType(null);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <LeftNavManagement
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <AdminHeader toggleSidebar={toggleSidebar} />

        {/* Dashboard Body */}
        <Container fluid className="dashboard-body">
          <div className="br-box-container">
            {!selectedBillType ? (
              // Bill Type Selection Screen
              <>
                <h2 className="mb-4">Generate New Bill</h2>
                <p className="mb-4">Please select the type of bill you want to generate:</p>

                <Row className="g-4">
                  <Col lg={4} md={6}>
                    <div
                      className="bill-type-card p-5 border rounded text-center cursor-pointer"
                      onClick={() => setSelectedBillType("ukssovm")}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.3s",
                        backgroundColor: "#f8f9fa",
                        border: "2px solid #dee2e6",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#e7f3ff";
                        e.currentTarget.style.borderColor = "#0d6efd";
                        e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                        e.currentTarget.style.borderColor = "#dee2e6";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <h4 className="mb-3">BrainRock</h4>
                      <p className="text-muted">Click to generate BrainRock bill</p>
                    </div>
                  </Col>

                  <Col lg={4} md={6}>
                    <div
                      className="bill-type-card p-5 border rounded text-center cursor-pointer"
                      onClick={() => setSelectedBillType("zee")}
                      style={{
                        cursor: "pointer",
                        transition: "all 0.3s",
                        backgroundColor: "#f8f9fa",
                        border: "2px solid #dee2e6",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#e7f3ff";
                        e.currentTarget.style.borderColor = "#0d6efd";
                        e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                        e.currentTarget.style.borderColor = "#dee2e6";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <h4 className="mb-3">Zee Bill</h4>
                      <p className="text-muted">Click to generate Zee bill</p>
                    </div>
                  </Col>
                </Row>
              </>
            ) : (
              // Bill Form Screen
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="mb-0">Generate New Bill - {selectedBillType === "ukssovm" ? "BrainRock" : "Zee Bill"}</h2>
                  <Button variant="secondary" onClick={handleBackToSelection}>
                    ← Back to Selection
                  </Button>
                </div>

                {/* Alert */}
                {showAlert && (
                  <Alert
                    variant={variant}
                    className="mb-4"
                    onClose={() => setShowAlert(false)}
                    dismissible
                  >
                    {message}
                  </Alert>
                )}

                {selectedBillType === "ukssovm" ? (
                  // BrainRock Form
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col lg={4}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontSize: "0.85rem" }}>Bill Date *</Form.Label>
                          <Form.Control
                            type="date"
                            name="billDate"
                            value={ukssoMFormData.billDate}
                            onChange={handleUkssoVMChange}
                            required
                            style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col lg={4}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontSize: "0.85rem" }}>Bill Number *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter bill number"
                            name="billNumber"
                            value={ukssoMFormData.billNumber}
                            onChange={handleUkssoVMChange}
                            required
                            style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col lg={4}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontSize: "0.85rem" }}>Bill To *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter bill recipient"
                            name="billTo"
                            value={ukssoMFormData.billTo}
                            onChange={handleUkssoVMChange}
                            required
                            style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col lg={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontSize: "0.85rem" }}>Nature of Work *</Form.Label>
                          <Form.Select
                            name="natureOfWorkDescription"
                            value={ukssoMFormData.natureOfWorkDescription}
                            onChange={handleUkssoVMChange}
                            required
                            style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                          >
                            <option value="service">Service</option>
                            <option value="product">Product</option>
                            <option value="other">Other</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col lg={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontSize: "0.85rem" }}>Nature of Work Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Enter description"
                            name="natureOfWork"
                            value={ukssoMFormData.natureOfWork}
                            onChange={handleUkssoVMChange}
                            style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Items Table */}
                    <div className="mb-2">
                      <h6 className="mb-2" style={{ fontSize: "0.95rem" }}>Bill Items</h6>
                      <div className="table-responsive">
                        <Table bordered size="sm" style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                          <thead className="bg-light">
                            <tr style={{ height: "2rem" }}>
                              <th style={{ padding: "0.4rem" }}>Product Name</th>
                              <th style={{ padding: "0.4rem" }}>Description</th>
                              <th style={{ padding: "0.4rem" }}>Qty</th>
                              <th style={{ padding: "0.4rem" }}>Rate</th>
                              <th style={{ padding: "0.4rem" }}>Total</th>
                              <th style={{ padding: "0.4rem" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ukssoMFormData.items.map((item, index) => {
                              const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
                              return (
                                <tr key={index} style={{ height: "2.5rem" }}>
                                  <td style={{ padding: "0.3rem" }}>
                                    <Form.Control
                                      type="text"
                                      placeholder="Product name"
                                      value={item.productName}
                                      onChange={(e) => handleItemChange(index, "productName", e.target.value)}
                                      style={{ fontSize: "0.8rem", padding: "0.3rem" }}
                                      required
                                      size="sm"
                                    />
                                  </td>
                                  <td style={{ padding: "0.3rem" }}>
                                    <Form.Control
                                      as="textarea"
                                      rows={1}
                                      placeholder="Description"
                                      value={item.description}
                                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                      style={{ fontSize: "0.8rem", padding: "0.3rem", resize: "none" }}
                                      size="sm"
                                    />
                                  </td>
                                  <td style={{ padding: "0.3rem" }}>
                                    <Form.Control
                                      type="number"
                                      placeholder="Qty"
                                      value={item.quantity}
                                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                      style={{ fontSize: "0.8rem", padding: "0.3rem" }}
                                      min="1"
                                      size="sm"
                                    />
                                  </td>
                                  <td style={{ padding: "0.3rem" }}>
                                    <Form.Control
                                      type="number"
                                      step="0.01"
                                      placeholder="Rate"
                                      value={item.rate}
                                      onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                                      style={{ fontSize: "0.8rem", padding: "0.3rem" }}
                                      size="sm"
                                    />
                                  </td>
                                  <td className="bg-light" style={{ padding: "0.3rem", textAlign: "center" }}>
                                    <strong style={{ fontSize: "0.8rem" }}>₹{itemTotal.toFixed(2)}</strong>
                                  </td>
                                  <td style={{ padding: "0.3rem" }}>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => removeItemRow(index)}
                                      disabled={ukssoMFormData.items.length === 1}
                                      style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem" }}
                                    >
                                      Remove
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                      <Button variant="outline-primary" onClick={addItemRow} className="mb-2" size="sm" style={{ fontSize: "0.8rem" }}>
                        + Add Item
                      </Button>
                    </div>

                    {/* Services Amount */}
                    <Row className="mb-2">
                      <Col lg={4}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: "0.85rem", marginBottom: "0.3rem" }}>Services Amount</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            name="servicesAmount"
                            value={ukssoMFormData.servicesAmount}
                            onChange={handleUkssoVMChange}
                            style={{ fontSize: "0.85rem", padding: "0.4rem" }}
                            size="sm"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Totals Section */}
                    {(() => {
                      const totals = calculateUkssoVMTotals();
                      return (
                        <Row className="mt-2 mb-2">
                          <Col lg={6} className="ms-auto">
                            <div className="bg-light p-2 rounded" style={{ fontSize: "0.85rem" }}>
                              <Row className="mb-1">
                                <Col sm={8} className="text-end">
                                  <strong>Subtotal:</strong>
                                </Col>
                                <Col sm={4} className="text-end">
                                  <strong>₹{totals.subtotal.toFixed(2)}</strong>
                                </Col>
                              </Row>
                              <Row className="mb-1">
                                <Col sm={8} className="text-end">
                                  <strong>CGST (9%):</strong>
                                </Col>
                                <Col sm={4} className="text-end">
                                  <strong>₹{totals.cgstAmount.toFixed(2)}</strong>
                                </Col>
                              </Row>
                              <Row className="mb-1">
                                <Col sm={8} className="text-end">
                                  <strong>SGST (9%):</strong>
                                </Col>
                                <Col sm={4} className="text-end">
                                  <strong>₹{totals.sgstAmount.toFixed(2)}</strong>
                                </Col>
                              </Row>
                              <hr style={{ margin: "0.5rem 0" }} />
                              <Row>
                                <Col sm={8} className="text-end">
                                  <strong>Total:</strong>
                                </Col>
                                <Col sm={4} className="text-end">
                                  <strong style={{ fontSize: "1rem" }}>₹{totals.totalPaid.toFixed(2)}</strong>
                                </Col>
                              </Row>
                            </div>
                          </Col>
                        </Row>
                      );
                    })()}

                    <div className="d-grid gap-2 d-sm-flex mt-4">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-grow-1"
                      >
                        {isSubmitting ? "Generating Bill..." : "Generate Bill"}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setUkssoMFormData({
                            billDate: new Date().toISOString().split("T")[0],
                            billNumber: billNumberPrefix,
                            billTo: "",
                            natureOfWork: "",
                            natureOfWorkDescription: "service",
                            servicesAmount: 0,
                            items: [{ productName: "", description: "", quantity: 1, rate: 0 }],
                          });
                        }}
                        className="flex-grow-1"
                      >
                        Clear
                      </Button>
                    </div>
                  </Form>
                ) : (
                  // Zee Bill Form
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col lg={4}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontSize: "0.85rem" }}>Invoice Date *</Form.Label>
                          <Form.Control
                            type="date"
                            name="invoiceDate"
                            value={zeeFormData.invoiceDate}
                            onChange={handleZeeChange}
                            required
                            style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col lg={4}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontSize: "0.85rem" }}>Bill Number *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter bill number"
                            name="billNo"
                            value={zeeFormData.billNo}
                            onChange={handleZeeChange}
                            required
                            style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col lg={4}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontSize: "0.85rem" }}>Bill To *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter bill recipient"
                            name="billTo"
                            value={zeeFormData.billTo}
                            onChange={handleZeeChange}
                            required
                            style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col lg={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontSize: "0.85rem" }}>Nature of Work</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Enter nature of work"
                            name="natureOfWork"
                            value={zeeFormData.natureOfWork}
                            onChange={handleZeeChange}
                            style={{ fontSize: "0.9rem", padding: "0.4rem 0.6rem" }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Items Table for Zee */}
                    <div className="mb-2">
                      <h6 className="mb-2" style={{ fontSize: "0.95rem" }}>Bill Items</h6>
                      <div className="table-responsive">
                        <Table bordered size="sm" style={{ fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                          <thead className="bg-light">
                            <tr style={{ height: "2rem" }}>
                              <th style={{ padding: "0.4rem" }}>Product</th>
                              <th style={{ padding: "0.4rem" }}>Description</th>
                              <th style={{ padding: "0.4rem" }}>Quantity</th>
                              <th style={{ padding: "0.4rem" }}>Price</th>
                              <th style={{ padding: "0.4rem" }}>Total</th>
                              <th style={{ padding: "0.4rem" }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {zeeFormData.items.map((item, index) => {
                              const quantity = parseFloat(item.phase) || 0; // treat 'phase' as quantity
                              const price = parseFloat(item.price) || 0;
                              const itemTotal = quantity * price;
                              return (
                                <tr key={index} style={{ height: "2.5rem" }}>
                                  <td style={{ padding: "0.3rem" }}>
                                    <Form.Control
                                      type="text"
                                      placeholder="Product name"
                                      value={item.product}
                                      onChange={(e) => handleZeeItemChange(index, "product", e.target.value)}
                                      style={{ fontSize: "0.8rem", padding: "0.3rem" }}
                                      size="sm"
                                      required
                                    />
                                  </td>
                                  <td style={{ padding: "0.3rem" }}>
                                    <Form.Control
                                      as="textarea"
                                      rows={1}
                                      placeholder="Description"
                                      value={item.description}
                                      onChange={(e) => handleZeeItemChange(index, "description", e.target.value)}
                                      style={{ fontSize: "0.8rem", padding: "0.3rem", resize: "none" }}
                                      size="sm"
                                    />
                                  </td>
                                  <td style={{ padding: "0.3rem" }}>
                                    <Form.Control
                                      type="number"
                                      min="0"
                                      placeholder="Quantity"
                                      value={item.phase}
                                      onChange={(e) => handleZeeItemChange(index, "phase", e.target.value)}
                                      style={{ fontSize: "0.8rem", padding: "0.3rem" }}
                                      size="sm"
                                      required
                                    />
                                  </td>
                                  <td style={{ padding: "0.3rem" }}>
                                    <Form.Control
                                      type="number"
                                      step="0.01"
                                      placeholder="Price"
                                      value={item.price}
                                      onChange={(e) => handleZeeItemChange(index, "price", e.target.value)}
                                      style={{ fontSize: "0.8rem", padding: "0.3rem" }}
                                      size="sm"
                                    />
                                  </td>
                                  <td className="bg-light" style={{ padding: "0.3rem", textAlign: "center" }}>
                                    <strong style={{ fontSize: "0.8rem" }}>₹{itemTotal.toFixed(2)}</strong>
                                  </td>
                                  <td style={{ padding: "0.3rem" }}>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => removeZeeItemRow(index)}
                                      disabled={zeeFormData.items.length === 1}
                                      style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem" }}
                                    >
                                      Remove
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </Table>
                      </div>
                      <Button variant="outline-primary" onClick={addZeeItemRow} className="mb-2" size="sm" style={{ fontSize: "0.8rem" }}>
                        + Add Item
                      </Button>
                    </div>

                    {/* Services Amount */}
                    <Row className="mb-2">
                      <Col lg={4}>
                        <Form.Group>
                          <Form.Label style={{ fontSize: "0.85rem", marginBottom: "0.3rem" }}>Services Amount</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            name="servicesAmount"
                            value={zeeFormData.servicesAmount}
                            onChange={handleZeeChange}
                            style={{ fontSize: "0.85rem", padding: "0.4rem" }}
                            size="sm"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Totals Section for Zee */}
                    {(() => {
                      const totals = calculateZeeTotals();
                      return (
                        <Row className="mt-2 mb-2">
                          <Col lg={6} className="ms-auto">
                            <div className="bg-light p-2 rounded" style={{ fontSize: "0.85rem" }}>
                              <Row className="mb-1">
                                <Col sm={8} className="text-end">
                                  <strong>Subtotal:</strong>
                                </Col>
                                <Col sm={4} className="text-end">
                                  <strong>₹{totals.subtotal.toFixed(2)}</strong>
                                </Col>
                              </Row>
                              <Row className="mb-1">
                                <Col sm={8} className="text-end">
                                  <strong>CGST (9%):</strong>
                                </Col>
                                <Col sm={4} className="text-end">
                                  <strong>₹{totals.cgst.toFixed(2)}</strong>
                                </Col>
                              </Row>
                              <Row className="mb-1">
                                <Col sm={8} className="text-end">
                                  <strong>SGST (9%):</strong>
                                </Col>
                                <Col sm={4} className="text-end">
                                  <strong>₹{totals.sgst.toFixed(2)}</strong>
                                </Col>
                              </Row>
                              <hr style={{ margin: "0.5rem 0" }} />
                              <Row>
                                <Col sm={8} className="text-end">
                                  <strong>Total:</strong>
                                </Col>
                                <Col sm={4} className="text-end">
                                  <strong style={{ fontSize: "1rem" }}>₹{totals.totalPaidAmount.toFixed(2)}</strong>
                                </Col>
                              </Row>
                            </div>
                          </Col>
                        </Row>
                      );
                    })()}

                    <div className="d-grid gap-2 d-sm-flex mt-4">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-grow-1"
                      >
                        {isSubmitting ? "Generating Bill..." : "Generate Bill"}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setZeeFormData({
                            invoiceDate: new Date().toISOString().split("T")[0],
                            billNo: billNumberPrefix,
                            billTo: "",
                            natureOfWork: "",
                            servicesAmount: 0,
                            items: [{ product: "", description: "", phase: "", price: 0 }],
                          });
                        }}
                        className="flex-grow-1"
                      >
                        Clear
                      </Button>
                    </div>
                  </Form>
                )}
              </>
            )}
          </div>
        </Container>
      </div>
    </div>
  );
};

export default GenerateBill;
