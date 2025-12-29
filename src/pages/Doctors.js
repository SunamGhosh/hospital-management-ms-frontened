import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import './Doctors.css';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    specialization: '',
    phone: '',
    email: '',
    qualification: '',
    experience_years: '',
    consultation_fee: '',
    available_days: '',
    available_time_start: '',
    available_time_end: '',
    status: 'active',
    username: '',
    password: '',
  });

  useEffect(() => {
    fetchDoctors();
  }, [searchTerm]);

  const fetchDoctors = async () => {
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await api.get('/api/doctors', { params });
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        // Don't send username/password when editing
        const { username, password, ...editData } = formData;
        await api.put(`/api/doctors/${editingDoctor.id}`, editData);
      } else {
        // Include username and password when creating new doctor
        if (!formData.username || !formData.password) {
          alert('Username and password are required for new doctors');
          return;
        }
        const response = await api.post('/api/doctors', formData);
        if (response.data.message) {
          alert(`Doctor created successfully!\n\nLogin credentials:\nEmail: ${response.data.login_email}\nUsername: ${response.data.login_username}\nPassword: [as set during creation]`);
        }
      }
      setShowModal(false);
      setEditingDoctor(null);
      resetForm();
      fetchDoctors();
    } catch (error) {
      console.error('Error saving doctor:', error);
      alert(error.response?.data?.error || 'Error saving doctor');
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      first_name: doctor.first_name || '',
      last_name: doctor.last_name || '',
      specialization: doctor.specialization || '',
      phone: doctor.phone || '',
      email: doctor.email || '',
      qualification: doctor.qualification || '',
      experience_years: doctor.experience_years || '',
      consultation_fee: doctor.consultation_fee || '',
      available_days: doctor.available_days || '',
      available_time_start: doctor.available_time_start || '',
      available_time_end: doctor.available_time_end || '',
      status: doctor.status || 'active',
      username: '', // Don't show username/password when editing
      password: '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await api.delete(`/api/doctors/${id}`);
        fetchDoctors();
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert('Error deleting doctor');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      specialization: '',
      phone: '',
      email: '',
      qualification: '',
      experience_years: '',
      consultation_fee: '',
      available_days: '',
      available_time_start: '',
      available_time_end: '',
      status: 'active',
      username: '',
      password: '',
    });
  };

  if (loading) {
    return <div className="loading">Loading doctors...</div>;
  }

  return (
    <div className="doctors-page">
      <div className="page-header">
        <h1 className="page-title">Doctors</h1>
        <button className="btn-primary" onClick={() => { setShowModal(true); setEditingDoctor(null); resetForm(); }}>
          <FiPlus /> Add Doctor
        </button>
      </div>

      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search doctors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Doctor ID</th>
              <th>Name</th>
              <th>Specialization</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Consultation Fee</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>No doctors found</td>
              </tr>
            ) : (
              doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.doctor_id}</td>
                  <td>Dr. {doctor.first_name} {doctor.last_name}</td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.phone || '-'}</td>
                  <td>{doctor.email || '-'}</td>
                  <td>${doctor.consultation_fee || '-'}</td>
                  <td>
                    <span className={`status-badge status-${doctor.status}`}>
                      {doctor.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEdit(doctor)}>
                      <FiEdit />
                    </button>
                    <button className="btn-icon btn-danger" onClick={() => handleDelete(doctor.id)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingDoctor(null); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Specialization *</label>
                  <input
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    placeholder="e.g., Cardiology, Pediatrics"
                  />
                </div>
                <div className="form-group">
                  <label>Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g., MD, MBBS"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    required={!editingDoctor}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="doctor@hospital.com"
                  />
                </div>
              </div>
              {!editingDoctor && (
                <>
                  <div className="form-section-divider">
                    <h3>Login Credentials (Required for Doctor Login)</h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      These credentials will be used by the doctor to login to the system
                    </p>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Username *</label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        placeholder="e.g., drsmith, john.doe"
                      />
                      <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        Unique username for login
                      </small>
                    </div>
                    <div className="form-group">
                      <label>Password *</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Minimum 6 characters"
                        minLength={6}
                      />
                      <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                        Minimum 6 characters required
                      </small>
                    </div>
                  </div>
                </>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label>Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Consultation Fee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.consultation_fee}
                    onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Available Days</label>
                  <input
                    type="text"
                    value={formData.available_days}
                    onChange={(e) => setFormData({ ...formData, available_days: e.target.value })}
                    placeholder="e.g., Monday, Wednesday, Friday"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Available Time Start</label>
                  <input
                    type="time"
                    value={formData.available_time_start}
                    onChange={(e) => setFormData({ ...formData, available_time_start: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Available Time End</label>
                  <input
                    type="time"
                    value={formData.available_time_end}
                    onChange={(e) => setFormData({ ...formData, available_time_end: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setEditingDoctor(null); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;

