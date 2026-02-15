import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useEvents from '../hooks/useEvents';
import EventCard from '../components/EventCard';
import './Events.css';

const CATEGORIES = ['Technology', 'Music', 'Sports', 'Business', 'Art', 'Food', 'Health', 'Education', 'Entertainment', 'Other'];
const SORT_OPTIONS = [
  { value: 'date', label: 'Date (Soonest)' },
  { value: '-date', label: 'Date (Latest)' },
  { value: 'price', label: 'Price (Low to High)' },
  { value: '-price', label: 'Price (High to Low)' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: '-availableSeats', label: 'Most Popular' },
];

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [locations, setLocations] = useState([]);

  const { events, pagination, loading, error, filters, updateFilter, resetFilters, goToPage } = useEvents({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
  });

  // Keep URL in sync with filters
  useEffect(() => {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    setSearchParams(params, { replace: true });
  }, [filters.search, filters.category, setSearchParams]);

  // Fetch unique locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const { eventsAPI } = await import('../utils/api');
        const { data } = await eventsAPI.getLocations();
        setLocations(data);
      } catch {}
    };
    fetchLocations();
  }, []);

  const hasActiveFilters = filters.search || filters.category || filters.location || filters.dateFrom || filters.dateTo;

  return (
    <div className="page events-page">
      <div className="container">
        {/* Page Header */}
        <div className="events-header">
          <div>
            <h1 className="section-title">🎫 Browse Events</h1>
            {pagination && (
              <p className="section-subtitle">
                {pagination.totalEvents} events available
              </p>
            )}
          </div>
        </div>

        {/* Filters Bar */}
        <div className="filters-bar">
          {/* Search */}
          <div className="filter-search">
            <span className="filter-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="filter-search-input"
            />
            {filters.search && (
              <button className="filter-clear-btn" onClick={() => updateFilter('search', '')}>
                ✕
              </button>
            )}
          </div>

          {/* Category */}
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Location */}
          <select
            value={filters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="filter-select"
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Date From */}
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
            className="filter-select filter-date"
            title="From date"
          />

          {/* Sort */}
          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="filter-select"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Reset */}
          {hasActiveFilters && (
            <button className="btn btn-secondary btn-sm filter-reset" onClick={resetFilters}>
              Clear All
            </button>
          )}
        </div>

        {/* Active filter tags */}
        {hasActiveFilters && (
          <div className="active-filters">
            {filters.search && (
              <span className="filter-tag">
                🔍 "{filters.search}"
                <button onClick={() => updateFilter('search', '')}>✕</button>
              </span>
            )}
            {filters.category && (
              <span className="filter-tag">
                📂 {filters.category}
                <button onClick={() => updateFilter('category', '')}>✕</button>
              </span>
            )}
            {filters.location && (
              <span className="filter-tag">
                📍 {filters.location}
                <button onClick={() => updateFilter('location', '')}>✕</button>
              </span>
            )}
            {filters.dateFrom && (
              <span className="filter-tag">
                📅 From {filters.dateFrom}
                <button onClick={() => updateFilter('dateFrom', '')}>✕</button>
              </span>
            )}
          </div>
        )}

        {/* Error */}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Events Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No events found</h3>
            <p>Try adjusting your filters or search query to find more events.</p>
            <button className="btn btn-primary" onClick={resetFilters}>Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="events-grid-container">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => goToPage(pagination.current - 1)}
                  disabled={!pagination.hasPrev}
                >
                  ‹
                </button>

                {Array.from({ length: pagination.total }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - pagination.current) <= 2)
                  .map((page) => (
                    <button
                      key={page}
                      className={`pagination-btn ${page === pagination.current ? 'active' : ''}`}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                <button
                  className="pagination-btn"
                  onClick={() => goToPage(pagination.current + 1)}
                  disabled={!pagination.hasNext}
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Events;
