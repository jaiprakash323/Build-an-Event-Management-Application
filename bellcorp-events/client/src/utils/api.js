import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  getFeatured: () => api.get('/events/featured'),
  getCategories: () => api.get('/events/categories'),
  getLocations: () => api.get('/events/locations'),
};

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Registrations API
export const registrationsAPI = {
  register: (eventId) => api.post(`/registrations/${eventId}`),
  cancel: (eventId) => api.delete(`/registrations/${eventId}`),
  getMyRegistrations: () => api.get('/registrations/my'),
  checkRegistration: (eventId) => api.get(`/registrations/check/${eventId}`),
};

export default api;
