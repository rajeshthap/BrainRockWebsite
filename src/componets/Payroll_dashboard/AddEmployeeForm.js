import React, { useState } from 'react';
 
const AddEmployeeForm = ({ onAddEmployee }) => {
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    salary: '',
    hours: '',
    bonus: ''
  });
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
 
  const handleSubmit = (e) => {
    e.preventDefault();
    onAddEmployee({
      ...formData,
      salary: parseFloat(formData.salary),
      hours: parseInt(formData.hours),
      bonus: parseFloat(formData.bonus)
    });
    setFormData({
      name: '',
      position: '',
      salary: '',
      hours: '',
      bonus: ''
    });
  };
 
  return (
<div className="add-employee-form">
<h2>Add New Employee</h2>
<form onSubmit={handleSubmit}>
<div className="form-group">
<label>Name</label>
<input type="text" name="name" value={formData.name} onChange={handleChange} required />
</div>
<div className="form-group">
<label>Position</label>
<input type="text" name="position" value={formData.position} onChange={handleChange} required />
</div>
<div className="form-group">
<label>Monthly Salary</label>
<input type="number" name="salary" value={formData.salary} onChange={handleChange} required />
</div>
<div className="form-group">
<label>Hours Worked</label>
<input type="number" name="hours" value={formData.hours} onChange={handleChange} required />
</div>
<div className="form-group">
<label>Bonus</label>
<input type="number" name="bonus" value={formData.bonus} onChange={handleChange} />
</div>
<button type="submit">Add Employee</button>
</form>
</div>
  );
};
 
export default AddEmployeeForm;