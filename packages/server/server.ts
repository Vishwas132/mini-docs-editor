import express, { Express } from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { connectDb } from './config/dbConfig.js';
import { Document } from './models/index.js';
import { IDocument } from './types/types.d.js';
import { Socket } from 'socket.io';

const { NODE_ENV } = process.env;
let { CLIENT_ADDRESS, SERVER_ADDRESS } = process.env;
CLIENT_ADDRESS =
  NODE_ENV === 'production' ? CLIENT_ADDRESS : 'http://localhost:4173';
SERVER_ADDRESS =
  NODE_ENV === 'production' ? SERVER_ADDRESS : 'http://localhost:3000';
const PORT = process.env.PORT || 3000;

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ADDRESS,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket: Socket) => {
  socket.on('get-document', async (documentId: string) => {
    if (!documentId) return;
    const newDocument = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit('load-document', newDocument);

    socket.on(
      'changes-to-server',
      async (
        document: Partial<IDocument>,
        callback: (response: { status: string; _id: string }) => void
      ) => {
        socket.broadcast.to(documentId).emit('changes-to-client', document);
        try {
          const updatedDocument = await Document.findByIdAndUpdate(
            documentId,
            document,
            { new: true }
          );

          if (updatedDocument) {
            callback({ status: 'success', _id: updatedDocument._id });
          } else {
            callback({ status: 'error', _id: '' });
          }
        } catch (error) {
          console.error('Error updating document:', error);
          callback({ status: 'error', _id: '' });
        }
      }
    );

    socket.on('cursor-move', (cursor: { x: number; y: number }) => {
      socket.broadcast.to(documentId).emit('receive-cursor', cursor);
    });
  });
});

async function findOrCreateDocument(
  documentId: string
): Promise<IDocument | null> {
  if (!documentId) return null;

  const existingDocument: IDocument | null =
    await Document.findById(documentId);
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
  httpServer.listen(PORT, () => {
    console.log(`Server running at ${SERVER_ADDRESS}`);
  });
}

startServer();

export default app;
