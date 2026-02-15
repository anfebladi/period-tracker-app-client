import axios from 'axios';
import { getStoredToken } from './context/AuthContext.jsx';

const api = axios.create({
  baseURL: '/api/',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers['x-user-token'] = token;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      try {
        localStorage.removeItem('period_app_user_token');
      } catch (_) {}
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    return Promise.reject(err);
  }
);

export default api;
