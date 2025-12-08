import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext"; 
 
const SalaryCalculation = ({ employee }) => {
  // Get user data from AuthContext
  const { user } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [gender, setGender] = useState(null);
  const [apiSalary, setApiSalary] = useState(null);
  const [monthlySalary, setMonthlySalary] = useState(null);
  const [joiningDate, setJoiningDate] = useState(null);
  const [salaryStructure, setSalaryStructure] = useState(null);
  const [hasSalaryStructure, setHasSalaryStructure] = useState(false);
  
  // State for save operation
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [saveError, setSaveError] = useState(null);
 
  const BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";
 
  // Axios instance with credentials
  const axiosInstance = useMemo(() => axios.create({
    baseURL: `${BASE_URL}/api/`,
    withCredentials: true,
  }), [BASE_URL]);
  const isAdmin = user && user.role === 'hr';
  // Function to determine if a leave is without pay
  const isWithoutPay = (leave) => {
    // Check if leave type is 'without pay' or 'without_pay'
    return leave.leave_type === 'without pay' ||
           leave.leave_type === 'without_pay' ||
           leave.leave_type === 'withoutpay';
  };
  
  // Calculate salary-related values using useMemo to avoid recalculations
  const salaryCalculations = useMemo(() => {
    if (!monthlySalary || !leaveBalance || !leaveHistory) return null;
    
    // Use basic salary from salary structure for EL, maternity, and paternity leave calculations
    const basicSalaryForSpecialLeaves = hasSalaryStructure && salaryStructure ? 
      parseFloat(salaryStructure.basic_salary) : 25000;
   
    // Calculate per day salary (assuming 26 working days in a month)
    const perDaySalaryForSpecialLeaves = basicSalaryForSpecialLeaves / 26;
   
    // Calculate per day salary for regular salary
    const perDaySalaryRegular = monthlySalary / 26;
   
    // Calculate total leave days taken in current month (only approved leaves)
    const totalLeaveDays = leaveHistory.reduce((total, leave) => {
      // Only count approved leaves
      if (leave.status === 'approved') {
        return total + (leave.leave_days || 0);
      }
      return total;
    }, 0);
   
    // Use without_pay value from leaveBalance as authoritative source
    const unpaidLeaveDays = leaveBalance ? leaveBalance.without_pay || 0 : 0;
   
    // Calculate earned leave days taken (only approved earned_leave)
    const earnedLeaveDaysTaken = leaveHistory.reduce((total, leave) => {
      // Only count approved earned leaves
      if (leave.status === 'approved' && (leave.leave_type === 'earned leave' || leave.leave_type === 'earned_leave')) {
        return total + (leave.leave_days || 0);
      }
      return total;
    }, 0);
   
    // Calculate salary deduction for unpaid leaves (using regular salary)
    const unpaidLeaveDeduction = unpaidLeaveDays * perDaySalaryRegular;
   
    // Calculate maternity leave deductions (only approved)
    const maternityLeaveDays = leaveHistory.reduce((total, leave) => {
      if (leave.leave_type === 'maternity_leave' && leave.status === 'approved') {
        return total + (leave.leave_days || 0);
      }
      return total;
    }, 0);
   
    // Calculate paternity leave days (only approved)
    const paternityLeaveDays = leaveHistory.reduce((total, leave) => {
      if (leave.leave_type === 'paternity_leave' && leave.status === 'approved') {
        return total + (leave.leave_days || 0);
      }
      return total;
    }, 0);
   
    // Maternity leave deduction uses basic salary from salary structure
    const maternityLeaveDeduction = maternityLeaveDays * perDaySalaryForSpecialLeaves;
   
    // Calculate earned leave (will be added in December)
    const earnedLeave = leaveBalance ? leaveBalance.earned_leave : 0;
   
    // Calculate total deductions (excluding earned leaves and paternity leave)
    const totalDeductions = unpaidLeaveDeduction + maternityLeaveDeduction;
   
    // UPDATED LOGIC: Calculate prorated salary for employees who joined after the 1st of any month
    let proratedSalary = monthlySalary;
    let proratedDays = 0; // This will now represent PAYABLE working days
    let isProrated = false;
    let proratedExplanation = "Full month salary";
   
    if (joiningDate) {
      const joinDate = new Date(joiningDate);
      const joinYear = joinDate.getFullYear();
      const joinMonth = joinDate.getMonth();
      const joinDay = joinDate.getDate();
     
      // If employee joined on any day other than the 1st, their salary is prorated
      if (joinDay > 1) {
        isProrated = true;
        const daysInMonth = new Date(joinYear, joinMonth + 1, 0).getDate();
        
        let payableDays = 0;
        // Loop from the joining day to the end of the month
        for (let day = joinDay; day <= daysInMonth; day++) {
          const dayDate = new Date(joinYear, joinMonth, day);
          // getDay() returns 0 for Sunday, 1 for Monday, etc.
          // We only count days that are not Sundays.
          if (dayDate.getDay() !== 0) {
            payableDays++;
          }
        }
        
        proratedDays = payableDays;
        // Calculate per-day salary based on the total days in the month
        const perDaySalary = monthlySalary / daysInMonth;
        proratedSalary = perDaySalary * proratedDays;
        
        proratedExplanation = `Prorated for ${proratedDays} working days (joined on ${joinDate.toLocaleDateString()}, Sundays excluded)`;
      }
    }
   
    // Calculate net salary (use prorated salary if applicable)
    const netSalary = proratedSalary - totalDeductions;
   
    // Calculate days worked in current month
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const daysWorked = isProrated ? proratedDays - totalLeaveDays : daysInMonth - totalLeaveDays;
   
    // Get current month to check if it's December (when EL is added)
    const currentMonth = new Date().getMonth();
    const isDecember = currentMonth === 11; // 0-indexed, so 11 = December
   
    // Calculate EL value to be added at end of financial year
    const elValueAtYearEnd = earnedLeave * perDaySalaryForSpecialLeaves;
    
    // Calculate EL value per day
    const elValue = perDaySalaryForSpecialLeaves;
   
    // Calculate total salary including EL at year end (only in December)
    const totalSalaryWithEL = isDecember ? netSalary + elValueAtYearEnd : netSalary;
    
    return {
      basicSalaryForSpecialLeaves,
      perDaySalaryForSpecialLeaves,
      perDaySalaryRegular,
      totalLeaveDays,
      unpaidLeaveDays,
      earnedLeaveDaysTaken,
      unpaidLeaveDeduction,
      maternityLeaveDays,
      paternityLeaveDays,
      maternityLeaveDeduction,
      earnedLeave,
      totalDeductions,
      proratedSalary,
      proratedDays,
      isProrated,
      proratedExplanation,
      netSalary,
      daysWorked,
      isDecember,
      elValueAtYearEnd,
      elValue,
      totalSalaryWithEL
    };
  }, [monthlySalary, leaveBalance, leaveHistory, hasSalaryStructure, salaryStructure, joiningDate]);
  
  // Function to post salary calculation data
  const postSalaryCalculation = async () => {
    setSaveLoading(true);
    setSaveSuccess(null);
    setSaveError(null);
    
    try {
      // Get user unique_id from AuthContext
      const userUniqueId = user?.unique_id || null;
      
      if (!userUniqueId) {
        setSaveError("User authentication error. Please log in again.");
        setSaveLoading(false);
        return;
      }
      
      // Get selected employee ID
      const employeeId = employee?.emp_id || employee?.employee_id || employee?.id || null;
      
      if (!employeeId) {
        setSaveError("Employee ID not found. Please select an employee again.");
        setSaveLoading(false);
        return;
      }
      
      // Check if salary calculations are available
      if (!salaryCalculations) {
        setSaveError("Salary calculations not available. Please try again.");
        setSaveLoading(false);
        return;
      }
      
      // Prepare data for API - including ONLY the fields specified by the user
      const salaryCalculationData = {
        // Employee identification
        employee_id: employeeId,
        
        // Salary structure components
        basic_salary: hasSalaryStructure && salaryStructure ? 
          parseFloat(salaryStructure.basic_salary).toFixed(2) : "0.00",
        hra: hasSalaryStructure && salaryStructure ? 
          parseFloat(salaryStructure.hra).toFixed(2) : "0.00",
        da: hasSalaryStructure && salaryStructure && salaryStructure.da ? 
          parseFloat(salaryStructure.da).toFixed(2) : "0.00",
        ta: hasSalaryStructure && salaryStructure && salaryStructure.ta ? 
          parseFloat(salaryStructure.ta).toFixed(2) : "0.00",
        medical_allowance: hasSalaryStructure && salaryStructure ? 
          parseFloat(salaryStructure.medical_allowance).toFixed(2) : "0.00",
        special_allowance: hasSalaryStructure && salaryStructure ? 
          parseFloat(salaryStructure.special_allowance).toFixed(2) : "0.00",
        marketing_perks: hasSalaryStructure && salaryStructure && salaryStructure.marketing_perks ? 
          parseFloat(salaryStructure.marketing_perks).toFixed(2) : "0.00",
        performance_bonus: hasSalaryStructure && salaryStructure && salaryStructure.performance_bonus ? 
          parseFloat(salaryStructure.performance_bonus).toFixed(2) : "0.00",
        client_bonus: hasSalaryStructure && salaryStructure && salaryStructure.client_bonus ? 
          parseFloat(salaryStructure.client_bonus).toFixed(2) : "0.00",
        total_earnings: hasSalaryStructure && salaryStructure ? 
          parseFloat(salaryStructure.total_earnings).toFixed(2) : "0.00",
          
        // Deductions
        pf: hasSalaryStructure && salaryStructure ? 
          parseFloat(salaryStructure.pf).toFixed(2) : "0.00",
        esi: hasSalaryStructure && salaryStructure && salaryStructure.esi ? 
          parseFloat(salaryStructure.esi).toFixed(2) : "0.00",
        tds: hasSalaryStructure && salaryStructure && salaryStructure.tds ? 
          parseFloat(salaryStructure.tds).toFixed(2) : "0.00",
        other_deductions: hasSalaryStructure && salaryStructure ? 
          parseFloat(salaryStructure.other_deductions).toFixed(2) : "0.00",
          
        // Leave deductions
        unpaid_leave_deduction: salaryCalculations.unpaidLeaveDeduction.toFixed(2),
        maternity_leave_deduction: salaryCalculations.maternityLeaveDeduction.toFixed(2),
        
        // Total deductions
        total_deductions: ((hasSalaryStructure && salaryStructure ? 
          parseFloat(salaryStructure.total_deductions) : 0) + salaryCalculations.totalDeductions).toFixed(2),
          
        // Salary calculations
        monthly_salary: monthlySalary.toFixed(2),
        prorated_salary: salaryCalculations.proratedSalary.toFixed(2),
        is_prorated: salaryCalculations.isProrated,
        prorated_explanation: salaryCalculations.proratedExplanation,
        prorated_days: salaryCalculations.proratedDays,
        
        // Final calculations
        net_salary: salaryCalculations.netSalary.toFixed(2),
        earned_leave_balance: salaryCalculations.earnedLeave,
        el_value_at_year_end: salaryCalculations.elValueAtYearEnd.toFixed(2),
        el_value: salaryCalculations.elValue.toFixed(2),
        total_payout_including_el: salaryCalculations.totalSalaryWithEL.toFixed(2),
        
        // Metadata
        created_by: userUniqueId,
        calculation_date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
      };
      
      console.log('Sending salary calculation data:', salaryCalculationData); // For debugging
      
      // Make API call to save salary calculation
      const response = await axios.post(
        'https://mahadevaaya.com/brainrock.in/brainrock/backendbr/api/salary-calculation/',
        salaryCalculationData,
        { withCredentials: true }
      );
      
      if (response.data && response.data.success) {
        setSaveSuccess("Salary calculation saved successfully!");
      } else {
        setSaveError(response.data.message || "Failed to save salary calculation");
      }
    } catch (err) {
      setSaveError(err.response?.data?.message || err.message || "Failed to save salary calculation");
      console.error("Error saving salary calculation:", err);
    } finally {
      setSaveLoading(false);
    }
  };
 
  // Fetch employee Salary, gender data, and salary structure
  useEffect(() => {
    const fetchEmployeeSalary = async () => {
      try {
        // Fetch employee gender and Salary
        const salaryResponse = await axiosInstance.get(`get-employee-gender-salary/?employee_id=${employee.emp_id}`);
       
        // Fetch leave balance
        const leaveBalanceResponse = await axiosInstance.get(`leave-balance/?employee_id=${employee.emp_id}`);
       
        // Fetch salary structure
        const salaryStructureResponse = await axiosInstance.get(`salary-structure/?employee_id=${employee.emp_id}`);
       
        if (salaryResponse.data.success) {
          setSalaryData(salaryResponse.data.data);
          setGender(salaryResponse.data.data.gender);
          setApiSalary(salaryResponse.data.data.salary);
          // Fetch joining_date directly from API response
          setJoiningDate(salaryResponse.data.data.joining_date);
        }
       
        if (leaveBalanceResponse.data) {
          setLeaveBalance(leaveBalanceResponse.data.leave_balance);
          setLeaveHistory(leaveBalanceResponse.data.leave_history || []);
        }
       
        // Check if salary structure data exists
        if (salaryStructureResponse.data && salaryStructureResponse.data.data && salaryStructureResponse.data.data.length > 0) {
          const structureData = salaryStructureResponse.data.data[0];
          setSalaryStructure(structureData);
          setHasSalaryStructure(true);
          
          // Use net salary from API as monthly salary
          const netSalaryFromApi = parseFloat(structureData.net_salary) || 0;
          setMonthlySalary(netSalaryFromApi);
        } else {
          setHasSalaryStructure(false);
          
          // Calculate monthly Salary from API salary (assuming annual salary)
          const annualSalary = salaryResponse.data.data.salary || 0;
          const calculatedMonthlySalary = annualSalary / 12;
          setMonthlySalary(calculatedMonthlySalary);
        }
       
      } catch (err) {
        console.error("Error fetching employee salary data:", err);
        setError("Failed to fetch employee salary data");
      } finally {
        setLoading(false);
      }
    };
 
    if (employee && employee.emp_id) {
      fetchEmployeeSalary();
    }
  }, [employee, axiosInstance]);
 
  // Create Employee Info rows
  const employeeInfoRows = [
    { label: "Employee ID", value: employee?.emp_id || 'N/A' },
    { label: "Name", value: employee ? `${employee.first_name} ${employee.last_name}` : 'N/A' },
    { label: "Gender", value: gender || 'N/A' },
    { label: "Department", value: employee?.department || 'N/A' },
    { label: "Designation", value: employee?.designation || 'N/A' },
    { label: "Joining Date", value: joiningDate ? new Date(joiningDate).toLocaleDateString() : 'N/A' },
    { label: "Annual Salary", value: `₹${apiSalary ? apiSalary.toFixed(2) : 'N/A'}` },
    { label: "Monthly Salary", value: `₹${monthlySalary ? monthlySalary.toFixed(2) : 'N/A'}` },
    { label: "Salary Structure Status", value: (
      <Badge bg={hasSalaryStructure ? 'success' : 'warning'}>
        {hasSalaryStructure ? 'Configured' : 'Not Configured'}
      </Badge>
    )},
  ];
 
  // Create Leave Balance rows
  const leaveBalanceRows = [
    { label: "Without Pay Leave", value: leaveBalance?.without_pay || 0 },
    { label: "Casual Leave ", value: leaveBalance?.casual_leave || 0 },
    { label: "Earned Leave", value: leaveBalance?.earned_leave || 0 },
    ...(gender === 'Female' ? [{ label: "Maternity Leave", value: leaveBalance?.maternity_leave || 0 }] : []),
    ...(gender === 'Male' ? [{ label: "Paternity Leave", value: leaveBalance?.paternity_leave || 0 }] : []),
    { label: "Paid Leave", value: leaveBalance?.paid_leave || 0 },
    {
      label: "Status",
      value: (
        <Badge bg={leaveBalance?.status === 'approved' ? 'success' : 'warning'}>
          {leaveBalance?.status || 'N/A'}
        </Badge>
      )
    }
  ];
 
  // Create Salary Calculation rows with salary structure components
  const salaryCalculationRows = useMemo(() => {
    if (!salaryCalculations) return [];
    
    return [
      // Earnings section
      { label: "Basic Salary", value: `₹${hasSalaryStructure && salaryStructure ? parseFloat(salaryStructure.basic_salary).toFixed(2) : 'N/A'}`, bold: true },
      { label: "HRA", value: `₹${hasSalaryStructure && salaryStructure ? parseFloat(salaryStructure.hra).toFixed(2) : 'N/A'}` },
      // Only show DA if it's not null
      ...(hasSalaryStructure && salaryStructure && salaryStructure.da !== null ? [
        { label: "DA", value: `₹${parseFloat(salaryStructure.da).toFixed(2)}` }
      ] : []),
      // Only show TA if it's not null
      ...(hasSalaryStructure && salaryStructure && salaryStructure.ta !== null ? [
        { label: "TA", value: `₹${parseFloat(salaryStructure.ta).toFixed(2)}` }
      ] : []),
      { label: "Medical Allowance", value: `₹${hasSalaryStructure && salaryStructure ? parseFloat(salaryStructure.medical_allowance).toFixed(2) : 'N/A'}` },
      { label: "Special Allowance", value: `₹${hasSalaryStructure && salaryStructure ? parseFloat(salaryStructure.special_allowance).toFixed(2) : 'N/A'}` },
      
      // Show marketing perks only if it's not null
      ...(hasSalaryStructure && salaryStructure && salaryStructure.marketing_perks !== null ? [
        { label: "Marketing Perks", value: `₹${parseFloat(salaryStructure.marketing_perks).toFixed(2)}` }
      ] : []),
      
      // Show performance bonus only if it's not null and not 0
      ...(hasSalaryStructure && salaryStructure && salaryStructure.performance_bonus !== null && parseFloat(salaryStructure.performance_bonus) > 0 ? [
        { label: "Performance Bonus", value: `₹${parseFloat(salaryStructure.performance_bonus).toFixed(2)}` }
      ] : []),
      
      // Show client bonus only if it's not null and not 0
      ...(hasSalaryStructure && salaryStructure && salaryStructure.client_bonus !== null && parseFloat(salaryStructure.client_bonus) > 0 ? [
        { label: "Client Bonus", value: `₹${parseFloat(salaryStructure.client_bonus).toFixed(2)}` }
      ] : []),
      
      { label: "Total Earnings", value: `₹${hasSalaryStructure && salaryStructure ? parseFloat(salaryStructure.total_earnings).toFixed(2) : 'N/A'}`, bold: true, success: true },
      
      // Conditionally show prorated salary details if applicable
      ...(salaryCalculations.isProrated ? [
        { label: "Prorated Salary", value: `₹${salaryCalculations.proratedSalary.toFixed(2)}`, info: true },
        { label: "Prorated Days", value: `${salaryCalculations.proratedDays} working days`, info: true }
      ] : []),
      
      // Deductions section
      { label: "PF", value: `-₹${hasSalaryStructure && salaryStructure ? parseFloat(salaryStructure.pf).toFixed(2) : 'N/A'}`, danger: true },
      
      // Only show ESI if it's not null
      ...(hasSalaryStructure && salaryStructure && salaryStructure.esi !== null ? [
        { label: "ESI", value: `-₹${parseFloat(salaryStructure.esi).toFixed(2)}`, danger: true }
      ] : []),
      
      // Only show TDS if it's not null
      ...(hasSalaryStructure && salaryStructure && salaryStructure.tds !== null ? [
        { label: "TDS", value: `-₹${parseFloat(salaryStructure.tds).toFixed(2)}`, danger: true }
      ] : []),
      
      { label: "Other Deductions", value: `-₹${hasSalaryStructure && salaryStructure ? parseFloat(salaryStructure.other_deductions).toFixed(2) : 'N/A'}`, danger: true },
      
      // Leave deductions
      { label: "Without Pay Leave Deduction", value: `-₹${salaryCalculations.unpaidLeaveDeduction.toFixed(2)}`, danger: true },
      // Only show maternity leave deduction if gender is female
      ...(gender === 'Female' ? [
        { label: "Maternity Leave Deduction", value: `-₹${salaryCalculations.maternityLeaveDeduction.toFixed(2)}`, danger: true }
      ] : []),
      
      // Total deductions
      { label: "Total Deductions", value: `-₹${((hasSalaryStructure && salaryStructure ? parseFloat(salaryStructure.total_deductions) : 0) + salaryCalculations.totalDeductions).toFixed(2)}`, bold: true, danger: true },
      
      // Net salary
      { label: "Net Salary", value: `₹${salaryCalculations.netSalary.toFixed(2)}`, bold: true, success: true },
      
      // Additional information
      { label: "Earned Leave (EL) Balance", value: salaryCalculations.earnedLeave, info: true },
      { label: "EL Value (at year-end)", value: `₹${salaryCalculations.elValueAtYearEnd.toFixed(2)}`, info: true },
      { label: "EL Value (per day)", value: `₹${salaryCalculations.elValue.toFixed(2)}`, info: true },
      ...(salaryCalculations.isDecember ? [{ label: "Total Payout (incl. EL)", value: `₹${salaryCalculations.totalSalaryWithEL.toFixed(2)}`, bold: true, success: true }] : [])
    ];
  }, [salaryCalculations, hasSalaryStructure, salaryStructure, gender]);
 
  return (
    <Container fluid className="dashboard-body p-4">
      <h2 className="mb-4">Salary Calculation</h2>
     
      {loading && <div className="d-flex justify-content-center"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger">{error}</Alert>}
      {saveSuccess && <Alert variant="success">{saveSuccess}</Alert>}
      {saveError && <Alert variant="danger">{saveError}</Alert>}
     
      {!loading && !error && (
        <>
          {/* Employee Information */}
          <Row className="mb-4">
            <Col md={6}>
              <Card className="p-3">
                <h5 className="mb-3">Employee Information</h5>
                <Table borderless>
                  <tbody>
                    {employeeInfoRows.map((row, index) => (
                      <tr key={index}>
                        <td><strong>{row.label}:</strong></td>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </Col>
           
            <Col md={6}>
              <Card className="p-3">
                <h5 className="mb-3">Leave Balance</h5>
                <Table borderless>
                  <tbody>
                    {leaveBalanceRows.map((row, index) => (
                      <tr key={index}>
                        <td><strong>{row.label}:</strong></td>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </Col>
          </Row>
         
          {/* Salary Calculation */}
          <Row className="mb-4">
            <Col md={12}>
              <Card className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Salary Calculation</h5>
                {/* Only show the Save Calculation button to admin users */}
{isAdmin && (
  <Button 
    variant="primary" 
    onClick={postSalaryCalculation}
    disabled={saveLoading || !salaryCalculations}
  >
    {saveLoading ? (
      <>
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
        <span className="ms-2">Saving...</span>
      </>
    ) : (
      "Save Calculation"
    )}
  </Button>
)}
                </div>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryCalculationRows.map((row, index) => (
                      <tr key={index} className={
                        row.danger ? "table-danger" : 
                        row.info ? "table-info" : 
                        row.success ? "table-success" : 
                        row.warning ? "table-warning" : 
                        row.bold ? "table-active" : ""
                      }>
                        <td>{row.bold ? <strong>{row.label}</strong> : row.label}</td>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </Col>
          </Row>
         
          {/* Leave History */}
          <Row>
            <Col md={12}>
              <Card className="p-3">
                <h5 className="mb-3">Leave History</h5>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Leave ID</th>
                      <th>Leave Type</th>
                      <th>Dates</th>
                      <th>Reason</th>
                      <th>Days</th>
                      <th>Status</th>
                      <th>Without Pay</th>
                      <th>Created By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveHistory.length > 0 ? (
                      leaveHistory.map((leave) => (
                        <tr key={leave.id}>
                          <td>{leave.id}</td>
                          <td>
                            <Badge bg={
                              leave.leave_type === 'casual_leave' ? 'primary' :
                              leave.leave_type === 'maternity_leave' ? 'info' :
                              leave.leave_type === 'paternity_leave' ? 'warning' :
                              leave.leave_type === 'paid_leave' ? 'success' :
                              leave.leave_type === 'earned leave' || leave.leave_type === 'earned_leave' ? 'dark' :
                              isWithoutPay(leave) ? 'danger' : 'secondary'
                            }>
                              {leave.leave_type.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td>{Array.isArray(leave.dates) ? leave.dates.join(', ') : leave.dates}</td>
                          <td>{leave.reason}</td>
                          <td>{leave.leave_days}</td>
                          <td>
                            <Badge bg={leave.status === 'approved' ? 'success' : leave.status === 'pending' ? 'warning' : 'secondary'}>
                              {leave.status}
                            </Badge>
                          </td>
                          <td>
                            {isWithoutPay(leave) ? (
                              <Badge bg="danger">Yes</Badge>
                            ) : (
                              <Badge bg="success">No</Badge>
                            )}
                          </td>
                          <td>{leave.created_byname}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">No leave history found</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card>
            </Col>
          </Row>
         
          {/* Informational Alert */}
          <Row className="mt-3">
            <Col md={12}>
              <Alert variant="info">
                <Alert.Heading>Salary Calculation & Leave Policy</Alert.Heading>
                <p>
                  This section explains how different types of leaves affect your salary.
                </p>
                <hr />
                <h5>1. Employee Status & Salary Calculation</h5>
                <p>
                  <strong>Active Employees:</strong> Receive full monthly salary from 1st to last day of month.<br/>
                  <strong>New Employees:</strong> If joining date is not the 1st of the month, salary is prorated. This is calculated based on the number of working days from the joining date to the end of the month, excluding any Sundays.<br/>
                  <strong>Inactive Employees:</strong> Receive prorated salary from 1st of month to their last working day.
                </p>
                <h5>2. Without Pay Leave</h5>
                <p>
                  <strong>Identification:</strong> Any leave with type <Badge bg="danger">without pay</Badge>.<br/>
                  <strong>Salary Impact:</strong> The salary for these days is <strong>deducted</strong> from your monthly salary. The deduction is calculated based on your actual monthly salary.<br/>
                  <strong>Display:</strong> These leaves are marked as <Badge bg="danger">Yes</Badge> in "Without Pay" column.
                </p>
                <h5>3. Earned Leave (EL)</h5>
                <p>
                  <strong>Identification:</strong> Any leave with type <Badge bg="dark">earned leave</Badge>.<br/>
                  <strong>Salary Impact:</strong> These leaves are <strong>not deducted</strong> from your monthly salary. They are paid leaves.<br/>
                  <strong>Year-End Encashment:</strong> At the end of the financial year (in December), the monetary value of your <strong>remaining EL balance</strong> is added to your salary. This value is calculated using the basic salary from your salary structure.<br/>
                  <strong>Display:</strong> These leaves are marked as <Badge bg="success">No</Badge> in "Without Pay" column.
                </p>
                 <h5>4. Other Leaves (Maternity, Paternity, etc.)</h5>
                <p>
                  <strong>Maternity Leave:</strong> Calculated based on basic salary from your salary structure (₹{salaryCalculations?.basicSalaryForSpecialLeaves?.toFixed(2) || 'N/A'} ÷ 26 days).<br/>
                  <strong>Paternity Leave:</strong> This is a <strong>fully paid leave</strong> with <strong>no salary deduction</strong>.<br/>
                  Other leaves are handled as per company policy.
                </p>
                {hasSalaryStructure && (
                  <>
                    <hr />
                    <h5>5. Salary Structure</h5>
                    <p>
                      This employee has a <Badge bg="success">Configured</Badge> salary structure. The salary calculation is based on predefined salary structure components.
                      {salaryStructure && salaryStructure.client_bonus > 0 && (
                        <> The client bonus of ₹{parseFloat(salaryStructure.client_bonus).toFixed(2)} is included in the net salary.</>
                      )}
                    </p>
                  </>
                )}
              </Alert>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};
 
export default SalaryCalculation;