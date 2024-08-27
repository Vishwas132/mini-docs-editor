import express, { Express } from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { connectDb } from './config/dbConfig';
import { Document } from './models';
import { IDocument } from './types/types.d';
import { Socket } from 'socket.io';

const app: Express = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
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
          let updatedDocument: IDocument | null;
          if (document._id) {
            updatedDocument = await Document.findByIdAndUpdate(
              documentId,
              document,
              { new: true }
            );
          } else {
            updatedDocument = await Document.create(document);
          }

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
