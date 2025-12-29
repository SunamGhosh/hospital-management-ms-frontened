import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiUserCheck, FiCalendar, FiFileText, FiPlus } from 'react-icons/fi';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="error">Failed to load dashboard data</div>;
  }

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const role = user?.role;

  // Admin Dashboard
  if (role === 'admin') {
    return (
      <div className="dashboard">
        <h1 className="page-title">Admin Dashboard</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>
              <FiUsers style={{ color: '#2563eb' }} />
            </div>
            <div className="stat-content">
              <h3>Total Patients</h3>
              <p className="stat-value">{stats.totalPatients || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5' }}>
              <FiUserCheck style={{ color: '#10b981' }} />
            </div>
            <div className="stat-content">
              <h3>Active Doctors</h3>
              <p className="stat-value">{stats.totalDoctors || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>
              <FiCalendar style={{ color: '#f59e0b' }} />
            </div>
            <div className="stat-content">
              <h3>Today's Appointments</h3>
              <p className="stat-value">{stats.appointmentsToday || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fee2e2' }}>
              <FiFileText style={{ color: '#ef4444' }} />
            </div>
            <div className="stat-content">
              <h3>Pending Appointments</h3>
              <p className="stat-value">{stats.pendingAppointments || 0}</p>
            </div>
          </div>
        </div>

        {stats.appointmentsByStatus && stats.appointmentsByStatus.length > 0 && (
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Appointments by Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.appointmentsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.appointmentsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {stats.patientsByGender && stats.patientsByGender.length > 0 && (
              <div className="chart-card">
                <h3>Patients by Gender</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.patientsByGender}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="gender" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        <div className="recent-appointments">
          <h2>Recent Appointments</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAppointments && stats.recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      No upcoming appointments
                    </td>
                  </tr>
                ) : (
                  (stats.recentAppointments || []).map((apt) => (
                    <tr key={apt.id}>
                      <td>
                        {apt.patient_first_name} {apt.patient_last_name}
                      </td>
                      <td>
                        Dr. {apt.doctor_first_name} {apt.doctor_last_name}
                      </td>
                      <td>{new Date(apt.appointment_date).toLocaleDateString()}</td>
                      <td>{apt.appointment_time}</td>
                      <td>
                        <span className={`status-badge status-${apt.status}`}>
                          {apt.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Doctor Dashboard
  if (role === 'doctor') {
    return (
      <div className="dashboard">
        <h1 className="page-title">Doctor Dashboard</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>
              <FiCalendar style={{ color: '#f59e0b' }} />
            </div>
            <div className="stat-content">
              <h3>Today's Appointments</h3>
              <p className="stat-value">{stats.appointmentsToday || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fee2e2' }}>
              <FiFileText style={{ color: '#ef4444' }} />
            </div>
            <div className="stat-content">
              <h3>Pending Appointments</h3>
              <p className="stat-value">{stats.pendingAppointments || 0}</p>
            </div>
          </div>
        </div>

        <div className="recent-appointments">
          <h2>Upcoming Appointments</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAppointments && stats.recentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>
                      No upcoming appointments
                    </td>
                  </tr>
                ) : (
                  (stats.recentAppointments || []).map((apt) => (
                    <tr key={apt.id}>
                      <td>
                        {apt.patient_first_name} {apt.patient_last_name}
                      </td>
                      <td>{new Date(apt.appointment_date).toLocaleDateString()}</td>
                      <td>{apt.appointment_time}</td>
                      <td>
                        <span className={`status-badge status-${apt.status}`}>
                          {apt.status}
                        </span>
                      </td>
                      <td>{apt.reason || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Customer Dashboard
  return (
    <div className="dashboard">
      <h1 className="page-title">My Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <FiCalendar style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-content">
            <h3>Today's Appointments</h3>
            <p className="stat-value">{stats.appointmentsToday || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>
            <FiCalendar style={{ color: '#10b981' }} />
          </div>
          <div className="stat-content">
            <h3>Upcoming Appointments</h3>
            <p className="stat-value">{stats.upcomingAppointments || 0}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <button
          className="action-button"
          onClick={() => navigate('/app/book-appointment')}
        >
          <FiPlus />
          Book New Appointment
        </button>
      </div>

      <div className="recent-appointments">
        <h2>My Upcoming Appointments</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentAppointments && stats.recentAppointments.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    No upcoming appointments. <button onClick={() => navigate('/app/book-appointment')} className="link-button">Book one now</button>
                  </td>
                </tr>
              ) : (
                (stats.recentAppointments || []).map((apt) => (
                  <tr key={apt.id}>
                    <td>
                      Dr. {apt.doctor_first_name} {apt.doctor_last_name}
                    </td>
                    <td>{apt.specialization}</td>
                    <td>{new Date(apt.appointment_date).toLocaleDateString()}</td>
                    <td>{apt.appointment_time}</td>
                    <td>
                      <span className={`status-badge status-${apt.status}`}>
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

