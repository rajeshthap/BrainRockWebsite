import React from 'react';
import { formatCurrency } from '../../utils/Helpers';
 
const PaySummary = ({ totals }) => {
  return (
<div className="summary-cards">
<div className="card">
<h3>Total Payroll</h3>
<p>{formatCurrency(totals.totalPayroll)}</p>
</div>
<div className="card">
<h3>Base Salaries</h3>
<p>{formatCurrency(totals.totalSalary)}</p>
</div>
<div className="card">
<h3>Overtime</h3>
<p>{formatCurrency(totals.totalOvertime)}</p>
</div>
<div className="card">
<h3>Bonuses</h3>
<p>{formatCurrency(totals.totalBonus)}</p>
</div>
</div>
  );
};
 
export default PaySummary;