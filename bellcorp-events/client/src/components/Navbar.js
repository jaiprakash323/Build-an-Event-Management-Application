import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span className="navbar-logo-icon">🎪</span>
          <span className="navbar-logo-text">
            Bell<span className="logo-accent">corp</span> Events
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Browse Events
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="navbar-auth">
          {user ? (
            <div className="user-menu">
              <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
              <span className="user-name">{user.name.split(' ')[0]}</span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/events" className="mobile-nav-link" onClick={closeMenu}>
            🎫 Browse Events
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className="mobile-nav-link" onClick={closeMenu}>
               Dashboard
            </NavLink>
          )}
          <div className="mobile-divider" />
          {user ? (
            <>
              <div className="mobile-user-info">
                <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="user-name">{user.name}</div>
                  <div className="user-email">{user.email}</div>
                </div>
              </div>
              <button className="btn btn-danger btn-sm mobile-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <div className="mobile-auth-btns">
              <Link to="/login" className="btn btn-secondary" onClick={closeMenu}>Log In</Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMenu}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
