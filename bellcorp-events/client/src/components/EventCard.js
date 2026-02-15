import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import './EventCard.css';

const getCategoryClass = (category) => {
  return `cat-${category?.toLowerCase().replace(/\s+/g, '-')}` || 'cat-other';
};

const EventCard = ({ event }) => {
  const isSoldOut = event.availableSeats <= 0;
  const isAlmostFull = event.availableSeats <= 10 && event.availableSeats > 0;
  const isPast = new Date(event.date) < new Date();

  return (
    <Link to={`/events/${event._id}`} className="event-card fade-in">
      {/* Image */}
      <div className="event-card-image">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.name} loading="lazy" />
        ) : (
          <div className="event-card-placeholder">
            <span></span>
          </div>
        )}
        {/* Status badges */}
        <div className="event-card-badges">
          {event.isFeatured && <span className="badge-featured"> Featured</span>}
          {isSoldOut && <span className="badge-soldout">Sold Out</span>}
          {isPast && !isSoldOut && <span className="badge-past">Past</span>}
          {isAlmostFull && !isSoldOut && <span className="badge-almost">Almost Full</span>}
        </div>
        {event.price === 0 && <span className="badge-free">FREE</span>}
      </div>

      {/* Content */}
      <div className="event-card-body">
        {/* Category */}
        <span className={`badge ${getCategoryClass(event.category)}`}>
          {event.category}
        </span>

        {/* Name */}
        <h3 className="event-card-title">{event.name}</h3>

        {/* Meta info */}
        <div className="event-card-meta">
          <div className="event-meta-item">
            <span className="meta-icon"></span>
            <span>{format(new Date(event.date), 'MMM dd, yyyy · h:mm a')}</span>
          </div>
          <div className="event-meta-item">
            <span className="meta-icon"></span>
            <span>{event.location}</span>
          </div>
          <div className="event-meta-item">
            <span className="meta-icon"></span>
            <span>{event.organizer}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="event-card-footer">
          <div className="event-seats">
            <div
              className="seats-bar"
              style={{
                '--fill': `${Math.max(0, 100 - (event.availableSeats / event.capacity) * 100)}%`,
              }}
            />
            <span className={`seats-text ${isSoldOut ? 'sold-out' : isAlmostFull ? 'almost-full' : ''}`}>
              {isSoldOut
                ? 'Sold Out'
                : `${event.availableSeats} seats left`}
            </span>
          </div>
          <div className="event-price">
            {event.price === 0 ? (
              <span className="price-free">Free</span>
            ) : (
              <span className="price-amount">₹{event.price.toLocaleString('en-IN')}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
