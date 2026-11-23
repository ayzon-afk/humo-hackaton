import { http } from './http';

export const agentApi = {
  status: () => http.get('/agent/status'),
  reports: () => http.get('/agent/reports'),
  run: () => http.post('/agent/run'),
};
