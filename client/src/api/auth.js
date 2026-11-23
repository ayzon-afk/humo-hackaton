import { http } from './http';

export const authApi = {
  login: (email, password) => http.post('/auth/login', { email, password }),
  register: (data) => http.post('/auth/register', data),
  me: () => http.get('/auth/me'),
};
