import React, { useState, useEffect } from 'react';
import { departments, employees as initialEmployees } from '../../data/MockData';
import PayrollSummary from '../../componets/Payroll_dashboard/PaySummary';
import EmployeeList from './EmployeeList';
import AddEmployeeForm from './AddEmployeeForm';
import PayrollCharts from './PayrollCharts';
import { calculateTotals } from '../../utils/PayrollCalculations';
import "../../assets/css/PayDashBoard.css"


const PayDashBoard = () => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [payrollData, setPayrollData] = useState([]);
  const [totals, setTotals] = useState({});

  // ✅ Step 1: Calculate payroll for each employee
  const calculatePayroll = (emps) => {
    return emps.map(emp => ({
      ...emp,
      totalPay: emp.salary + emp.bonus
    }));
  };

  useEffect(() => {

    const payroll = calculatePayroll(employees);   // ✔ ARRAY

    setPayrollData(payroll);                       // ✔ ARRAY → OK

    const totals = calculateTotals(payroll);       // ✔ now reduce works
    setTotals(totals);

  }, [employees]);

  const handleAddEmployee = (newEmployee) => {
    setEmployees(prev => [
      ...prev,
      { ...newEmployee, id: prev.length + 1 }
    ]);
  };

  return (
    <div className="dashboard">
      <header>
        <h1>Payroll Dashboard</h1>
      </header>

      <PayrollSummary totals={totals} />

      <div className="dashboard-content">
        <div className="left-column">
          <EmployeeList payrollData={payrollData} />
          <AddEmployeeForm onAddEmployee={handleAddEmployee} />
        </div>

        <div className="right-column">
          <PayrollCharts payrollData={payrollData} departments={departments} />
        </div>
      </div>
    </div>
  );
};

export default PayDashBoard;
