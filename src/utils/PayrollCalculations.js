
export const PayrollCalculations = (employees) => {

  return employees.map(emp => {

    const hourlyRate = emp.salary / 160; // Assuming 160 hours/month

    const overtime = emp.hours > 160 ? emp.hours - 160 : 0;

    const overtimePay = overtime * hourlyRate * 1.5;

    const totalPay = emp.salary + overtimePay + emp.bonus;

    return {

      ...emp,

      overtime,

      overtimePay,

      totalPay

    };

  });

};
 
export const calculateTotals = (payrollData) => {

  return payrollData.reduce((acc, emp) => {

    acc.totalSalary += emp.salary;

    acc.totalOvertime += emp.overtimePay;

    acc.totalBonus += emp.bonus;

    acc.totalPayroll += emp.totalPay;

    return acc;

  }, {

    totalSalary: 0,

    totalOvertime: 0,

    totalBonus: 0,

    totalPayroll: 0

  });

};
 