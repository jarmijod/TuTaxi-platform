import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const API_URL = 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }) => api.post('/auth/register', data).then((r) => r.data),

  getProfile: () => api.get('/auth/profile').then((r) => r.data),
};
