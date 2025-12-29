import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiClock, FiUser, FiSearch } from 'react-icons/fi';
import './BookAppointment.css';

const BookAppointment = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [patient, setPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');

  useEffect(() => {
    fetchPatient();
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (formData.doctor_id && formData.appointment_date) {
      fetchAvailableSlots();
    }
  }, [formData.doctor_id, formData.appointment_date]);

  const fetchPatient = async () => {
    try {
      const response = await api.get('/api/patients');
      const patients = response.data.patients || response.data;
      if (patients.length > 0) {
        setPatient(patients[0]);
        // Pre-fill patient_id if needed
      }
    } catch (error) {
      console.error('Error fetching patient:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const params = { status: 'active' };
      if (specializationFilter) params.specialization = specializationFilter;
      const response = await api.get('/api/doctors', { params });
      setDoctors(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      if (!formData.doctor_id || !formData.appointment_date) {
        setAvailableSlots([]);
        return;
      }

      const response = await api.get('/api/appointments', {
        params: {
          doctor_id: formData.doctor_id,
          date: formData.appointment_date,
        },
      });
      
      const bookedSlots = (response.data || []).map(apt => apt.appointment_time);
      const doctor = doctors.find(d => d.id === parseInt(formData.doctor_id));
      
      if (doctor && doctor.available_time_start && doctor.available_time_end) {
        const slots = generateTimeSlots(doctor.available_time_start, doctor.available_time_end);
        const available = slots.filter(slot => !bookedSlots.includes(slot));
        setAvailableSlots(available);
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    }
  };

  const generateTimeSlots = (start, end) => {
    const slots = [];
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`);
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }
    
    return slots;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === 'doctor_id') {
      const doctor = doctors.find(d => d.id === parseInt(e.target.value));
      setSelectedDoctor(doctor);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      if (!patient) {
        throw new Error('Patient information not found');
      }

      const appointmentData = {
        ...formData,
        patient_id: patient.id,
      };

      await api.post('/api/appointments', appointmentData);
      setMessage({ type: 'success', text: 'Appointment booked successfully!' });
      setFormData({
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        reason: '',
      });
      setSelectedDoctor(null);
      setAvailableSlots([]);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to book appointment',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = !searchTerm || 
      `${doctor.first_name} ${doctor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const specializations = [...new Set(doctors.map(d => d.specialization))];

  if (loading) {
    return <div className="loading">Loading doctors...</div>;
  }

  return (
    <div className="book-appointment">
      <h1 className="page-title">Book Appointment</h1>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSubmit} className="appointment-form">
        <div className="form-section">
          <h2>Select Doctor</h2>
          
          <div className="filter-group">
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={specializationFilter}
              onChange={(e) => {
                setSpecializationFilter(e.target.value);
                fetchDoctors();
              }}
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className="doctors-grid">
            {filteredDoctors.map(doctor => (
              <div
                key={doctor.id}
                className={`doctor-card ${formData.doctor_id === doctor.id.toString() ? 'selected' : ''}`}
                onClick={() => {
                  setFormData({ ...formData, doctor_id: doctor.id.toString() });
                  setSelectedDoctor(doctor);
                }}
              >
                <div className="doctor-info">
                  <h3>Dr. {doctor.first_name} {doctor.last_name}</h3>
                  <p className="specialization">{doctor.specialization}</p>
                  <p className="qualification">{doctor.qualification}</p>
                  <p className="experience">{doctor.experience_years} years experience</p>
                  <p className="fee">Fee: ${doctor.consultation_fee}</p>
                  <p className="availability">
                    Available: {doctor.available_days} ({doctor.available_time_start} - {doctor.available_time_end})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedDoctor && (
          <div className="form-section">
            <h2>Appointment Details</h2>
            
            <div className="form-group">
              <label htmlFor="appointment_date">
                <FiCalendar /> Appointment Date
              </label>
              <input
                type="date"
                id="appointment_date"
                name="appointment_date"
                value={formData.appointment_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {formData.appointment_date && availableSlots.length > 0 && (
              <div className="form-group">
                <label htmlFor="appointment_time">
                  <FiClock /> Available Time Slots
                </label>
                <div className="time-slots">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      className={`time-slot ${formData.appointment_time === slot ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, appointment_time: slot })}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formData.appointment_date && availableSlots.length === 0 && (
              <div className="no-slots">No available slots for this date. Please select another date.</div>
            )}

            <div className="form-group">
              <label htmlFor="reason">Reason for Visit</label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your symptoms or reason for visit"
                required
              />
            </div>

            <button type="submit" className="submit-button" disabled={submitting || !formData.appointment_time}>
              {submitting ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default BookAppointment;

