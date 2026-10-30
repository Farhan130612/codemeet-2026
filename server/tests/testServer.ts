import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from '../src/server.js';
import { setupSocketHandlers } from '../src/socketHandler.js';

export function createIsolatedTestServer(): Promise<{
  server: http.Server;
  io: SocketIOServer;
  port: number;
  close: () => Promise<void>;
}> {
  return new Promise((resolve) => {
    const server = http.createServer(app);
    const io = new SocketIOServer(server, {
      cors: { origin: '*' },
    });
    setupSocketHandlers(io);

    server.listen(0, () => {
      const addr = server.address();
      const port = addr && typeof addr !== 'string' ? addr.port : 0;
      resolve({
        server,
        io,
        port,
        close: () =>
          new Promise<void>((res) => {
            io.close(() => {
              server.close(() => res());
            });
          }),
      });
    });
  });
}
