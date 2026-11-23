import http from 'node:http';
import { createApp } from './app.js';
import { config } from './config.js';
import { initSocket } from './realtime/socket.js';
import { ensureSeed } from './db/seed.js';
import { aiEnabled } from './services/ai.service.js';

ensureSeed();

const app = createApp();
const server = http.createServer(app);
initSocket(server);

server.listen(config.port, () => {
  console.log(`🚀 API:  http://localhost:${config.port}/api/health`);
  console.log(`🤖 AI:   ${aiEnabled() ? config.ai.model : 'DEMO-режим (ключ не задан)'}`);
  console.log(`📦 CRUD: ${config.collections.map((c) => '/api/' + c).join(', ')}`);
});
