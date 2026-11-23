import { Server } from 'socket.io';

let io = null;

export function initSocket(server) {
  io = new Server(server, { cors: { origin: '*' } });
  io.on('connection', (socket) => {
    console.log('🔌 client connected', socket.id);
    socket.on('disconnect', () => console.log('🔌 client left', socket.id));
  });
  return io;
}

/** Отправить событие всем клиентам (вау-эффект на демо: данные появляются сами) */
export function emit(event, payload) {
  io?.emit(event, payload);
}
