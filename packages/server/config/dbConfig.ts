import mongoose from 'mongoose';

export async function connectDb() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://127.0.0.1/mini-docs-editor',
      {
        dbName: process.env.DB_NAME || 'mini-docs-editor',
        maxPoolSize: 10,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
      }
    );
    console.log('Connected to MongoDB');
  } catch (error) {
    console.log('Something went wrong in connecting to DB:', error);
    process.exit(1);
  }
}
