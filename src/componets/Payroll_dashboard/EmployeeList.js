import React from 'react';
import { formatCurrency } from '../../utils/Helpers';
 
const EmployeeList = ({ payrollData }) => {
  return (
<div className="employee-list">
<h2>Employee Payroll Details</h2>
<table>
<thead>
<tr>
<th>Name</th>
<th>Position</th>
<th>Base Salary</th>
<th>Overtime</th>
<th>Bonus</th>
<th>Total Pay</th>
</tr>
</thead>
<tbody>
          {payrollData.map(emp => (
<tr key={emp.id}>
<td>{emp.name}</td>
<td>{emp.position}</td>
<td>{formatCurrency(emp.salary)}</td>
<td>{formatCurrency(emp.overtimePay)}</td>
<td>{formatCurrency(emp.bonus)}</td>
<td>{formatCurrency(emp.totalPay)}</td>
</tr>
          ))}
</tbody>
</table>
</div>
  );
};
 
export default EmployeeList;