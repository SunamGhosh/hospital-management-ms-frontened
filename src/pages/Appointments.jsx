import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiCalendar } from 'react-icons/fi';
import './Appointments.css';

const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    notes: '',
    status: 'scheduled',
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
  }, [searchTerm, filterDate]);

  const fetchAppointments = async () => {
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filterDate) params.date = filterDate;
      const response = await api.get('/api/appointments', { params });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      // Only fetch patients if user is admin or doctor
      if (user?.role === 'admin' || user?.role === 'doctor') {
        const response = await api.get('/api/patients');
        setPatients(response.data.patients || response.data);
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        await api.put(`/api/appointments/${editingAppointment.id}`, formData);
      } else {
        await api.post('/api/appointments', formData);
      }
      setShowModal(false);
      setEditingAppointment(null);
      resetForm();
      fetchAppointments();
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert(error.response?.data?.error || 'Error saving appointment');
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patient_id: appointment.patient_id || '',
      doctor_id: appointment.doctor_id || '',
      appointment_date: appointment.appointment_date || '',
      appointment_time: appointment.appointment_time || '',
      reason: appointment.reason || '',
      notes: appointment.notes || '',
      status: appointment.status || 'scheduled',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirmMessage = user?.role === 'customer' 
      ? 'Are you sure you want to cancel this appointment?'
      : 'Are you sure you want to delete this appointment?';
    
    if (window.confirm(confirmMessage)) {
      try {
        await api.delete(`/api/appointments/${id}`);
        fetchAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        alert(error.response?.data?.error || 'Error deleting appointment');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      reason: '',
      notes: '',
      status: 'scheduled',
    });
  };

  if (loading) {
    return <div className="loading">Loading appointments...</div>;
  }

  const canCreateAppointment = user?.role === 'admin' || user?.role === 'doctor';
  const canEditAppointment = user?.role === 'admin' || user?.role === 'doctor';
  const canDeleteAppointment = user?.role === 'admin' || user?.role === 'customer';

  return (
    <div className="appointments-page">
      <div className="page-header">
        <h1 className="page-title">
          {user?.role === 'customer' ? 'My Appointments' : 
           user?.role === 'doctor' ? 'My Appointments' : 
           'Appointments'}
        </h1>
        {canCreateAppointment && (
          <button className="btn-primary" onClick={() => { setShowModal(true); setEditingAppointment(null); resetForm(); }}>
            <FiPlus /> Schedule Appointment
          </button>
        )}
        {user?.role === 'customer' && (
          <button className="btn-primary" onClick={() => navigate('/app/book-appointment')}>
            <FiPlus /> Book New Appointment
          </button>
        )}
      </div>

      <div className="filters">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="date-filter">
          <FiCalendar className="search-icon" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Appointment ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center' }}>No appointments found</td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.appointment_id}</td>
                  <td>
                    {appointment.patient_first_name} {appointment.patient_last_name}
                  </td>
                  <td>
                    Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}
                    <br />
                    <small style={{ color: '#6b7280' }}>{appointment.specialization}</small>
                  </td>
                  <td>{new Date(appointment.appointment_date).toLocaleDateString()}</td>
                  <td>{appointment.appointment_time}</td>
                  <td>{appointment.reason || '-'}</td>
                  <td>
                    <span className={`status-badge status-${appointment.status}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    {canEditAppointment && (
                      <button className="btn-icon" onClick={() => handleEdit(appointment)}>
                        <FiEdit />
                      </button>
                    )}
                    {canDeleteAppointment && (
                      <button className="btn-icon btn-danger" onClick={() => handleDelete(appointment.id)}>
                        <FiTrash2 />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingAppointment(null); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                {user?.role === 'admin' && (
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
                )}
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
                  <label>Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label>Appointment Time *</label>
                  <input
                    type="time"
                    required
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Reason</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g., Regular checkup, Follow-up"
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
              {editingAppointment && (user?.role === 'admin' || user?.role === 'doctor') && (
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setEditingAppointment(null); resetForm(); }}>
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

export default Appointments;

