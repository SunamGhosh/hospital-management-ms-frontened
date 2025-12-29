import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import './Patients.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    blood_group: '',
    allergies: '',
  });

  useEffect(() => {
    fetchPatients();
  }, [searchTerm]);

  const fetchPatients = async () => {
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await api.get('/api/patients', { params });
      setPatients(response.data.patients || response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await api.put(`/api/patients/${editingPatient.id}`, formData);
      } else {
        await api.post('/api/patients', formData);
      }
      setShowModal(false);
      setEditingPatient(null);
      resetForm();
      fetchPatients();
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error saving patient');
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData({
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      date_of_birth: patient.date_of_birth || '',
      gender: patient.gender || '',
      phone: patient.phone || '',
      email: patient.email || '',
      address: patient.address || '',
      emergency_contact_name: patient.emergency_contact_name || '',
      emergency_contact_phone: patient.emergency_contact_phone || '',
      blood_group: patient.blood_group || '',
      allergies: patient.allergies || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await api.delete(`/api/patients/${id}`);
        fetchPatients();
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Error deleting patient');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      phone: '',
      email: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      blood_group: '',
      allergies: '',
    });
  };

  if (loading) {
    return <div className="loading">Loading patients...</div>;
  }

  return (
    <div className="patients-page">
      <div className="page-header">
        <h1 className="page-title">Patients</h1>
        <button className="btn-primary" onClick={() => { setShowModal(true); setEditingPatient(null); resetForm(); }}>
          <FiPlus /> Add Patient
        </button>
      </div>

      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Name</th>
              <th>Date of Birth</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>No patients found</td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.patient_id}</td>
                  <td>{patient.first_name} {patient.last_name}</td>
                  <td>{new Date(patient.date_of_birth).toLocaleDateString()}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.phone || '-'}</td>
                  <td>{patient.email || '-'}</td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEdit(patient)}>
                      <FiEdit />
                    </button>
                    <button className="btn-icon btn-danger" onClick={() => handleDelete(patient.id)}>
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
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingPatient(null); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</h2>
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
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
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
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="2"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Emergency Contact Name</label>
                  <input
                    type="text"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Blood Group</label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Allergies</label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="e.g., Penicillin, Nuts"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setEditingPatient(null); resetForm(); }}>
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

export default Patients;

