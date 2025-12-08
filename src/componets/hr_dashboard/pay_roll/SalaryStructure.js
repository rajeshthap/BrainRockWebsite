import React, { useState, useEffect, useMemo, useContext } from "react";
import {
  Container,
  Row,
  Badge,
  Alert,
  Spinner,
  Image,
  Button, 
  Pagination,
  Form,
  Card,
  Col,
  InputGroup,
  Table,
  Tab,
  Tabs
} from "react-bootstrap";
import HrHeader from "../HrHeader";
import SideNav from "../SideNav";
import "../../../assets/css/attendance.css";
import { AiFillEdit } from "react-icons/ai";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext"; // Adjust path as needed

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaPrint } from "react-icons/fa6";
import { FaFileExcel } from "react-icons/fa";

// Government salary structure percentages
const GOVERNMENT_SALARY_STRUCTURE = {
  earnings: {
    basic: 40,      // 40% of gross salary
    hra: 20,        // Default 20% of gross salary (will be adjusted based on metro/non-metro)
    da: 10,         // 10% of gross salary
    ta: 5,          // 5% of gross salary
    medical: 5,     // 5% of gross salary
    special: 20     // 20% of gross salary
  },
  deductions: {
    pf: 12,         // 12% of basic salary
    esi: 0.75,      // 0.75% of gross salary
    tds: 0,         // Default 0% (will be adjusted based on salary)
    other_deductions: 0
  }
};

// Other salary structure percentages
const OTHER_SALARY_STRUCTURE = {
  earnings: {
    basic: 40,      // 40% of CTC
    hra: 50,        // Default 50% of basic salary (will be adjusted based on metro/non-metro)
    special: 35,    // 35% of CTC (adjusted to make total 100% with basic, hra, medical)
    medical: 5,     // 5% of CTC
    performance_bonus: 0  // 0% of CTC (editable)
  },
  deductions: {
    pf: 12,         // 12% of basic salary
    other_deductions: 0
  }
};

// Marketing department specific percentages
const MARKETING_SALARY_STRUCTURE = {
  earnings: {
    basic: 40,      // 40% of CTC
    hra: 50,        // Default 50% of basic salary (will be adjusted based on metro/non-metro)
    special: 29,    // 29% of CTC (adjusted to make total 100% with basic, hra, medical, marketing_perks)
    medical: 5,     // 5% of CTC
    performance_bonus: 0,  // 0% of CTC (editable)
    marketing_perks: 6    // 6% of basic for mobile, car, etc.
  },
  deductions: {
    pf: 12,         // 12% of basic salary
    other_deductions: 0
  }
};

// Metro vs Non-Metro HRA percentages
const HRA_PERCENTAGES = {
  metro: 50,       // 50% of basic salary for metro cities
  nonMetro: 40     // 40% of basic salary for non-metro cities
};

// Helper function to format currency values with 2 decimal places and max 12 digits
const formatCurrencyValue = (value) => {
  // Convert to string and check if it has more than 12 digits (excluding decimal point)
  const strValue = value.toString();
  const digitsOnly = strValue.replace('.', '');
  
  if (digitsOnly.length > 12) {
    // If more than 12 digits, truncate to fit
    const integerPart = Math.floor(value).toString().substring(0, 10);
    const decimalPart = value.toFixed(2).split('.')[1];
    return parseFloat(`${integerPart}.${decimalPart}`).toFixed(2);
  }
  
  return parseFloat(value).toFixed(2);
};

