import mongoose from 'mongoose';

export async function connectDb() {
  try {
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected');
    });

    mongoose.connection.on('error', err => {
      throw err;
    });
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://127.0.0.1/mini-docs-editor',
      {
        dbName: process.env.DB_NAME || 'mini-docs-editor',
      }
    );
  } catch (error) {
    console.log('Something went wrong in connecting to DB:', error);
  }
}
