import axios from 'axios';

// Use relative /api/ so Vite dev proxy can forward to your backend (no CORS)
const api = axios.create({
  baseURL: '/api/',
  timeout: 10000,
});

export default api;


