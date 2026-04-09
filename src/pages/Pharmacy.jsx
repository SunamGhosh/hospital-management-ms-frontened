import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiPackage, FiCalendar, FiDollarSign } from 'react-icons/fi';
import './Pharmacy.css';

const Pharmacy = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    manufacturer: '',
    expiry_date: '',
    price: '',
    stock_quantity: '',
    status: 'available',
    image: null,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchMedicines();
  }, [searchTerm]);

  const fetchMedicines = async () => {
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await api.get('/api/medicines', { params });
      setMedicines(response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && key !== 'image') {
          data.append(key, formData[key]);
        }
      });
      
      if (selectedFile) {
        data.append('image', selectedFile);
      }

      if (editingMedicine) {
        await api.put(`/api/medicines/${editingMedicine._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/api/medicines', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShowModal(false);
      setEditingMedicine(null);
      resetForm();
      fetchMedicines();
    } catch (error) {
      console.error('Error saving medicine:', error);
      alert(error.response?.data?.error || 'Error saving medicine');
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name || '',
      category: medicine.category || '',
      manufacturer: medicine.manufacturer || '',
      expiry_date: medicine.expiry_date ? new Date(medicine.expiry_date).toISOString().split('T')[0] : '',
      price: medicine.price || '',
      stock_quantity: medicine.stock_quantity || '',
      status: medicine.status || 'available',
    });
    setSelectedFile(null);
    setImagePreview(medicine.image ? `${api.defaults.baseURL}${medicine.image}` : null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await api.delete(`/api/medicines/${id}`);
        fetchMedicines();
      } catch (error) {
        console.error('Error deleting medicine:', error);
        alert('Error deleting medicine');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      manufacturer: '',
      expiry_date: '',
      price: '',
      stock_quantity: '',
      status: 'available',
    });
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="loading">Loading pharmacy inventory...</div>;
  }

  return (
    <div className="pharmacy-page">
      <div className="page-header">
        <h1 className="page-title">Pharmacy Management</h1>
        <button className="btn-primary" onClick={() => { setShowModal(true); setEditingMedicine(null); resetForm(); }}>
          <FiPlus /> Add Medicine
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon icon-blue"><FiPackage /></div>
          <div className="stat-details">
            <span className="stat-label">Total Medicines</span>
            <span className="stat-value">{medicines.length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-green"><FiCalendar /></div>
          <div className="stat-details">
            <span className="stat-label">In Stock</span>
            <span className="stat-value">{medicines.filter(m => m.status === 'available').length}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-yellow"><FiDollarSign /></div>
          <div className="stat-details">
            <span className="stat-label">Out of Stock</span>
            <span className="stat-value">{medicines.filter(m => m.status === 'out of stock').length}</span>
          </div>
        </div>
      </div>

      <div className="search-bar">
        <FiSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by name, ID or manufacturer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Medicine ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Manufacturer</th>
              <th>Expiry Date</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center' }}>No medicines found</td>
              </tr>
            ) : (
              medicines.map((medicine) => (
                <tr key={medicine._id}>
                  <td>
                    {medicine.image ? (
                      <img 
                        src={`${api.defaults.baseURL}${medicine.image}`} 
                        alt={medicine.name} 
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiPackage />
                      </div>
                    )}
                  </td>
                  <td>{medicine.medicine_id}</td>
                  <td><strong>{medicine.name}</strong></td>
                  <td>{medicine.category}</td>
                  <td>{medicine.manufacturer || '-'}</td>
                  <td>{medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : '-'}</td>
                  <td>₹{medicine.price}</td>
                  <td>{medicine.stock_quantity}</td>
                  <td>
                    <span className={`status-badge status-${medicine.status.replace(' ', '-')}`}>
                      {medicine.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Edit" onClick={() => handleEdit(medicine)}>
                        <FiEdit />
                      </button>
                      <button className="btn-icon btn-danger" title="Delete" onClick={() => handleDelete(medicine._id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingMedicine(null); resetForm(); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Medicine Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Paracetamol"
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Analgesic, Antibiotic"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g. PharmaCorp"
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Medicine Image</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>

              {editingMedicine && (
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="available">Available</option>
                    <option value="out of stock">Out of Stock</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setEditingMedicine(null); resetForm(); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingMedicine ? 'Update Medicine' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;
