import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">🎪 Bellcorp Events</span>
          <p>Discover amazing events around India. Register, attend, and create memories.</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Explore</h4>
            <Link to="/events">Browse Events</Link>
            <Link to="/events?category=Technology">Tech Events</Link>
            <Link to="/events?category=Music">Music Events</Link>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/register">Sign Up</Link>
            <Link to="/login">Log In</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} Bellcorp Events. Built with ❤️ using MERN Stack.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
