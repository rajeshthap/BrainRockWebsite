import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
 
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
 
const PayrollCharts = ({ payrollData, departments }) => {
  return (
<div className="charts-container">
<div className="chart">
<h3>Payroll by Department</h3>
<ResponsiveContainer width="100%" height={300}>
<PieChart>
<Pie
              data={departments}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
>
              {departments.map((entry, index) => (
<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
</Pie>
<Tooltip />
</PieChart>
</ResponsiveContainer>
</div>
<div className="chart">
<h3>Employee Compensation</h3>
<ResponsiveContainer width="100%" height={300}>
<BarChart
            data={payrollData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="name" />
<YAxis />
<Tooltip />
<Legend />
<Bar dataKey="salary" name="Base Salary" fill="#8884d8" />
<Bar dataKey="overtimePay" name="Overtime" fill="#82ca9d" />
<Bar dataKey="bonus" name="Bonus" fill="#ffc658" />
</BarChart>
</ResponsiveContainer>
</div>
</div>
  );
};
 
export default PayrollCharts;