import { http } from './http';

export const operatorApi = {
  state: () => http.get('/operator/state'),
  command: (text) => http.post('/operator/command', { text }),
  briefing: () => http.get('/operator/briefing'),
  confirm: (id) => http.post(`/operator/proposals/${id}/confirm`, {}),
  reject: (id) => http.post(`/operator/proposals/${id}/reject`, {}),
  demoSale: (productId) => http.post('/operator/demo/sale', { productId }),
};
