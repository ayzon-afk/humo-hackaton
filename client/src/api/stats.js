import { http } from './http';

export const statsApi = {
  get: (collection) => http.get(`/stats/${collection}`),
};
