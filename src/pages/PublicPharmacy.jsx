import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FiSearch, FiPackage, FiActivity } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './Pharmacy.css';

const PublicPharmacy = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMedicines();
  }, [searchTerm]);

  const fetchMedicines = async () => {
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      console.log('Fetching medicines from:', api.defaults.baseURL + '/api/medicines', 'with params:', params);
      const response = await api.get('/api/medicines', { params });
      console.log('Medicines response:', response.data);
      setMedicines(response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-pharmacy-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header className="public-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827' }}>Hospital Pharmacy</h1>
          <p style={{ color: '#6b7280' }}>Browse our available medicines and healthcare products</p>
        </div>
        <Link to="/" style={{ color: '#3b82f6', fontWeight: '600', textDecoration: 'none' }}>Back to Home</Link>
      </header>

      <div className="search-bar" style={{ marginBottom: '2rem', background: 'white', display: 'flex', alignItems: 'center', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <FiSearch className="search-icon" style={{ marginRight: '1rem', color: '#9ca3af' }} />
        <input
          type="text"
          placeholder="Search by medicine name, category, or manufacturer..."
          value={searchTerm}
          style={{ width: '100%', border: 'none', outline: 'none', fontSize: '1rem' }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading" style={{ textAlign: 'center', padding: '4rem' }}>
          <FiActivity className="loading-spinner" style={{ fontSize: '3rem', color: '#3b82f6', animation: 'spin 2s linear infinite' }} />
          <p style={{ marginTop: '1rem' }}>Loading medicines...</p>
        </div>
      ) : (
        <div className="medicine-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {medicines.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
              <FiPackage style={{ fontSize: '4rem', color: '#e5e7eb' }} />
              <p>No medicines found.</p>
            </div>
          ) : (
            medicines.map((medicine) => (
              <div key={medicine._id} className="medicine-card" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', transition: 'transform 0.3s' }}>
                <div className="medicine-image-container" style={{ height: '200px', background: '#f8fafc', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {medicine.image ? (
                    <img 
                      src={`${api.defaults.baseURL}${medicine.image}`} 
                      alt={medicine.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <FiPackage style={{ fontSize: '4rem', color: '#cbd5e1' }} />
                  )}
                </div>
                <div className="medicine-card-content" style={{ padding: '1.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#3b82f6', background: '#eff6ff', padding: '0.25rem 0.75rem', borderRadius: '100px' }}>
                    {medicine.category}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', marginTop: '0.75rem', fontWeight: '700', color: '#1f2937' }}>{medicine.name}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.5rem 0' }}>By {medicine.manufacturer || 'Unknown Manufacturer'}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827' }}>₹{medicine.price}</span>
                    <span className={`status-badge status-${medicine.status.replace(' ', '-')}`} style={{ 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '8px', 
                      fontSize: '0.75rem', 
                      fontWeight: '700',
                      background: medicine.status === 'available' ? '#dcfce7' : '#fee2e2',
                      color: medicine.status === 'available' ? '#16a34a' : '#ef4444'
                    }}>
                      {medicine.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PublicPharmacy;
