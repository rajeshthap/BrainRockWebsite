import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import axios from "axios";

const SalaryCalculation = ({ employee }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [gender, setGender] = useState(null);
  const [apiSalary, setApiSalary] = useState(null);
  const [monthlySalary, setMonthlySalary] = useState(null);
  const [joiningDate, setJoiningDate] = useState(null);
  
  const BASE_URL = "https://mahadevaaya.com/brainrock.in/brainrock/backendbr";
  
  // Axios instance with credentials
  const axiosInstance = axios.create({
    baseURL: `${BASE_URL}/api/`,
    withCredentials: true,
  });

  
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
          setJoiningDate(salaryResponse.data.data.created_at);
          
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

  // Placeholder for attendance data - would be fetched from attendance API when available
  // For now, we'll use 0 absent days since we don't have the attendance data
  const absentDays = 0; // This would be calculated from attendance data when API is available
  
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
  
  // Total days without pay = leave days + absent days
  const totalWithoutPayDays = unpaidLeaveDays + absentDays;
  
  // Calculate earned leave days taken (only approved earned_leave)
  const earnedLeaveDaysTaken = leaveHistory.reduce((total, leave) => {
    // Only count approved earned leaves
    if (leave.status === 'approved' && (leave.leave_type === 'earned leave' || leave.leave_type === 'earned_leave')) {
      return total + (leave.leave_days || 0);
    }
    return total;
  }, 0);
  
  // Calculate salary deduction for unpaid leaves (using regular salary)
  const unpaidLeaveDeduction = totalWithoutPayDays * perDaySalaryRegular;
  
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
  
  // Maternity leave deduction uses basic salary
  const maternityLeaveDeduction = maternityLeaveDays * perDaySalaryForSpecialLeaves;
  
  // Paternity leave is now a paid leave - NO DEDUCTION
  const paternityLeaveDeduction = 0;
  
  // Calculate earned leave (will be added in December)
  const earnedLeave = leaveBalance ? leaveBalance.earned_leave : 0;
  
  // Calculate total deductions (excluding earned leaves and paternity leave)
  const totalDeductions = unpaidLeaveDeduction + maternityLeaveDeduction;
  
  // NEW LOGIC: Calculate prorated salary for new employees
  let proratedSalary = monthlySalary;
  let proratedDays = 0;
  let isProrated = false;
  let proratedExplanation = "Full month salary";
  
  if (joiningDate) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Parse joining date from created_at field
    const joinDate = new Date(joiningDate);
    const joinYear = joinDate.getFullYear();
    const joinMonth = joinDate.getMonth();
    const joinDay = joinDate.getDate();
    
    // If employee joined in current month
    if (joinYear === currentYear && joinMonth === currentMonth) {
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      proratedDays = daysInMonth - joinDay + 1;
      proratedSalary = (monthlySalary / daysInMonth) * proratedDays;
      isProrated = true;
      proratedExplanation = `Prorated salary for ${proratedDays} days (joined on ${joinDate.toLocaleDateString()})`;
    }
  }
  
  // Calculate net salary (use prorated salary if applicable)
  const netSalary = proratedSalary - totalDeductions;
  
  // Calculate days worked in current month
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const daysWorked = isProrated ? proratedDays - totalLeaveDays - absentDays : daysInMonth - totalLeaveDays - absentDays;

  // Get current month to check if it's December (when EL is added)
  const currentMonth = new Date().getMonth();
  const isDecember = currentMonth === 11; // 0-indexed, so 11 = December
  
  // Calculate EL value to be added at the end of the financial year
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
    { label: "Joining Date", value: joiningDate ? new Date(joiningDate).toLocaleDateString() : 'N/A' },
    { label: "Annual Salary", value: `₹${apiSalary ? apiSalary.toFixed(2) : 'N/A'}` },
    { label: "Monthly Salary", value: `₹${monthlySalary ? monthlySalary.toFixed(2) : 'N/A'}` },
    { 
      label: "Salary for Deductions", 
      value: (
        <div>
          <div>Without Pay: ₹{monthlySalary ? monthlySalary.toFixed(2) : 'N/A'}</div>
          <div>Maternity/EL: ₹{basicSalaryForSpecialLeaves.toFixed(2)}</div>
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
    { label: "Absent Days (No Check-in/Check-out)", value: absentDays, calculation: "Days with missing attendance", warning: true },
    { label: "Without Pay Leave Days", value: unpaidLeaveDays, calculation: "From leave balance" },
    { label: "Total Without Pay Days", value: totalWithoutPayDays, calculation: `${unpaidLeaveDays} (Leave) + ${absentDays} (Absent)`, danger: true },
    { label: "Earned Leave Days Taken", value: earnedLeaveDaysTaken, calculation: "Count of 'earned leave' taken" },
    { label: "Without Pay Leave Deduction", value: `-₹${unpaidLeaveDeduction.toFixed(2)}`, calculation: `${totalWithoutPayDays} × ₹${perDaySalaryRegular.toFixed(2)}`, danger: true },
    { label: "Earned Leave Deduction", value: "No", calculation: "Earned leaves are not deducted from salary", success: true },
    // Only show maternity leave deduction if gender is female
    ...(gender === 'Female' ? [
      { label: "Maternity Leave Deduction", value: `-₹${maternityLeaveDeduction.toFixed(2)}`, calculation: `${maternityLeaveDays} × ₹${perDaySalaryForSpecialLeaves.toFixed(2)} (Basic Salary)`, danger: true }
    ] : []),
    // Only show paternity leave row if gender is male (but with no deduction)
    ...(gender === 'Male' ? [
      { label: "Paternity Leave", value: `${paternityLeaveDays} days`, calculation: "Paid leave - no salary deduction", success: true }
    ] : []),
    { label: "Total Deductions", value: `-₹${totalDeductions.toFixed(2)}`, calculation: "Sum of all deductions", info: true },
    // Add prorated salary calculation if applicable
    ...(isProrated ? [
      { label: "Prorated Salary", value: `₹${proratedSalary.toFixed(2)}`, calculation: proratedExplanation, warning: true }
    ] : []),
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
                      <tr key={index} className={row.danger ? "table-danger" : row.info ? "table-info" : row.success ? "table-success" : row.warning ? "table-warning" : ""}>
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
                <h5>1. Employee Status & Salary Calculation</h5>
                <p>
                  <strong>Active Employees:</strong> Receive full monthly salary from 1st to last day of month.<br/>
                  <strong>New Employees:</strong> Receive prorated salary based on joining date. For example, if you joined on the 15th of the month, your salary will be calculated for the remaining days of that month.<br/>
                  <strong>Inactive Employees:</strong> Receive prorated salary from the 1st of the month to their last working day.
                </p>
                <h5>2. Attendance Policy (Future Implementation)</h5>
                <p>
                  <strong>Absence Detection:</strong> When both check-in and check-out times are missing for a day, the employee will be marked as <Badge bg="danger">Absent</Badge>.<br/>
                  <strong>Salary Impact:</strong> Absent days will be treated as "without pay" leave and result in salary deduction.<br/>
                  <strong>Note:</strong> Attendance tracking is currently being implemented. Once available, absent days will be automatically calculated and deducted.
                </p>
                <h5>3. Without Pay Leave</h5>
                <p>
                  <strong>Identification:</strong> Any leave with type <Badge bg="danger">without pay</Badge> or days marked as absent.<br/>
                  <strong>Salary Impact:</strong> The salary for these days is <strong>deducted</strong> from your monthly salary. The deduction is calculated based on your actual monthly salary.<br/>
                  <strong>Display:</strong> These leaves are marked as <Badge bg="danger">Yes</Badge> in the "Without Pay" column.
                </p>
                <h5>4. Earned Leave (EL)</h5>
                <p>
                  <strong>Identification:</strong> Any leave with type <Badge bg="dark">earned leave</Badge>.<br/>
                  <strong>Salary Impact:</strong> These leaves are <strong>not deducted</strong> from your monthly salary. They are paid leaves.<br/>
                  <strong>Year-End Encashment:</strong> At the end of the financial year (in December), the monetary value of your <strong>remaining EL balance</strong> is added to your salary. This value is calculated using a fixed basic salary of ₹25,000.<br/>
                  <strong>Display:</strong> These leaves are marked as <Badge bg="success">No</Badge> in the "Without Pay" column.
                </p>
                 <h5>5. Other Leaves (Maternity, Paternity, etc.)</h5>
                <p>
                  <strong>Maternity Leave:</strong> Calculated based on a fixed basic salary of ₹25,000.<br/>
                  <strong>Paternity Leave:</strong> This is a <strong>fully paid leave</strong> with <strong>no salary deduction</strong>.<br/>
                  Other leaves are handled as per company policy.
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