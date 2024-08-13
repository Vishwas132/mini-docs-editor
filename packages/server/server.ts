import express, { Express } from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { connectDb } from './config/dbConfig';
import { Document } from './models';

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', socket => {
  socket.on('get-document', async documentId => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit('load-document', document?.data);

    socket.on('send-changes', delta => {
      socket.broadcast.to(documentId).emit('receive-changes', delta);
    });

    socket.on('save-document', async data => {
      await Document.findByIdAndUpdate(documentId, { data });
    });

    socket.on('cursor-move', cursor => {
      socket.broadcast.to(documentId).emit('receive-cursor', cursor);
    });
  });
});

async function findOrCreateDocument(id: string | null) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  const data = {};
  return await Document.create({ _id: id, data });
}

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
