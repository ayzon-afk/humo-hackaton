import { http } from './http';

/** CRUD-клиент для любой коллекции сервера */
export const crudApi = (name) => ({
  list: (params) => http.get(`/${name}`, { params }),
  get: (id) => http.get(`/${name}/${id}`),
  create: (data) => http.post(`/${name}`, data),
  update: (id, data) => http.patch(`/${name}/${id}`, data),
  remove: (id) => http.delete(`/${name}/${id}`),
});
