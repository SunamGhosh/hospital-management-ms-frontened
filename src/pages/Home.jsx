import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiActivity,
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiFileText,
  FiShield,
  FiArrowRight,
  FiCheckCircle,
  FiHeart,
  FiClock,
  FiLock,
} from 'react-icons/fi';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <FiUsers />,
      title: 'Patient Management',
      description: 'Comprehensive patient records management with complete medical history tracking.',
    },
    {
      icon: <FiUserCheck />,
      title: 'Doctor Management',
      description: 'Manage doctor profiles, specializations, and availability schedules.',
    },
    {
      icon: <FiCalendar />,
      title: 'Appointment Scheduling',
      description: 'Easy appointment booking with real-time availability and conflict detection.',
    },
    {
      icon: <FiFileText />,
      title: 'Medical Records',
      description: 'Secure and comprehensive medical records management system.',
    },
    {
      icon: <FiShield />,
      title: 'Secure Access',
      description: 'Role-based access control ensuring data security and privacy.',
    },
    {
      icon: <FiActivity />,
      title: 'Analytics Dashboard',
      description: 'Real-time statistics and insights for better decision making.',
    },
  ];

  const benefits = [
    'Streamlined patient care management',
    'Efficient appointment scheduling',
    'Secure medical records storage',
    'Role-based access control',
    'Real-time analytics and reporting',
    'Easy-to-use interface',
  ];

  return (
    <div className="home-page">
      {/* Navigation Bar */}
      <nav className="home-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <FiHeart className="logo-icon" />
            <span>Hospital MS</span>
          </div>
          <div className="nav-links">
            {user ? (
              <Link to="/app/dashboard" className="nav-link btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/login" className="nav-link btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Modern Hospital
              <span className="highlight"> Management System</span>
            </h1>
            <p className="hero-description">
              Streamline your hospital operations with our comprehensive management system.
              Manage patients, doctors, appointments, and medical records all in one place.
            </p>
            <div className="hero-buttons">
              {user ? (
                <button
                  className="btn-hero btn-primary-hero"
                  onClick={() => navigate('/app/dashboard')}
                >
                  Go to Dashboard
                  <FiArrowRight />
                </button>
              ) : (
                <>
                  <button
                    className="btn-hero btn-primary-hero"
                    onClick={() => navigate('/login')}
                  >
                    Get Started
                    <FiArrowRight />
                  </button>
                  <button
                    className="btn-hero btn-secondary-hero"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </button>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <FiUsers className="stat-icon" />
                <div>
                  <div className="stat-value">Patient Care</div>
                  <div className="stat-label">Management</div>
                </div>
              </div>
              <div className="stat-item">
                <FiClock className="stat-icon" />
                <div>
                  <div className="stat-value">24/7</div>
                  <div className="stat-label">Access</div>
                </div>
              </div>
              <div className="stat-item">
                <FiLock className="stat-icon" />
                <div>
                  <div className="stat-value">Secure</div>
                  <div className="stat-label">System</div>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <FiUsers />
              <span>Patients</span>
            </div>
            <div className="floating-card card-2">
              <FiUserCheck />
              <span>Doctors</span>
            </div>
            <div className="floating-card card-3">
              <FiCalendar />
              <span>Appointments</span>
            </div>
            <div className="floating-card card-4">
              <FiFileText />
              <span>Records</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-description">
              Everything you need to manage your hospital efficiently
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="benefits-content">
            <div className="benefits-text">
              <h2 className="section-title">Why Choose Our System?</h2>
              <p className="section-description">
                Experience the benefits of a modern, efficient hospital management system
                designed to improve patient care and streamline operations.
              </p>
              <ul className="benefits-list">
                {benefits.map((benefit, index) => (
                  <li key={index} className="benefit-item">
                    <FiCheckCircle className="benefit-icon" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              {!user && (
                <button
                  className="btn-primary-hero"
                  onClick={() => navigate('/login')}
                >
                  Get Started Now
                  <FiArrowRight />
                </button>
              )}
            </div>
            <div className="benefits-visual">
              <div className="visual-card">
                <FiActivity className="visual-icon" />
                <div className="visual-content">
                  <h3>Real-time Analytics</h3>
                  <p>Track your hospital's performance with comprehensive dashboards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Get Started?</h2>
              <p className="cta-description">
                Join thousands of healthcare professionals using our system to improve patient care.
              </p>
              <div className="cta-buttons">
                <button
                  className="btn-hero btn-primary-hero btn-large"
                  onClick={() => navigate('/login')}
                >
                  Start Free Trial
                  <FiArrowRight />
                </button>
                <button
                  className="btn-hero btn-secondary-hero btn-large"
                  onClick={() => navigate('/login')}
                >
                  Login to Account
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <FiHeart className="logo-icon" />
                <span>Hospital MS</span>
              </div>
              <p className="footer-description">
                Modern hospital management system for efficient healthcare operations.
              </p>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Quick Links</h4>
              <ul className="footer-links">
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                {user && (
                <li>
                  <Link to="/app/dashboard">Dashboard</Link>
                </li>
                )}
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-title">Features</h4>
              <ul className="footer-links">
                <li>Patient Management</li>
                <li>Appointment Scheduling</li>
                <li>Medical Records</li>
                <li>Analytics Dashboard</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Hospital Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

