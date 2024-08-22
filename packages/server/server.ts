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
    if (documentId == null) return;
    const newDocument = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit('load-document', newDocument);

    socket.on('send-changes', async (document, callback) => {
      socket.broadcast.to(documentId).emit('receive-changes', document);
      if (!document?._id) {
        await Document.findByIdAndUpdate(documentId, document);
      } else {
        const newDocument = await Document.create(document);
        if (newDocument) {
          callback({ status: 'success', _id: newDocument._id });
        }
      }
    });

    socket.on('cursor-move', cursor => {
      socket.broadcast.to(documentId).emit('receive-cursor', cursor);
    });
  });
});

async function findOrCreateDocument(documentId: string) {
  if (documentId == null) return;

  const existingDocument = await Document.findById(documentId);
  if (existingDocument) return existingDocument;

  return await Document.create({
    _id: documentId,
    fileName: 'untitled',
    data: {},
  });
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
