import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { registrationsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const getCategoryClass = (category) => `cat-${category?.toLowerCase()}` || 'cat-other';

const EventListItem = ({ registration, onCancel, cancelling }) => {
  const event = registration.event;
  if (!event) return null;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="dash-event-item">
      <div className="dash-event-image">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.name} />
        ) : (
          <div className="dash-event-placeholder">🎫</div>
        )}
      </div>
      <div className="dash-event-body">
        <div className="dash-event-meta-row">
          <span className={`badge ${getCategoryClass(event.category)}`}>{event.category}</span>
          {isPast ? (
            <span className="badge badge-gray">Past</span>
          ) : (
            <span className="badge badge-success">Upcoming</span>
          )}
        </div>
        <h4 className="dash-event-name">
          <Link to={`/events/${event._id}`}>{event.name}</Link>
        </h4>
        <div className="dash-event-info">
          <span>📅 {format(new Date(event.date), 'MMM dd, yyyy · h:mm a')}</span>
          <span>📍 {event.location}</span>
          <span>🏢 {event.organizer}</span>
        </div>
        <div className="dash-event-footer">
          <span className="reg-date">
            Registered: {format(new Date(registration.registeredAt || registration.createdAt), 'MMM dd, yyyy')}
          </span>
          {!isPast && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onCancel(event._id)}
              disabled={cancelling === event._id}
            >
              {cancelling === event._id ? (
                <><div className="spinner spinner-sm" /> Cancelling</>
              ) : (
                'Cancel'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ upcoming: [], past: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [tab, setTab] = useState('upcoming');

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await registrationsAPI.getMyRegistrations();
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleCancel = async (eventId) => {
    if (!window.confirm('Cancel your registration for this event?')) return;
    setCancelling(eventId);
    try {
      await registrationsAPI.cancel(eventId);
      fetchRegistrations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel registration');
    } finally {
      setCancelling(null);
    }
  };

  const currentList = tab === 'upcoming' ? data.upcoming : data.past;

  return (
    <div className="page dashboard-page">
      <div className="container">
        {/* Header */}
        <div className="dash-header">
          <div>
            <h1 className="section-title">
              👋 Hello, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="section-subtitle">Manage your event registrations</p>
          </div>
          <Link to="/events" className="btn btn-primary">
            🎫 Browse More Events
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="dash-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-icon">📅</div>
            <div className="dash-stat-body">
              <div className="dash-stat-num">{data.upcoming.length}</div>
              <div className="dash-stat-label">Upcoming Events</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon">✅</div>
            <div className="dash-stat-body">
              <div className="dash-stat-num">{data.past.length}</div>
              <div className="dash-stat-label">Past Events</div>
            </div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-icon">🎟️</div>
            <div className="dash-stat-body">
              <div className="dash-stat-num">{data.total}</div>
              <div className="dash-stat-label">Total Registrations</div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Tabs */}
        <div className="dash-tabs">
          <button
            className={`dash-tab ${tab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setTab('upcoming')}
          >
            📅 Upcoming
            {data.upcoming.length > 0 && (
              <span className="tab-count">{data.upcoming.length}</span>
            )}
          </button>
          <button
            className={`dash-tab ${tab === 'past' ? 'active' : ''}`}
            onClick={() => setTab('past')}
          >
            ⏰ Past Events
            {data.past.length > 0 && (
              <span className="tab-count">{data.past.length}</span>
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading your registrations...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              {tab === 'upcoming' ? '🎯' : '📋'}
            </div>
            <h3>
              {tab === 'upcoming' ? 'No upcoming events' : 'No past events'}
            </h3>
            <p>
              {tab === 'upcoming'
                ? 'Browse and register for events to see them here.'
                : "Events you've attended will appear here."}
            </p>
            {tab === 'upcoming' && (
              <Link to="/events" className="btn btn-primary">
                Browse Events →
              </Link>
            )}
          </div>
        ) : (
          <div className="dash-events-list">
            {currentList.map((reg) => (
              <EventListItem
                key={reg._id}
                registration={reg}
                onCancel={handleCancel}
                cancelling={cancelling}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
