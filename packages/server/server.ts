import express, { Express } from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { connectDb } from './config/dbConfig.js';
import { Document } from './models/index.js';
import { IDocument } from './types/types.d.js';
import { Socket } from 'socket.io';
import { cache, refreshCache } from './cache.js';

// Refresh cache every 5 minutes
setInterval(refreshCache, 5 * 60 * 1000);

// Initial cache population
refreshCache();

async function getCachedData(
  key: string | number,
  fetchFunction: () => Promise<IDocument | null>
) {
  const cachedData = cache.get(key);

  if (cachedData) {
    return cachedData;
  }

  const freshData = await fetchFunction();
  cache.set(key, freshData);
  return freshData;
}

const { NODE_ENV } = process.env;
let { CLIENT_ADDRESS } = process.env;
CLIENT_ADDRESS =
  NODE_ENV === 'production' ? CLIENT_ADDRESS : 'http://localhost:5173';
const PORT = (process.env.PORT && parseInt(process.env.PORT)) || 3000;

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
    const newOrExistingDocument = await getCachedData(documentId, async () => {
      return await findOrCreateDocument(documentId);
    });
    if (newOrExistingDocument) {
      socket.join(documentId);
      socket.emit('load-document', newOrExistingDocument);
    }

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
            cache.set(documentId, updatedDocument);
            callback({ status: 'success', _id: updatedDocument._id });
          } else {
            cache.del(documentId);
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
    console.log(`Server started on port ${PORT}`);
  });
}

startServer();

export default app;
