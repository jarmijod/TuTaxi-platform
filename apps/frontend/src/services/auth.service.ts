import { api } from '@/lib/axios';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

export const authService = {
  login: (data: LoginPayload) =>
    api.post('/auth/login', data).then((r) => r.data),

  register: (data: RegisterPayload) =>
    api.post('/auth/register', data).then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: (refreshToken?: string) =>
    api.post('/auth/logout', { refreshToken }),

  getProfile: () =>
    api.get('/auth/profile').then((r) => r.data),
};
