import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiFileText } from 'react-icons/fi';
import './MedicalRecords.css';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_id: '',
    diagnosis: '',
    symptoms: '',
    prescription: '',
    test_results: '',
    notes: '',
    visit_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchRecords();
    fetchPatients();
    fetchDoctors();
    fetchAppointments();
  }, [searchTerm]);

  const fetchRecords = async () => {
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await api.get('/api/medical-records', { params });
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/api/patients');
      setPatients(response.data.patients || response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/api/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/api/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await api.put(`/api/medical-records/${editingRecord.id}`, formData);
      } else {
        await api.post('/api/medical-records', formData);
      }
      setShowModal(false);
      setEditingRecord(null);
      resetForm();
      fetchRecords();
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Error saving medical record');
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      patient_id: record.patient_id || '',
      doctor_id: record.doctor_id || '',
      appointment_id: record.appointment_id || '',
      diagnosis: record.diagnosis || '',
      symptoms: record.symptoms || '',
      prescription: record.prescription || '',
      test_results: record.test_results || '',
      notes: record.notes || '',
      visit_date: record.visit_date || new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medical record?')) {
      try {
        await api.delete(`/api/medical-records/${id}`);
        fetchRecords();
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Error deleting medical record');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      doctor_id: '',
      appointment_id: '',
      diagnosis: '',
      symptoms: '',
      prescription: '',
      test_results: '',
      notes: '',
      visit_date: new Date().toISOString().split('T')[0],
    });
  };

  if (loading) {
    return <div className="loading">Loading medical records...</div>;
  }

  return (
    <div className="medical-records-page">
      <div className="page-header">
        <h1 className="page-title">Medical Records</h1>
        <button className="btn-primary" onClick={() => { setShowModal(true); setEditingRecord(null); resetForm(); }}>
          <FiPlus /> Add Record
        </button>
      </div>

      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search medical records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Visit Date</th>
              <th>Diagnosis</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No medical records found</td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id}>
                  <td>{record.record_id}</td>
                  <td>
                    {record.patient_first_name} {record.patient_last_name}
                    <br />
                    <small style={{ color: '#6b7280' }}>{record.patient_code}</small>
                  </td>
                  <td>
                    Dr. {record.doctor_first_name} {record.doctor_last_name}
                    <br />
                    <small style={{ color: '#6b7280' }}>{record.specialization}</small>
                  </td>
                  <td>{new Date(record.visit_date).toLocaleDateString()}</td>
                  <td>{record.diagnosis || '-'}</td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEdit(record)}>
                      <FiEdit />
                    </button>
                    <button className="btn-icon btn-danger" onClick={() => handleDelete(record.id)}>
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
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingRecord(null); resetForm(); }}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingRecord ? 'Edit Medical Record' : 'Add New Medical Record'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Patient *</label>
                  <select
                    required
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name} ({patient.patient_id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Doctor *</label>
                  <select
                    required
                    value={formData.doctor_id}
                    onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Appointment (Optional)</label>
                  <select
                    value={formData.appointment_id}
                    onChange={(e) => setFormData({ ...formData, appointment_id: e.target.value })}
                  >
                    <option value="">Select Appointment</option>
                    {appointments
                      .filter(apt => apt.patient_id == formData.patient_id)
                      .map((appointment) => (
                        <option key={appointment.id} value={appointment.id}>
                          {new Date(appointment.appointment_date).toLocaleDateString()} - {appointment.appointment_time}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Visit Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.visit_date}
                    onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Diagnosis</label>
                <input
                  type="text"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  placeholder="Enter diagnosis"
                />
              </div>
              <div className="form-group">
                <label>Symptoms</label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  rows="3"
                  placeholder="Describe symptoms..."
                />
              </div>
              <div className="form-group">
                <label>Prescription</label>
                <textarea
                  value={formData.prescription}
                  onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                  rows="3"
                  placeholder="Enter prescription details..."
                />
              </div>
              <div className="form-group">
                <label>Test Results</label>
                <textarea
                  value={formData.test_results}
                  onChange={(e) => setFormData({ ...formData, test_results: e.target.value })}
                  rows="3"
                  placeholder="Enter test results..."
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setEditingRecord(null); resetForm(); }}>
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

export default MedicalRecords;

