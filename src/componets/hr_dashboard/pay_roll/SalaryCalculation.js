import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Spinner,
  Alert,
  Form,
  Button
} from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

const SalaryCalculation = ({ employee }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [gender, setGender] = useState(null);
  const [apiSalary, setApiSalary] = useState(null);
  const [monthlySalary, setMonthlySalary] = useState(null);
  
  const BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";
  
  // Axios instance with credentials
  const axiosInstance = axios.create({
    baseURL: `${BASE_URL}/api/`,
    withCredentials: true,
  });

  // HELPER FUNCTION: MOVED TO THE TOP TO BE DECLARED BEFORE USE
  // Function to determine if a leave is without pay
  const isWithoutPay = (leave) => {
    // Check if leave type is 'without pay' or 'without_pay'
    return leave.leave_type === 'without pay' || 
           leave.leave_type === 'without_pay' || 
           leave.leave_type === 'withoutpay';
  };

  // Fetch employee Salary and gender data
  useEffect(() => {
    const fetchEmployeeSalary = async () => {
      try {
        // Fetch employee gender and Salary
        const salaryResponse = await axiosInstance.get(`get-employee-gender-salary/?employee_id=${employee.emp_id}`);
        
        // Fetch leave balance
        const leaveBalanceResponse = await axiosInstance.get(`leave-balance/?employee_id=${employee.emp_id}`);
        
        if (salaryResponse.data.success) {
          setSalaryData(salaryResponse.data.data);
          setGender(salaryResponse.data.data.gender);
          setApiSalary(salaryResponse.data.data.salary);
          
          // Calculate monthly Salary from API salary (assuming annual salary)
          const annualSalary = salaryResponse.data.data.salary || 0;
          const calculatedMonthlySalary = annualSalary / 12;
          setMonthlySalary(calculatedMonthlySalary);
        }
        
        if (leaveBalanceResponse.data) {
          setLeaveBalance(leaveBalanceResponse.data.leave_balance);
          setLeaveHistory(leaveBalanceResponse.data.leave_history || []);
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
  }, [employee]);

  // Use basic salary of 25000 for EL, maternity, and paternity leave calculations
  const basicSalaryForSpecialLeaves = 25000;
  
  // Calculate per day salary (assuming 26 working days in a month)
  const perDaySalaryForSpecialLeaves = basicSalaryForSpecialLeaves / 26;
  
  // Calculate per hour salary (8 hours work day)
  const perHourSalaryForSpecialLeaves = perDaySalaryForSpecialLeaves / 8;
  
  // Calculate per day salary for regular salary
  const perDaySalaryRegular = monthlySalary / 26;
  
  // Calculate per hour salary for regular salary
  const perHourSalaryRegular = perDaySalaryRegular / 8;
  
  // Calculate total leave days taken in current month (only approved leaves)
  const totalLeaveDays = leaveHistory.reduce((total, leave) => {
    // Only count approved leaves
    if (leave.status === 'approved') {
      return total + (leave.leave_days || 0);
    }
    return total;
  }, 0);
  
  // Calculate unpaid leave days taken (only approved without_pay leaves)
  const unpaidLeaveDaysFromHistory = leaveHistory.reduce((total, leave) => {
    // Only count approved leaves where leave_type is 'without pay' or 'without_pay'
    if (leave.status === 'approved' && isWithoutPay(leave)) {
      return total + (leave.leave_days || 0);
    }
    return total;
  }, 0);
  
  // Use the without_pay value from leaveBalance as the authoritative source
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
  
  // Calculate maternity and paternity leave deductions (only approved)
  const maternityLeaveDays = leaveHistory.reduce((total, leave) => {
    if (leave.leave_type === 'maternity_leave' && leave.status === 'approved') {
      return total + (leave.leave_days || 0);
    }
    return total;
  }, 0);
  
  const paternityLeaveDays = leaveHistory.reduce((total, leave) => {
    if (leave.leave_type === 'paternity_leave' && leave.status === 'approved') {
      return total + (leave.leave_days || 0);
    }
    return total;
  }, 0);
  
  const maternityLeaveDeduction = maternityLeaveDays * perDaySalaryForSpecialLeaves;
  const paternityLeaveDeduction = paternityLeaveDays * perDaySalaryForSpecialLeaves;
  
  // Calculate earned leave (will be added in December)
  const earnedLeave = leaveBalance ? leaveBalance.earned_leave : 0;
  
  // Calculate total deductions (excluding earned leaves)
  const totalDeductions = unpaidLeaveDeduction + maternityLeaveDeduction + paternityLeaveDeduction;
  
  // Calculate net salary
  const netSalary = monthlySalary - totalDeductions;
  
  // Calculate days worked in current month
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysWorked = daysInMonth - totalLeaveDays;

  // Get current month to check if it's December (when EL is added)
  const currentMonth = new Date().getMonth();
  const isDecember = currentMonth === 11; // 0-indexed, so 11 = December
  
  // Calculate EL value to be added at the end of financial year
  const elValueAtYearEnd = earnedLeave * perDaySalaryForSpecialLeaves;
  
  // Calculate total salary including EL at year end (only in December)
  const totalSalaryWithEL = isDecember ? netSalary + elValueAtYearEnd : netSalary;

  // Create Employee Info rows
  const employeeInfoRows = [
    { label: "Employee ID", value: employee.emp_id },
    { label: "Name", value: `${employee.first_name} ${employee.last_name}` },
    { label: "Gender", value: gender || 'N/A' },
    { label: "Department", value: employee.department },
    { label: "Designation", value: employee.designation },
    { label: "Annual Salary", value: `₹${apiSalary ? apiSalary.toFixed(2) : 'N/A'}` },
    { label: "Monthly Salary", value: `₹${monthlySalary ? monthlySalary.toFixed(2) : 'N/A'}` },
    { 
      label: "Salary for Deductions", 
      value: (
        <div>
          <div>Without Pay: ₹{monthlySalary ? monthlySalary.toFixed(2) : 'N/A'}</div>
          <div>Special (EL/Mat/Pat): ₹{basicSalaryForSpecialLeaves.toFixed(2)}</div>
        </div>
      )
    }
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

  // Create Salary Calculation rows
  const salaryCalculationRows = [
    { label: "Monthly Salary", value: `₹${monthlySalary ? monthlySalary.toFixed(2) : 'N/A'}`, calculation: "Annual salary ÷ 12" },
    { label: "Per Day Salary (Regular)", value: `₹${perDaySalaryRegular.toFixed(2)}`, calculation: `Monthly Salary ÷ 26 days` },
    { label: "Days in Current Month", value: daysInMonth, calculation: "Calendar days" },
    { label: "Total Approved Leave Days", value: totalLeaveDays, calculation: "Sum of all approved leaves" },
    { label: "Without Pay Leave Days", value: unpaidLeaveDays, calculation: "From leave balance" },
    { label: "Earned Leave Days Taken", value: earnedLeaveDaysTaken, calculation: "Count of 'earned leave' taken" },
    { label: "Without Pay Leave Deduction", value: `-₹${unpaidLeaveDeduction.toFixed(2)}`, calculation: `${unpaidLeaveDays} × ₹${perDaySalaryRegular.toFixed(2)}`, danger: true },
    { label: "Earned Leave Deduction", value: "No", calculation: "Earned leaves are not deducted from salary", success: true },
    ...(gender === 'Female' ? [{ label: "Maternity Leave Deduction", value: `-₹${maternityLeaveDeduction.toFixed(2)}`, calculation: `${maternityLeaveDays} × ₹${perDaySalaryForSpecialLeaves.toFixed(2)}`, danger: true }] : []),
    ...(gender === 'Male' ? [{ label: "Paternity Leave Deduction", value: `-₹${paternityLeaveDeduction.toFixed(2)}`, calculation: `${paternityLeaveDays} × ₹${perDaySalaryForSpecialLeaves.toFixed(2)}`, danger: true }] : []),
    { label: "Total Deductions", value: `-₹${totalDeductions.toFixed(2)}`, calculation: "Sum of all deductions", info: true },
    { label: "Net Salary", value: `₹${netSalary.toFixed(2)}`, calculation: `Monthly Salary - Total Deductions`, success: true },
    { label: "Earned Leave (EL) Balance", value: earnedLeave, calculation: "From leave balance", info: true },
    { label: "EL Value (at year-end)", value: `₹${elValueAtYearEnd.toFixed(2)}`, calculation: `${earnedLeave} EL × ₹${perDaySalaryForSpecialLeaves.toFixed(2)}/day`, info: true },
    ...(isDecember ? [{ label: "Total Payout (incl. EL)", value: `₹${totalSalaryWithEL.toFixed(2)}`, calculation: `Net Salary + EL Value`, success: true }] : [])
  ];

  return (
    <Container fluid className="dashboard-body p-4">
      <h2 className="mb-4">Salary Calculation</h2>
      
      {loading && <div className="d-flex justify-content-center"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger">{error}</Alert>}
      
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
                <h5 className="mb-3">Salary Calculation</h5>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Calculation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryCalculationRows.map((row, index) => (
                      <tr key={index} className={row.danger ? "table-danger" : row.info ? "table-info" : row.success ? "table-success" : ""}>
                        <td>{row.label}</td>
                        <td>{row.value}</td>
                        <td>{row.calculation}</td>
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
                <h5>1. Without Pay Leave</h5>
                <p>
                  <strong>Identification:</strong> Any leave with the type <Badge bg="danger">without pay</Badge>.<br/>
                  <strong>Salary Impact:</strong> The salary for these days is <strong>deducted</strong> from your monthly salary. The deduction is calculated based on your actual monthly salary.<br/>
                  <strong>Display:</strong> These leaves are marked as <Badge bg="danger">Yes</Badge> in the "Without Pay" column.
                </p>
                <h5>2. Earned Leave (EL)</h5>
                <p>
                  <strong>Identification:</strong> Any leave with the type <Badge bg="dark">earned leave</Badge>.<br/>
                  <strong>Salary Impact:</strong> These leaves are <strong>not deducted</strong> from your monthly salary. They are paid leaves.<br/>
                  <strong>Year-End Encashment:</strong> At the end of the financial year (in December), the monetary value of your <strong>remaining EL balance</strong> is added to your salary. This value is calculated using a fixed basic salary of ₹25,000.<br/>
                  <strong>Display:</strong> These leaves are marked as <Badge bg="success">No</Badge> in the "Without Pay" column.
                </p>
                 <h5>3. Other Leaves (Maternity, Paternity, etc.)</h5>
                <p>
                  These leaves are handled as per company policy, and their deductions (if any) are calculated based on the fixed basic salary of ₹25,000.
                </p>
              </Alert>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default SalaryCalculation;