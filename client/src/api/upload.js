import { http } from './http';

export const uploadApi = {
  file: (file) => {
    const form = new FormData();
    form.append('file', file);
    return http.post('/upload', form);
  },
};
