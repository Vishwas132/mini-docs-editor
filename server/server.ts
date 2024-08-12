import express, { Express } from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { connectDb } from './config/dbConfig';

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

async function startServer() {
  await connectDb();
  httpServer.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
  });
}

startServer();

export default app;
