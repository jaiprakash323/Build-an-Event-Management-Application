import { useState, useEffect, useCallback, useRef } from 'react';
import { eventsAPI } from '../utils/api';

const useEvents = (initialFilters = {}) => {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 12,
    sort: 'date',
    ...initialFilters,
  });

  const debounceTimer = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchEvents = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await eventsAPI.getAll(params);
      if (isMounted.current) {
        setEvents(data.events);
        setPagination(data.pagination);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.response?.data?.message || 'Failed to fetch events');
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  // Debounce search, immediate for other filters
  useEffect(() => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchEvents(filters);
    }, filters.search ? 400 : 0);

    return () => clearTimeout(debounceTimer.current);
  }, [filters, fetchEvents]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Reset to page 1 on filter change
    }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const goToPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      location: '',
      dateFrom: '',
      dateTo: '',
      page: 1,
      limit: 12,
      sort: 'date',
    });
  }, []);

  return {
    events,
    pagination,
    loading,
    error,
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    goToPage,
    refetch: () => fetchEvents(filters),
  };
};

export default useEvents;
