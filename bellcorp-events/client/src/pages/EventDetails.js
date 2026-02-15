import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { eventsAPI, registrationsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './EventDetails.css';

const getCategoryClass = (category) => `cat-${category?.toLowerCase()}` || 'cat-other';

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [checkingReg, setCheckingReg] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await eventsAPI.getById(id);
        setEvent(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Event not found');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    const checkReg = async () => {
      if (!user || !event) return;
      setCheckingReg(true);
      try {
        const { data } = await registrationsAPI.checkRegistration(id);
        setIsRegistered(data.isRegistered);
      } catch {}
      finally { setCheckingReg(false); }
    };
    checkReg();
  }, [user, event, id]);

  const handleRegister = async () => {
    if (!user) return navigate('/login', { state: { from: `/events/${id}` } });
    setActionLoading(true);
    setActionMessage(null);
    try {
      await registrationsAPI.register(id);
      setIsRegistered(true);
      setEvent((prev) => ({ ...prev, availableSeats: prev.availableSeats - 1 }));
      setActionMessage({ type: 'success', text: '🎉 Successfully registered! Check your dashboard.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Registration failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your registration?')) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      await registrationsAPI.cancel(id);
      setIsRegistered(false);
      setEvent((prev) => ({ ...prev, availableSeats: prev.availableSeats + 1 }));
      setActionMessage({ type: 'success', text: 'Registration cancelled successfully.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Cancellation failed' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /><p>Loading event...</p></div>;
  if (error) return (
    <div className="page container">
      <div className="alert alert-error">{error}</div>
      <Link to="/events" className="btn btn-secondary">← Back to Events</Link>
    </div>
  );

  const isPast = new Date(event.date) < new Date();
  const isSoldOut = event.availableSeats <= 0;
  const occupancyPct = Math.round(((event.capacity - event.availableSeats) / event.capacity) * 100);

  return (
    <div className="page event-details-page">
      <div className="container">
        <Link to="/events" className="back-link">← Back to Events</Link>

        <div className="event-details-layout">
          {/* Main Content */}
          <div className="event-details-main">
            {/* Header Image */}
            <div className="event-details-image">
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.name} />
              ) : (
                <div className="event-image-placeholder">🎫</div>
              )}
              {event.isFeatured && <span className="det-badge-featured">⭐ Featured Event</span>}
            </div>

            {/* Event Info */}
            <div className="event-details-card card">
              <div className="event-details-header">
                <span className={`badge ${getCategoryClass(event.category)}`}>{event.category}</span>
                {isPast && <span className="badge badge-gray">Past Event</span>}
                {event.price === 0 && <span className="badge badge-success">🎟️ Free</span>}
              </div>
              <h1 className="event-details-title">{event.name}</h1>

              <div className="event-details-meta">
                <div className="det-meta-item">
                  <span className="det-meta-icon">📅</span>
                  <div>
                    <div className="det-meta-label">Date & Time</div>
                    <div className="det-meta-value">{format(new Date(event.date), 'EEEE, MMMM dd, yyyy · h:mm a')}</div>
                    {event.endDate && (
                      <div className="det-meta-sub">Ends: {format(new Date(event.endDate), 'h:mm a')}</div>
                    )}
                  </div>
                </div>
                <div className="det-meta-item">
                  <span className="det-meta-icon">📍</span>
                  <div>
                    <div className="det-meta-label">Location</div>
                    <div className="det-meta-value">{event.location}</div>
                  </div>
                </div>
                <div className="det-meta-item">
                  <span className="det-meta-icon">🏢</span>
                  <div>
                    <div className="det-meta-label">Organizer</div>
                    <div className="det-meta-value">{event.organizer}</div>
                  </div>
                </div>
              </div>

              <hr className="divider" />

              {/* Description */}
              <div className="event-description">
                <h3>About This Event</h3>
                <p>{event.description}</p>
              </div>

              {/* Tags */}
              {event.tags?.length > 0 && (
                <div className="event-tags">
                  {event.tags.map((tag) => (
                    <span key={tag} className="event-tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="event-details-sidebar">
            {/* Registration Card */}
            <div className="reg-card card">
              {/* Price */}
              <div className="reg-price">
                {event.price === 0 ? (
                  <span className="price-free-lg">Free Event</span>
                ) : (
                  <>
                    <span className="price-label">Price</span>
                    <span className="price-value">₹{event.price.toLocaleString('en-IN')}</span>
                  </>
                )}
              </div>

              <hr className="divider" />

              {/* Capacity */}
              <div className="reg-capacity">
                <div className="capacity-header">
                  <span>Availability</span>
                  <span className={isSoldOut ? 'text-danger' : 'text-success'}>
                    {isSoldOut ? 'Sold Out' : `${event.availableSeats} of ${event.capacity} seats left`}
                  </span>
                </div>
                <div className="capacity-bar">
                  <div className="capacity-fill" style={{ width: `${occupancyPct}%` }} />
                </div>
                <div className="capacity-sub">{occupancyPct}% filled</div>
              </div>

              <hr className="divider" />

              {/* Action message */}
              {actionMessage && (
                <div className={`alert alert-${actionMessage.type}`}>
                  {actionMessage.text}
                </div>
              )}

              {/* CTA Button */}
              {checkingReg ? (
                <button className="btn btn-primary btn-lg w-full" disabled>
                  <div className="spinner spinner-sm" /> Checking...
                </button>
              ) : isPast ? (
                <div className="reg-past-msg">
                  <span>⏰</span> This event has already ended.
                </div>
              ) : isRegistered ? (
                <>
                  <div className="reg-confirmed-msg">
                    ✅ You're registered for this event!
                  </div>
                  <button
                    className="btn btn-danger btn-lg w-full"
                    onClick={handleCancel}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <><div className="spinner spinner-sm" /> Cancelling...</> : 'Cancel Registration'}
                  </button>
                </>
              ) : isSoldOut ? (
                <div className="reg-soldout-msg">
                  😞 This event is sold out.
                </div>
              ) : !user ? (
                <div>
                  <button className="btn btn-primary btn-lg w-full" onClick={() => navigate('/login', { state: { from: `/events/${id}` } })}>
                    Login to Register
                  </button>
                  <p className="reg-signup-hint">
                    Don't have an account? <Link to="/register">Sign up free</Link>
                  </p>
                </div>
              ) : (
                <button
                  className="btn btn-primary btn-lg w-full"
                  onClick={handleRegister}
                  disabled={actionLoading}
                >
                  {actionLoading ? <><div className="spinner spinner-sm" /> Registering...</> : '🎫 Register Now'}
                </button>
              )}

              {/* Share */}
              <button
                className="btn btn-secondary btn-sm w-full share-btn"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
              >
                📤 Share Event
              </button>
            </div>

            {/* Event Summary Card */}
            <div className="event-summary-card card">
              <h4>Quick Info</h4>
              <div className="summary-list">
                <div className="summary-item">
                  <span>Capacity</span>
                  <strong>{event.capacity} people</strong>
                </div>
                <div className="summary-item">
                  <span>Category</span>
                  <strong>{event.category}</strong>
                </div>
                {event.tags?.length > 0 && (
                  <div className="summary-item">
                    <span>Tags</span>
                    <strong>{event.tags.slice(0, 3).join(', ')}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
