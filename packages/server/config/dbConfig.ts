import mongoose from 'mongoose';

export async function connectDb() {
  try {
    const connection = (
      await mongoose.connect(
        process.env.MONGO_URI || 'mongodb://127.0.0.1/mini-docs-editor'
      )
    ).connection;
    connection.on('connection', () => {
      console.log('MongoDB connected');
    });

    connection.on('error', err => {
      throw err;
    });
  } catch (error) {
    console.log('Something went wrong in connecting to DB:', error);
  }
}
