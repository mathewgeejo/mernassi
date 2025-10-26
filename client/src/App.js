import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    location: '',
    salary: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/employeelist');
      setEmployees(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        // Update existing employee
        await axios.put(`/api/employeelist/${editingId}`, formData);
        setEditingId(null);
      } else {
        // Create new employee
        await axios.post('/api/employeelist', formData);
      }
      
      // Reset form
      setFormData({ name: '', position: '', location: '', salary: '' });
      
      // Refresh employee list
      await fetchEmployees();
      setError('');
    } catch (err) {
      setError('Failed to save employee');
      console.error('Error saving employee:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (employee) => {
    setFormData({
      name: employee.name,
      position: employee.position,
      location: employee.location,
      salary: employee.salary.toString()
    });
    setEditingId(employee._id);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        setLoading(true);
        await axios.delete(`/api/employeelist/${id}`);
        await fetchEmployees();
        setError('');
      } catch (err) {
        setError('Failed to delete employee');
        console.error('Error deleting employee:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({ name: '', position: '', location: '', salary: '' });
    setEditingId(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Employee Management System</h1>
      </header>

      <main className="main-content">
        {/* Employee Form */}
        <section className="form-section">
          <h2>{editingId ? 'Edit Employee' : 'Add New Employee'}</h2>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="employee-form">
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">Position:</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location:</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="salary">Salary:</label>
              <input
                type="number"
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-buttons">
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Employee' : 'Add Employee'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancel} className="cancel-btn">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Employee List */}
        <section className="list-section">
          <h2>Employee List</h2>
          {loading && !employees.length && <div>Loading employees...</div>}
          
          <div className="employee-grid">
            {employees.map((employee) => (
              <div key={employee._id} className="employee-card">
                <h3>{employee.name}</h3>
                <p><strong>Position:</strong> {employee.position}</p>
                <p><strong>Location:</strong> {employee.location}</p>
                <p><strong>Salary:</strong> ${employee.salary.toLocaleString()}</p>
                <p><strong>Created:</strong> {new Date(employee.createdAt).toLocaleDateString()}</p>
                
                <div className="card-actions">
                  <button 
                    onClick={() => handleEdit(employee)}
                    className="edit-btn"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(employee._id)}
                    className="delete-btn"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {employees.length === 0 && !loading && (
            <div className="no-employees">
              No employees found. Add your first employee above!
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;