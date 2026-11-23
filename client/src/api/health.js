import { http } from './http';

export const healthApi = {
  get: () => http.get('/health'),
};
