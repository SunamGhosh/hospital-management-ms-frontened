import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiTrash2, FiSearch, FiShield } from 'react-icons/fi';
import './Admins.css';

const Admins = () => {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, [searchTerm]);

  const fetchAdmins = async () => {
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await api.get('/api/admins', { params });
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await api.post('/api/admins', formData);
      alert(`Admin created successfully!\n\nLogin credentials:\nEmail: ${response.data.login_email}\nUsername: ${response.data.login_username}\nPassword: [as set during creation]`);
      setShowModal(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      setError(error.response?.data?.error || 'Error creating admin');
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      alert('You cannot delete your own account');
      return;
    }

    if (window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      try {
        await api.delete(`/api/admins/${id}`);
        fetchAdmins();
      } catch (error) {
        alert(error.response?.data?.error || 'Error deleting admin');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
    });
    setError('');
  };

  if (loading) {
    return <div className="loading">Loading admins...</div>;
  }

  return (
    <div className="admins-page">
      <div className="page-header">
        <h1 className="page-title">
          <FiShield /> Admin Management
        </h1>
        <button className="btn-primary" onClick={() => { setShowModal(true); resetForm(); }}>
          <FiPlus /> Add Admin
        </button>
      </div>

      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search admins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No admins found</td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.username}</td>
                  <td>{admin.email}</td>
                  <td>
                    <span className="role-badge">{admin.role}</span>
                  </td>
                  <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                  <td>
                    {admin.id !== currentUser?.id && (
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => handleDelete(admin.id)}
                        title="Delete Admin"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                    {admin.id === currentUser?.id && (
                      <span className="current-user-badge">Current User</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Admin</h2>
            <form onSubmit={handleSubmit}>
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-section-divider">
                <h3>Login Credentials</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  These credentials will be used by the admin to login to the system
                </p>
              </div>

              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g., admin2, superadmin"
                />
                <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                  Unique username for login
                </small>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin2@hospital.com"
                />
                <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                  Email address for login
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

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">Create Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins;


