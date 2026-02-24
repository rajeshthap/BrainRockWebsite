import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert, Card, Modal, Spinner, Table, Pagination } from "react-bootstrap";
import "../../../assets/css/emp_dashboard.css";
import { useNavigate, useLocation } from "react-router-dom";
import LeftNavManagement from "../LeftNavManagement";
import AdminHeader from "../AdminHeader";
import { AiOutlineFileDone, AiOutlineDelete } from "react-icons/ai";

const API_BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";

const ManageBills = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Bill type selection state
  const [selectedBillType, setSelectedBillType] = useState(null);

  // Data state
  const [billsData, setBillsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    billNumber: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    amount: "",
    description: "",
    billDate: "",
    dueDate: "",
    bill_date: "",
    bill_number: "",
    bill_to: "",
    nature_of_work: "",
    nature_of_work_description: "service",
    services_amount: 0,
    subtotal: 0,
    cgst_amount: 0,
    sgst_amount: 0,
    total_paid: 0,
    // Zee bill fields
    bill_no: "",
    invoice_date: "",
    cgst: 0,
    sgst: 0,
    total_paid_amount: 0,
    items: [], // For BrainRock and Zee
  });
  const [updating, setUpdating] = useState(false);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("all"); // all, bill_number, bill_to, nature_of_work
  const [financialYearFilter, setFinancialYearFilter] = useState(""); // Financial year filter

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("success");

  // Set bill type from navigation state
  useEffect(() => {
    if (location.state?.billType) {
      setSelectedBillType(location.state.billType);
    }
  }, [location.state]);

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

  // Fetch bills data when bill type changes
  useEffect(() => {
    if (selectedBillType) {
      fetchBillsData();
    }
  }, [selectedBillType]);

  const fetchBillsData = async () => {
    try {
      setLoading(true);
      // Use different API endpoint based on bill type
      const apiEndpoint = selectedBillType === "ukssovm"
        ? `${API_BASE_URL}/api/bill-brainrock/`
        : `${API_BASE_URL}/api/bill-zee/`;

      const response = await fetch(apiEndpoint, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bills data");
      }

      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        setBillsData(result.data);
      } else {
        setBillsData([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching bills:", err);
      setError(err.message || "Failed to load bills");
      setBillsData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSelection = () => {
    setSelectedBillType(null);
    setCurrentPage(1);
    setSearchTerm("");
    setSearchField("all");
    setFinancialYearFilter("");
  };

  // Generate financial year options (current year and one before)
  const generateFinancialYears = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0 = January, 3 = April

    // If current month is before April (0-3), current FY started last April
    const currentFYStart = currentMonth < 3 ? currentYear - 1 : currentYear;
    const currentFY = `${currentFYStart}-${(currentFYStart + 1).toString().slice(-2)}`;
    const previousFY = `${currentFYStart - 1}-${currentFYStart.toString().slice(-2)}`;

    return [
      { label: currentFY, value: currentFY },
      { label: previousFY, value: previousFY }
    ];
  };

  // Check if bill date falls within a financial year (April to March)
  const isInFinancialYear = (billDate, fy) => {
    const date = new Date(billDate);
    const year = parseInt(fy.split("-")[0]);
    
    const fyStartDate = new Date(year, 3, 1); // April 1st
    const fyEndDate = new Date(year + 1, 2, 31); // March 31st

    return date >= fyStartDate && date <= fyEndDate;
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Handle edit button click
  const handleEditClick = (bill) => {
    setCurrentEditItem(bill);
    if (selectedBillType === "ukssovm") {
      // Ensure items array has proper structure with numeric values
      const items = (bill.items || []).map(item => ({
        product_name: item.product_name || "",
        description: item.description || "",
        quantity: parseFloat(item.quantity) || 1,
        rate: parseFloat(item.rate) || 0,
        total: parseFloat(item.total) || 0,
      }));

      setEditFormData({
        bill_date: bill.bill_date || "",
        bill_number: bill.bill_number || "",
        bill_to: bill.bill_to || "",
        nature_of_work: bill.nature_of_work || "",
        nature_of_work_description: bill.nature_of_work_description || "service",
        services_amount: parseFloat(bill.services_amount) || 0,
        subtotal: parseFloat(bill.subtotal) || 0,
        cgst_amount: parseFloat(bill.cgst_amount) || 0,
        sgst_amount: parseFloat(bill.sgst_amount) || 0,
        total_paid: parseFloat(bill.total_paid) || 0,
        items: items,
      });
    } else if (selectedBillType === "zee") {
      // Handle Zee bill items - map backend 'phase' to frontend 'quantity'
      const items = (bill.items || []).map(item => ({
        product: item.product || "",
        description: item.description || "",
        quantity: parseFloat(item.phase) || 0,
        price: parseFloat(item.price) || 0,
      }));

      setEditFormData({
        bill_no: bill.bill_no || "",
        bill_to: bill.bill_to || "",
        invoice_date: bill.invoice_date || "",
        nature_of_work: bill.nature_of_work || "",
        services_amount: parseFloat(bill.services_amount) || 0,
        subtotal: parseFloat(bill.subtotal) || 0,
        cgst: parseFloat(bill.cgst) || 0,
        sgst: parseFloat(bill.sgst) || 0,
        total_paid_amount: parseFloat(bill.total_paid_amount) || 0,
        items: items,
      });
    } else {
      setEditFormData({
        billNumber: bill.billNumber || "",
        clientName: bill.clientName || "",
        clientEmail: bill.clientEmail || "",
        clientPhone: bill.clientPhone || "",
        amount: bill.amount || "",
        description: bill.description || "",
        billDate: bill.billDate || "",
        dueDate: bill.dueDate || "",
        items: [],
      });
    }
    setShowEditModal(true);
  };

  // Handle edit form input change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle item change in edit modal for BrainRock
  const handleEditItemChange = (index, field, value) => {
    const updatedItems = [...editFormData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === "quantity" || field === "rate" ? parseFloat(value) || 0 : value,
    };

    // Auto-calculate item total
    if (field === "quantity" || field === "rate") {
      updatedItems[index].total = parseFloat((updatedItems[index].quantity * updatedItems[index].rate).toFixed(2));
    }

    setEditFormData((prev) => {
      const newFormData = {
        ...prev,
        items: updatedItems,
      };

      // Recalculate totals including services amount
      const itemsSubtotal = updatedItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
      const servicesAmount = parseFloat(prev.services_amount) || 0;
      const subtotal = parseFloat((itemsSubtotal + servicesAmount).toFixed(2));
      
      const roundedSubtotal = Math.round(subtotal);
      const cgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
      const sgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
      const totalPaid = parseFloat((roundedSubtotal + cgstAmount + sgstAmount).toFixed(2));

      newFormData.subtotal = roundedSubtotal;
      newFormData.cgst_amount = cgstAmount;
      newFormData.sgst_amount = sgstAmount;
      newFormData.total_paid = totalPaid;

      return newFormData;
    });
  };

  // Add new item row in edit modal
  const addEditItemRow = () => {
    setEditFormData((prev) => {
      const newItems = [
        ...prev.items,
        {
          product_name: "",
          description: "",
          quantity: 1,
          rate: 0,
          total: 0,
        },
      ];

      // Recalculate totals including services amount
      const itemsSubtotal = newItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
      const servicesAmount = parseFloat(prev.services_amount) || 0;
      const subtotal = parseFloat((itemsSubtotal + servicesAmount).toFixed(2));
      
      const roundedSubtotal = Math.round(subtotal);
      const cgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
      const sgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
      const totalPaid = parseFloat((roundedSubtotal + cgstAmount + sgstAmount).toFixed(2));

      return {
        ...prev,
        items: newItems,
        subtotal: roundedSubtotal,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount,
        total_paid: totalPaid,
      };
    });
  };

  // Remove item row in edit modal
  const removeEditItemRow = (index) => {
    setEditFormData((prev) => {
      const newItems = prev.items.filter((_, i) => i !== index);

      // Recalculate totals including services amount
      const itemsSubtotal = newItems.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
      const servicesAmount = parseFloat(prev.services_amount) || 0;
      const subtotal = parseFloat((itemsSubtotal + servicesAmount).toFixed(2));
      
      const roundedSubtotal = Math.round(subtotal);
      const cgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
      const sgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
      const totalPaid = parseFloat((roundedSubtotal + cgstAmount + sgstAmount).toFixed(2));

      return {
        ...prev,
        items: newItems,
        subtotal: roundedSubtotal,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount,
        total_paid: totalPaid,
      };
    });
  };

  // Handle update submission
  const handleUpdateBill = async () => {
    setUpdating(true);
    try {
      if (selectedBillType === "ukssovm") {
        if (!editFormData.bill_number || !editFormData.bill_to) {
          throw new Error("Please fill in all required fields");
        }
      } else if (selectedBillType === "zee") {
        if (!editFormData.bill_no || !editFormData.bill_to) {
          throw new Error("Please fill in all required fields");
        }
      }

      const apiEndpoint = selectedBillType === "ukssovm"
        ? `${API_BASE_URL}/api/bill-brainrock/`
        : `${API_BASE_URL}/api/bill-zee/`;

      // Map frontend 'quantity' back to backend 'phase' for zee bills
      let bodyData = { ...editFormData, id: currentEditItem.id };
      if (selectedBillType === "zee" && bodyData.items) {
        bodyData.items = bodyData.items.map(item => ({
          ...item,
          phase: item.quantity,
          quantity: undefined // Remove quantity field before sending
        }));
      }

      const response = await fetch(apiEndpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(bodyData),
      });

      const responseText = await response.text();

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server Error: ${response.status} - ${responseText.substring(0, 200)}`);
      }

      if (!response.ok) {
        const errorMessage = responseData.message || responseData.error || "Server error";
        throw new Error(errorMessage);
      }

      setMessage("Bill updated successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowEditModal(false);

      // Refresh data
      fetchBillsData();

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      setMessage(error.message || "Failed to update bill");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setUpdating(false);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (bill) => {
    setItemToDelete(bill);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteBill = async () => {
    setDeleting(true);
    try {
      const apiEndpoint = selectedBillType === "ukssovm"
        ? `${API_BASE_URL}/api/bill-brainrock/`
        : `${API_BASE_URL}/api/bill-zee/`;

      const response = await fetch(apiEndpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id: itemToDelete.id }),
      });

      const responseText = await response.text();

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server Error: ${response.status} - ${responseText.substring(0, 200)}`);
      }

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to delete bill");
      }

      setMessage("Bill deleted successfully!");
      setVariant("success");
      setShowAlert(true);
      setShowDeleteModal(false);

      // Refresh data
      fetchBillsData();

      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      setMessage(error.message || "Failed to delete bill");
      setVariant("danger");
      setShowAlert(true);
    } finally {
      setDeleting(false);
    }
  };

  // Filter bills based on search term and financial year
  const filteredBills = billsData.filter((bill) => {
    const searchLower = searchTerm.toLowerCase();
    
    // Financial year filter
    const billDate = selectedBillType === "ukssovm" ? bill.bill_date : bill.invoice_date;
    const fyMatch = !financialYearFilter || isInFinancialYear(billDate, financialYearFilter);
    
    if (!fyMatch) return false;

    if (selectedBillType === "ukssovm") {
      if (searchField === "all") {
        return (
          bill.bill_number?.toLowerCase().includes(searchLower) ||
          bill.bill_to?.toLowerCase().includes(searchLower) ||
          bill.nature_of_work?.toLowerCase().includes(searchLower)
        );
      } else if (searchField === "bill_number") {
        return bill.bill_number?.toLowerCase().includes(searchLower);
      } else if (searchField === "bill_to") {
        return bill.bill_to?.toLowerCase().includes(searchLower);
      } else if (searchField === "nature_of_work") {
        return bill.nature_of_work?.toLowerCase().includes(searchLower);
      }
    } else if (selectedBillType === "zee") {
      if (searchField === "all") {
        return (
          bill.bill_no?.toLowerCase().includes(searchLower) ||
          bill.bill_to?.toLowerCase().includes(searchLower) ||
          bill.nature_of_work?.toLowerCase().includes(searchLower)
        );
      } else if (searchField === "bill_no") {
        return bill.bill_no?.toLowerCase().includes(searchLower);
      } else if (searchField === "bill_to") {
        return bill.bill_to?.toLowerCase().includes(searchLower);
      } else if (searchField === "nature_of_work") {
        return bill.nature_of_work?.toLowerCase().includes(searchLower);
      }
    }
    return true;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBills = filteredBills.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Function to generate and download PDF of filtered data
  const downloadTableAsPDF = () => {
    if (filteredBills.length === 0) {
      alert("No bills to download. Please adjust your filters.");
      return;
    }

    // Create a new window for PDF content
    const printWindow = window.open("", "_blank");
    
    const billType = selectedBillType === "ukssovm" ? "BrainRock" : "Zee Bill";
    const title = `${billType} Bills Report`;
    
    let htmlContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            h1 {
              text-align: center;
              color: #0d6efd;
              margin-bottom: 10px;
            }
            .filter-info {
              text-align: center;
              color: #666;
              margin-bottom: 20px;
              font-size: 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #f8f9fa;
              border: 1px solid #dee2e6;
              padding: 12px;
              text-align: left;
              font-weight: bold;
              color: #333;
            }
            td {
              border: 1px solid #dee2e6;
              padding: 10px;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 11px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="filter-info">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            ${financialYearFilter ? `<p>Financial Year: ${financialYearFilter}</p>` : ""}
            ${searchTerm ? `<p>Search Term: ${searchTerm}</p>` : ""}
            <p>Total Records: ${filteredBills.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>${selectedBillType === "ukssovm" ? "Bill Number" : "Bill Number"}</th>
                <th>Bill To</th>
                <th>Nature of Work</th>
                <th>Total Paid</th>
                <th>${selectedBillType === "ukssovm" ? "Bill Date" : "Invoice Date"}</th>
              </tr>
            </thead>
            <tbody>
    `;

    filteredBills.forEach((bill, index) => {
      const billDate = selectedBillType === "ukssovm" ? bill.bill_date : bill.invoice_date;
      const billNumber = selectedBillType === "ukssovm" ? bill.bill_number : bill.bill_no;
      const totalPaid = selectedBillType === "ukssovm" ? bill.total_paid : bill.total_paid_amount;

      htmlContent += `
        <tr>
          <td>${index + 1}</td>
          <td>${billNumber}</td>
          <td>${bill.bill_to}</td>
          <td>${bill.nature_of_work}</td>
          <td>₹${parseFloat(totalPaid).toFixed(2)}</td>
          <td>${new Date(billDate).toLocaleDateString()}</td>
        </tr>
      `;
    });

    // Calculate total amount
    const totalAmount = filteredBills.reduce((sum, bill) => {
      const amount = selectedBillType === "ukssovm" ? parseFloat(bill.total_paid) : parseFloat(bill.total_paid_amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    htmlContent += `
            <tr style="font-weight: bold; background-color: #f0f0f0;">
              <td colspan="4" style="text-align: right;">TOTAL:</td>
              <td style="color: #0d6efd; font-weight: bold;">₹${totalAmount.toFixed(2)}</td>
              <td></td>
            </tr>
            </tbody>
          </table>
          <div class="footer">
            <p>This is an auto-generated report from Brain Rock Management System</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Trigger print dialog which allows saving as PDF
    setTimeout(() => {
      printWindow.print();
    }, 500);
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
                <h2 className="mb-4">Manage Bills</h2>
                <p className="mb-4">Please select the type of bill you want to manage:</p>

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
                      <p className="text-muted">Click to manage BrainRock bills</p>
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
                      <p className="text-muted">Click to manage Zee bills</p>
                    </div>
                  </Col>
                </Row>
              </>
            ) : (
              // Bills Management Screen
              <>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="mb-0">Manage Bills - {selectedBillType === "ukssovm" ? "BrainRock" : "Zee Bill"}</h2>
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

                {/* Search Bar */}
                <Row className="mb-4">
                  <Col lg={6}>
                    <Form.Group>
                      <Form.Label>Search Bills</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder={
                          selectedBillType === "ukssovm"
                            ? `Search by ${
                                searchField === "all"
                                  ? "All Fields"
                                  : searchField === "bill_number"
                                  ? "Bill Number"
                                  : searchField === "bill_to"
                                  ? "Bill To"
                                  : "Nature of Work"
                              }...`
                            : `Search by ${
                                searchField === "all"
                                  ? "All Fields"
                                  : searchField === "bill_no"
                                  ? "Bill Number"
                                  : searchField === "bill_to"
                                  ? "Bill To"
                                  : "Nature of Work"
                              }...`
                        }
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={3}>
                    <Form.Group>
                      <Form.Label>Search By Column</Form.Label>
                      <Form.Select
                        value={searchField}
                        onChange={(e) => {
                          setSearchField(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="all">All Fields</option>
                        {selectedBillType === "ukssovm" ? (
                          <>
                            <option value="bill_number">Bill Number</option>
                            <option value="bill_to">Bill To</option>
                            <option value="nature_of_work">Nature of Work</option>
                          </>
                        ) : (
                          <>
                            <option value="bill_no">Bill Number</option>
                            <option value="bill_to">Bill To</option>
                            <option value="nature_of_work">Nature of Work</option>
                          </>
                        )}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col lg={3}>
                    <Form.Group>
                      <Form.Label>Financial Year</Form.Label>
                      <Form.Select
                        value={financialYearFilter}
                        onChange={(e) => {
                          setFinancialYearFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Years</option>
                        {generateFinancialYears().map((fy) => (
                          <option key={fy.value} value={fy.value}>
                            {fy.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Loading State */}
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : error ? (
                  <Alert variant="danger">Error: {error}</Alert>
                ) : currentBills.length > 0 ? (
                  <>
                    {/* Download PDF Button */}
                    <div className="mb-3 d-flex justify-content-end">
                      <Button
                        variant="outline-primary"
                        onClick={downloadTableAsPDF}
                        title="Download filtered bills as PDF"
                      >
                        📄 Download as PDF
                      </Button>
                    </div>

                    {/* Bills Table */}
                    <div className="table-responsive">
                      <Table 
                        striped 
                        bordered 
                        hover 
                        className="mb-4"
                        style={{
                          fontSize: "13px",
                          marginBottom: "1rem"
                        }}
                      >
                        <thead className="table-light">
                          <tr style={{ padding: "0.25rem 0.5rem" }}>
                            <th style={{ padding: "0.4rem 0.6rem" }}>#</th>
                            {selectedBillType === "ukssovm" ? (
                              <>
                                <th style={{ padding: "0.4rem 0.6rem" }}>Bill Number</th>
                                <th style={{ padding: "0.4rem 0.6rem" }}>Bill To</th>
                                <th style={{ padding: "0.4rem 0.6rem" }}>Nature of Work</th>
                                <th style={{ padding: "0.4rem 0.6rem" }}>Total Paid</th>
                                <th style={{ padding: "0.4rem 0.6rem" }}>Bill Date</th>
                              </>
                            ) : (
                              <>
                                <th style={{ padding: "0.4rem 0.6rem" }}>Bill Number</th>
                                <th style={{ padding: "0.4rem 0.6rem" }}>Bill To</th>
                                <th style={{ padding: "0.4rem 0.6rem" }}>Nature of Work</th>
                                <th style={{ padding: "0.4rem 0.6rem" }}>Total Paid</th>
                                <th style={{ padding: "0.4rem 0.6rem" }}>Invoice Date</th>
                              </>
                            )}
                            <th style={{ padding: "0.4rem 0.6rem" }}>PDF Document</th>
                            <th style={{ padding: "0.4rem 0.6rem" }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentBills.map((bill, index) => (
                            <tr key={bill.id} style={{ padding: "0.25rem 0.5rem" }}>
                              <td style={{ padding: "0.4rem 0.6rem" }}>{indexOfFirstItem + index + 1}</td>
                              {selectedBillType === "ukssovm" ? (
                                <>
                                  <td style={{ padding: "0.4rem 0.6rem" }}>{bill.bill_number}</td>
                                  <td style={{ padding: "0.4rem 0.6rem" }}>{bill.bill_to}</td>
                                  <td style={{ padding: "0.4rem 0.6rem" }}>{bill.nature_of_work}</td>
                                  <td style={{ padding: "0.4rem 0.6rem" }}>₹{parseFloat(bill.total_paid).toFixed(2)}</td>
                                  <td style={{ padding: "0.4rem 0.6rem" }}>{new Date(bill.bill_date).toLocaleDateString()}</td>
                                </>
                              ) : (
                                <>
                                  <td style={{ padding: "0.4rem 0.6rem" }}>{bill.bill_no}</td>
                                  <td style={{ padding: "0.4rem 0.6rem" }}>{bill.bill_to}</td>
                                  <td style={{ padding: "0.4rem 0.6rem" }}>{bill.nature_of_work}</td>
                                  <td style={{ padding: "0.4rem 0.6rem" }}>₹{parseFloat(bill.total_paid_amount).toFixed(2)}</td>
                                  <td style={{ padding: "0.4rem 0.6rem" }}>{new Date(bill.invoice_date).toLocaleDateString()}</td>
                                </>
                              )}
                              <td style={{ padding: "0.4rem 0.6rem" }}>
                                {bill.pdf_file ? (
                                  <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <Button
                                      variant="info"
                                      size="sm"
                                      onClick={() => {
                                        const pdfUrl = `${API_BASE_URL}${bill.pdf_file}`;
                                        window.open(pdfUrl, "_blank");
                                      }}
                                      title="View PDF"
                                    >
                                      👁️ View
                                    </Button>
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={() => {
                                        const pdfUrl = `${API_BASE_URL}${bill.pdf_file}`;
                                        const fileName = bill.pdf_file.split("/").pop();
                                        
                                        // Method 1: Try fetch with blob
                                        fetch(pdfUrl, { 
                                          method: "GET",
                                          credentials: "include",
                                          headers: {
                                            "Accept": "application/pdf"
                                          }
                                        })
                                          .then((response) => {
                                            if (!response.ok) {
                                              throw new Error(`HTTP error! status: ${response.status}`);
                                            }
                                            return response.blob();
                                          })
                                          .then((blob) => {
                                            const url = window.URL.createObjectURL(blob);
                                            const link = document.createElement("a");
                                            link.href = url;
                                            link.download = fileName;
                                            link.style.display = "none";
                                            document.body.appendChild(link);
                                            link.click();
                                            
                                            // Cleanup
                                            setTimeout(() => {
                                              document.body.removeChild(link);
                                              window.URL.revokeObjectURL(url);
                                            }, 100);
                                          })
                                          .catch((err) => {
                                            console.error("Error downloading PDF:", err);
                                            // Fallback: Open in new tab
                                            alert("Download using browser method. Opening PDF in new tab...");
                                            window.open(pdfUrl, "_blank");
                                          });
                                      }}
                                      title="Download PDF"
                                    >
                                      ⬇️ Download
                                    </Button>
                                  </div>
                                ) : (
                                  <span style={{ color: "#999", fontSize: "12px" }}>No PDF</span>
                                )}
                              </td>
                              <td style={{ padding: "0.4rem 0.6rem" }}>
                                <Button
                                  variant="warning"
                                  size="sm"
                                  className="me-2"
                                  onClick={() => handleEditClick(bill)}
                                  title="Edit Bill"
                                >
                                  <AiOutlineFileDone /> Edit
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(bill)}
                                  title="Delete Bill"
                                >
                                  <AiOutlineDelete /> Delete
                                </Button>
                              </td>
                            </tr>
                          ))}
                          {/* Total Row */}
                          <tr style={{ padding: "0.25rem 0.5rem", fontWeight: "bold", backgroundColor: "#f8f9fa" }}>
                            <td style={{ padding: "0.4rem 0.6rem" }}></td>
                            <td style={{ padding: "0.4rem 0.6rem" }}></td>
                            <td style={{ padding: "0.4rem 0.6rem" }}></td>
                            <td style={{ padding: "0.4rem 0.6rem", textAlign: "right" }}>TOTAL:</td>
                            <td style={{ padding: "0.4rem 0.6rem", color: "#0d6efd" }}>
                              ₹{filteredBills.reduce((sum, bill) => {
                                const amount = selectedBillType === "ukssovm" ? parseFloat(bill.total_paid) : parseFloat(bill.total_paid_amount);
                                return sum + (isNaN(amount) ? 0 : amount);
                              }, 0).toFixed(2)}
                            </td>
                            <td style={{ padding: "0.4rem 0.6rem" }}></td>
                            <td style={{ padding: "0.4rem 0.6rem" }}></td>
                            <td style={{ padding: "0.4rem 0.6rem" }}></td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <nav aria-label="Page navigation">
                        <Pagination>
                          <Pagination.First
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                          />
                          <Pagination.Prev
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          />
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Pagination.Item
                              key={page}
                              active={page === currentPage}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Pagination.Item>
                          ))}
                          <Pagination.Next
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          />
                          <Pagination.Last
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                          />
                        </Pagination>
                      </nav>
                    )}
                  </>
                ) : (
                  <Alert variant="info">No bills found. {searchTerm && "Try adjusting your search."}</Alert>
                )}
              </>
            )}
          </div>
        </Container>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Bill</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {selectedBillType === "ukssovm" ? (
              <>
                <Row>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Bill Date *</Form.Label>
                      <Form.Control
                        type="date"
                        name="bill_date"
                        value={editFormData.bill_date}
                        onChange={handleEditChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Bill Number *</Form.Label>
                      <Form.Control
                        type="text"
                        name="bill_number"
                        value={editFormData.bill_number}
                        onChange={handleEditChange}
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
                        name="bill_to"
                        value={editFormData.bill_to}
                        onChange={handleEditChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nature of Work Description *</Form.Label>
                      <Form.Select
                        name="nature_of_work_description"
                        value={editFormData.nature_of_work_description}
                        onChange={handleEditChange}
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
                        name="nature_of_work"
                        value={editFormData.nature_of_work}
                        onChange={handleEditChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Items Table */}
                <Form.Group className="mb-3">
                  <Form.Label>Items</Form.Label>
                  <div className="table-responsive">
                    <Table striped bordered hover size="sm" style={{ fontSize: "12px" }}>
                      <thead className="table-light">
                        <tr>
                          <th style={{ padding: "0.4rem 0.6rem" }}>Product Name</th>
                          <th style={{ padding: "0.4rem 0.6rem" }}>Description</th>
                          <th style={{ padding: "0.4rem 0.6rem" }}>Quantity</th>
                          <th style={{ padding: "0.4rem 0.6rem" }}>Rate</th>
                          <th style={{ padding: "0.4rem 0.6rem" }}>Total</th>
                          <th style={{ padding: "0.4rem 0.6rem" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editFormData.items && editFormData.items.map((item, index) => (
                          <tr key={index} style={{ padding: "0.25rem 0.5rem" }}>
                            <td style={{ padding: "0.4rem 0.6rem" }}>
                              <Form.Control
                                type="text"
                                size="sm"
                                value={item.product_name}
                                onChange={(e) => handleEditItemChange(index, "product_name", e.target.value)}
                                placeholder="Product Name"
                                style={{ fontSize: "12px" }}
                              />
                            </td>
                            <td style={{ padding: "0.4rem 0.6rem" }}>
                              <Form.Control
                                type="text"
                                size="sm"
                                value={item.description}
                                onChange={(e) => handleEditItemChange(index, "description", e.target.value)}
                                placeholder="Description"
                                style={{ fontSize: "12px" }}
                              />
                            </td>
                            <td style={{ padding: "0.4rem 0.6rem" }}>
                              <Form.Control
                                type="number"
                                size="sm"
                                value={item.quantity}
                                onChange={(e) => handleEditItemChange(index, "quantity", e.target.value)}
                                min="1"
                                style={{ fontSize: "12px" }}
                              />
                            </td>
                            <td style={{ padding: "0.4rem 0.6rem" }}>
                              <Form.Control
                                type="number"
                                size="sm"
                                value={item.rate}
                                onChange={(e) => handleEditItemChange(index, "rate", e.target.value)}
                                step="0.01"
                                style={{ fontSize: "12px" }}
                              />
                            </td>
                            <td style={{ padding: "0.4rem 0.6rem" }}>
                              ₹{parseFloat(item.total || 0).toFixed(2)}
                            </td>
                            <td style={{ padding: "0.4rem 0.6rem" }}>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeEditItemRow(index)}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  <Button variant="success" size="sm" onClick={addEditItemRow} className="mt-2">
                    + Add Item
                  </Button>
                </Form.Group>

                {/* Services Amount */}
                <Row className="mb-4">
                  <Col lg={6}>
                    <Form.Group>
                      <Form.Label>Services Amount</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="Enter additional services amount"
                        name="services_amount"
                        value={editFormData.services_amount}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value) || 0;
                          setEditFormData((prev) => {
                            const itemsSubtotal = prev.items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
                            const subtotal = parseFloat((itemsSubtotal + newValue).toFixed(2));
                            const roundedSubtotal = Math.round(subtotal);
                            const cgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
                            const sgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
                            const totalPaid = parseFloat((roundedSubtotal + cgstAmount + sgstAmount).toFixed(2));

                            return {
                              ...prev,
                              services_amount: newValue,
                              subtotal: roundedSubtotal,
                              cgst_amount: cgstAmount,
                              sgst_amount: sgstAmount,
                              total_paid: totalPaid,
                            };
                          });
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col lg={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Subtotal</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="subtotal"
                        value={editFormData.subtotal}
                        onChange={handleEditChange}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>CGST Amount</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="cgst_amount"
                        value={editFormData.cgst_amount}
                        onChange={handleEditChange}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>SGST Amount</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="sgst_amount"
                        value={editFormData.sgst_amount}
                        onChange={handleEditChange}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Total Paid</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="total_paid"
                    value={editFormData.total_paid}
                    onChange={handleEditChange}
                    readOnly
                  />
                </Form.Group>
              </>
            ) : selectedBillType === "zee" ? (
              <>
                <Row>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Invoice Date *</Form.Label>
                      <Form.Control
                        type="date"
                        name="invoice_date"
                        value={editFormData.invoice_date}
                        onChange={handleEditChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Bill Number *</Form.Label>
                      <Form.Control
                        type="text"
                        name="bill_no"
                        value={editFormData.bill_no}
                        onChange={handleEditChange}
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
                        name="bill_to"
                        value={editFormData.bill_to}
                        onChange={handleEditChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nature of Work</Form.Label>
                      <Form.Control
                        type="text"
                        name="nature_of_work"
                        value={editFormData.nature_of_work}
                        onChange={handleEditChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Zee Items Table */}
                <Form.Group className="mb-3">
                  <Form.Label>Items</Form.Label>
                  <div className="table-responsive">
                    <Table striped bordered hover size="sm" style={{ fontSize: "12px" }}>
                      <thead className="table-light">
                        <tr>
                          <th style={{ padding: "0.4rem 0.6rem" }}>Product</th>
                          <th style={{ padding: "0.4rem 0.6rem" }}>Description</th>
                          <th style={{ padding: "0.4rem 0.6rem" }}>Quantity</th>
                          <th style={{ padding: "0.4rem 0.6rem" }}>Price</th>
                          <th style={{ padding: "0.4rem 0.6rem" }}>Total</th>
                          <th style={{ padding: "0.4rem 0.6rem" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editFormData.items && editFormData.items.map((item, index) => (
                          <tr key={index} style={{ padding: "0.25rem 0.5rem" }}>
                            <td style={{ padding: "0.4rem 0.6rem" }}>
                              <Form.Control
                                type="text"
                                size="sm"
                                value={item.product}
                                onChange={(e) => {
                                  const updatedItems = [...editFormData.items];
                                  updatedItems[index] = { ...updatedItems[index], product: e.target.value };
                                  setEditFormData((prev) => ({ ...prev, items: updatedItems }));
                                }}
                                placeholder="Product"
                                style={{ fontSize: "12px" }}
                              />
                            </td>
                            <td style={{ padding: "0.4rem 0.6rem" }}>
                              <Form.Control
                                type="text"
                                size="sm"
                                value={item.description}
                                onChange={(e) => {
                                  const updatedItems = [...editFormData.items];
                                  updatedItems[index] = { ...updatedItems[index], description: e.target.value };
                                  setEditFormData((prev) => ({ ...prev, items: updatedItems }));
                                }}
                                placeholder="Description"
                                style={{ fontSize: "12px" }}
                              />
                            </td>
                            <td style={{ padding: "0.4rem 0.6rem" }}>
                              <Form.Control
                                type="number"
                                size="sm"
                                value={item.quantity}
                                onChange={(e) => {
                                  const updatedItems = [...editFormData.items];
                                  updatedItems[index] = { ...updatedItems[index], quantity: parseFloat(e.target.value) || 0 };
                                  
                                  // Recalculate totals
                                  const itemsSubtotal = updatedItems.reduce((sum, i) => sum + ((parseFloat(i.quantity) || 0) * (parseFloat(i.price) || 0)), 0);
                                  const servicesAmount = parseFloat(editFormData.services_amount) || 0;
                                  const subtotal = parseFloat((itemsSubtotal + servicesAmount).toFixed(2));
                                  const roundedSubtotal = Math.round(subtotal);
                                  const cgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
                                  const sgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
                                  const totalPaidAmount = parseFloat((roundedSubtotal + cgstAmount + sgstAmount).toFixed(2));

                                  setEditFormData((prev) => ({
                                    ...prev,
                                    items: updatedItems,
                                    subtotal: roundedSubtotal,
                                    cgst: cgstAmount,
                                    sgst: sgstAmount,
                                    total_paid_amount: totalPaidAmount,
                                  }));
                                }}
                                min="1"
                                step="1"
                                placeholder="Quantity"
                                style={{ fontSize: "12px" }}
                              />
                            </td>
                            <td style={{ padding: "0.4rem 0.6rem" }}>
                              <Form.Control
                                type="number"
                                size="sm"
                                value={item.price}
                                onChange={(e) => {
                                  const updatedItems = [...editFormData.items];
                                  updatedItems[index] = { ...updatedItems[index], price: parseFloat(e.target.value) || 0 };
                                  
                                  // Recalculate totals
                                  const itemsSubtotal = updatedItems.reduce((sum, i) => sum + ((parseFloat(i.quantity) || 0) * (parseFloat(i.price) || 0)), 0);
                                  const servicesAmount = parseFloat(editFormData.services_amount) || 0;
                                  const subtotal = parseFloat((itemsSubtotal + servicesAmount).toFixed(2));
                                  const roundedSubtotal = Math.round(subtotal);
                                  const cgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
                                  const sgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
                                  const totalPaidAmount = parseFloat((roundedSubtotal + cgstAmount + sgstAmount).toFixed(2));

                                  setEditFormData((prev) => ({
                                    ...prev,
                                    items: updatedItems,
                                    subtotal: roundedSubtotal,
                                    cgst: cgstAmount,
                                    sgst: sgstAmount,
                                    total_paid_amount: totalPaidAmount,
                                  }));
                                }}
                                step="0.01"
                                style={{ fontSize: "12px" }}
                              />
                            </td>
                            <td style={{ padding: "0.4rem 0.6rem" }}>
                              ₹{((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0)).toFixed(2)}
                            </td>
                            <td style={{ padding: "0.4rem 0.6rem" }}>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  const updatedItems = editFormData.items.filter((_, i) => i !== index);
                                  
                                  // Recalculate totals
                                  const itemsSubtotal = updatedItems.reduce((sum, i) => sum + ((parseFloat(i.quantity) || 0) * (parseFloat(i.price) || 0)), 0);
                                  const servicesAmount = parseFloat(editFormData.services_amount) || 0;
                                  const subtotal = parseFloat((itemsSubtotal + servicesAmount).toFixed(2));
                                  const roundedSubtotal = Math.round(subtotal);
                                  const cgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
                                  const sgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
                                  const totalPaidAmount = parseFloat((roundedSubtotal + cgstAmount + sgstAmount).toFixed(2));

                                  setEditFormData((prev) => ({
                                    ...prev,
                                    items: updatedItems,
                                    subtotal: roundedSubtotal,
                                    cgst: cgstAmount,
                                    sgst: sgstAmount,
                                    total_paid_amount: totalPaidAmount,
                                  }));
                                }}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  <Button variant="success" size="sm" onClick={() => {
                    setEditFormData((prev) => {
                      const newItems = [...prev.items, { product: "", description: "", quantity: 1, price: 0 }];
                      
                      // Recalculate totals
                      const itemsSubtotal = newItems.reduce((sum, i) => sum + ((parseFloat(i.quantity) || 0) * (parseFloat(i.price) || 0)), 0);
                      const servicesAmount = parseFloat(prev.services_amount) || 0;
                      const subtotal = parseFloat((itemsSubtotal + servicesAmount).toFixed(2));
                      const roundedSubtotal = Math.round(subtotal);
                      const cgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
                      const sgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
                      const totalPaidAmount = parseFloat((roundedSubtotal + cgstAmount + sgstAmount).toFixed(2));

                      return {
                        ...prev,
                        items: newItems,
                        subtotal: roundedSubtotal,
                        cgst: cgstAmount,
                        sgst: sgstAmount,
                        total_paid_amount: totalPaidAmount,
                      };
                    });
                  }} className="mt-2">
                    + Add Item
                  </Button>
                </Form.Group>

                {/* Services Amount */}
                <Row className="mb-4">
                  <Col lg={6}>
                    <Form.Group>
                      <Form.Label>Services Amount</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="Enter additional services amount"
                        name="services_amount"
                        value={editFormData.services_amount}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value) || 0;
                          setEditFormData((prev) => {
                            const itemsSubtotal = prev.items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
                            const subtotal = parseFloat((itemsSubtotal + newValue).toFixed(2));
                            const roundedSubtotal = Math.round(subtotal);
                            const cgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
                            const sgstAmount = parseFloat((Math.round(roundedSubtotal * 0.09)).toFixed(2));
                            const totalPaidAmount = parseFloat((roundedSubtotal + cgstAmount + sgstAmount).toFixed(2));

                            return {
                              ...prev,
                              services_amount: newValue,
                              subtotal: roundedSubtotal,
                              cgst: cgstAmount,
                              sgst: sgstAmount,
                              total_paid_amount: totalPaidAmount,
                            };
                          });
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col lg={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Subtotal</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="subtotal"
                        value={editFormData.subtotal}
                        onChange={handleEditChange}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>CGST</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="cgst"
                        value={editFormData.cgst}
                        onChange={handleEditChange}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                  <Col lg={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>SGST</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="sgst"
                        value={editFormData.sgst}
                        onChange={handleEditChange}
                        readOnly
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Total Paid Amount</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="total_paid_amount"
                    value={editFormData.total_paid_amount}
                    onChange={handleEditChange}
                    readOnly
                  />
                </Form.Group>
              </>
            ) : null}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateBill}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Bill"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Bill</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBillType === "ukssovm" ? (
            <>
              <p>
                Are you sure you want to delete the bill <strong>{itemToDelete?.bill_number}</strong> for{" "}
                <strong>{itemToDelete?.bill_to}</strong>?
              </p>
            </>
          ) : (
            <>
              <p>
                Are you sure you want to delete the bill <strong>{itemToDelete?.bill_no}</strong> for{" "}
                <strong>{itemToDelete?.bill_to}</strong>?
              </p>
            </>
          )}
          <p className="text-danger">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteBill}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Bill"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageBills;
