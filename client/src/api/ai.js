import { http } from './http';

export const aiApi = {
  chat: (messages, system) => http.post('/ai/chat', { messages, system }),
  analyze: (text, instruction) => http.post('/ai/analyze', { text, instruction }),
  vision: (file, prompt) => {
    const form = new FormData();
    form.append('image', file);
    if (prompt) form.append('prompt', prompt);
    return http.post('/ai/vision', form);
  },
};
