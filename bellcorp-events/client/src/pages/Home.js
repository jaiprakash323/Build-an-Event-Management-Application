import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../utils/api';
import EventCard from '../components/EventCard';
import './Home.css';

const CATEGORIES = [
  { icon: '💻', label: 'Technology' },
  { icon: '🎵', label: 'Music' },
  { icon: '🏏', label: 'Sports' },
  { icon: '💼', label: 'Business' },
  { icon: '🎨', label: 'Art' },
  { icon: '🍽️', label: 'Food' },
  { icon: '🏃', label: 'Health' },
  { icon: '📚', label: 'Education' },
  { icon: '🎬', label: 'Entertainment' },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await eventsAPI.getFeatured();
        setFeatured(data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-badge">🎉 India's Premier Event Platform</div>
          <h1 className="hero-title">
            Discover Events<br />
            <span className="hero-gradient">That Inspire You</span>
          </h1>
          <p className="hero-subtitle">
            From tech conferences to music festivals — find, register, and
            experience the best events across India.
          </p>

          {/* Search bar */}
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search events, organizers, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="hero-search-input"
            />
            <button type="submit" className="btn btn-primary btn-lg hero-search-btn">
              🔍 Search Events
            </button>
          </form>

          <div className="hero-stats">
            <div className="hero-stat">
              <strong>20+</strong>
              <span>Events Live</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>10+</strong>
              <span>Cities</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>9</strong>
              <span>Categories</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-heading">Browse by Category</h2>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                to={`/events?category=${cat.label}`}
                className="category-chip"
              >
                <span className="category-chip-icon">{cat.icon}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">⭐ Featured Events</h2>
              <p className="section-subtitle">Handpicked events you shouldn't miss</p>
            </div>
            <Link to="/events" className="btn btn-outline">
              View All Events →
            </Link>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>Loading events...</p>
            </div>
          ) : featured.length > 0 ? (
            <div className="events-grid">
              {featured.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"></div>
              <h3>No featured events yet</h3>
              <p>Check back soon for exciting upcoming events!</p>
              <Link to="/events" className="btn btn-primary">Browse All Events</Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Ready to Start Exploring?</h2>
              <p>Join thousands of event-goers who discover and attend amazing events every week.</p>
              <div className="cta-btns">
                <Link to="/events" className="btn btn-primary btn-lg">
                   Browse Events
                </Link>
                <Link to="/register" className="btn btn-outline btn-lg cta-secondary-btn">
                  Create Account →
                </Link>
              </div>
            </div>
            <div className="cta-illustration">🎪</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