const SalaryStructure = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Get user data from AuthContext
  const { user } = useContext(AuthContext);
  
  // Check if user is an admin
  const isAdmin = user && user.role === 'hr';
  
  // State for API data
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [salaryStatusFilter, setSalaryStatusFilter] = useState('all'); // New state for salary status filter
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Set to 10 items per page
  
  // State for selected employee and salary structure form
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  
  // State for metro/non-metro selection
  const [cityType, setCityType] = useState('metro'); // 'metro' or 'nonMetro'
  
  // State for salary structure type selection
  const [salaryStructureType, setSalaryStructureType] = useState('government'); // 'government' or 'other'
  
  // State for salary structure form
  const [salaryStructure, setSalaryStructure] = useState({
    basic: '',
    hra: '',
    da: '',
    ta: '',
    medical: '',
    special: '',
    marketing_perks: '',
    performance_bonus: '',
    pf: '',
    esi: '',
    tds: '',
    other_deductions: ''
  });
  
  // State for performance bonus input
  const [performanceBonusInput, setPerformanceBonusInput] = useState('');

  // State for fetched salary data
  const [employeeSalaryData, setEmployeeSalaryData] = useState(null);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [salaryError, setSalaryError] = useState(null);
  
  // State for save operation
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  // State for salary structure status
  const [salaryStatuses, setSalaryStatuses] = useState({});
  
  // State for marketing client management
  const [clients, setClients] = useState([]);
  const [newClient, setNewClient] = useState({ name: '', value: '', bonus: '' });
  const [clientBonus, setClientBonus] = useState(0);
  
  // New state for number of clients and per-client bonus
  const [numberOfClients, setNumberOfClients] = useState(0);
  const [perClientBonus, setPerClientBonus] = useState(2000); // Default 2000 per client

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Fetch data from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/employee-list/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        if (Array.isArray(data)) {
            setEmployees(data);
        } else if (data && Array.isArray(data.results)) {
            setEmployees(data.results);
        } else {
            setError("Received unexpected data format from server.");
        }
        
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch employees:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // If user is an employee, find their own data from the employees list
  const employeeData = useMemo(() => {
    if (!isAdmin && employees.length > 0) {
      return employees.find(emp => emp.emp_id === user.unique_id);
    }
    return null;
  }, [isAdmin, employees, user]);

  // If user is an employee, show their salary structure directly
  useEffect(() => {
    if (!isAdmin && employeeData) {
      setSelectedEmployee(employeeData);
      setShowSalaryForm(true);
      
      // Set salary structure type based on employee department
      const departmentName = employeeData.department?.trim().toLowerCase();
      const isMarketingOrSales = departmentName === 'sales department' || departmentName === 'marketing department';
      
      if (isMarketingOrSales) {
        setSalaryStructureType('other');
      } else {
        setSalaryStructureType('government');
      }
      
      // Fetch employee salary data
      fetchEmployeeSalary(employeeData.emp_id);
    }
  }, [isAdmin, employeeData]);

  // Function to check salary structure status for an employee
  const checkSalaryStatus = async (employeeId) => {
    try {
      const response = await fetch(`https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/salary-structure/?employee_id=${employeeId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          // Check if any salary structure is confirmed
          const confirmedStructure = data.data.find(item => item.status === 'confirmed');
          setSalaryStatuses(prev => ({
            ...prev,
            [employeeId]: confirmedStructure ? 'confirmed' : 'unconfirmed'
          }));
          return confirmedStructure ? 'confirmed' : 'unconfirmed';
        } else {
          setSalaryStatuses(prev => ({
            ...prev,
            [employeeId]: 'unconfirmed'
          }));
          return 'unconfirmed';
        }
      }
    } catch (error) {
      console.error(`Error checking salary status for ${employeeId}:`, error);
      setSalaryStatuses(prev => ({
        ...prev,
        [employeeId]: 'unconfirmed'
      }));
      return 'unconfirmed';
    }
  };

  // Check salary status for all employees
  useEffect(() => {
    if (employees.length > 0) {
      employees.forEach(emp => {
        if (emp.emp_id) {
          checkSalaryStatus(emp.emp_id);
        }
      });
    }
  }, [employees]);

  // Calculate client perks based on number of clients and per-client bonus
  const clientPerks = useMemo(() => {
    return numberOfClients * perClientBonus;
  }, [numberOfClients, perClientBonus]);

  // Update client bonus whenever client perks or individual client bonuses change
  useEffect(() => {
    const individualClientBonus = clients.reduce((sum, client) => sum + parseFloat(client.bonus || 0), 0);
    const totalBonus = individualClientBonus + clientPerks;
    setClientBonus(totalBonus);
  }, [clients, clientPerks]);

  // Function to calculate salary structure based on percentages
  const calculateSalaryStructure = (annualCTC) => {
    const monthlyCTC = annualCTC / 12;
    
    // Determine which salary structure to use
    let structure;
    if (salaryStructureType === 'government') {
      structure = GOVERNMENT_SALARY_STRUCTURE;
    } else {
      // *** FIX: Check the 'department' field for specific names ***
      const departmentName = selectedEmployee?.department?.trim().toLowerCase();
      const isMarketingOrSales = departmentName === 'sales department' || departmentName === 'marketing department';

      if (isMarketingOrSales) {
        structure = MARKETING_SALARY_STRUCTURE;
      } else {
        structure = OTHER_SALARY_STRUCTURE;
      }
    }
    
    // Calculate basic salary
    const basic = monthlyCTC * structure.earnings.basic / 100;
    
    // Calculate earnings
    const earnings = {};
    Object.entries(structure.earnings).forEach(([key, percentage]) => {
      if (key === 'hra') {
        // HRA is calculated based on basic salary and city type
        earnings[key] = formatCurrencyValue(basic * HRA_PERCENTAGES[cityType] / 100);
      } else if (key === 'marketing_perks') {
        // Marketing perks are now editable, use the current value or calculate default
        if (salaryStructure.marketing_perks && !isNaN(salaryStructure.marketing_perks)) {
          earnings[key] = formatCurrencyValue(salaryStructure.marketing_perks);
        } else {
          earnings[key] = formatCurrencyValue(basic * percentage / 100);
        }
      } else if (key === 'performance_bonus') {
        // Performance bonus is editable, use input value
        earnings[key] = formatCurrencyValue(parseFloat(performanceBonusInput) || 0);
      } else {
        // Other earnings are calculated as percentage of monthly CTC
        earnings[key] = formatCurrencyValue(monthlyCTC * percentage / 100);
      }
    });
    
    // Calculate deductions
    const deductions = {};
    Object.entries(structure.deductions).forEach(([key, percentage]) => {
      if (key === 'pf') {
        // PF is calculated on basic salary
        let pfValue = basic * percentage / 100;
        // Cap PF at 1800/month as per current regulations
        if (pfValue > 1800) {
          pfValue = 1800;
        }
        deductions[key] = formatCurrencyValue(pfValue);
      } else if (key === 'tds') {
        // TDS calculation based on annual salary
        const annualSalary = annualCTC;
        let tdsPercentage = 0;
        
        if (annualSalary > 1000000) {
          tdsPercentage = 20;
        } else if (annualSalary > 500000) {
          tdsPercentage = 10;
        } else if (annualSalary > 250000) {
          tdsPercentage = 5;
        }
        
        deductions[key] = formatCurrencyValue(monthlyCTC * tdsPercentage / 100);
      } else {
        // Other deductions are calculated on gross salary
        deductions[key] = formatCurrencyValue(monthlyCTC * percentage / 100);
      }
    });
    
    // Set calculated values
    setSalaryStructure({
      ...earnings,
      ...deductions
    });
  };

  // Function to fetch employee salary data
  const fetchEmployeeSalary = async (employeeId) => {
    setSalaryLoading(true);
    setSalaryError(null);
    
    try {
      const response = await axios.get(
        `https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/get-employee-gender-salary/?employee_id=${employeeId}`,
        { withCredentials: true }
      );
      
      if (response.data && response.data.success) {
        setEmployeeSalaryData(response.data.data);
        
        // Calculate salary structure based on fetched salary
        if (response.data.data && response.data.data.salary) {
          const annualCTC = parseFloat(response.data.data.salary);
          // Use a timeout to ensure state updates are processed before calculation
          setTimeout(() => calculateSalaryStructure(annualCTC), 0);
        }
      } else {
        setSalaryError("Failed to fetch employee salary data");
      }
    } catch (err) {
      setSalaryError(err.message || "Failed to fetch employee salary data");
      console.error("Error fetching employee salary:", err);
    } finally {
      setSalaryLoading(false);
    }
  };

  const handlePrint = () => {
  const columnsToRemove = [1, 10]; // REMOVE: Photo (1), Action (7)

  const table = document.querySelector(".temp-rwd-table")?.cloneNode(true);
  if (!table) {
    window.alert("Salary table not found!");
    return;
  }

  // Remove unwanted columns
  table.querySelectorAll("tr").forEach((row) => {
    const cells = row.querySelectorAll("th, td");
    [...columnsToRemove].sort((a, b) => b - a).forEach((colIndex) => {
      if (cells[colIndex]) cells[colIndex].remove();
    });
  });

  const newWindow = window.open("", "_blank");
  newWindow.document.write(`
    <html>
    <head>
      <title>Salary Structure</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 13px; }
        th { background-color: #f4f4f4; font-weight: bold; }
        tr:nth-child(even) { background-color: #fafafa; }
      </style>
    </head>
    <body>
      <h2>Employee Salary Structure</h2>
      ${table.outerHTML}
    </body>
    </html>
  `);

  newWindow.document.close();
  newWindow.print();
};


const handleDownload = () => {
  if (allFilteredEmployees.length === 0) {
    window.alert("No salary structure records found!");
    return;
  }

  const data = allFilteredEmployees.map((emp, index) => ({
    "S.No": index + 1,
    "Employee ID": emp.emp_id,
    "Employee Name": `${emp.first_name} ${emp.last_name}`,
    "Department": emp.department,
    "Designation": emp.designation,
    "Email": emp.email || "N/A",
    "Mobile": emp.phone || "N/A",
    "Status": emp.is_active ? "Active" : "Inactive",
  }));

  const ws = XLSX.utils.json_to_sheet(data);

  const range = XLSX.utils.decode_range(ws["!ref"]);

  // Header styling (same as EmpList)
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellRef]) continue;
    ws[cellRef].s = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
      fill: { fgColor: { rgb: "2B5797" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "999999" } },
        bottom: { style: "thin", color: { rgb: "999999" } },
        left: { style: "thin", color: { rgb: "999999" } },
        right: { style: "thin", color: { rgb: "999999" } }
      }
    };
  }

  // Column widths
  ws["!cols"] = [
    { wch: 6 },   // S.No
    { wch: 18 },  // Employee ID
    { wch: 28 },  // Name
    { wch: 20 },  // Department
    { wch: 20 },  // Designation
    { wch: 15 },  // Basic
    { wch: 10 },  // HRA
    { wch: 10 },  // DA
    { wch: 10 },  // TA
    { wch: 15 },  // Gross
    { wch: 15 },  // Net
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Salary Structure");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([wbout], { type: "application/octet-stream" }), "Salary_Structure.xlsx");
};


  // Function to handle setting salary structure
  const handleSetSalaryStructure = (employee) => {
    setSelectedEmployee(employee);
    setShowSalaryForm(true);
    
    // --- DEBUGGING LOGS ---
    // Open your browser's developer console (usually with F12) to see these logs
    console.log("Selected Employee Department:", employee.department);
    // --- END DEBUGGING LOGS ---

    // *** FIX: Check the 'department' field for specific names ***
    const departmentName = employee.department?.trim().toLowerCase();
    const isMarketingOrSales = departmentName === 'sales department' || departmentName === 'marketing department';
    
    // Reset salary structure type based on employee department
    if (isMarketingOrSales) {
      setSalaryStructureType('other'); // Marketing/Sales uses 'other' type with special components
    } else {
      setSalaryStructureType('government'); // Default for others
    }
    
    // Reset performance bonus input
    setPerformanceBonusInput('');
    
    // Reset client-related values
    setNumberOfClients(0);
    setPerClientBonus(2000);
    
    // Fetch employee salary data
    fetchEmployeeSalary(employee.emp_id);
  };
  
  // Function to go back to employee list
  const handleBackToList = () => {
    setSelectedEmployee(null);
    setShowSalaryForm(false);
    setEmployeeSalaryData(null);
    setSaveError(null);
    setCityType('metro'); // Reset to default
    setSalaryStructureType('government'); // Reset to default
    setClients([]); // Clear clients
    setClientBonus(0); // Reset client bonus
    setPerformanceBonusInput(''); // Reset performance bonus
    setNumberOfClients(0); // Reset number of clients
    setPerClientBonus(2000); // Reset per-client bonus
  };

  // Calculate total earnings and deductions
  const totalEarnings = useMemo(() => {
    return Object.entries(salaryStructure)
      .filter(([key]) => ['basic', 'hra', 'da', 'ta', 'medical', 'special', 'marketing_perks', 'performance_bonus'].includes(key))
      .reduce((sum, [_, value]) => sum + (parseFloat(value) || 0), 0);
  }, [salaryStructure]);

  const totalDeductions = useMemo(() => {
    return Object.entries(salaryStructure)
      .filter(([key]) => ['pf', 'esi', 'tds', 'other_deductions'].includes(key))
      .reduce((sum, [_, value]) => sum + (parseFloat(value) || 0), 0);
  }, [salaryStructure]);

  const calculatedNetSalary = useMemo(() => {
    return totalEarnings - totalDeductions + parseFloat(clientBonus || 0);
  }, [totalEarnings, totalDeductions, clientBonus]);

  // Function to save salary structure
  const handleSaveSalaryStructure = async () => {
    setSaveLoading(true);
    setSaveError(null);
    
    try {
      // Get user unique_id from AuthContext
      const userUniqueId = user?.unique_id || null;
      
      if (!userUniqueId) {
        setSaveError("User authentication error. Please log in again.");
        setSaveLoading(false);
        return;
      }
      
      // Get selected employee ID - using multiple possible field names
      const employeeId = selectedEmployee?.emp_id || selectedEmployee?.employee_id || selectedEmployee?.id || null;
      
      if (!employeeId) {
        setSaveError("Employee ID not found. Please select an employee again.");
        setSaveLoading(false);
        return;
      }
      
      // Format totals to ensure they meet requirements
      const formattedTotalEarnings = formatCurrencyValue(totalEarnings);
      const formattedTotalDeductions = formatCurrencyValue(totalDeductions);
      const formattedNetSalary = formatCurrencyValue(calculatedNetSalary);
      
      // Determine which salary structure to use
      const departmentName = selectedEmployee?.department?.trim().toLowerCase();
      const isMarketingOrSales = departmentName === 'sales department' || departmentName === 'marketing department';
      
      // Create base data object that will be sent for all structure types
      let salaryData = {
        // Employee information
        employee_id: employeeId,
        city_type: cityType,
        salary_structure_type: salaryStructureType,
        // Totals - using formatted values
        total_earnings: parseFloat(formattedTotalEarnings),
        total_deductions: parseFloat(formattedTotalDeductions),
        net_salary: parseFloat(formattedNetSalary),
        created_by: userUniqueId
      };
      
      // Add fields based on salary structure type
      if (salaryStructureType === 'government') {
        // Government structure specific fields
        salaryData = {
          ...salaryData,
          // Earnings
          basic_salary: parseFloat(salaryStructure.basic),
          hra: parseFloat(salaryStructure.hra),
          da: parseFloat(salaryStructure.da),
          ta: parseFloat(salaryStructure.ta),
          medical_allowance: parseFloat(salaryStructure.medical),
          special_allowance: parseFloat(salaryStructure.special),
          // Deductions
          pf: parseFloat(salaryStructure.pf),
          esi: parseFloat(salaryStructure.esi),
          tds: parseFloat(salaryStructure.tds),
          other_deductions: parseFloat(salaryStructure.other_deductions)
        };
      } else if (isMarketingOrSales) {
        // Marketing & Sales structure specific fields
        salaryData = {
          ...salaryData,
          // Earnings
          basic_salary: parseFloat(salaryStructure.basic),
          hra: parseFloat(salaryStructure.hra),
          medical_allowance: parseFloat(salaryStructure.medical),
          special_allowance: parseFloat(salaryStructure.special),
          marketing_perks: parseFloat(salaryStructure.marketing_perks),
          performance_bonus: parseFloat(salaryStructure.performance_bonus),
          // Deductions
          pf: parseFloat(salaryStructure.pf),
          other_deductions: parseFloat(salaryStructure.other_deductions),
          // Client related data
          client_bonus: parseFloat(clientBonus) || 0,
          number_of_clients: parseInt(numberOfClients) || 0,
          per_client_bonus: parseFloat(perClientBonus) || 0
        };
      } else {
        // Other structure specific fields
        salaryData = {
          ...salaryData,
          // Earnings
          basic_salary: parseFloat(salaryStructure.basic),
          hra: parseFloat(salaryStructure.hra),
          medical_allowance: parseFloat(salaryStructure.medical),
          special_allowance: parseFloat(salaryStructure.special),
          performance_bonus: parseFloat(salaryStructure.performance_bonus),
          // Deductions
          pf: parseFloat(salaryStructure.pf),
          other_deductions: parseFloat(salaryStructure.other_deductions)
        };
      }
      
      console.log('Sending salary data:', salaryData); // For debugging
      
      // Make API call to save salary structure
      const response = await axios.post(
        'https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/salary-structure/',
        salaryData,
        { withCredentials: true }
      );
      
      if (response.data && response.data.success) {
        alert('Salary structure saved successfully!');
        // Update the salary status for this employee to confirmed
        setSalaryStatuses(prev => ({
          ...prev,
          [employeeId]: 'confirmed'
        }));
        handleBackToList();
      } else {
        setSaveError(response.data.message || "Failed to save salary structure");
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || err.message || "Failed to save salary structure");
      console.error("Error saving salary structure:", err);
    } finally {
      setSaveLoading(false);
    }
  };

  // Function to add a new client
  const handleAddClient = () => {
    if (newClient.name && newClient.value && newClient.bonus) {
      setClients([...clients, { ...newClient, id: Date.now() }]);
      setNewClient({ name: '', value: '', bonus: '' });
      
      // Calculate total client bonus
      const totalBonus = [...clients, { ...newClient, id: Date.now() }]
        .reduce((sum, client) => sum + parseFloat(client.bonus), 0);
      setClientBonus(totalBonus);
    }
  };

  // Function to remove a client
  const handleRemoveClient = (clientId) => {
    const updatedClients = clients.filter(client => client.id !== clientId);
    setClients(updatedClients);
    
    // Recalculate total client bonus
    const totalBonus = updatedClients.reduce((sum, client) => sum + parseFloat(client.bonus), 0);
    setClientBonus(totalBonus);
  };

  // Filter employees based on search term and status
  const allFilteredEmployees = useMemo(() => {
    let filtered = employees;
    
    // Apply employee status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => {
        if (statusFilter === 'active') {
          return emp.is_active === true;
        } else if (statusFilter === 'inactive') {
          return emp.is_active === false;
        }
        return true;
      });
    }
    
    // Apply salary status filter
    if (salaryStatusFilter !== 'all') {
      filtered = filtered.filter(emp => {
        const empSalaryStatus = salaryStatuses[emp.emp_id];
        if (salaryStatusFilter === 'confirmed') {
          return empSalaryStatus === 'confirmed';
        } else if (salaryStatusFilter === 'unconfirmed') {
          return empSalaryStatus === 'unconfirmed';
        }
        return true;
      });
    }
    
    // Apply search filter
    if (!searchTerm) {
      return filtered;
    }
    
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return filtered.filter(emp =>
      emp.first_name?.toLowerCase().includes(lowercasedSearchTerm) ||
      emp.last_name?.toLowerCase().includes(lowercasedSearchTerm) ||
      emp.email?.toLowerCase().includes(lowercasedSearchTerm) ||
      emp.emp_id?.toLowerCase().includes(lowercasedSearchTerm) ||
      emp.phone?.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [employees, searchTerm, statusFilter, salaryStatusFilter, salaryStatuses]);

  // Reset page on search or status filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, salaryStatusFilter]);

  // Get current page's employees
  const paginatedEmployees = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return allFilteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
  }, [allFilteredEmployees, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(allFilteredEmployees.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Get page numbers to display
  const getVisiblePageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const baseUrl = 'https://mahadevaaya.com/brainrock.in/brainrock/backendbr';

  // If showing salary form, render salary structure form
  if (showSalaryForm && selectedEmployee) {
    // *** FIX: Check the 'department' field for specific names ***
    const departmentName = selectedEmployee?.department?.trim().toLowerCase();
    const isMarketingOrSales = departmentName === 'sales department' || departmentName === 'marketing department';
    const isOtherStructure = salaryStructureType === 'other';
    const isGovernmentStructure = salaryStructureType === 'government';
    
    // Marketing fields should only show when both: employee is in marketing/sales AND structure type is "other"
    const showMarketingFields = isMarketingOrSales && isOtherStructure;
    
    return (
      <div className="dashboard-container">
        <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="main-content">
          <HrHeader toggleSidebar={toggleSidebar} />
          
          <Container fluid className="dashboard-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">View Salary Structure</h2>
              {isAdmin && (
                <Button variant="secondary" onClick={handleBackToList}>
                  Back to Employee List
                </Button>
              )}
            </div>
            
            <Card className="p-4">
              <h4 className="mb-4">
                Employee: {selectedEmployee.first_name} {selectedEmployee.last_name} ({selectedEmployee.emp_id})
              </h4>
              
              {salaryLoading && <div className="d-flex justify-content-center mb-3"><Spinner animation="border" /></div>}
              {salaryError && <Alert variant="danger">{salaryError}</Alert>}
              
              {saveError && <Alert variant="danger">{saveError}</Alert>}
              
              {employeeSalaryData && (
                <>
                  <Tabs defaultActiveKey="salary" id="salary-tabs" className="mb-4">
                    <Tab eventKey="salary" title="Salary Structure">
                      <Row className="mb-4">
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Employee Annual CTC (from System)</Form.Label>
                            <InputGroup>
                              <InputGroup.Text>₹</InputGroup.Text>
                              <Form.Control
                                type="text"
                                value={formatCurrencyValue(employeeSalaryData.salary)}
                                disabled
                              />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>Salary Structure Type</Form.Label>
                            <Form.Select 
                              value={salaryStructureType} 
                              onChange={(e) => {
                                setSalaryStructureType(e.target.value);
                                // Reset performance bonus when structure type changes
                                setPerformanceBonusInput('');
                                // Recalculate salary structure when type changes
                                if (employeeSalaryData && employeeSalaryData.salary) {
                                  const annualCTC = parseFloat(employeeSalaryData.salary);
                                  setTimeout(() => calculateSalaryStructure(annualCTC), 0);
                                }
                              }}
                              disabled={!isAdmin}
                            >
                              <option value="government">Government</option>
                              <option value="other">Other</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>City Type</Form.Label>
                            <Form.Select 
                              value={cityType} 
                              onChange={(e) => {
                                setCityType(e.target.value);
                                // Recalculate salary structure when city type changes
                                if (employeeSalaryData && employeeSalaryData.salary) {
                                  const annualCTC = parseFloat(employeeSalaryData.salary);
                                  setTimeout(() => calculateSalaryStructure(annualCTC), 0);
                                }
                              }}
                             
                            >
                              <option value="metro">Metro City</option>
                              <option value="nonMetro">Non-Metro City</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col md={6}>
                          <h5 className="mb-3">Earnings</h5>
                          <Form>
                            <Form.Group className="mb-3">
                              <Form.Label>Basic Salary (40% of CTC)</Form.Label>
                              <InputGroup>
                                <InputGroup.Text>₹</InputGroup.Text>
                                <Form.Control
                                  type="text"
                                  name="basic"
                                  value={salaryStructure.basic}
                                  disabled
                                />
                              </InputGroup>
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>HRA ({isGovernmentStructure ? '20% of Gross' : (cityType === 'metro' ? '50%' : '40%') + ' of Basic'})</Form.Label>
                              <InputGroup>
                                <InputGroup.Text>₹</InputGroup.Text>
                                <Form.Control
                                  type="text"
                                  name="hra"
                                  value={salaryStructure.hra}
                                  disabled
                                />
                              </InputGroup>
                            </Form.Group>
                            
                            {/* Government specific fields */}
                            {isGovernmentStructure && (
                              <>
                                <Form.Group className="mb-3">
                                  <Form.Label>DA (10% of Gross)</Form.Label>
                                  <InputGroup>
                                    <InputGroup.Text>₹</InputGroup.Text>
                                    <Form.Control
                                      type="text"
                                      name="da"
                                      value={salaryStructure.da}
                                      disabled
                                    />
                                  </InputGroup>
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                  <Form.Label>TA (5% of Gross)</Form.Label>
                                  <InputGroup>
                                    <InputGroup.Text>₹</InputGroup.Text>
                                    <Form.Control
                                      type="text"
                                      name="ta"
                                      value={salaryStructure.ta}
                                      disabled
                                    />
                                  </InputGroup>
                                </Form.Group>
                              </>
                            )}
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Medical Allowance (5% of CTC)</Form.Label>
                              <InputGroup>
                                <InputGroup.Text>₹</InputGroup.Text>
                                <Form.Control
                                  type="text"
                                  name="medical"
                                  value={salaryStructure.medical}
                                  disabled
                                />
                              </InputGroup>
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Special Allowance ({isGovernmentStructure ? '20% of Gross' : (isMarketingOrSales ? '29%' : '35%') + ' of CTC'})</Form.Label>
                              <InputGroup>
                                <InputGroup.Text>₹</InputGroup.Text>
                                <Form.Control
                                  type="text"
                                  name="special"
                                  value={salaryStructure.special}
                                  disabled
                                />
                              </InputGroup>
                            </Form.Group>
                            
                            {/* Marketing specific fields - Only show when both conditions are met */}
                            {showMarketingFields && (
                              <>
                                <Form.Group className="mb-3">
                                  <Form.Label>Marketing Perks (Editable)</Form.Label>
                                  <InputGroup>
                                    <InputGroup.Text>₹</InputGroup.Text>
                                    <Form.Control
                                      type="text"
                                      name="marketing_perks"
                                      value={salaryStructure.marketing_perks}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setSalaryStructure(prev => ({
                                          ...prev,
                                          marketing_perks: value
                                        }));
                                      }}
                                      disabled={!isAdmin}
                                    />
                                  </InputGroup>
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                  <Form.Label>Number of Clients</Form.Label>
                                  <Form.Control
                                    type="number"
                                    value={numberOfClients}
                                    onChange={(e) => setNumberOfClients(parseInt(e.target.value) || 0)}
                                    min="0"
                                    disabled={!isAdmin}
                                  />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                  <Form.Label>Bonus Per Client (₹)</Form.Label>
                                  <InputGroup>
                                    <InputGroup.Text>₹</InputGroup.Text>
                                    <Form.Control
                                      type="text"
                                      value={perClientBonus}
                                      onChange={(e) => setPerClientBonus(parseFloat(e.target.value) || 0)}
                                      disabled={!isAdmin}
                                    />
                                  </InputGroup>
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                  <Form.Label>Client Perks (Calculated)</Form.Label>
                                  <InputGroup>
                                    <InputGroup.Text>₹</InputGroup.Text>
                                    <Form.Control
                                      type="text"
                                      value={formatCurrencyValue(clientPerks)}
                                      disabled
                                    />
                                  </InputGroup>
                                </Form.Group>
                              </>
                            )}
                            
                            {/* Performance Bonus - Only show for "other" structure type */}
                            {isOtherStructure && (
                              <Form.Group className="mb-3">
                                <Form.Label>Performance Bonus (Editable)</Form.Label>
                                <InputGroup>
                                  <InputGroup.Text>₹</InputGroup.Text>
                                  <Form.Control
                                    type="text"
                                    name="performance_bonus"
                                    value={performanceBonusInput}
                                    onChange={(e) => {
                                      setPerformanceBonusInput(e.target.value);
                                      // Recalculate when performance bonus changes
                                      if (employeeSalaryData && employeeSalaryData.salary) {
                                        const annualCTC = parseFloat(employeeSalaryData.salary);
                                        setTimeout(() => calculateSalaryStructure(annualCTC), 0);
                                      }
                                    }}
                                    placeholder="Enter performance bonus"
                                    disabled={!isAdmin}
                                  />
                                </InputGroup>
                              </Form.Group>
                            )}
                          </Form>
                        </Col>
                        
                        <Col md={6}>
                          <h5 className="mb-3">Deductions</h5>
                          <Form>
                            <Form.Group className="mb-3">
                              <Form.Label>PF (12% of Basic)</Form.Label>
                              <InputGroup>
                                <InputGroup.Text>₹</InputGroup.Text>
                                <Form.Control
                                  type="text"
                                  name="pf"
                                  value={salaryStructure.pf}
                                  disabled
                                />
                              </InputGroup>
                            </Form.Group>
                            
                            {/* Government specific deduction fields */}
                            {isGovernmentStructure && (
                              <>
                                <Form.Group className="mb-3">
                                  <Form.Label>ESI (0.75% of Gross)</Form.Label>
                                  <InputGroup>
                                    <InputGroup.Text>₹</InputGroup.Text>
                                    <Form.Control
                                      type="text"
                                      name="esi"
                                      value={salaryStructure.esi}
                                      disabled
                                    />
                                  </InputGroup>
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                  <Form.Label>TDS (Based on Annual Salary)</Form.Label>
                                  <InputGroup>
                                    <InputGroup.Text>₹</InputGroup.Text>
                                    <Form.Control
                                      type="text"
                                      name="tds"
                                      value={salaryStructure.tds}
                                      disabled
                                    />
                                  </InputGroup>
                                </Form.Group>
                              </>
                            )}
                            
                            <Form.Group className="mb-3">
                              <Form.Label>Other Deductions</Form.Label>
                              <InputGroup>
                                <InputGroup.Text>₹</InputGroup.Text>
                                <Form.Control
                                  type="text"
                                  name="other_deductions"
                                  value={salaryStructure.other_deductions}
                                  disabled
                                />
                              </InputGroup>
                            </Form.Group>
                          </Form>
                          
                          <div className="mt-4">
                            <h5 className="mb-3">Summary</h5>
                            <Table striped bordered>
                              <tbody>
                                <tr>
                                  <td><strong>Total Earnings:</strong></td>
                                  <td>₹{formatCurrencyValue(totalEarnings)}</td>
                                </tr>
                                <tr>
                                  <td><strong>Total Deductions:</strong></td>
                                  <td>₹{formatCurrencyValue(totalDeductions)}</td>
                                </tr>
                                {showMarketingFields && (
                                  <>
                                    <tr>
                                      <td><strong>Client Perks ({numberOfClients} × ₹{perClientBonus}):</strong></td>
                                      <td>₹{formatCurrencyValue(clientPerks)}</td>
                                    </tr>
                                  </>
                                )}
                                {clientBonus > 0 && (
                                  <tr>
                                    <td><strong>Total Client Bonus:</strong></td>
                                    <td>₹{formatCurrencyValue(clientBonus)}</td>
                                  </tr>
                                )}
                                <tr className="table-info">
                                  <td><strong>Net Salary:</strong></td>
                                  <td><strong>₹{formatCurrencyValue(calculatedNetSalary)}</strong></td>
                                </tr>
                              </tbody>
                            </Table>
                          </div>
                        </Col>
                      </Row>
                    </Tab>
                  </Tabs>
                </>
              )}
              
              {isAdmin && (
                <div className="d-flex justify-content-center mt-4">
                  <Button 
                    variant="primary" 
                    onClick={handleSaveSalaryStructure}
                    disabled={salaryLoading || saveLoading || salaryStatuses[selectedEmployee.emp_id] === 'confirmed'}
                  >
                    {saveLoading ? <Spinner as="span" animation="border" size="sm" /> : null}
                    {salaryStatuses[selectedEmployee.emp_id] === 'confirmed' ? 'Salary Structure Already Confirmed' : 'Save Salary Structure'}
                  </Button>
                </div>
              )}
            </Card>
          </Container>
        </div>
      </div>
    );
  }

  // If user is an employee but we don't have their data yet, show loading
  if (!isAdmin && !employeeData && loading) {
    return (
      <div className="dashboard-container">
        <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="main-content">
          <HrHeader toggleSidebar={toggleSidebar} />
          
          <Container fluid className="dashboard-body p-4">
            <div className="d-flex justify-content-center">
              <Spinner animation="border" />
            </div>
          </Container>
        </div>
      </div>
    );
  }

  // Otherwise, render employee list
  return (
    <div className="dashboard-container">
      <SideNav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="main-content">
        <HrHeader toggleSidebar={toggleSidebar} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        <Container fluid className="dashboard-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Employee List</h2>
            
            {/* Filter Dropdowns */}
            <div className="d-flex align-items-center gap-3">
              {/* Employee Status Filter */}
              <div className="d-flex align-items-center">
                <span className="me-2">Employee Status:</span>
                <Form.Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Employees</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </div>
              
              {/* Salary Status Filter */}
              <div className="d-flex align-items-center">
                <span className="me-2">Salary Status:</span>
                <Form.Select 
                  value={salaryStatusFilter} 
                  onChange={(e) => setSalaryStatusFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="unconfirmed">Unconfirmed</option>
                </Form.Select>
              </div>
            </div>
          </div>

           <div className="mt-2 vmb-2 text-end">
                        <Button variant="" size="sm" className="mx-2 print-btn" onClick={handlePrint}>
                          <FaPrint /> Print
                        </Button>
          
                        <Button variant="" size="sm" className="download-btn" onClick={handleDownload}>
                          <FaFileExcel />Download
                        </Button>
                      </div>
          
          {loading && <div className="d-flex justify-content-center"><Spinner animation="border" /></div>}
          {error && <Alert variant="danger">Failed to load employees: {error}</Alert>}

          {!loading && !error && (
            <>
              {/* --- YOUR CUSTOM TABLE STRUCTURE --- */}
              <Row className="mt-3">
                <div className="col-md-12">
                  <table className="temp-rwd-table">
                    <tbody>
                      <tr>
                        <th>S.No</th>
                        <th>Photo</th>
                        <th>Employee ID</th>
                        <th>Employee Name</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Status</th>
                        <th>Salary Status</th>
                        <th>Action</th>
                      </tr>
 
                      {paginatedEmployees.length > 0 ? (
                        paginatedEmployees.map((emp, index) => (
                          <tr key={emp.id}>
                            <td data-th="S.No">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                            <td data-th="Photo">
                               {emp.profile_photo ? (
                                    <Image src={`${baseUrl}${emp.profile_photo}`} roundedCircle width={40} height={40} />
                                ) : (
                                    <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                                        {emp.first_name?.[0]}{emp.last_name?.[0]}
                                    </div>
                                )}
                            </td>
                            <td data-th="Employee ID">{emp.emp_id || "N/A"}</td>
                            <td data-th="Employee Name">{emp.first_name} {emp.last_name}</td>
                            <td data-th="Department">{emp.department || "N/A"}</td>
                            <td data-th="Designation">{emp.designation || "N/A"}</td>
                            <td data-th="Email">{emp.email || "N/A"}</td>
                            <td data-th="Mobile">{emp.phone || "N/A"}</td>
                            <td data-th="Status">
                              <Badge bg={emp.is_active ? "success" : "secondary"}>
                                {emp.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td data-th="Salary Status">
                              <Badge bg={salaryStatuses[emp.emp_id] === 'confirmed' ? "success" : "warning"}>
                                {salaryStatuses[emp.emp_id] === 'confirmed' ? 'Confirmed' : 'Unconfirmed'}
                              </Badge>
                            </td>
                            <td data-th="Action">
                              <Button 
                              className="big-edit-btn"
                                variant="primary" 
                                size="sm"
                                onClick={() => handleSetSalaryStructure(emp)}
                                disabled={salaryStatuses[emp.emp_id] === 'confirmed'}
                              >
                                <AiFillEdit /> {salaryStatuses[emp.emp_id] === 'confirmed' ? 'View Salary ' : 'Set Salary '}
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="11" className="text-center">
                            No employees found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Row>
              
              {/* --- Pagination Controls --- */}
              {allFilteredEmployees.length > 0 && (
                <div className="d-flex justify-content-center align-items-center mt-4">
                  
                
                  <Pagination>
                    <Pagination.Prev 
                      onClick={() => handlePageChange(currentPage - 1)} 
                      disabled={currentPage === 1}
                    />
                    
                    {getVisiblePageNumbers().map((page, index) => (
                      page === '...' ? (
                        <Pagination.Item key={`ellipsis-${index}`} disabled>
                          ...
                        </Pagination.Item>
                      ) : (
                        <Pagination.Item 
                          key={page} 
                          active={page === currentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      )
                    ))}
                    
                    <Pagination.Next 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Container>
      </div>
    </div>
  );
};

export default SalaryStructure;