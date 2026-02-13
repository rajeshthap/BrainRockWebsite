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

  // Bill type selection state
  const [selectedBillType, setSelectedBillType] = useState(null);

  // UKSSOVM specific state
  const [ukssoMFormData, setUkssoMFormData] = useState({
    billDate: new Date().toISOString().split("T")[0],
    billNumber: "",
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
    billNo: "",
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

  // Calculate totals for UKSSOVM
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

  // Calculate totals for Zee bills
  const calculateZeeTotals = () => {
    // Calculate subtotal from items and services
    const itemsSubtotal = zeeFormData.items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) || 0);
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

  // Handle UKSSOVM form changes
  const handleUkssoVMChange = (e) => {
    const { name, value } = e.target;
    setUkssoMFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle item changes for UKSSOVM
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
        // UKSSOVM validation
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
            phase: item.phase,
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
          billNumber: "",
          billTo: "",
          natureOfWork: "",
          natureOfWorkDescription: "service",
          servicesAmount: 0,
          items: [{ productName: "", description: "", quantity: 1, rate: 0 }],
        });
      } else if (selectedBillType === "zee") {
        setZeeFormData({
          invoiceDate: new Date().toISOString().split("T")[0],
          billNo: "",
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
                      <h4 className="mb-3">UKSSOVM</h4>
                      <p className="text-muted">Click to generate UKSSOVM bill</p>
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
                  <h2 className="mb-0">Generate New Bill - {selectedBillType === "ukssovm" ? "UKSSOVM" : "Zee Bill"}</h2>
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
                  // UKSSOVM Form
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col lg={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Bill Date *</Form.Label>
                          <Form.Control
                            type="date"
                            name="billDate"
                            value={ukssoMFormData.billDate}
                            onChange={handleUkssoVMChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col lg={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Bill Number *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter bill number"
                            name="billNumber"
                            value={ukssoMFormData.billNumber}
                            onChange={handleUkssoVMChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col lg={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Bill To *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter bill recipient"
                            name="billTo"
                            value={ukssoMFormData.billTo}
                            onChange={handleUkssoVMChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col lg={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nature of Work Description *</Form.Label>
                          <Form.Select
                            name="natureOfWorkDescription"
                            value={ukssoMFormData.natureOfWorkDescription}
                            onChange={handleUkssoVMChange}
                            required
                          >
                            <option value="service">Service</option>
                            <option value="product">Product</option>
                            <option value="other">Other</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col lg={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nature of Work</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter nature of work"
                            name="natureOfWork"
                            value={ukssoMFormData.natureOfWork}
                            onChange={handleUkssoVMChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Items Table */}
                    <div className="mb-4">
                      <h5 className="mb-3">Bill Items</h5>
                      <div className="table-responsive">
                        <Table bordered>
                          <thead>
                            <tr>
                              <th>Product Name</th>
                              <th>Description</th>
                              <th>Qty</th>
                              <th>Rate</th>
                              <th>Total</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ukssoMFormData.items.map((item, index) => {
                              const itemTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0);
                              return (
                                <tr key={index}>
                                  <td>
                                    <Form.Control
                                      type="text"
                                      placeholder="Product name"
                                      value={item.productName}
                                      onChange={(e) => handleItemChange(index, "productName", e.target.value)}
                                      required
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="text"
                                      placeholder="Description"
                                      value={item.description}
                                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="number"
                                      placeholder="Qty"
                                      value={item.quantity}
                                      onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                      min="1"
                                    />
                                  </td>
                                  <td>
                                    <Form.Control
                                      type="number"
                                      step="0.01"
                                      placeholder="Rate"
                                      value={item.rate}
                                      onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                                    />
                                  </td>
                                  <td className="bg-light">
                                    <strong>₹{itemTotal.toFixed(2)}</strong>
                                  </td>
                                  <td>
                                    <Button
                                      variant="danger"
                                      size="sm"
                                      onClick={() => removeItemRow(index)}
                                      disabled={ukssoMFormData.items.length === 1}
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
                      <Button variant="outline-primary" onClick={addItemRow} className="mb-3">
                        + Add Item
                      </Button>
                    </div>

                    {/* Services Amount */}
                    <Row className="mb-4">
                      <Col lg={6}>
                        <Form.Group>
                          <Form.Label>Services Amount</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            placeholder="Enter additional services amount"
                            name="servicesAmount"
                            value={ukssoMFormData.servicesAmount}
                            onChange={handleUkssoVMChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Totals Section */}
                    {(() => {
                      const totals = calculateUkssoVMTotals();
                      return (
                        <Row className="mt-4">
                          <Col lg={6} className="ms-auto">
                            <div className="bg-light p-3 rounded">
                              <Row className="mb-2">
                                <Col sm={8} className="text-end">
                                  <strong>Subtotal:</strong>
                                </Col>
                                <Col sm={4} className="text-end">
                                  <strong>₹{totals.subtotal.toFixed(2)}</strong>
                                </Col>
                              </Row>
                              <Row className="mb-2">
                                <Col sm={8} className="text-end">
                                  <strong>CGST (9%):</strong>
                                </Col>
                                <Col sm={4} className="text-end">
                                  <strong>₹{totals.cgstAmount.toFixed(2)}</strong>
                                </Col>
                              </Row>
                              <Row className="mb-2">
                                <Col sm={8} className="text-end">
                                  <strong>SGST (9%):</strong>
                                </Col>
                                <Col sm={4} className="text-end">
                                  <strong>₹{totals.sgstAmount.toFixed(2)}</strong>
                                </Col>
                              </Row>
                              <hr />
                              <Row>
                                <Col sm={8} className="text-end">
                                  <h5>Total:</h5>
                                </Col>
                                <Col sm={4} className="text-end">
                                  <h5>₹{totals.totalPaid.toFixed(2)}</h5>
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
                            billNumber: "",
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
                      <Col lg={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Invoice Date *</Form.Label>
                          <Form.Control
                            type="date"
                            name="invoiceDate"
                            value={zeeFormData.invoiceDate}
                            onChange={handleZeeChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col lg={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Bill Number *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter bill number"
                            name="billNo"
                            value={zeeFormData.billNo}
                            onChange={handleZeeChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col lg={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Bill To *</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter bill recipient"
                            name="billTo"
                            value={zeeFormData.billTo}
                            onChange={handleZeeChange}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col lg={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Nature of Work</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter nature of work"
                            name="natureOfWork"
                            value={zeeFormData.natureOfWork}
                            onChange={handleZeeChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Items Table for Zee */}
                    <div className="mb-4">
                      <h5 className="mb-3">Bill Items</h5>
                      <div className="table-responsive">
                        <Table bordered>
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Description</th>
                              <th>Phase</th>
                              <th>Price</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {zeeFormData.items.map((item, index) => (
                              <tr key={index}>
                                <td>
                                  <Form.Control
                                    type="text"
                                    placeholder="Product name"
                                    value={item.product}
                                    onChange={(e) => handleZeeItemChange(index, "product", e.target.value)}
                                    required
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    type="text"
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) => handleZeeItemChange(index, "description", e.target.value)}
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    type="text"
                                    placeholder="Phase"
                                    value={item.phase}
                                    onChange={(e) => handleZeeItemChange(index, "phase", e.target.value)}
                                  />
                                </td>
                                <td>
                                  <Form.Control
                                    type="number"
                                    step="0.01"
                                    placeholder="Price"
                                    value={item.price}
                                    onChange={(e) => handleZeeItemChange(index, "price", e.target.value)}
                                  />
                                </td>
                                <td>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => removeZeeItemRow(index)}
                                    disabled={zeeFormData.items.length === 1}
                                  >
                                    Remove
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                      <Button variant="outline-primary" onClick={addZeeItemRow} className="mb-3">
                        + Add Item
                      </Button>
                    </div>

                    {/* Services Amount */}
                    <Row className="mb-4">
                      <Col lg={6}>
                        <Form.Group>
                          <Form.Label>Services Amount</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            placeholder="Enter additional services amount"
                            name="servicesAmount"
                            value={zeeFormData.servicesAmount}
                            onChange={handleZeeChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Totals Section for Zee */}
                    {(() => {
                      const totals = calculateZeeTotals();
                      return (
                        <Row className="mt-4">
                          <Col lg={6} className="ms-auto">
                            <div className="bg-light p-3 rounded">
                              <Row className="mb-2">
                                <Col sm={8} className="text-end">
                                  <strong>Subtotal:</strong>
                                </Col>
                                <Col sm={4} className="text-end">
                                  <strong>₹{totals.subtotal.toFixed(2)}</strong>
                                </Col>
                              </Row>
                              <Row className="mb-2">
                                <Col sm={8} className="text-end">
                                  <strong>CGST (9%):</strong>
                                </Col>
                                <Col sm={4} className="text-end">
                                  <strong>₹{totals.cgst.toFixed(2)}</strong>
                                </Col>
                              </Row>
                              <Row className="mb-2">
                                <Col sm={8} className="text-end">
                                  <strong>SGST (9%):</strong>
                                </Col>
                                <Col sm={4} className="text-end">
                                  <strong>₹{totals.sgst.toFixed(2)}</strong>
                                </Col>
                              </Row>
                              <hr />
                              <Row>
                                <Col sm={8} className="text-end">
                                  <h5>Total:</h5>
                                </Col>
                                <Col sm={4} className="text-end">
                                  <h5>₹{totals.totalPaidAmount.toFixed(2)}</h5>
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
                            billNo: "",
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
